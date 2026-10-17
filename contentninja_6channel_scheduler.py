#!/usr/bin/env python3
"""
contentninja_6channel_scheduler.py

All-in-one scheduler for 6 YouTube channels:
 - Fetches NewsAPI (per-category)
 - Deduplicates and saves daily Excel per category
 - Generates TTS audio (edge-tts)
 - Downloads/fallback images (Pillow)
 - Creates vertical short (moviepy)
 - Uploads to per-category mapped YouTube channel (Google OAuth)
 - Deletes audio/image/video/excel after successful upload (configurable)
 - Runs every 4 hours by default (APScheduler)
"""
import os
import sys
import re
import json
import time
import asyncio
import hashlib
import logging
import signal
from io import BytesIO
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
import pandas as pd
from PIL import Image as PILImage, ImageDraw, ImageFont

import edge_tts
from moviepy.editor import ImageClip, AudioFileClip

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

# -----------------------
# Configuration (env)
# -----------------------
BASE_DIR = Path(os.getenv("BASE_DIR", ".")).resolve()
EXCEL_DIR = Path(os.getenv("EXCEL_DIR", BASE_DIR / "news_excel"))
AUDIO_DIR = Path(os.getenv("AUDIO_DIR", BASE_DIR / "news_audio"))
IMAGE_DIR = Path(os.getenv("IMAGE_DIR", BASE_DIR / "news_images"))
VIDEO_DIR = Path(os.getenv("VIDEO_DIR", BASE_DIR / "videos/shorts"))
LOG_DIR = Path(os.getenv("LOG_DIR", BASE_DIR / "logs"))

EXCEL_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
IMAGE_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

NEWSAPI_KEYS = os.getenv("NEWSAPI_KEYS", "")
NEWSAPI_KEYS = [k.strip() for k in NEWSAPI_KEYS.split(",") if k.strip()]
NEWSAPI_URL = os.getenv("NEWSAPI_URL", "https://newsapi.org/v2/top-headlines")
PAGE_SIZE = int(os.getenv("PAGE_SIZE", "100"))

VOICE = os.getenv("VOICE", "hi-IN-SwaraNeural")

CHANNELS_CONFIG_PATH = os.getenv("CHANNELS_CONFIG_PATH", "")  # path to channels.json (required)
DELETE_AFTER_UPLOAD = os.getenv("DELETE_AFTER_UPLOAD", "true").lower() in ("1", "true", "yes")
SCHEDULE_CRON = os.getenv("SCHEDULE_CRON", "0 */4 * * *")  # every 4 hours default

IMAGE_TIMEOUT = int(os.getenv("IMAGE_TIMEOUT", "15"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "30"))

VIDEO_WIDTH = int(os.getenv("VIDEO_WIDTH", "1080"))
VIDEO_HEIGHT = int(os.getenv("VIDEO_HEIGHT", "1920"))
VIDEO_FPS = int(os.getenv("VIDEO_FPS", "24"))
CPU_THREADS = max(1, (os.cpu_count() or 2) - 1)

DAY_FORMAT = "%Y%m%d"

# Columns used in Excel files
COLUMNS = [
    "category", "title", "description", "content", "source", "author", "url", "image_url",
    "local_image_path", "published_at", "article_hash", "audio_path", "short_video",
    "status", "error_message", "updated_at", "youtube_url"
]

# -----------------------
# Logging
# -----------------------
LOG_FILE = LOG_DIR / f"contentninja_6chan_{datetime.now().strftime('%Y%m%d')}.log"
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s | %(levelname)s | %(message)s",
                    handlers=[logging.FileHandler(LOG_FILE, encoding="utf-8"), logging.StreamHandler(sys.stdout)])
logger = logging.getLogger("ContentNinja6Chan")

# -----------------------
# Helpers
# -----------------------
def now_string(): return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
def today_str(): return datetime.now().strftime(DAY_FORMAT)
def get_excel_path(category): return EXCEL_DIR / f"{category}_{today_str()}.xlsx"
def sanitize_filename(text, default="untitled_news"):
    if not text:
        return default
    s = re.sub(r'[\\/:*?"<>|]+', "_", str(text))
    s = re.sub(r'\s+', '_', s).strip("_")
    s = re.sub(r'[^a-zA-Z0-9_.-]', '', s)
    return s[:140] or default
def create_hash(article):
    url = (article.get("url") or "").strip().lower()
    v = url or (article.get("title") or "").strip().lower() or str(datetime.now().timestamp())
    return hashlib.sha256(v.encode("utf-8")).hexdigest()
def load_excel(category):
    p = get_excel_path(category)
    if not p.exists():
        return pd.DataFrame(columns=COLUMNS)
    try:
        df = pd.read_excel(p, engine="openpyxl")
        for col in COLUMNS:
            if col not in df.columns:
                df[col] = ""
        return df[COLUMNS]
    except Exception as e:
        logger.warning("Excel read error %s: %s", p, e)
        return pd.DataFrame(columns=COLUMNS)
def save_excel(df, path):
    try:
        df.to_excel(path, index=False, engine="openpyxl")
        return True
    except Exception as e:
        logger.error("Failed to save excel %s: %s", path, e)
        return False

# -----------------------
# Channels config loader
# -----------------------
def load_channels_config():
    path = Path(CHANNELS_CONFIG_PATH)
    if not path.exists():
        raise RuntimeError("Missing CHANNELS_CONFIG_PATH or file not found.")
    try:
        cfg = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        raise RuntimeError(f"Failed to read channels config: {e}")
    channels = {}
    category_map = {}
    for ch in cfg.get("channels", []):
        cid = ch.get("id")
        client_secret = ch.get("client_secret")
        token = ch.get("token")
        cats = ch.get("categories", [])
        daily_limit = int(ch.get("daily_limit", 100))
        if not cid or not client_secret or not token or not cats:
            logger.warning("Skipping invalid channel entry (missing id/client_secret/token/categories): %s", ch)
            continue
        channels[cid] = {
            "client_secret": Path(client_secret),
            "token": Path(token),
            "categories": list(cats),
            "daily_limit": daily_limit
        }
        for c in cats:
            category_map[c] = cid
    if not channels:
        raise RuntimeError("No valid channels found in config.")
    return channels, category_map

# -----------------------
# Image download + fallback
# -----------------------
def generate_fallback_image(title, category, filename):
    try:
        img = PILImage.new("RGB", (VIDEO_WIDTH, VIDEO_HEIGHT), color=(15,23,42))
        draw = ImageDraw.Draw(img)
        try:
            f_banner = ImageFont.truetype("DejaVuSans-Bold.ttf", 48)
            f_title = ImageFont.truetype("DejaVuSans-Bold.ttf", 64)
            f_cat = ImageFont.truetype("DejaVuSans.ttf", 36)
        except Exception:
            f_banner = ImageFont.load_default(); f_title = ImageFont.load_default(); f_cat = ImageFont.load_default()
        draw.rectangle([(80,200),(1000,320)], fill=(225,29,72))
        draw.text((120,220),"BREAKING NEWS", fill=(255,255,255), font=f_banner)
        draw.text((80,400), f"CATEGORY: {category.upper()}", fill=(56,189,248), font=f_cat)
        words = title.split(); lines=[]; cur=""
        for w in words:
            test = (cur + " " + w).strip()
            if len(test)*28 < 920: cur = test
            else:
                lines.append(cur); cur = w
        if cur: lines.append(cur)
        y = 520
        for line in lines[:8]:
            draw.text((80,y), line, fill=(255,255,255), font=f_title); y += 80
        img.save(filename, "JPEG", quality=90)
        return str(filename)
    except Exception as e:
        logger.error("Fallback image error: %s", e)
        return ""

def download_and_save_image(image_url, title, category, filename):
    image_url = (image_url or "").strip()
    if not image_url:
        return generate_fallback_image(title, category, filename)
    try:
        resp = requests.get(image_url, timeout=IMAGE_TIMEOUT, headers={"User-Agent":"ContentNinja/1.0"})
        if resp.status_code == 200:
            img = PILImage.open(BytesIO(resp.content)).convert("RGB")
            img.save(filename, "JPEG", quality=90)
            if Path(filename).stat().st_size > 1000:
                return str(filename)
    except Exception as e:
        logger.debug("Image download error for %s: %s", title[:40], e)
    return generate_fallback_image(title, category, filename)

# -----------------------
# TTS (edge-tts)
# -----------------------
async def _edge_save(text, voice, out_file):
    comm = edge_tts.Communicate(text, voice)
    await comm.save(out_file)

def run_tts_generation(title, content, output_filename):
    text_to_speak = f"ब्रेकिंग न्यूज़. {title}. {content or title}"
    try:
        asyncio.run(_edge_save(text_to_speak, VOICE, output_filename))
        return Path(output_filename).exists() and Path(output_filename).stat().st_size > 1200
    except Exception as e:
        logger.error("EDGE-TTS error: %s", e)
        return False

# -----------------------
# NewsAPI fetcher
# -----------------------
def fetch_category(category):
    if not NEWSAPI_KEYS:
        logger.error("No NEWSAPI_KEYS configured.")
        return []
    for idx, key in enumerate(NEWSAPI_KEYS, start=1):
        if not key: continue
        logger.info("Fetching %s (key #%d)", category, idx)
        page = 1
        all_articles = []
        try:
            while True:
                params = {"apiKey": key, "category": category, "language": "en", "pageSize": PAGE_SIZE, "page": page}
                resp = requests.get(NEWSAPI_URL, params=params, timeout=REQUEST_TIMEOUT)
                try:
                    data = resp.json()
                except Exception:
                    data = {}
                if resp.status_code != 200 or data.get("status") != "ok":
                    logger.warning("NewsAPI error: %s", data.get("message") or resp.text[:200])
                    break
                articles = data.get("articles", [])
                if not articles:
                    break
                all_articles.extend(articles)
                logger.info("Page %d: %d articles", page, len(articles))
                if len(articles) < PAGE_SIZE:
                    break
                page += 1
            return all_articles
        except Exception as e:
            logger.error("NewsAPI network error: %s", e)
            continue
    return []

def save_category(category, articles):
    path = get_excel_path(category)
    df = load_excel(category)
    existing_hashes = set(df["article_hash"].fillna("").astype(str)) if not df.empty else set()
    existing_titles = set(df["title"].fillna("").astype(str).str.strip().str.lower()) if not df.empty else set()
    new_rows = []
    for a in articles:
        title = (a.get("title") or "").strip()
        if not title and not a.get("url"):
            continue
        h = create_hash(a)
        if h in existing_hashes or (title and title.lower() in existing_titles):
            continue
        row = {
            "category": category,
            "title": title,
            "description": a.get("description") or "",
            "content": a.get("content") or "",
            "source": (a.get("source") or {}).get("name","") if a.get("source") else "",
            "author": a.get("author") or "",
            "url": a.get("url") or "",
            "image_url": a.get("urlToImage") or "",
            "local_image_path": "",
            "published_at": a.get("publishedAt") or "",
            "article_hash": h,
            "audio_path": "",
            "short_video": "",
            "status": "",
            "error_message": "",
            "updated_at": now_string()
        }
        new_rows.append(row)
        existing_hashes.add(h)
        if title: existing_titles.add(title.lower())
    if new_rows:
        new_df = pd.DataFrame(new_rows, columns=COLUMNS)
        final_df = new_df if df.empty else pd.concat([df, new_df], ignore_index=True)
        save_excel(final_df, path)
        logger.info("%s: added %d new articles", category, len(new_rows))
    else:
        if not path.exists():
            pd.DataFrame(columns=COLUMNS).to_excel(path, index=False)
        logger.info("%s: no new unique articles", category)

# -----------------------
# Video creation
# -----------------------
def create_single_article_video_from_row(row, category):
    title = str(row.get("title","")).strip() or "untitled_news"
    content = str(row.get("content","") or row.get("description","") or "")
    article_hash = str(row.get("article_hash") or hashlib.sha256(title.encode()).hexdigest())[:64]
    safe_title_filename = sanitize_filename(title)[:100]
    audio_filename = AUDIO_DIR / f"{article_hash}.mp3"
    image_filename = IMAGE_DIR / f"{article_hash}.jpg"
    video_filename = VIDEO_DIR / f"{safe_title_filename}.mp4"

    # 1. generate audio
    if not audio_filename.exists() or audio_filename.stat().st_size < 1200:
        ok = run_tts_generation(title, content, str(audio_filename))
        if not ok:
            logger.warning("TTS generation failed for %s", title)

    # 2. download image or fallback
    if not image_filename.exists() or image_filename.stat().st_size < 1000:
        download_and_save_image(row.get("image_url",""), title, category, str(image_filename))

    # Validate presence
    if not audio_filename.exists() or audio_filename.stat().st_size < 1200:
        logger.error("Missing audio; skipping video for: %s", title)
        return None, None, None
    if not image_filename.exists() or image_filename.stat().st_size < 1000:
        logger.error("Missing image; skipping video for: %s", title)
        return str(audio_filename), None, None

    # 3. create video using moviepy
    try:
        audio_clip = AudioFileClip(str(audio_filename))
        duration = audio_clip.duration or 3.0
        image_clip = ImageClip(str(image_filename)).set_duration(duration)
        image_clip = image_clip.resize(width=VIDEO_WIDTH)
        if image_clip.h > VIDEO_HEIGHT:
            y_center = image_clip.h / 2
            image_clip = image_clip.crop(y_center=y_center, height=VIDEO_HEIGHT, width=VIDEO_WIDTH)
        video_clip = image_clip.set_audio(audio_clip)
        video_clip.write_videofile(str(video_filename),
                                   fps=VIDEO_FPS,
                                   codec="libx264",
                                   audio_codec="aac",
                                   preset="ultrafast",
                                   threads=CPU_THREADS,
                                   logger=None)
        audio_clip.close()
        video_clip.close()
        logger.info("Created video %s", video_filename.name)
        return str(audio_filename), str(image_filename), str(video_filename)
    except Exception as e:
        logger.exception("Video creation error for %s: %s", title, e)
        return str(audio_filename) if audio_filename.exists() else None, str(image_filename) if image_filename.exists() else None, None

# -----------------------
# YouTube auth + upload per channel
# -----------------------
SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

def authenticate_youtube_for_channel(channel_entry):
    client_secret_file = channel_entry["client_secret"]
    token_file = channel_entry["token"]
    if not client_secret_file.exists():
        raise FileNotFoundError(f"Missing client_secret: {client_secret_file}")
    creds = None
    if token_file.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)
        except Exception as e:
            logger.warning("Failed to read token %s: %s", token_file, e); creds = None
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            token_file.write_text(creds.to_json(), encoding="utf-8")
            logger.info("Refreshed token for %s", token_file)
        except Exception as e:
            logger.warning("Token refresh failed: %s", e); creds = None
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(str(client_secret_file), SCOPES)
        creds = flow.run_local_server(host="localhost", port=9001, open_browser=True)
        token_file.write_text(creds.to_json(), encoding="utf-8")
        logger.info("Saved new token %s", token_file)
    youtube = build("youtube", "v3", credentials=creds)
    return youtube

def upload_video_to_channel(youtube, local_path, title, description, category_id="25", tags=None):
    if tags is None:
        tags = []
    body = {
        "snippet": {
            "title": title[:100],
            "description": description,
            "tags": tags,
            "categoryId": str(category_id),
            "defaultLanguage": "en",
            "defaultAudioLanguage": "en"
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False
        }
    }
    media = MediaFileUpload(local_path, mimetype="video/mp4", chunksize=8*1024*1024, resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    try:
        while response is None:
            status, response = request.next_chunk()
            if status:
                logger.info("Upload progress %s: %.2f%%", Path(local_path).name, status.progress()*100)
    except HttpError as e:
        txt = str(e).lower()
        if any(k in txt for k in ("quotaexceeded","quota exceeded","daily limit exceeded","uploadlimitexceeded")):
            logger.error("Quota error during upload: %s", e)
            raise e
        logger.error("YouTube HttpError: %s", e)
        raise e
    except Exception as e:
        logger.error("Upload error: %s", e)
        raise e
    video_id = response.get("id")
    if not video_id:
        raise RuntimeError("YouTube returned no video id")
    url = f"https://www.youtube.com/watch?v={video_id}"
    return video_id, url

# -----------------------
# Per-channel state file helpers (to track daily counts)
# -----------------------
def state_file_for_channel(channel_id):
    return BASE_DIR / f"youtube_state_{channel_id}.json"

def load_channel_state(channel_id):
    p = state_file_for_channel(channel_id)
    if not p.exists():
        state = {
            "quota": {
                "last_reset_date_pt": None,
                "upload_count_today": 0,
                "quota_blocked": False,
                "quota_blocked_at": None,
                "next_quota_reset": None
            },
            "videos": {},
            "processed_excels": []
        }
        save_channel_state(channel_id, state)
        return state
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        logger.warning("Failed to read state %s: %s", p, e)
        state = {
            "quota": {
                "last_reset_date_pt": None,
                "upload_count_today": 0,
                "quota_blocked": False,
                "quota_blocked_at": None,
                "next_quota_reset": None
            },
            "videos": {},
            "processed_excels": []
        }
        save_channel_state(channel_id, state)
        return state

def save_channel_state(channel_id, state):
    p = state_file_for_channel(channel_id)
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(p)

def reset_quota_if_needed(state):
    # Pacific Time midnight detection would require timezone; for simplicity, reset daily based on UTC date
    today_utc = datetime.now(timezone.utc).date().isoformat()
    last = state["quota"].get("last_reset_date_pt")
    if last != today_utc:
        state["quota"]["last_reset_date_pt"] = today_utc
        state["quota"]["upload_count_today"] = 0
        state["quota"]["quota_blocked"] = False
        state["quota"]["quota_blocked_at"] = None
        state["quota"]["next_quota_reset"] = None

# -----------------------
# Orchestration: one scheduled run
# -----------------------
def process_cycle(channels_cfg, category_map):
    logger.info("=== Scheduled run start: %s ===", now_string())
    # 1) Fetch news for all categories present in mapping
    categories = sorted(set(category_map.keys()))
    for cat in categories:
        try:
            arts = fetch_category(cat)
            save_category(cat, arts)
        except Exception as e:
            logger.exception("Failed fetch/save for %s: %s", cat, e)

    # 2) For each excel, process rows and route to assigned channel
    # Cache youtube clients per channel
    youtube_clients = {}
    channel_states = {}
    for cid in channels_cfg:
        channel_states[cid] = load_channel_state(cid)
        reset_quota_if_needed(channel_states[cid])

    for xlsx in EXCEL_DIR.glob("*.xlsx"):
        try:
            df = pd.read_excel(xlsx, engine="openpyxl").fillna("")
        except Exception as e:
            logger.error("Cannot read excel %s: %s", xlsx.name, e)
            continue
        updated = False
        for idx in range(len(df)):
            row = df.iloc[idx]
            status = str(row.get("status","") or "").strip().lower()
            if status == "video_uploaded":
                continue
            cat = (row.get("category") or "").strip()
            if not cat:
                cat = "general"
            channel_id = category_map.get(cat)
            if not channel_id:
                logger.warning("No channel mapped for category %s; skipping row", cat)
                continue
            ch_entry = channels_cfg[channel_id]
            ch_state = channel_states[channel_id]
            if ch_state["quota"].get("quota_blocked"):
                logger.info("Channel %s quota blocked; skipping", channel_id); continue
            if ch_state["quota"].get("upload_count_today",0) >= ch_entry.get("daily_limit",100):
                logger.info("Channel %s reached daily_limit; blocking", channel_id)
                ch_state["quota"]["quota_blocked"] = True
                ch_state["quota"]["next_quota_reset"] = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
                save_channel_state(channel_id, ch_state)
                continue
            # create audio/image/video
            logger.info("Processing row %s of %s", idx+1, xlsx.name)
            try:
                audio_p, image_p, video_p = create_single_article_video_from_row(row, cat)
                if audio_p:
                    df.at[idx, "audio_path"] = audio_p
                if image_p:
                    df.at[idx, "local_image_path"] = image_p
                if video_p:
                    df.at[idx, "short_video"] = video_p
                df.at[idx, "updated_at"] = now_string()
                save_excel(df, xlsx)
                updated = True
                if not video_p:
                    df.at[idx, "status"] = "video_failed"
                    df.at[idx, "error_message"] = "video creation failed"
                    df.at[idx, "updated_at"] = now_string()
                    save_excel(df, xlsx)
                    continue
                # ensure youtube client
                if channel_id not in youtube_clients:
                    try:
                        youtube_clients[channel_id] = authenticate_youtube_for_channel(ch_entry)
                    except Exception as e:
                        logger.error("Auth failed for channel %s: %s", channel_id, e)
                        df.at[idx, "status"] = "auth_failed"
                        df.at[idx, "error_message"] = str(e)[:1000]
                        df.at[idx, "updated_at"] = now_string()
                        save_excel(df, xlsx)
                        continue
                # upload
                title = str(row.get("title","")).strip() or f"Latest {cat.title()} Update"
                desc = (str(row.get("description","")) or "") + f"\n\nUploaded by {channel_id}"
                try:
                    vid, url = upload_video_to_channel(youtube_clients[channel_id], video_p, title, desc)
                    df.at[idx, "status"] = "video_uploaded"
                    df.at[idx, "youtube_url"] = url
                    df.at[idx, "error_message"] = ""
                    df.at[idx, "updated_at"] = now_string()
                    save_excel(df, xlsx)
                    updated = True
                    # increment channel quota
                    ch_state["quota"]["upload_count_today"] = ch_state["quota"].get("upload_count_today",0) + 1
                    save_channel_state(channel_id, ch_state)
                    # delete assets
                    if DELETE_AFTER_UPLOAD:
                        for p in (audio_p, image_p, video_p):
                            try:
                                if p and Path(p).exists():
                                    Path(p).unlink()
                            except Exception as e:
                                logger.warning("Failed deleting %s: %s", p, e)
                except HttpError as e:
                    txt = str(e).lower()
                    if any(k in txt for k in ("quotaexceeded","quota exceeded","daily limit exceeded","uploadlimitexceeded")):
                        logger.error("Quota error for channel %s: %s", channel_id, e)
                        ch_state["quota"]["quota_blocked"] = True
                        ch_state["quota"]["quota_blocked_at"] = datetime.now(timezone.utc).isoformat()
                        ch_state["quota"]["next_quota_reset"] = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
                        save_channel_state(channel_id, ch_state)
                        df.at[idx, "status"] = "upload_pending"
                        df.at[idx, "error_message"] = "quota"
                        save_excel(df, xlsx)
                        updated = True
                        continue
                    logger.error("Upload failed: %s", e)
                    df.at[idx, "status"] = "upload_failed"
                    df.at[idx, "error_message"] = str(e)[:1000]
                    df.at[idx, "updated_at"] = now_string()
                    save_excel(df, xlsx)
                    updated = True
                except Exception as e:
                    logger.exception("Unhandled upload error: %s", e)
                    df.at[idx, "status"] = "upload_failed"
                    df.at[idx, "error_message"] = str(e)[:1000]
                    df.at[idx, "updated_at"] = now_string()
                    save_excel(df, xlsx)
                    updated = True
            except Exception as e:
                logger.exception("Row processing exception: %s", e)
                df.at[idx, "status"] = "error"
                df.at[idx, "error_message"] = str(e)[:1000]
                df.at[idx, "updated_at"] = now_string()
                save_excel(df, xlsx)
                updated = True
        # post-run: if all rows uploaded, delete excel and any leftover assets
        try:
            df2 = pd.read_excel(xlsx, engine="openpyxl").fillna("")
            total = len(df2); uploaded = sum(1 for s in df2.get("status",[]) if str(s).lower()=="video_uploaded")
            if total > 0 and uploaded == total and DELETE_AFTER_UPLOAD:
                logger.info("All rows uploaded for %s; deleting excel and assets", xlsx.name)
                for _, r in df2.iterrows():
                    for key in ("audio_path","local_image_path","short_video"):
                        p = str(r.get(key,"") or "")
                        if p:
                            rp = Path(p)
                            if not rp.is_absolute():
                                rp = BASE_DIR / p
                            try:
                                if rp.exists(): rp.unlink()
                            except Exception:
                                pass
                try:
                    xlsx.unlink()
                except Exception as e:
                    logger.warning("Failed to delete excel %s: %s", xlsx.name, e)
        except Exception:
            pass
        if updated:
            save_excel(df, xlsx)
    # save channel states
    for cid, st in channel_states.items():
        save_channel_state(cid, st)
    logger.info("=== Scheduled run finish: %s ===", now_string())

# -----------------------
# Scheduler start / shutdown
# -----------------------
def start_scheduler(channels_cfg, category_map):
    sched = BackgroundScheduler()
    try:
        m,h,d,mo,dow = SCHEDULE_CRON.split()
        trigger = CronTrigger(minute=m, hour=h, day=d, month=mo, day_of_week=dow)
    except Exception:
        trigger = CronTrigger(minute="0", hour="*/4")
    sched.add_job(lambda: process_cycle(channels_cfg, category_map), trigger, id="cn6_run", max_instances=1, replace_existing=True)
    sched.start()
    logger.info("Scheduler started with cron: %s", SCHEDULE_CRON)
    # run once immediately
    try:
        process_cycle(channels_cfg, category_map)
    except Exception as e:
        logger.exception("Initial run failed: %s", e)
    return sched

def shutdown(signum=None, frame=None):
    logger.info("Shutting down scheduler..."); sys.exit(0)

# -----------------------
# Entry point
# -----------------------
def main():
    channels_cfg, category_map = load_channels_config()
    # normalize Path objects in channels_cfg
    for cid, ch in channels_cfg.items():
        ch["client_secret"] = Path(ch["client_secret"])
        ch["token"] = Path(ch["token"])
    sched = start_scheduler(channels_cfg, category_map)
    signal.signal(signal.SIGINT, shutdown); signal.signal(signal.SIGTERM, shutdown)
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        shutdown()

if __name__ == "__main__":
    main()
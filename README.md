# PulseNews - Global News Portal & PWA

A modern, responsive full-stack news web application and installable Android PWA featuring Google AdSense integration, NewsAPI top headlines, category discovery, Clean In-App Reader with full news extraction, text-to-speech audio reader, and Gemini AI executive briefings.

---

## 🚀 Running on Your Laptop (Quick Start)

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes with Node.js)

### 1. Install Dependencies
In the project folder, open your terminal and run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
*(Optional: Add your own `NEWS_API_KEY` from [newsapi.org](https://newsapi.org) or `GEMINI_API_KEY` from Google AI Studio. PulseNews includes built-in offline-ready news and fallback dispatches so it works immediately even without API keys!)*

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🛠️ Available Scripts

- **`npm run dev`** – Starts the unified Express + Vite development server on port 3000 with live updates.
- **`npm run build`** – Builds production bundle into `dist/` with PWA manifest and service worker.
- **`npm run start`** – Runs the production server (`NODE_ENV=production node server.ts`).
- **`npm run lint`** – Validates TypeScript types with zero compile errors.

---

## ✨ Features

- **Google AdSense Ready**: Configured for publisher client ID (`ca-pub-8153839325985487`) with responsive banners, leaderboard, in-feed placements, and `/ads.txt` verification.
- **Clean In-App Reader**: Automatic fallback to clean in-app structure if external publishers restrict iframe embedding, complete with full article paragraph extraction and typography sizing.
- **Multi-Category Discovery**: Top 10 paginated news across General, Technology, Business, Sports, Entertainment, Science, and Health.
- **Latest News First**: All news feeds sorted chronologically with newest dispatches at the top.
- **Audio Voice Reader**: Built-in speech synthesis to listen to full stories aloud.
- **Installable Android PWA**: Progressive Web App with offline caching, mobile navigation, and Android device framing.
- **Smart AI Summaries**: Gemini 3.8 Flash key takeaways, sentiment analysis, and ELI5 plain English breakdown.

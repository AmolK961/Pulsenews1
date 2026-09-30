import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../types/news';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  X, 
  Headphones, 
  Gauge,
  Radio,
  ExternalLink
} from 'lucide-react';

interface AudioBriefingBarProps {
  articles: Article[];
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
}

export const AudioBriefingBar: React.FC<AudioBriefingBarProps> = ({
  articles,
  isOpen,
  onClose,
  onSelectArticle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const currentArticle = articles[currentIndex];

  const speakCurrent = () => {
    if (!synthRef.current || !currentArticle) return;

    synthRef.current.cancel();

    const textToSpeak = `Story ${currentIndex + 1} of ${articles.length}. From ${currentArticle.source.name}. ${currentArticle.title}. ${currentArticle.description || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Auto advance to next article
      if (currentIndex < articles.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      speakCurrent();
    }
  }, [currentIndex, rate]);

  const togglePlay = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      speakCurrent();
    }
  };

  const handleNext = () => {
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRateChange = () => {
    const nextRate = rate === 1.0 ? 1.25 : rate === 1.25 ? 1.5 : 1.0;
    setRate(nextRate);
  };

  const handleClose = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen || articles.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-rose-500/40 shadow-2xl px-4 py-3 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Article info */}
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-950/50">
            <Radio className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>

          <div className="min-w-0 flex-1 sm:max-w-md">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="font-bold text-rose-400 uppercase tracking-wider">
                Daily Podcast Mode &bull; Story {currentIndex + 1} of {articles.length}
              </span>
              <span>&bull;</span>
              <span className="truncate">{currentArticle?.source.name}</span>
            </div>
            <p className="text-xs font-semibold text-white truncate cursor-pointer hover:underline" onClick={() => onSelectArticle(currentArticle)}>
              {currentArticle?.title}
            </p>
          </div>
        </div>

        {/* Center: Audio playback controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
            aria-label="Previous story"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 active:scale-95 transition"
            aria-label={isPlaying ? 'Pause audio briefing' : 'Play audio briefing'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === articles.length - 1}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
            aria-label="Next story"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={handleRateChange}
            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-medium hover:bg-slate-700 transition"
            title="Adjust reading speed"
          >
            {rate}x
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectArticle(currentArticle)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <span>Read Story</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close audio player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

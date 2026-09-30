import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, CloudSun, Sun, CloudRain, Wind, Cloud, RefreshCw } from 'lucide-react';

interface MarketItem {
  symbol: string;
  value: string;
  change: string;
  up: boolean;
  category: string;
}

interface WeatherData {
  city: string;
  temp: string;
  condition: string;
  icon: string;
}

interface MarketBarProps {
  countryCode: string;
}

export const MarketBar: React.FC<MarketBarProps> = ({ countryCode }) => {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Fetch market data
    fetch('/api/market-data')
      .then(res => res.json())
      .then(json => {
        if (json.status === 'ok') setMarketData(json.data);
      })
      .catch(console.error);

    // Fetch weather
    fetch(`/api/weather?country=${countryCode}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'ok') setWeather(json.data);
      })
      .catch(console.error);
  }, [countryCode]);

  const renderWeatherIcon = () => {
    if (!weather) return <CloudSun className="w-3.5 h-3.5 text-amber-400" />;
    switch (weather.icon) {
      case 'Sun': return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'CloudRain': return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'Wind': return <Wind className="w-3.5 h-3.5 text-teal-400" />;
      case 'Cloud': return <Cloud className="w-3.5 h-3.5 text-slate-300" />;
      default: return <CloudSun className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border-b border-slate-800/60 overflow-hidden py-1 px-4 text-[11px] flex items-center justify-between gap-4">
      {/* Weather Pill */}
      {weather && (
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/90 border border-slate-800 px-2.5 py-0.5 rounded-full text-slate-300">
          {renderWeatherIcon()}
          <span className="font-semibold text-slate-200">{weather.city}:</span>
          <span className="font-mono text-amber-300">{weather.temp}</span>
          <span className="text-slate-400 hidden sm:inline">&bull; {weather.condition}</span>
        </div>
      )}

      {/* Scrolling Markets Bar */}
      <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-5 whitespace-nowrap">
        {marketData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono font-medium">{item.symbol}</span>
            <span className="text-slate-200 font-semibold">{item.value}</span>
            <span className={`inline-flex items-center text-[10px] font-bold ${
              item.up ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {item.up ? (
                <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
              )}
              {item.change}
            </span>
          </div>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Market Live</span>
      </div>
    </div>
  );
};

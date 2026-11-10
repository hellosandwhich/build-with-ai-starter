import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  Search, 
  Activity, 
  Play, 
  Pause, 
  Zap, 
  Bookmark, 
  TrendingUp, 
  Briefcase,
  ChevronDown,
  Globe
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const {
    isLiveStreaming,
    setIsLiveStreaming,
    streamingSpeed,
    setStreamingSpeed,
    triggerManualTick,
    watchlist,
    isWatchlistDrawerOpen,
    setIsWatchlistDrawerOpen,
    paperBalance,
    totalPortfolioValue,
    totalUnrealizedPnl
  } = useMarket();

  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);

  const pnlPercent = ((totalUnrealizedPnl / 100000) * 100);

  return (
    <header className="sticky top-0 z-40 bg-[#131722] border-b border-[#2A2E39] select-none">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 group cursor-pointer">
            {/* TradingView Geometric Icon */}
            <div className="w-8 h-8 rounded bg-[#2962FF] flex items-center justify-center shadow-lg shadow-[#2962FF]/20 group-hover:bg-[#1E53E5] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <rect x="3" y="11" width="3.5" height="9" rx="1" fill="currentColor" />
                <rect x="9.5" y="4" width="3.5" height="16" rx="1" fill="currentColor" />
                <rect x="16" y="8" width="3.5" height="12" rx="1" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-[#F0F3FA] uppercase">TradingView</span>
                <span className="bg-[#2A2E39] text-[#787B86] text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Markets
                </span>
              </div>
              <span className="text-[10px] text-[#787B86] hidden sm:inline leading-none font-mono">Institutional Terminal</span>
            </div>
          </div>

          {/* Market Status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-[#2A2E39] text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#089981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#089981]"></span>
            </span>
            <span className="text-[#089981] font-semibold text-[11px] tracking-wider uppercase">US Markets Open</span>
            <span className="text-[#50535E] text-[11px]">• Regular Session</span>
          </div>
        </div>

        {/* Center: Quick Search Trigger Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-[#1E222D] hover:bg-[#262A35] border border-[#2A2E39] hover:border-[#363A45] text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-xs text-[#787B86] group-hover:text-[#F0F3FA] transition-colors truncate">
              <Search className="w-3.5 h-3.5 shrink-0 text-[#787B86]" />
              <span className="truncate">Search tickers, stocks, crypto, forex, commodities...</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <kbd className="hidden sm:inline-block bg-[#131722] border border-[#363A45] rounded px-1.5 py-0.5 text-[10px] text-[#787B86] font-mono">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Streaming Controls, Paper Balance & Watchlist */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Live Tick Controls */}
          <div className="hidden md:flex items-center bg-[#1E222D] border border-[#2A2E39] rounded p-0.5">
            {/* Play/Pause */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              title={isLiveStreaming ? "Pause Live Feed" : "Resume Live Feed"}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                isLiveStreaming 
                  ? 'bg-[#089981]/15 text-[#089981] hover:bg-[#089981]/25' 
                  : 'text-[#787B86] hover:text-[#F0F3FA] hover:bg-[#2A2E39]'
              }`}
            >
              {isLiveStreaming ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[11px] font-semibold">LIVE</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="text-[11px]">PAUSED</span>
                </>
              )}
            </button>

            {/* Manual Tick trigger */}
            <button
              onClick={triggerManualTick}
              title="Force Instant Market Tick"
              className="p-1 hover:bg-[#2A2E39] text-[#787B86] hover:text-[#F0F3FA] rounded transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>

            {/* Speed selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
                className="flex items-center gap-1 px-1.5 py-1 text-[11px] text-[#787B86] hover:text-[#F0F3FA] rounded hover:bg-[#2A2E39]"
              >
                <span className="capitalize">{streamingSpeed}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {speedDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-28 bg-[#1E222D] border border-[#363A45] rounded shadow-xl py-1 z-50 text-xs"
                  onMouseLeave={() => setSpeedDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-[10px] text-[#50535E] uppercase font-bold tracking-wider">Tick Frequency</div>
                  {(['fast', 'normal', 'slow'] as const).map(speed => (
                    <button
                      key={speed}
                      onClick={() => {
                        setStreamingSpeed(speed);
                        setSpeedDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1 hover:bg-[#2A2E39] text-xs capitalize flex items-center justify-between ${
                        streamingSpeed === speed ? 'text-[#2962FF] font-semibold' : 'text-[#F0F3FA]'
                      }`}
                    >
                      <span>{speed}</span>
                      <span className="text-[10px] text-[#787B86]">
                        {speed === 'fast' ? '1.2s' : speed === 'normal' ? '2.4s' : '4.5s'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Paper Trading Account Pill */}
          <button
            onClick={() => setIsWatchlistDrawerOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#1E222D] hover:bg-[#262A35] border border-[#2A2E39] hover:border-[#363A45] transition-all text-xs"
            title="Paper Trading Account - Click to view portfolio & positions"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#2962FF]" />
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#787B86] font-medium hidden sm:inline">PAPER PORTFOLIO</span>
                <span className="font-mono font-semibold text-[#F0F3FA] tabular-nums">
                  ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1 text-[10px] font-mono tabular-nums leading-none">
                <span className={totalUnrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}>
                  {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </button>

          {/* Watchlist Drawer Toggle Button */}
          <button
            onClick={() => setIsWatchlistDrawerOpen(!isWatchlistDrawerOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium transition-colors ${
              isWatchlistDrawerOpen
                ? 'bg-[#2962FF] text-white border-[#2962FF]'
                : 'bg-[#1E222D] hover:bg-[#262A35] border-[#2A2E39] text-[#F0F3FA]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Watchlist</span>
            <span className="bg-[#2A2E39] text-white text-[10px] font-mono px-1.5 rounded-full">
              {watchlist.length}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};

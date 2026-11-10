/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { TickerMarquee } from './components/TickerMarquee';
import { NavigationTabs } from './components/NavigationTabs';
import { OverviewView } from './components/OverviewView';
import { ScreenerTable } from './components/ScreenerTable';
import { HeatmapView } from './components/HeatmapView';
import { InteractiveChartModal } from './components/InteractiveChartModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SearchModal } from './components/SearchModal';
import { ToastContainer } from './components/ToastContainer';
import { Globe, Shield, RefreshCw } from 'lucide-react';

const MainMarketApp: React.FC = () => {
  const { 
    activeCategory, 
    selectedSymbol, 
    setSelectedSymbol 
  } = useMarket();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut Cmd+K or / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#131722] text-[#F0F3FA] flex flex-col font-sans selection:bg-[#2962FF] selection:text-white">
      
      {/* 1. Institutional Top Navigation */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* 2. Top Rolling Ticker Marquee */}
      <TickerMarquee />

      {/* 3. Category Navigation Tabs */}
      <NavigationTabs />

      {/* 4. Active Screen View */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-6">
        {activeCategory === 'overview' && <OverviewView />}
        
        {activeCategory === 'stocks' && (
          <ScreenerTable 
            category="stocks" 
            title="U.S. Stocks Screener" 
            subtitle="Explore high-volume equities, mega-cap valuations, and technical strength ratings across all industry sectors."
          />
        )}

        {activeCategory === 'crypto' && (
          <ScreenerTable 
            category="crypto" 
            title="Cryptocurrency Asset Screener" 
            subtitle="Spot crypto tokens, layer-1 blockchains, 24h volume turnover, and 7-day trend trajectories."
          />
        )}

        {activeCategory === 'forex' && (
          <ScreenerTable 
            category="forex" 
            title="Foreign Exchange (FX) Markets" 
            subtitle="G10 currency pairs, cross rates, pip valuations, and 24-hour intra-day ranges."
          />
        )}

        {activeCategory === 'indices' && (
          <ScreenerTable 
            category="indices" 
            title="Global Benchmark Indices" 
            subtitle="S&P 500, Nasdaq 100, Dow Jones, Nikkei 225, and international equities performance."
          />
        )}

        {activeCategory === 'futures' && (
          <ScreenerTable 
            category="futures" 
            title="Commodities & Government Yields" 
            subtitle="Energy contracts, precious metals spot pricing, and U.S. Treasury sovereign yield spreads."
          />
        )}

        {activeCategory === 'heatmap' && <HeatmapView />}
      </main>

      {/* 5. Institutional Terminal Footer */}
      <footer className="bg-[#0A0E19] border-t border-[#2A2E39] text-[#787B86] text-xs py-6 mt-8 select-none">
        <div className="max-w-[1720px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#2962FF] flex items-center justify-center text-white text-[10px] font-bold">
              TV
            </div>
            <span className="font-semibold text-[#F0F3FA]">TradingView Markets Pro Terminal</span>
            <span className="text-[#50535E]">• Real-Time Market Composite Feed</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>Quotes simulated with institutional tick dynamics</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Paper Trading Engine Active ($100k starting equity)</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[#089981] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
              WebSocket Engine Live
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedSymbol && (
        <InteractiveChartModal
          symbol={selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
        />
      )}

      <WatchlistDrawer />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainMarketApp />
    </MarketProvider>
  );
}

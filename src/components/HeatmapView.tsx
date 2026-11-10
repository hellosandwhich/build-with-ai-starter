import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketSymbol } from '../types/market';
import { Grid, Layers, Sparkles, TrendingUp, TrendingDown, Info } from 'lucide-react';

export const HeatmapView: React.FC = () => {
  const { symbols, setSelectedSymbol } = useMarket();
  const [heatmapType, setHeatmapType] = useState<'stocks' | 'crypto'>('stocks');
  const [hoveredSymbol, setHoveredSymbol] = useState<MarketSymbol | null>(null);

  // Group symbols by sector or category
  const stocksBySector = useMemo(() => {
    const stockList = symbols.filter(s => s.category === 'stocks');
    const grouped: Record<string, MarketSymbol[]> = {};

    stockList.forEach(stock => {
      const sec = stock.sector || 'Other';
      if (!grouped[sec]) grouped[sec] = [];
      grouped[sec].push(stock);
    });

    // Sort symbols within sector by market cap
    Object.keys(grouped).forEach(sec => {
      grouped[sec].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    });

    return grouped;
  }, [symbols]);

  const cryptoSymbols = useMemo(() => {
    return symbols
      .filter(s => s.category === 'crypto')
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
  }, [symbols]);

  // Color mapping function based on change percentage
  const getPerformanceBg = (pct: number) => {
    if (pct >= 4.0) return 'bg-[#089981] text-white';
    if (pct >= 2.0) return 'bg-[#089981]/85 text-white';
    if (pct >= 0.5) return 'bg-[#089981]/60 text-white';
    if (pct >= 0) return 'bg-[#089981]/35 text-[#F0F3FA]';
    if (pct >= -1.0) return 'bg-[#F23645]/35 text-[#F0F3FA]';
    if (pct >= -3.0) return 'bg-[#F23645]/70 text-white';
    return 'bg-[#F23645] text-white';
  };

  return (
    <div className="space-y-4">
      
      {/* Heatmap Toolbar */}
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-[#2962FF]" />
          <div>
            <h2 className="text-sm font-bold text-[#F0F3FA] uppercase tracking-wide">
              Market Capitalization Treemap
            </h2>
            <p className="text-xs text-[#787B86]">
              Box size represents market capitalization, color indicates 24h performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono">
            <span className="text-[#F23645] font-semibold">-3%</span>
            <div className="flex h-3 w-28 rounded overflow-hidden">
              <div className="w-1/6 bg-[#F23645]" />
              <div className="w-1/6 bg-[#F23645]/70" />
              <div className="w-1/6 bg-[#F23645]/35" />
              <div className="w-1/6 bg-[#089981]/35" />
              <div className="w-1/6 bg-[#089981]/70" />
              <div className="w-1/6 bg-[#089981]" />
            </div>
            <span className="text-[#089981] font-semibold">+3%</span>
          </div>

          {/* Type Toggle */}
          <div className="flex items-center bg-[#131722] p-0.5 rounded border border-[#2A2E39] text-xs">
            <button
              onClick={() => setHeatmapType('stocks')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                heatmapType === 'stocks'
                  ? 'bg-[#2A2E39] text-[#F0F3FA] font-semibold'
                  : 'text-[#787B86] hover:text-[#F0F3FA]'
              }`}
            >
              U.S. Stocks (S&P)
            </button>
            <button
              onClick={() => setHeatmapType('crypto')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                heatmapType === 'crypto'
                  ? 'bg-[#2A2E39] text-[#F0F3FA] font-semibold'
                  : 'text-[#787B86] hover:text-[#F0F3FA]'
              }`}
            >
              Crypto Assets
            </button>
          </div>
        </div>
      </div>

      {/* Main Treemap Visualization Container */}
      <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-2 min-h-[540px] relative select-none">
        
        {heatmapType === 'stocks' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {Object.entries(stocksBySector).map(([sector, stocks]) => {
              return (
                <div 
                  key={sector} 
                  className="bg-[#1E222D]/80 border border-[#2A2E39] rounded p-2 flex flex-col gap-1.5"
                >
                  {/* Sector Title */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#787B86] px-1">
                    <span className="uppercase tracking-wider">{sector}</span>
                    <span className="font-mono text-[10px]">{stocks.length} assets</span>
                  </div>

                  {/* Stocks grid inside sector */}
                  <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-[140px]">
                    {stocks.map((stock, idx) => {
                      const isMega = idx === 0 && stock.marketCap && stock.marketCap > 1000000000000;
                      const isUp = stock.changePercent >= 0;
                      const bgClass = getPerformanceBg(stock.changePercent);

                      return (
                        <div
                          key={stock.symbol}
                          onClick={() => setSelectedSymbol(stock)}
                          onMouseEnter={() => setHoveredSymbol(stock)}
                          onMouseLeave={() => setHoveredSymbol(null)}
                          className={`${isMega ? 'col-span-2 min-h-[90px]' : 'min-h-[70px]'} ${bgClass} rounded p-2.5 flex flex-col justify-between cursor-pointer hover:brightness-110 hover:scale-[1.01] transition-all relative group shadow-sm`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-extrabold text-sm tracking-tight">{stock.symbol}</span>
                            <span className="font-mono text-xs font-bold tabular-nums">
                              {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>

                          <div className="flex items-end justify-between mt-2">
                            <span className="text-[11px] font-mono opacity-90 tabular-nums">
                              ${stock.price.toFixed(2)}
                            </span>
                            <span className="text-[10px] font-mono opacity-80">
                              {stock.marketCapFormatted}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Crypto Heatmap */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {cryptoSymbols.map((coin, idx) => {
              const isBtc = coin.symbol === 'BTCUSD';
              const isEth = coin.symbol === 'ETHUSD';
              const spanClass = isBtc ? 'sm:col-span-2 md:col-span-2 sm:row-span-2 min-h-[180px]' : isEth ? 'sm:col-span-2 min-h-[120px]' : 'min-h-[90px]';
              const isUp = coin.changePercent >= 0;
              const bgClass = getPerformanceBg(coin.changePercent);

              return (
                <div
                  key={coin.symbol}
                  onClick={() => setSelectedSymbol(coin)}
                  onMouseEnter={() => setHoveredSymbol(coin)}
                  onMouseLeave={() => setHoveredSymbol(null)}
                  className={`${spanClass} ${bgClass} rounded p-3 flex flex-col justify-between cursor-pointer hover:brightness-110 hover:scale-[1.01] transition-all group shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-extrabold text-base tracking-tight">{coin.symbol}</span>
                      <p className="text-xs opacity-90">{coin.name}</p>
                    </div>
                    <span className="font-mono text-sm font-bold tabular-nums">
                      {isUp ? '+' : ''}{coin.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    <span className="text-sm font-mono font-bold tabular-nums">
                      ${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.decimals, maximumFractionDigits: coin.decimals })}
                    </span>
                    <span className="text-xs font-mono opacity-90">
                      Cap: {coin.marketCapFormatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hover detail card pinned at bottom right */}
        {hoveredSymbol && (
          <div className="hidden lg:flex fixed bottom-6 right-6 z-30 bg-[#1E222D] border border-[#363A45] rounded-lg p-3.5 shadow-2xl w-72 pointer-events-none animate-in fade-in duration-150">
            <div className="w-full space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-[#F0F3FA] flex items-center gap-1.5">
                    <span>{hoveredSymbol.symbol}</span>
                    <span className="text-[10px] text-[#787B86] font-mono bg-[#131722] px-1 rounded">
                      {hoveredSymbol.exchange}
                    </span>
                  </div>
                  <div className="text-xs text-[#787B86] truncate">{hoveredSymbol.name}</div>
                </div>

                <div className={`text-xs font-mono font-bold ${hoveredSymbol.changePercent >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                  {hoveredSymbol.changePercent >= 0 ? '+' : ''}{hoveredSymbol.changePercent.toFixed(2)}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A2E39] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#787B86] block">Last Price</span>
                  <span className="text-[#F0F3FA] font-bold">
                    {hoveredSymbol.currency}{hoveredSymbol.price.toLocaleString(undefined, { minimumFractionDigits: hoveredSymbol.decimals, maximumFractionDigits: hoveredSymbol.decimals })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#787B86] block">Market Cap</span>
                  <span className="text-[#F0F3FA]">{hoveredSymbol.marketCapFormatted || '--'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#787B86] block">24h Volume</span>
                  <span className="text-[#787B86]">{hoveredSymbol.volumeFormatted}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#787B86] block">Technical</span>
                  <span className="text-[#089981] font-bold">{hoveredSymbol.rating}</span>
                </div>
              </div>

              <div className="text-[10px] text-[#2962FF] font-semibold text-center pt-1">
                Click block to open technical chart & order terminal
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

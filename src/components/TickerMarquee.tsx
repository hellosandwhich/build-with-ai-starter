import React from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketSymbol } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const TickerMarquee: React.FC = () => {
  const { symbols, setSelectedSymbol } = useMarket();

  // Select key marquee tickers: SPX, NDX, DJI, BTCUSD, ETHUSD, NVDA, AAPL, EURUSD, XAUUSD, CL1!, US10Y
  const marqueeTickers = ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'NVDA', 'AAPL', 'TSLA', 'EURUSD', 'XAUUSD', 'CL1!', 'US10Y'];
  const marqueeItems = marqueeTickers
    .map(t => symbols.find(s => s.symbol === t))
    .filter((s): s is MarketSymbol => Boolean(s));

  // Duplicate items to ensure smooth infinite marquee looping
  const displayItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="w-full bg-[#171B26] border-b border-[#2A2E39] overflow-hidden select-none py-1 h-9 flex items-center">
      <div className="animate-marquee flex items-center">
        {displayItems.map((item, index) => {
          const isUp = item.change >= 0;
          const flashClass = item.lastTickDirection === 'up'
            ? 'flash-green'
            : item.lastTickDirection === 'down'
            ? 'flash-red'
            : '';

          return (
            <div
              key={`${item.symbol}-${index}`}
              onClick={() => setSelectedSymbol(item)}
              className={`flex items-center gap-2 px-3.5 py-0.5 border-r border-[#2A2E39] cursor-pointer hover:bg-[#2A2E39]/70 transition-colors shrink-0 group ${flashClass}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#F0F3FA] group-hover:text-[#2962FF] transition-colors">
                  {item.symbol}
                </span>
                <span className="text-[10px] text-[#787B86] font-mono hidden sm:inline">
                  {item.exchange}
                </span>
              </div>

              <span className="text-xs font-mono font-medium text-[#F0F3FA] tabular-nums">
                {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: item.decimals, maximumFractionDigits: item.decimals })}
              </span>

              <div className={`flex items-center text-[11px] font-mono font-medium tabular-nums ${
                isUp ? 'text-[#089981]' : 'text-[#F23645]'
              }`}>
                {isUp ? (
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                )}
                <span>
                  {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

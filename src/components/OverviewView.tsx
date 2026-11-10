import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './Sparkline';
import { MarketSymbol } from '../types/market';
import { SECTOR_PERFORMANCES, MARKET_NEWS, ECONOMIC_EVENTS } from '../data/mockMarketData';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Flame, 
  Percent, 
  Calendar, 
  Newspaper, 
  Eye, 
  ChevronRight,
  Gauge,
  Layers
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { symbols, setSelectedSymbol, toggleWatchlist, isInWatchlist, setActiveCategory } = useMarket();
  const [moverTab, setMoverTab] = useState<'gainers' | 'losers' | 'active' | 'highs'>('gainers');
  const [newsFilter, setNewsFilter] = useState<'all' | 'bullish' | 'bearish'>('all');

  // Pulse Hero symbols: SPX, NDX, BTCUSD, XAUUSD
  const pulseSymbols = ['SPX', 'NDX', 'BTCUSD', 'XAUUSD']
    .map(sym => symbols.find(s => s.symbol === sym))
    .filter((s): s is MarketSymbol => Boolean(s));

  // Compute market movers from all symbols
  const gainers = [...symbols].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...symbols].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const mostActive = [...symbols].sort((a, b) => b.volume - a.volume).slice(0, 5);
  const highs52w = [...symbols]
    .filter(s => s.high52w)
    .sort((a, b) => (b.price / (b.high52w || 1)) - (a.price / (a.high52w || 1)))
    .slice(0, 5);

  const displayedMovers = moverTab === 'gainers' 
    ? gainers 
    : moverTab === 'losers' 
    ? losers 
    : moverTab === 'active' 
    ? mostActive 
    : highs52w;

  const filteredNews = newsFilter === 'all' 
    ? MARKET_NEWS 
    : MARKET_NEWS.filter(n => n.sentiment === newsFilter);

  return (
    <div className="space-y-6">
      
      {/* 1. Pulse Hero Cards: Key Global Markets */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F0F3FA] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2962FF]" />
              Major Market Indices & Assets
            </h2>
          </div>
          <span className="text-xs text-[#787B86] hidden sm:inline">Real-time composite streaming</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pulseSymbols.map(asset => {
            const isUp = asset.change >= 0;
            const flashClass = asset.lastTickDirection === 'up'
              ? 'flash-green'
              : asset.lastTickDirection === 'down'
              ? 'flash-red'
              : '';

            return (
              <div
                key={asset.symbol}
                onClick={() => setSelectedSymbol(asset)}
                className={`bg-[#1E222D] hover:bg-[#262A35] border border-[#2A2E39] hover:border-[#363A45] rounded-lg p-3.5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm ${flashClass}`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#F0F3FA] group-hover:text-[#2962FF] transition-colors">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] text-[#787B86] font-mono bg-[#131722] px-1 rounded">
                          {asset.exchange}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#787B86] truncate max-w-[170px] mt-0.5">{asset.name}</p>
                    </div>

                    <div className={`px-2 py-0.5 rounded text-xs font-mono font-semibold flex items-center gap-0.5 ${
                      isUp 
                        ? 'bg-[#089981]/15 text-[#089981]' 
                        : 'bg-[#F23645]/15 text-[#F23645]'
                    }`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isUp ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-[#F0F3FA] tabular-nums">
                      {asset.currency}{asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.decimals, maximumFractionDigits: asset.decimals })}
                    </span>
                    <span className={`text-xs font-mono tabular-nums ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      {isUp ? '+' : ''}{asset.change.toFixed(asset.decimals)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2A2E39]/60 flex items-center justify-between">
                  <div className="text-[10px] text-[#787B86] font-mono">
                    <span>L: {asset.low24h.toLocaleString()}</span>
                    <span className="mx-1.5">•</span>
                    <span>H: {asset.high24h.toLocaleString()}</span>
                  </div>
                  <Sparkline data={asset.sparkline} width={76} height={26} isPositive={isUp} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Market Movers & Sector Heat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Market Movers Screener Widget */}
        <div className="lg:col-span-2 bg-[#1E222D] border border-[#2A2E39] rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2A2E39]">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#2962FF]" />
              <h3 className="text-sm font-bold text-[#F0F3FA] uppercase tracking-wider">Market Movers</h3>
            </div>

            {/* Mover Tabs */}
            <div className="flex items-center bg-[#131722] p-0.5 rounded border border-[#2A2E39] text-xs">
              <button
                onClick={() => setMoverTab('gainers')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  moverTab === 'gainers' ? 'bg-[#2A2E39] text-[#089981]' : 'text-[#787B86] hover:text-[#F0F3FA]'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setMoverTab('losers')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  moverTab === 'losers' ? 'bg-[#2A2E39] text-[#F23645]' : 'text-[#787B86] hover:text-[#F0F3FA]'
                }`}
              >
                Top Losers
              </button>
              <button
                onClick={() => setMoverTab('active')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  moverTab === 'active' ? 'bg-[#2A2E39] text-[#2962FF]' : 'text-[#787B86] hover:text-[#F0F3FA]'
                }`}
              >
                Most Active
              </button>
              <button
                onClick={() => setMoverTab('highs')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  moverTab === 'highs' ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86] hover:text-[#F0F3FA]'
                }`}
              >
                52W Highs
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2E39] text-[11px] font-semibold text-[#787B86] uppercase tracking-wider h-8">
                  <th className="py-2 px-3">Symbol</th>
                  <th className="py-2 px-3 text-right">Price</th>
                  <th className="py-2 px-3 text-right">Change %</th>
                  <th className="py-2 px-3 text-right hidden sm:table-cell">Volume</th>
                  <th className="py-2 px-3 text-center hidden md:table-cell">Trend (7D)</th>
                  <th className="py-2 px-3 text-center hidden lg:table-cell">Technical Rating</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedMovers.map(item => {
                  const isUp = item.change >= 0;
                  const inWatch = isInWatchlist(item.symbol);
                  const flashClass = item.lastTickDirection === 'up'
                    ? 'flash-green'
                    : item.lastTickDirection === 'down'
                    ? 'flash-red'
                    : '';

                  return (
                    <tr
                      key={item.symbol}
                      className={`h-9 border-b border-[#2A2E39]/70 hover:bg-[#2A2E39] transition-colors cursor-pointer text-xs ${flashClass}`}
                      onClick={() => setSelectedSymbol(item)}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(item.symbol);
                            }}
                            className={`text-xs p-1 rounded hover:bg-[#363A45] transition-colors ${
                              inWatch ? 'text-[#2962FF]' : 'text-[#50535E] hover:text-[#787B86]'
                            }`}
                            title={inWatch ? "Remove from Watchlist" : "Add to Watchlist"}
                          >
                            ★
                          </button>
                          <div>
                            <span className="font-bold text-[#F0F3FA] group-hover:text-[#2962FF]">{item.symbol}</span>
                            <span className="text-[10px] text-[#787B86] ml-1.5 hidden sm:inline">{item.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 px-3 text-right font-mono font-semibold text-[#F0F3FA] tabular-nums">
                        {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: item.decimals, maximumFractionDigits: item.decimals })}
                      </td>

                      <td className="py-2 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-semibold text-[11px] tabular-nums ${
                          isUp 
                            ? 'bg-[#089981]/15 text-[#089981]' 
                            : 'bg-[#F23645]/15 text-[#F23645]'
                        }`}>
                          {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-2 px-3 text-right font-mono text-[#787B86] tabular-nums hidden sm:table-cell">
                        {item.volumeFormatted}
                      </td>

                      <td className="py-2 px-3 text-center hidden md:table-cell">
                        <div className="flex justify-center">
                          <Sparkline data={item.sparkline} width={64} height={20} isPositive={isUp} />
                        </div>
                      </td>

                      <td className="py-2 px-3 text-center hidden lg:table-cell">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.rating.includes('Buy')
                            ? 'bg-[#089981]/20 text-[#089981]'
                            : item.rating.includes('Sell')
                            ? 'bg-[#F23645]/20 text-[#F23645]'
                            : 'bg-[#2A2E39] text-[#787B86]'
                        }`}>
                          {item.rating}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedSymbol(item)}
                          className="px-2 py-1 rounded bg-[#2962FF]/15 hover:bg-[#2962FF] text-[#2962FF] hover:text-white text-[11px] font-semibold transition-all"
                        >
                          Chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-2 border-t border-[#2A2E39] flex items-center justify-between text-xs text-[#787B86]">
            <span>Showing top market movements based on real-time stream</span>
            <button
              onClick={() => setActiveCategory('stocks')}
              className="text-[#2962FF] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View full screener</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Market Sentiment & Breadth Barometer */}
        <div className="space-y-4">
          
          {/* Sentiment Gauge Card */}
          <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#2962FF]" />
                <h3 className="text-sm font-bold text-[#F0F3FA] uppercase tracking-wider">Market Sentiment</h3>
              </div>
              <span className="text-[10px] bg-[#089981]/20 text-[#089981] font-semibold px-1.5 py-0.5 rounded">
                BULLISH BIAS
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-3xl font-extrabold text-[#089981] font-mono">68</div>
              <div className="text-xs font-semibold text-[#F0F3FA] mt-0.5 uppercase tracking-wide">Greed</div>
              <div className="text-[11px] text-[#787B86] mt-1">Fear & Greed Index (Previous Close: 64)</div>
            </div>

            {/* Custom Meter Gradient Bar */}
            <div className="mt-2 space-y-1">
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#F23645] via-[#ffb3b0] to-[#089981] relative">
                {/* Pointer indicator */}
                <div 
                  className="absolute -top-1 w-4 h-4 bg-white rounded-full shadow-md border-2 border-[#131722] transform -translate-x-1/2"
                  style={{ left: '68%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#50535E] font-mono">
                <span>0 Extreme Fear</span>
                <span>50 Neutral</span>
                <span>100 Extreme Greed</span>
              </div>
            </div>

            {/* Market Breadth Matrix */}
            <div className="mt-4 pt-3 border-t border-[#2A2E39] grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#131722] p-2 rounded border border-[#2A2E39]">
                <div className="text-[10px] text-[#787B86]">Advancing vs Declining</div>
                <div className="font-mono font-semibold text-[#089981] mt-0.5">342 : 158</div>
                <div className="text-[10px] text-[#787B86]">68.4% Advancing</div>
              </div>
              <div className="bg-[#131722] p-2 rounded border border-[#2A2E39]">
                <div className="text-[10px] text-[#787B86]">52W Highs vs Lows</div>
                <div className="font-mono font-semibold text-[#F0F3FA] mt-0.5">58 : 9</div>
                <div className="text-[10px] text-[#089981]">+49 Net Highs</div>
              </div>
            </div>
          </div>

          {/* Quick Heatmap preview widget */}
          <div 
            onClick={() => setActiveCategory('heatmap')}
            className="bg-[#1E222D] hover:bg-[#262A35] border border-[#2A2E39] hover:border-[#363A45] rounded-lg p-4 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2962FF]" />
                <h4 className="text-xs font-bold uppercase text-[#F0F3FA]">Market Capitalization Heatmap</h4>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#787B86] group-hover:text-[#2962FF] transition-colors" />
            </div>
            <p className="text-[11px] text-[#787B86]">
              Visual breakdown of market performance by sector and weight.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-1 h-8 rounded overflow-hidden">
              <div className="bg-[#089981] flex items-center justify-center text-[10px] font-bold text-white">NVDA +3.6%</div>
              <div className="bg-[#089981]/80 flex items-center justify-center text-[10px] font-bold text-white">AAPL +0.7%</div>
              <div className="bg-[#089981] flex items-center justify-center text-[10px] font-bold text-white">TSLA +5.8%</div>
              <div className="bg-[#F23645] flex items-center justify-center text-[10px] font-bold text-white">MSFT -0.5%</div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Global Sector Performance Strip */}
      <section className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#F0F3FA] uppercase tracking-wider flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#2962FF]" />
            U.S. Sector Performance (Today)
          </h3>
          <span className="text-xs text-[#787B86]">Ranked by daily price change</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SECTOR_PERFORMANCES.map(sec => {
            const isUp = sec.changePercent >= 0;
            return (
              <div
                key={sec.sector}
                className="bg-[#131722] border border-[#2A2E39] hover:border-[#363A45] rounded p-2.5 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-semibold text-[#F0F3FA] truncate" title={sec.sector}>
                    {sec.sector}
                  </div>
                  <div className="text-[10px] text-[#787B86] mt-0.5">{sec.marketCapFormatted}</div>
                </div>

                <div className="mt-2.5">
                  <div className={`text-xs font-mono font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                    {isUp ? '+' : ''}{sec.changePercent.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-[#50535E] truncate mt-0.5">
                    Top: <span className="text-[#F0F3FA] font-mono">{sec.topStock}</span> ({sec.topStockGain > 0 ? '+' : ''}{sec.topStockGain}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Bottom Section: Market News & Economic Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Breaking News Feed */}
        <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2E39]">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#2962FF]" />
              <h3 className="text-sm font-bold text-[#F0F3FA] uppercase tracking-wider">Market Intelligence</h3>
            </div>
            
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'bullish', 'bearish'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setNewsFilter(f)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    newsFilter === f ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86] hover:text-[#F0F3FA]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#2A2E39]/60">
            {filteredNews.map(news => (
              <div key={news.id} className="py-3 hover:bg-[#262A35]/50 px-1 rounded transition-colors">
                <div className="flex items-center justify-between text-[11px] text-[#787B86] mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#2962FF]">{news.source}</span>
                    <span>•</span>
                    <span>{news.timeAgo}</span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                    news.sentiment === 'bullish' 
                      ? 'bg-[#089981]/15 text-[#089981]' 
                      : news.sentiment === 'bearish'
                      ? 'bg-[#F23645]/15 text-[#F23645]'
                      : 'bg-[#2A2E39] text-[#787B86]'
                  }`}>
                    {news.sentiment}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-[#F0F3FA] hover:text-[#2962FF] transition-colors leading-snug">
                  {news.title}
                </h4>
                <p className="text-[11px] text-[#787B86] mt-1 line-clamp-2">
                  {news.summary}
                </p>

                <div className="flex items-center gap-1.5 mt-2">
                  {news.symbols.map(sym => (
                    <button
                      key={sym}
                      onClick={() => {
                        const target = symbols.find(s => s.symbol === sym);
                        if (target) setSelectedSymbol(target);
                      }}
                      className="text-[10px] font-mono bg-[#131722] text-[#787B86] hover:text-[#2962FF] hover:border-[#2962FF] px-1.5 py-0.5 rounded border border-[#2A2E39] transition-colors"
                    >
                      ${sym}
                    </button>
                  ))}
                  <span className="text-[10px] text-[#50535E] ml-auto">{news.readTime} read</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Calendar Events */}
        <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2E39]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2962FF]" />
              <h3 className="text-sm font-bold text-[#F0F3FA] uppercase tracking-wider">Economic Calendar (Today)</h3>
            </div>
            <span className="text-[11px] text-[#787B86] font-mono">EST Timezone</span>
          </div>

          <div className="divide-y divide-[#2A2E39]/60">
            {ECONOMIC_EVENTS.map(event => (
              <div key={event.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-[120px]">
                  <span className="text-sm">{event.flag}</span>
                  <div>
                    <span className="font-mono text-[#F0F3FA] font-medium text-[11px]">{event.time}</span>
                    <span className="text-[10px] text-[#787B86] block font-mono">{event.country}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-[#F0F3FA] text-xs truncate">{event.event}</span>
                    <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                      event.impact === 'high' 
                        ? 'bg-[#F23645]/20 text-[#F23645]' 
                        : 'bg-[#2A2E39] text-[#787B86]'
                    }`}>
                      {event.impact}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right font-mono text-xs tabular-nums shrink-0">
                  <div>
                    <span className="text-[10px] text-[#787B86] block">Act</span>
                    <span className="font-semibold text-[#089981]">{event.actual}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#787B86] block">Fcst</span>
                    <span className="text-[#787B86]">{event.forecast}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#787B86] block">Prev</span>
                    <span className="text-[#50535E]">{event.previous}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-[#2A2E39] text-[11px] text-[#787B86] flex items-center justify-between">
            <span>High-impact macroeconomic releases affect asset volatility</span>
            <span className="text-[#2962FF] font-semibold cursor-pointer hover:underline">Full Weekly Calendar →</span>
          </div>
        </div>

      </div>

    </div>
  );
};

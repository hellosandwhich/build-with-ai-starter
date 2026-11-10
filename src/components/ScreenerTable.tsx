import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketSymbol, SectorType } from '../types/market';
import { Sparkline } from './Sparkline';
import { 
  ArrowUpDown, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';

interface ScreenerTableProps {
  category: 'stocks' | 'crypto' | 'forex' | 'indices' | 'futures';
  title: string;
  subtitle?: string;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'peRatio';
type SortOrder = 'asc' | 'desc';

export const ScreenerTable: React.FC<ScreenerTableProps> = ({ category, title, subtitle }) => {
  const { 
    symbols, 
    setSelectedSymbol, 
    toggleWatchlist, 
    isInWatchlist, 
    executeOrder 
  } = useMarket();

  const [filterPreset, setFilterPreset] = useState<'all' | 'gainers' | 'losers' | 'high_vol' | 'strong_buy'>('all');
  const [selectedSector, setSelectedSector] = useState<SectorType>('All Sectors');
  const [localSearch, setLocalSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter symbols for this category
  const categorySymbols = useMemo(() => {
    return symbols.filter(item => {
      if (category === 'stocks') return item.category === 'stocks';
      if (category === 'crypto') return item.category === 'crypto';
      if (category === 'forex') return item.category === 'forex';
      if (category === 'indices') return item.category === 'indices';
      if (category === 'futures') return item.category === 'commodities' || item.category === 'bonds';
      return true;
    });
  }, [symbols, category]);

  // Apply search, sector, and preset filters
  const filteredData = useMemo(() => {
    let result = categorySymbols;

    // Search query
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      result = result.filter(s => 
        s.symbol.toLowerCase().includes(q) || 
        s.name.toLowerCase().includes(q) ||
        (s.sector && s.sector.toLowerCase().includes(q))
      );
    }

    // Sector filter for stocks
    if (category === 'stocks' && selectedSector !== 'All Sectors') {
      result = result.filter(s => s.sector === selectedSector);
    }

    // Presets
    if (filterPreset === 'gainers') {
      result = result.filter(s => s.changePercent > 0);
    } else if (filterPreset === 'losers') {
      result = result.filter(s => s.changePercent < 0);
    } else if (filterPreset === 'strong_buy') {
      result = result.filter(s => s.rating === 'Strong Buy' || s.rating === 'Buy');
    } else if (filterPreset === 'high_vol') {
      // Top 50% by volume
      const medianVol = 10000000;
      result = result.filter(s => s.volume > medianVol);
    }

    // Sort
    return [...result].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === undefined) valA = 0;
      if (valB === undefined) valB = 0;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [categorySymbols, localSearch, selectedSector, filterPreset, sortField, sortOrder, category]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sectors: SectorType[] = [
    'All Sectors',
    'Technology',
    'Communication Services',
    'Consumer Cyclical',
    'Healthcare',
    'Financial',
    'Energy',
    'Industrials'
  ];

  return (
    <div className="space-y-4">
      
      {/* Table Header Controls & Title */}
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#F0F3FA] uppercase tracking-wide">{title}</h2>
              <span className="bg-[#2A2E39] text-[#787B86] text-xs font-mono px-2 py-0.5 rounded">
                {filteredData.length} symbols
              </span>
            </div>
            {subtitle && <p className="text-xs text-[#787B86] mt-0.5">{subtitle}</p>}
          </div>

          {/* Search within screener */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#787B86] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter symbols or name..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#131722] border border-[#2A2E39] rounded text-xs text-[#F0F3FA] focus:outline-none focus:border-[#2962FF] placeholder-[#50535E]"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills & Sector Controls */}
        <div className="mt-3 pt-3 border-t border-[#2A2E39] flex flex-wrap items-center justify-between gap-2">
          
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(['all', 'gainers', 'losers', 'high_vol', 'strong_buy'] as const).map(preset => {
              const labels = {
                all: 'All Assets',
                gainers: 'Gainers (Green)',
                losers: 'Losers (Red)',
                high_vol: 'High Volume',
                strong_buy: 'Strong Buy Ratings'
              };
              const isActive = filterPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setFilterPreset(preset)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                    isActive
                      ? 'bg-[#2A2E39] text-[#F0F3FA] border-[#363A45]'
                      : 'bg-transparent text-[#787B86] hover:text-[#F0F3FA] border-transparent hover:bg-[#2A2E39]/40'
                  }`}
                >
                  {labels[preset]}
                </button>
              );
            })}
          </div>

          {/* Sector filter for stocks */}
          {category === 'stocks' && (
            <div className="flex items-center gap-1.5 text-xs text-[#787B86]">
              <span className="hidden sm:inline">Sector:</span>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value as SectorType)}
                className="bg-[#131722] border border-[#2A2E39] text-[#F0F3FA] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#2962FF]"
              >
                {sectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* Main High-Density Data Table */}
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Headers: 28px height, #131722 background, uppercase label-sm #787B86 */}
            <thead>
              <tr className="bg-[#131722] border-b border-[#2A2E39] text-[11px] font-semibold text-[#787B86] uppercase tracking-wider h-7 select-none">
                <th className="py-1.5 px-3 w-8 text-center">★</th>
                <th 
                  className="py-1.5 px-3 cursor-pointer hover:text-[#F0F3FA] transition-colors"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-1">
                    <span>Ticker & Name</span>
                    {sortField === 'symbol' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>

                <th 
                  className="py-1.5 px-3 text-right cursor-pointer hover:text-[#F0F3FA] transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Last Price</span>
                    {sortField === 'price' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>

                <th 
                  className="py-1.5 px-3 text-right cursor-pointer hover:text-[#F0F3FA] transition-colors"
                  onClick={() => handleSort('changePercent')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Change %</span>
                    {sortField === 'changePercent' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>

                <th className="py-1.5 px-3 text-center hidden md:table-cell">
                  <span>24h Range</span>
                </th>

                <th 
                  className="py-1.5 px-3 text-right cursor-pointer hover:text-[#F0F3FA] transition-colors hidden sm:table-cell"
                  onClick={() => handleSort('volume')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume</span>
                    {sortField === 'volume' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>

                {category !== 'forex' && (
                  <th 
                    className="py-1.5 px-3 text-right cursor-pointer hover:text-[#F0F3FA] transition-colors hidden lg:table-cell"
                    onClick={() => handleSort('marketCap')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Market Cap</span>
                      {sortField === 'marketCap' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                )}

                {category === 'stocks' && (
                  <th 
                    className="py-1.5 px-3 text-right cursor-pointer hover:text-[#F0F3FA] transition-colors hidden xl:table-cell"
                    onClick={() => handleSort('peRatio')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>P/E</span>
                      {sortField === 'peRatio' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                )}

                <th className="py-1.5 px-3 text-center hidden md:table-cell">
                  <span>7D Trend</span>
                </th>

                <th className="py-1.5 px-3 text-center hidden lg:table-cell">
                  <span>Technical</span>
                </th>

                <th className="py-1.5 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>

            {/* Table Rows: 36px total height, live flashes on tick */}
            <tbody className="divide-y divide-[#2A2E39]/70">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-[#787B86]">
                    No instruments matching current search and filters.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => {
                  const isUp = item.change >= 0;
                  const inWatch = isInWatchlist(item.symbol);
                  const flashClass = item.lastTickDirection === 'up'
                    ? 'flash-green'
                    : item.lastTickDirection === 'down'
                    ? 'flash-red'
                    : '';

                  // Calculate 24h range progress percentage
                  const rangeSpan = item.high24h - item.low24h || 1;
                  const rangePct = Math.min(100, Math.max(0, ((item.price - item.low24h) / rangeSpan) * 100));

                  return (
                    <tr
                      key={item.symbol}
                      onClick={() => setSelectedSymbol(item)}
                      className={`h-9 hover:bg-[#2A2E39] transition-colors cursor-pointer text-xs group ${flashClass}`}
                    >
                      {/* Watchlist Star */}
                      <td className="py-1.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleWatchlist(item.symbol)}
                          className={`text-xs p-1 rounded hover:bg-[#363A45] transition-colors ${
                            inWatch ? 'text-[#2962FF]' : 'text-[#50535E] hover:text-[#787B86]'
                          }`}
                          title={inWatch ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          ★
                        </button>
                      </td>

                      {/* Symbol & Name */}
                      <td className="py-1.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#F0F3FA] group-hover:text-[#2962FF] transition-colors">
                            {item.symbol}
                          </span>
                          <span className="text-[10px] text-[#787B86] font-mono bg-[#131722] px-1 py-0.2 rounded">
                            {item.exchange}
                          </span>
                          <span className="text-[11px] text-[#787B86] truncate max-w-[140px] hidden sm:inline">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-1.5 px-3 text-right font-mono font-semibold text-[#F0F3FA] tabular-nums">
                        {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: item.decimals, maximumFractionDigits: item.decimals })}
                      </td>

                      {/* Change % Pill */}
                      <td className="py-1.5 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-semibold text-[11px] tabular-nums ${
                          isUp 
                            ? 'bg-[#089981]/15 text-[#089981]' 
                            : 'bg-[#F23645]/15 text-[#F23645]'
                        }`}>
                          {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* 24h Range Bar */}
                      <td className="py-1.5 px-3 text-center hidden md:table-cell">
                        <div className="w-24 mx-auto space-y-1">
                          <div className="flex justify-between text-[9px] text-[#50535E] font-mono">
                            <span>{item.low24h}</span>
                            <span>{item.high24h}</span>
                          </div>
                          <div className="h-1 bg-[#131722] rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full ${isUp ? 'bg-[#089981]' : 'bg-[#F23645]'}`}
                              style={{ width: `${rangePct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-1.5 px-3 text-right font-mono text-[#787B86] tabular-nums hidden sm:table-cell">
                        {item.volumeFormatted}
                      </td>

                      {/* Market Cap */}
                      {category !== 'forex' && (
                        <td className="py-1.5 px-3 text-right font-mono text-[#F0F3FA] tabular-nums hidden lg:table-cell">
                          {item.marketCapFormatted || '--'}
                        </td>
                      )}

                      {/* P/E Ratio */}
                      {category === 'stocks' && (
                        <td className="py-1.5 px-3 text-right font-mono text-[#787B86] tabular-nums hidden xl:table-cell">
                          {item.peRatio ? item.peRatio.toFixed(1) : '--'}
                        </td>
                      )}

                      {/* 7D Trend Sparkline */}
                      <td className="py-1.5 px-3 text-center hidden md:table-cell">
                        <div className="flex justify-center">
                          <Sparkline data={item.sparkline} width={64} height={20} isPositive={isUp} />
                        </div>
                      </td>

                      {/* Technical Rating */}
                      <td className="py-1.5 px-3 text-center hidden lg:table-cell">
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

                      {/* Quick Actions (Trade & Chart) */}
                      <td className="py-1.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              executeOrder(item.symbol, 'buy', 'market', item.category === 'crypto' ? 0.1 : 10);
                            }}
                            className="px-2 py-0.5 rounded bg-[#089981]/20 hover:bg-[#089981] text-[#089981] hover:text-white font-mono text-[10px] font-bold transition-colors"
                            title={`Quick Buy 10 shares of ${item.symbol}`}
                          >
                            BUY
                          </button>
                          <button
                            onClick={() => setSelectedSymbol(item)}
                            className="px-2 py-0.5 rounded bg-[#2962FF] hover:bg-[#1E53E5] text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                          >
                            <BarChart2 className="w-3 h-3" />
                            <span>Chart</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

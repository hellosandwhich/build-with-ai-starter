import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketSymbol } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { symbols, setSelectedSymbol } = useMarket();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'stocks' | 'crypto' | 'forex' | 'indices' | 'commodities'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global hotkey listener for Cmd+K and '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // handled in parent or toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = symbols.filter(item => {
    if (activeFilter !== 'all') {
      if (activeFilter === 'commodities') {
        if (item.category !== 'commodities' && item.category !== 'bonds') return false;
      } else if (item.category !== activeFilter) {
        return false;
      }
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.symbol.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.sector && item.sector.toLowerCase().includes(q))
    );
  });

  const handleSelect = (item: MarketSymbol) => {
    setSelectedSymbol(item);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-3 select-none">
      <div className="bg-[#1E222D] border border-[#363A45] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#2A2E39] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#787B86] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search by symbol, company, asset class, or market..."
            className="flex-1 bg-transparent text-sm text-[#F0F3FA] placeholder-[#50535E] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#131722] text-[#787B86] hover:text-[#F0F3FA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-3.5 py-2 bg-[#171B26] border-b border-[#2A2E39] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {(['all', 'stocks', 'crypto', 'forex', 'indices', 'commodities'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                setActiveFilter(f);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-[#2962FF] text-white'
                  : 'bg-[#131722] text-[#787B86] hover:text-[#F0F3FA]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#2A2E39]/60">
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#787B86]">
              No instruments found for "{query}".
            </div>
          ) : (
            results.map((item, idx) => {
              const isUp = item.change >= 0;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.symbol}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#F0F3FA] text-sm w-16">{item.symbol}</span>
                    <div>
                      <div className="text-[#F0F3FA] font-medium truncate max-w-xs">{item.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-[#787B86]">
                        <span className="font-mono">{item.exchange}</span>
                        <span>•</span>
                        <span className="capitalize">{item.category}</span>
                        {item.sector && (
                          <>
                            <span>•</span>
                            <span>{item.sector}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-right">
                    <div>
                      <div className="font-bold text-[#F0F3FA] tabular-nums">
                        {item.currency}{item.price.toFixed(item.decimals)}
                      </div>
                      <div className={`text-[10px] font-semibold tabular-nums flex items-center justify-end ${
                        isUp ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}>
                        {isUp ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                        <span>{isUp ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>

                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#2962FF]' : 'text-transparent'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Hotkey Hint */}
        <div className="bg-[#131722] border-t border-[#2A2E39] px-3.5 py-2 flex items-center justify-between text-[11px] text-[#787B86] font-mono">
          <span>Navigate with <kbd className="bg-[#1E222D] px-1 rounded border border-[#2A2E39]">↑</kbd> <kbd className="bg-[#1E222D] px-1 rounded border border-[#2A2E39]">↓</kbd></span>
          <span>Open chart with <kbd className="bg-[#1E222D] px-1 rounded border border-[#2A2E39]">ENTER</kbd></span>
        </div>

      </div>
    </div>
  );
};

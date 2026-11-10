import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MarketSymbol, AssetCategory, Position, TradeOrder, PriceAlert } from '../types/market';
import { INITIAL_MARKET_SYMBOLS } from '../data/mockMarketData';

interface ToastNotice {
  id: string;
  message: string;
  type: 'success' | 'alert' | 'info';
}

interface MarketContextType {
  symbols: MarketSymbol[];
  activeCategory: AssetCategory;
  setActiveCategory: (cat: AssetCategory) => void;
  selectedSymbol: MarketSymbol | null;
  setSelectedSymbol: (symbol: MarketSymbol | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // Real-time streaming
  isLiveStreaming: boolean;
  setIsLiveStreaming: (live: boolean) => void;
  streamingSpeed: 'slow' | 'normal' | 'fast';
  setStreamingSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  triggerManualTick: () => void;

  // Watchlist & alerts
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  isWatchlistDrawerOpen: boolean;
  setIsWatchlistDrawerOpen: (open: boolean) => void;
  alerts: PriceAlert[];
  addAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  removeAlert: (id: string) => void;

  // Paper trading account
  paperBalance: number;
  positions: Position[];
  orders: TradeOrder[];
  executeOrder: (
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit',
    quantity: number,
    price?: number,
    takeProfit?: number,
    stopLoss?: number
  ) => boolean;
  closePosition: (positionId: string) => void;
  totalPortfolioValue: number;
  totalUnrealizedPnl: number;

  // Toast notifications
  toasts: ToastNotice[];
  removeToast: (id: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [symbols, setSymbols] = useState<MarketSymbol[]>(() => {
    return INITIAL_MARKET_SYMBOLS.map(s => ({
      ...s,
      lastTickDirection: null,
      lastTickTimestamp: 0
    }));
  });

  const [activeCategory, setActiveCategory] = useState<AssetCategory>('overview');
  const [selectedSymbol, setSelectedSymbol] = useState<MarketSymbol | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Streaming controls
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [streamingSpeed, setStreamingSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  // Watchlist
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tv_markets_watchlist');
      return saved ? JSON.parse(saved) : ['NVDA', 'BTCUSD', 'AAPL', 'TSLA', 'SPX', 'EURUSD'];
    } catch {
      return ['NVDA', 'BTCUSD', 'AAPL', 'TSLA', 'SPX', 'EURUSD'];
    }
  });

  const [isWatchlistDrawerOpen, setIsWatchlistDrawerOpen] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  // Paper Trading
  const [paperBalance, setPaperBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tv_paper_balance');
      return saved ? Number(saved) : 100000;
    } catch {
      return 100000;
    }
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const saved = localStorage.getItem('tv_paper_positions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'pos-1',
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          side: 'buy',
          quantity: 50,
          entryPrice: 132.50,
          currentPrice: 138.25,
          unrealizedPnl: 287.50,
          unrealizedPnlPercent: 4.34,
          createdAt: Date.now() - 3600000 * 24
        },
        {
          id: 'pos-2',
          symbol: 'BTCUSD',
          name: 'Bitcoin',
          side: 'buy',
          quantity: 0.5,
          entryPrice: 85200,
          currentPrice: 88450,
          unrealizedPnl: 1625.00,
          unrealizedPnlPercent: 3.81,
          createdAt: Date.now() - 3600000 * 12
        }
      ];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<TradeOrder[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tv_markets_watchlist', JSON.stringify(watchlist));
    } catch {
      // Ignore
    }
  }, [watchlist]);

  // Save positions and balance
  useEffect(() => {
    try {
      localStorage.setItem('tv_paper_balance', paperBalance.toString());
      localStorage.setItem('tv_paper_positions', JSON.stringify(positions));
    } catch {
      // Ignore
    }
  }, [paperBalance, positions]);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => {
      const exists = prev.includes(symbol);
      if (exists) {
        addToast(`Removed ${symbol} from Watchlist`, 'info');
        return prev.filter(s => s !== symbol);
      } else {
        addToast(`Added ${symbol} to Watchlist`, 'success');
        return [...prev, symbol];
      }
    });
  }, [addToast]);

  const isInWatchlist = useCallback((symbol: string) => watchlist.includes(symbol), [watchlist]);

  // Add / Remove alerts
  const addAlert = useCallback((symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substring(2, 9),
      symbol,
      targetPrice,
      condition,
      createdAt: Date.now()
    };
    setAlerts(prev => [...prev, newAlert]);
    addToast(`Alert created for ${symbol} when price is ${condition} ${targetPrice}`, 'success');
  }, [addToast]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Realistic simulation tick engine
  const applyTickUpdates = useCallback(() => {
    setSymbols(prevSymbols => {
      // Pick 2 to 5 random symbols to tick simultaneously
      const tickCount = Math.floor(Math.random() * 4) + 2;
      const updatedIndices = new Set<number>();
      while (updatedIndices.size < tickCount) {
        const randIdx = Math.floor(Math.random() * prevSymbols.length);
        updatedIndices.add(randIdx);
      }

      const now = Date.now();
      const nextSymbols = prevSymbols.map((item, idx) => {
        if (!updatedIndices.has(idx)) {
          // Clear active tick flash after 800ms
          if (item.lastTickTimestamp && now - item.lastTickTimestamp > 1200) {
            return { ...item, lastTickDirection: null };
          }
          return item;
        }

        // Realistic tick delta between -0.35% and +0.38%
        const deltaPercent = (Math.random() - 0.48) * 0.007;
        const rawDelta = item.price * deltaPercent;
        const newPrice = Math.max(0.0001, Number((item.price + rawDelta).toFixed(item.decimals)));
        const direction: 'up' | 'down' = newPrice >= item.price ? 'up' : 'down';
        
        const newChange = Number((newPrice - item.previousClose).toFixed(item.decimals));
        const newChangePercent = Number(((newChange / item.previousClose) * 100).toFixed(2));
        const newHigh = Math.max(item.high24h, newPrice);
        const newLow = Math.min(item.low24h, newPrice);

        // Update sparkline with trailing window
        const newSparkline = [...item.sparkline.slice(1), newPrice];

        return {
          ...item,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          high24h: newHigh,
          low24h: newLow,
          sparkline: newSparkline,
          lastTickDirection: direction,
          lastTickTimestamp: now
        };
      });

      // Also update selectedSymbol in sync if open
      return nextSymbols;
    });
  }, []);

  // Keep selectedSymbol updated with latest price
  useEffect(() => {
    if (selectedSymbol) {
      const liveCurrent = symbols.find(s => s.symbol === selectedSymbol.symbol);
      if (liveCurrent && liveCurrent.price !== selectedSymbol.price) {
        setSelectedSymbol(liveCurrent);
      }
    }
  }, [symbols, selectedSymbol]);

  // Update open positions PnL with current prices and check alerts
  useEffect(() => {
    setPositions(prevPositions => {
      let changed = false;
      const updated = prevPositions.map(pos => {
        const sym = symbols.find(s => s.symbol === pos.symbol);
        if (!sym) return pos;

        const currentPrice = sym.price;
        const diff = pos.side === 'buy' ? (currentPrice - pos.entryPrice) : (pos.entryPrice - currentPrice);
        const pnl = Number((diff * pos.quantity).toFixed(2));
        const pnlPercent = Number(((diff / pos.entryPrice) * 100).toFixed(2));

        if (pos.currentPrice !== currentPrice || pos.unrealizedPnl !== pnl) {
          changed = true;
          return {
            ...pos,
            currentPrice,
            unrealizedPnl: pnl,
            unrealizedPnlPercent: pnlPercent
          };
        }
        return pos;
      });

      return changed ? updated : prevPositions;
    });

    // Check price alerts
    alerts.forEach(alert => {
      if (alert.triggered) return;
      const sym = symbols.find(s => s.symbol === alert.symbol);
      if (!sym) return;

      const triggered = alert.condition === 'above' ? sym.price >= alert.targetPrice : sym.price <= alert.targetPrice;
      if (triggered) {
        alert.triggered = true;
        addToast(`🚨 ALERT TRIGGERED: ${alert.symbol} reached target price ${alert.targetPrice}!`, 'alert');
      }
    });
  }, [symbols, alerts, addToast]);

  // Live timer tick runner
  useEffect(() => {
    if (!isLiveStreaming) return;

    const intervalMs = streamingSpeed === 'fast' ? 1200 : streamingSpeed === 'slow' ? 4500 : 2400;
    const interval = setInterval(applyTickUpdates, intervalMs);
    return () => clearInterval(interval);
  }, [isLiveStreaming, streamingSpeed, applyTickUpdates]);

  const triggerManualTick = useCallback(() => {
    applyTickUpdates();
  }, [applyTickUpdates]);

  // Order Execution & Paper Trading
  const executeOrder = useCallback((
    symbolTicker: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit',
    quantity: number,
    targetPrice?: number,
    takeProfit?: number,
    stopLoss?: number
  ): boolean => {
    const sym = symbols.find(s => s.symbol === symbolTicker);
    if (!sym) return false;

    const fillPrice = targetPrice && type === 'limit' ? targetPrice : sym.price;
    const orderCost = fillPrice * quantity;

    if (side === 'buy' && orderCost > paperBalance) {
      addToast(`Order rejected: Insufficient funds ($${paperBalance.toLocaleString()} available vs $${orderCost.toLocaleString()} required)`, 'alert');
      return false;
    }

    // Deduct / credit balance
    if (side === 'buy') {
      setPaperBalance(b => Number((b - orderCost).toFixed(2)));
    } else {
      setPaperBalance(b => Number((b + orderCost).toFixed(2)));
    }

    const newOrder: TradeOrder = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: sym.symbol,
      side,
      type,
      quantity,
      price: fillPrice,
      status: 'filled',
      timestamp: Date.now(),
      total: orderCost
    };

    setOrders(prev => [newOrder, ...prev]);

    // Check if we should add or merge position
    setPositions(prev => {
      const existing = prev.find(p => p.symbol === sym.symbol && p.side === side);
      if (existing) {
        const newTotalQty = existing.quantity + quantity;
        const newAvgEntry = ((existing.entryPrice * existing.quantity) + (fillPrice * quantity)) / newTotalQty;
        return prev.map(p => p.id === existing.id ? {
          ...p,
          quantity: newTotalQty,
          entryPrice: Number(newAvgEntry.toFixed(sym.decimals)),
          currentPrice: sym.price
        } : p);
      } else {
        const newPos: Position = {
          id: Math.random().toString(36).substring(2, 9),
          symbol: sym.symbol,
          name: sym.name,
          side,
          quantity,
          entryPrice: fillPrice,
          currentPrice: sym.price,
          takeProfit,
          stopLoss,
          unrealizedPnl: 0,
          unrealizedPnlPercent: 0,
          createdAt: Date.now()
        };
        return [newPos, ...prev];
      }
    });

    addToast(`Filled ${side.toUpperCase()} ${quantity} ${sym.symbol} @ ${sym.currency}${fillPrice}`, 'success');
    return true;
  }, [symbols, paperBalance, addToast]);

  const closePosition = useCallback((positionId: string) => {
    setPositions(prev => {
      const pos = prev.find(p => p.id === positionId);
      if (!pos) return prev;

      const sym = symbols.find(s => s.symbol === pos.symbol);
      const closePrice = sym ? sym.price : pos.currentPrice;
      const returnedValue = pos.side === 'buy' ? closePrice * pos.quantity : (pos.entryPrice * 2 - closePrice) * pos.quantity;

      setPaperBalance(b => Number((b + returnedValue).toFixed(2)));
      addToast(`Closed position ${pos.symbol} for PnL: ${pos.unrealizedPnl >= 0 ? '+' : ''}$${pos.unrealizedPnl.toFixed(2)}`, pos.unrealizedPnl >= 0 ? 'success' : 'alert');

      return prev.filter(p => p.id !== positionId);
    });
  }, [symbols, addToast]);

  // Aggregate stats
  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
  const totalPositionsValue = positions.reduce((acc, p) => acc + (p.currentPrice * p.quantity), 0);
  const totalPortfolioValue = paperBalance + totalPositionsValue;

  return (
    <MarketContext.Provider
      value={{
        symbols,
        activeCategory,
        setActiveCategory,
        selectedSymbol,
        setSelectedSymbol,
        searchQuery,
        setSearchQuery,
        isLiveStreaming,
        setIsLiveStreaming,
        streamingSpeed,
        setStreamingSpeed,
        triggerManualTick,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        isWatchlistDrawerOpen,
        setIsWatchlistDrawerOpen,
        alerts,
        addAlert,
        removeAlert,
        paperBalance,
        positions,
        orders,
        executeOrder,
        closePosition,
        totalPortfolioValue,
        totalUnrealizedPnl,
        toasts,
        removeToast
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './Sparkline';
import { 
  X, 
  Bookmark, 
  Briefcase, 
  Bell, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  DollarSign
} from 'lucide-react';

export const WatchlistDrawer: React.FC = () => {
  const {
    isWatchlistDrawerOpen,
    setIsWatchlistDrawerOpen,
    watchlist,
    toggleWatchlist,
    symbols,
    setSelectedSymbol,
    positions,
    closePosition,
    paperBalance,
    totalPortfolioValue,
    totalUnrealizedPnl,
    alerts,
    removeAlert,
    orders
  } = useMarket();

  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio' | 'alerts'>('watchlist');

  if (!isWatchlistDrawerOpen) return null;

  const watchlistItems = watchlist
    .map(ticker => symbols.find(s => s.symbol === ticker))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs select-none">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#131722] border-l border-[#2A2E39] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Drawer Top Header */}
          <div className="bg-[#1E222D] border-b border-[#2A2E39] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2962FF]" />
              <h3 className="text-sm font-bold text-[#F0F3FA] uppercase tracking-wider">Trading Desk Drawer</h3>
            </div>
            <button
              onClick={() => setIsWatchlistDrawerOpen(false)}
              className="p-1 rounded bg-[#131722] hover:bg-[#2A2E39] text-[#787B86] hover:text-[#F0F3FA]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Tab Navigation */}
          <div className="grid grid-cols-3 bg-[#171B26] border-b border-[#2A2E39] p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`py-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'watchlist' ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86] hover:text-[#F0F3FA]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist ({watchlist.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'portfolio' ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86] hover:text-[#F0F3FA]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Positions ({positions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'alerts' ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86] hover:text-[#F0F3FA]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts ({alerts.length})</span>
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Tab 1: Watchlist */}
            {activeTab === 'watchlist' && (
              <div className="space-y-2">
                {watchlistItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#787B86]">
                    Your watchlist is currently empty. Star symbols anywhere to add them here!
                  </div>
                ) : (
                  watchlistItems.map(item => {
                    if (!item) return null;
                    const isUp = item.change >= 0;
                    return (
                      <div
                        key={item.symbol}
                        onClick={() => {
                          setSelectedSymbol(item);
                          setIsWatchlistDrawerOpen(false);
                        }}
                        className="bg-[#1E222D] hover:bg-[#262A35] border border-[#2A2E39] hover:border-[#363A45] rounded p-2.5 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(item.symbol);
                            }}
                            className="text-[#2962FF] hover:text-[#F23645] p-1 text-xs"
                            title="Remove from watchlist"
                          >
                            ★
                          </button>
                          <div>
                            <div className="font-bold text-xs text-[#F0F3FA] group-hover:text-[#2962FF] flex items-center gap-1">
                              <span>{item.symbol}</span>
                              <span className="text-[10px] text-[#787B86] font-mono">{item.exchange}</span>
                            </div>
                            <div className="text-[10px] text-[#787B86] truncate max-w-[120px]">{item.name}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Sparkline data={item.sparkline} width={50} height={18} isPositive={isUp} />
                          <div className="text-right font-mono">
                            <div className="text-xs font-bold text-[#F0F3FA] tabular-nums">
                              {item.currency}{item.price.toFixed(item.decimals)}
                            </div>
                            <div className={`text-[10px] font-semibold tabular-nums ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                              {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: Portfolio & Positions */}
            {activeTab === 'portfolio' && (
              <div className="space-y-4">
                {/* Account Summary Banner */}
                <div className="bg-[#1E222D] border border-[#2A2E39] rounded p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#787B86]">Total Portfolio Value</span>
                    <span className="font-mono font-bold text-[#F0F3FA] text-sm tabular-nums">
                      ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#787B86]">Available Cash</span>
                    <span className="font-mono text-[#787B86] tabular-nums">
                      ${paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-[#2A2E39]">
                    <span className="text-[#787B86]">Unrealized PnL</span>
                    <span className={`font-mono font-bold tabular-nums ${totalUnrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Open Positions List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#787B86] uppercase tracking-wider">Active Positions</h4>
                  {positions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#787B86]">
                      No active open positions. Open a chart to execute paper trades!
                    </div>
                  ) : (
                    positions.map(pos => (
                      <div key={pos.id} className="bg-[#1E222D] border border-[#2A2E39] rounded p-3 text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-[#F0F3FA] flex items-center gap-1.5">
                              <span>{pos.symbol}</span>
                              <span className={`text-[10px] px-1 rounded uppercase font-mono font-bold ${
                                pos.side === 'buy' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#F23645]/20 text-[#F23645]'
                              }`}>
                                {pos.side}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#787B86]">{pos.quantity} units @ ${pos.entryPrice}</div>
                          </div>

                          <div className="text-right font-mono">
                            <div className={`font-bold tabular-nums ${pos.unrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                              {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                            </div>
                            <div className={`text-[10px] tabular-nums ${pos.unrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                              ({pos.unrealizedPnlPercent >= 0 ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#2A2E39] flex justify-end">
                          <button
                            onClick={() => closePosition(pos.id)}
                            className="px-2.5 py-1 rounded bg-[#F23645]/20 hover:bg-[#F23645] text-[#F23645] hover:text-white text-[11px] font-bold transition-colors"
                          >
                            Close Position
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Orders Log */}
                {orders.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-[#787B86] uppercase tracking-wider">Recent Executions</h4>
                    <div className="divide-y divide-[#2A2E39] text-xs font-mono">
                      {orders.slice(0, 5).map(o => (
                        <div key={o.id} className="py-2 flex justify-between text-[11px]">
                          <div>
                            <span className={o.side === 'buy' ? 'text-[#089981] font-bold' : 'text-[#F23645] font-bold'}>
                              {o.side.toUpperCase()}
                            </span> {o.quantity} {o.symbol} @ ${o.price}
                          </div>
                          <span className="text-[#089981]">FILLED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Alerts */}
            {activeTab === 'alerts' && (
              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#787B86]">
                    No active price alerts set. Open any symbol to add triggers!
                  </div>
                ) : (
                  alerts.map(a => (
                    <div key={a.id} className="bg-[#1E222D] border border-[#2A2E39] rounded p-3 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#F0F3FA] flex items-center gap-1.5">
                          <span>{a.symbol}</span>
                          <span className="text-[10px] text-[#787B86] uppercase">Price {a.condition}</span>
                        </div>
                        <div className="font-mono text-sm font-bold text-[#2962FF] mt-0.5">
                          ${a.targetPrice.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => removeAlert(a.id)}
                        className="p-1.5 rounded bg-[#131722] hover:bg-[#F23645]/20 text-[#787B86] hover:text-[#F23645] transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

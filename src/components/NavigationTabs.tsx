import React from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetCategory } from '../types/market';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Coins, 
  ArrowLeftRight, 
  BarChart3, 
  Fuel, 
  Grid 
} from 'lucide-react';

interface TabItem {
  id: AssetCategory;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const NavigationTabs: React.FC = () => {
  const { activeCategory, setActiveCategory } = useMarket();

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'stocks', label: 'Stocks', icon: <TrendingUp className="w-3.5 h-3.5" />, badge: 'Mega-Cap' },
    { id: 'crypto', label: 'Crypto', icon: <Coins className="w-3.5 h-3.5" />, badge: '$2.74T' },
    { id: 'forex', label: 'Forex', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
    { id: 'indices', label: 'Indices', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'futures', label: 'Commodities & Bonds', icon: <Fuel className="w-3.5 h-3.5" /> },
    { id: 'heatmap', label: 'Market Heatmap', icon: <Grid className="w-3.5 h-3.5" />, badge: 'Live Treemap' }
  ];

  return (
    <div className="bg-[#131722] border-b border-[#2A2E39] select-none">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {tabs.map(tab => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-[#2A2E39] text-[#F0F3FA] border-[#363A45] shadow-sm'
                    : 'bg-transparent text-[#787B86] hover:text-[#F0F3FA] hover:bg-[#1E222D] border-transparent'
                }`}
              >
                <span className={isActive ? 'text-[#2962FF]' : 'text-[#787B86]'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-[#2962FF]/20 text-[#7ba4ff]'
                      : 'bg-[#1E222D] text-[#787B86]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

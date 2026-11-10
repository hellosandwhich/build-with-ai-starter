export type AssetCategory = 'overview' | 'stocks' | 'crypto' | 'forex' | 'indices' | 'futures' | 'heatmap';

export type SectorType = 
  | 'All Sectors'
  | 'Technology'
  | 'Communication Services'
  | 'Consumer Cyclical'
  | 'Healthcare'
  | 'Financial'
  | 'Energy'
  | 'Industrials'
  | 'Consumer Defensive'
  | 'Utilities'
  | 'Real Estate';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface MarketSymbol {
  symbol: string;
  name: string;
  category: 'stocks' | 'crypto' | 'forex' | 'indices' | 'commodities' | 'bonds';
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  open: number;
  previousClose: number;
  volume: number;
  volumeFormatted: string;
  marketCap?: number;
  marketCapFormatted?: string;
  peRatio?: number;
  sector?: SectorType;
  subSector?: string;
  rating: TechnicalRating;
  sparkline: number[];
  currency: string;
  decimals: number;
  lastTickDirection?: 'up' | 'down' | null;
  lastTickTimestamp?: number;
  // Specific financial metrics for detail view
  eps?: number;
  divYield?: number;
  beta?: number;
  targetPrice?: number;
  high52w?: number;
  low52w?: number;
}

export interface ChartCandle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1D' | '5D' | '1M' | '3M' | '1Y' | '5Y' | 'ALL';
export type ChartType = 'candles' | 'line' | 'area';

export interface Position {
  id: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  createdAt: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  price: number;
  status: 'filled' | 'cancelled';
  timestamp: number;
  total: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  symbols: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  readTime: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  flag: string;
  country: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual: string;
  forecast: string;
  previous: string;
}

export interface SectorPerformance {
  sector: SectorType;
  changePercent: number;
  marketCapFormatted: string;
  topStock: string;
  topStockGain: number;
}

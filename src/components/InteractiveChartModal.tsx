import React, { useState, useMemo, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketSymbol, Timeframe, ChartType, ChartCandle } from '../types/market';
import { generateCandleData } from '../data/mockMarketData';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Maximize2, 
  Activity, 
  Bell, 
  Bookmark, 
  Layers, 
  DollarSign, 
  ArrowUpRight,
  ShieldAlert,
  Percent,
  CheckCircle2
} from 'lucide-react';

interface InteractiveChartModalProps {
  symbol: MarketSymbol;
  onClose: () => void;
}

export const InteractiveChartModal: React.FC<InteractiveChartModalProps> = ({ symbol, onClose }) => {
  const { 
    isInWatchlist, 
    toggleWatchlist, 
    addAlert, 
    paperBalance, 
    positions, 
    executeOrder, 
    closePosition 
  } = useMarket();

  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [activeSidePanel, setActiveSidePanel] = useState<'trade' | 'stats'>('trade');

  // Indicators toggle
  const [showMa20, setShowMa20] = useState(true);
  const [showMa50, setShowMa50] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showRsi, setShowRsi] = useState(true);

  // Crosshair state
  const [hoveredCandle, setHoveredCandle] = useState<ChartCandle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Trade form state
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState<number>(symbol.category === 'crypto' ? 0.25 : 10);
  const [limitPrice, setLimitPrice] = useState<number>(symbol.price);
  const [takeProfitPct, setTakeProfitPct] = useState<number>(5);
  const [stopLossPct, setStopLossPct] = useState<number>(3);
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>('');
  const [showAlertModal, setShowAlertModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate candle data based on current symbol price & selected timeframe
  const candles = useMemo(() => {
    return generateCandleData(symbol.price, timeframe, 50);
  }, [symbol.price, timeframe]);

  // Compute Moving Averages
  const ma20Points = useMemo(() => {
    const period = 10;
    return candles.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const avg = slice.reduce((sum, c) => sum + c.close, 0) / period;
      return avg;
    });
  }, [candles]);

  const ma50Points = useMemo(() => {
    const period = 20;
    return candles.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const avg = slice.reduce((sum, c) => sum + c.close, 0) / period;
      return avg;
    });
  }, [candles]);

  // Compute RSI(14) series
  const rsiValues = useMemo(() => {
    const period = 14;
    const rsi: (number | null)[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        rsi.push(null);
        continue;
      }
      const change = candles[i].close - candles[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;

      if (i < period) {
        rsi.push(null);
      } else {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) {
          rsi.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsi.push(Number((100 - (100 / (1 + rs))).toFixed(1)));
        }
      }
    }
    return rsi;
  }, [candles]);

  // Dimension helpers
  const chartWidth = 720;
  const chartHeight = showRsi ? 290 : 380;
  const rsiHeight = 85;

  const minPrice = Math.min(...candles.map(c => c.low));
  const maxPrice = Math.max(...candles.map(c => c.high));
  const priceRange = maxPrice - minPrice || 1;
  const maxVol = Math.max(...candles.map(c => c.volume)) || 1;

  const getY = (val: number) => {
    return chartHeight - 20 - ((val - minPrice) / priceRange) * (chartHeight - 40);
  };

  const candleSpacing = chartWidth / candles.length;
  const candleBodyWidth = Math.max(3, candleSpacing * 0.65);

  // Current inspected candle (hovered or last candle)
  const currentInspect = hoveredCandle || candles[candles.length - 1];

  // Symbol positions in paper trading account
  const symbolPositions = positions.filter(p => p.symbol === symbol.symbol);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const candleIdx = Math.floor((x / rect.width) * candles.length);
    if (candleIdx >= 0 && candleIdx < candles.length) {
      setHoveredCandle(candles[candleIdx]);
      setMousePos({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setMousePos(null);
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const fillPrice = orderType === 'limit' ? limitPrice : symbol.price;
    const tpPrice = fillPrice * (1 + takeProfitPct / 100);
    const slPrice = fillPrice * (1 - stopLossPct / 100);

    executeOrder(
      symbol.symbol,
      orderSide,
      orderType,
      quantity,
      fillPrice,
      tpPrice,
      slPrice
    );
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(alertTargetPrice);
    if (!isNaN(target) && target > 0) {
      const condition = target >= symbol.price ? 'above' : 'below';
      addAlert(symbol.symbol, target, condition);
      setShowAlertModal(false);
      setAlertTargetPrice('');
    }
  };

  const isUp = symbol.change >= 0;
  const inWatch = isInWatchlist(symbol.symbol);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        ref={containerRef}
        className="bg-[#131722] border border-[#2A2E39] rounded-lg w-full max-w-[1340px] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Modal Top Header Bar */}
        <div className="bg-[#1E222D] border-b border-[#2A2E39] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Symbol identifiers & current quote */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleWatchlist(symbol.symbol)}
              className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors ${
                inWatch ? 'text-[#2962FF]' : 'text-[#787B86] hover:text-[#F0F3FA]'
              }`}
              title={inWatch ? "In Watchlist" : "Add to Watchlist"}
            >
              ★
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#F0F3FA] tracking-tight">{symbol.symbol}</span>
                <span className="bg-[#131722] text-[#787B86] text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#2A2E39]">
                  {symbol.exchange}
                </span>
                <span className="text-xs text-[#787B86] hidden sm:inline">{symbol.name}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 pl-3 border-l border-[#2A2E39]">
              <span className="text-lg font-bold font-mono text-[#F0F3FA] tabular-nums">
                {symbol.currency}{symbol.price.toLocaleString(undefined, { minimumFractionDigits: symbol.decimals, maximumFractionDigits: symbol.decimals })}
              </span>
              <span className={`text-xs font-mono font-semibold tabular-nums ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                {isUp ? '+' : ''}{symbol.change.toFixed(symbol.decimals)} ({isUp ? '+' : ''}{symbol.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Quick Tools & Close button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAlertModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#131722] hover:bg-[#2A2E39] border border-[#2A2E39] text-xs text-[#F0F3FA] transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-[#2962FF]" />
              <span className="hidden sm:inline">Set Alert</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded bg-[#131722] hover:bg-[#2A2E39] text-[#787B86] hover:text-[#F0F3FA] transition-colors"
              title="Close chart modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Secondary Toolbar: Timeframe & Indicators & OHLC Readout */}
        <div className="bg-[#171B26] border-b border-[#2A2E39] px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Timeframes */}
            <div className="flex items-center bg-[#131722] p-0.5 rounded border border-[#2A2E39]">
              {(['1D', '5D', '1M', '3M', '1Y', '5Y', 'ALL'] as Timeframe[]).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-0.5 rounded font-mono font-medium transition-colors ${
                    timeframe === tf ? 'bg-[#2962FF] text-white' : 'text-[#787B86] hover:text-[#F0F3FA]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Type */}
            <div className="flex items-center bg-[#131722] p-0.5 rounded border border-[#2A2E39]">
              <button
                onClick={() => setChartType('candles')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  chartType === 'candles' ? 'bg-[#2A2E39] text-[#F0F3FA] font-semibold' : 'text-[#787B86] hover:text-[#F0F3FA]'
                }`}
              >
                Candles
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  chartType === 'line' ? 'bg-[#2A2E39] text-[#F0F3FA] font-semibold' : 'text-[#787B86] hover:text-[#F0F3FA]'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  chartType === 'area' ? 'bg-[#2A2E39] text-[#F0F3FA] font-semibold' : 'text-[#787B86] hover:text-[#F0F3FA]'
                }`}
              >
                Area
              </button>
            </div>

            {/* Indicator Toggles */}
            <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-[#2A2E39]">
              <button
                onClick={() => setShowMa20(!showMa20)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  showMa20 ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40' : 'bg-transparent text-[#787B86] border-[#2A2E39]'
                }`}
              >
                MA(20)
              </button>
              <button
                onClick={() => setShowMa50(!showMa50)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  showMa50 ? 'bg-[#ff9100]/20 text-[#ff9100] border-[#ff9100]/40' : 'bg-transparent text-[#787B86] border-[#2A2E39]'
                }`}
              >
                MA(50)
              </button>
              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                  showVolume ? 'bg-[#2962FF]/20 text-[#2962FF] border-[#2962FF]/40' : 'bg-transparent text-[#787B86] border-[#2A2E39]'
                }`}
              >
                Vol
              </button>
              <button
                onClick={() => setShowRsi(!showRsi)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  showRsi ? 'bg-[#e040fb]/20 text-[#e040fb] border-[#e040fb]/40' : 'bg-transparent text-[#787B86] border-[#2A2E39]'
                }`}
              >
                RSI(14)
              </button>
            </div>
          </div>

          {/* Real-time OHLCV Bar Readout */}
          <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-[#787B86]">
            <span>Time: <span className="text-[#F0F3FA]">{currentInspect.time}</span></span>
            <span>O: <span className="text-[#F0F3FA]">{currentInspect.open}</span></span>
            <span>H: <span className="text-[#089981]">{currentInspect.high}</span></span>
            <span>L: <span className="text-[#F23645]">{currentInspect.low}</span></span>
            <span>C: <span className={currentInspect.close >= currentInspect.open ? 'text-[#089981]' : 'text-[#F23645]'}>{currentInspect.close}</span></span>
            <span className="hidden sm:inline">Vol: <span className="text-[#F0F3FA]">{(currentInspect.volume / 1000).toFixed(0)}K</span></span>
          </div>

        </div>

        {/* Modal Body: Split Canvas & Side Execution / Stats Panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[460px]">
          
          {/* Main Chart Canvas Area */}
          <div className="flex-1 bg-[#131722] p-3 flex flex-col justify-between overflow-hidden relative">
            
            {/* SVG Chart */}
            <div className="relative w-full flex-1">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full block cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2962FF" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#2962FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Price Grid Lines */}
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((ratio, i) => {
                  const y = chartHeight * ratio;
                  const priceLabel = (maxPrice - ratio * priceRange).toFixed(symbol.decimals);
                  return (
                    <g key={i}>
                      <line
                        x1="0"
                        y1={y}
                        x2={chartWidth - 50}
                        y2={y}
                        stroke="#2A2E39"
                        strokeDasharray="2,3"
                        strokeWidth="0.8"
                      />
                      <text
                        x={chartWidth - 45}
                        y={y + 3}
                        fill="#787B86"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {priceLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Time Grid Lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
                  const x = chartWidth * ratio;
                  return (
                    <line
                      key={i}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2={chartHeight}
                      stroke="#2A2E39"
                      strokeDasharray="2,3"
                      strokeWidth="0.8"
                    />
                  );
                })}

                {/* Volume Histogram (bottom 25% of chart) */}
                {showVolume && candles.map((c, idx) => {
                  const x = idx * candleSpacing + candleSpacing / 2;
                  const vHeight = (c.volume / maxVol) * 45;
                  const vColor = c.close >= c.open ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)';
                  return (
                    <rect
                      key={`vol-${idx}`}
                      x={x - candleBodyWidth / 2}
                      y={chartHeight - vHeight}
                      width={candleBodyWidth}
                      height={vHeight}
                      fill={vColor}
                    />
                  );
                })}

                {/* Candlesticks Mode */}
                {chartType === 'candles' && candles.map((c, idx) => {
                  const x = idx * candleSpacing + candleSpacing / 2;
                  const yHigh = getY(c.high);
                  const yLow = getY(c.low);
                  const yOpen = getY(c.open);
                  const yClose = getY(c.close);

                  const isCandleUp = c.close >= c.open;
                  const color = isCandleUp ? '#089981' : '#F23645';

                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                  return (
                    <g key={`candle-${idx}`}>
                      {/* Wick Line */}
                      <line
                        x1={x}
                        y1={yHigh}
                        x2={x}
                        y2={yLow}
                        stroke={color}
                        strokeWidth="1.2"
                      />
                      {/* Body Rect */}
                      <rect
                        x={x - candleBodyWidth / 2}
                        y={bodyTop}
                        width={candleBodyWidth}
                        height={bodyHeight}
                        fill={color}
                        rx="1"
                      />
                    </g>
                  );
                })}

                {/* Line or Area Mode */}
                {(chartType === 'line' || chartType === 'area') && (
                  <>
                    {/* Area fill */}
                    {chartType === 'area' && (
                      <path
                        d={`M 0,${getY(candles[0].close)} ${candles.map((c, i) => `L ${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`).join(' ')} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                        fill="url(#areaGrad)"
                      />
                    )}
                    {/* Continuous Line */}
                    <path
                      d={`M 0,${getY(candles[0].close)} ${candles.map((c, i) => `L ${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`).join(' ')}`}
                      fill="none"
                      stroke="#2962FF"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* Moving Average 20 Line (cyan) */}
                {showMa20 && (
                  <path
                    d={ma20Points
                      .map((val, i) => val !== null ? `${i === 0 ? 'M' : 'L'} ${i * candleSpacing + candleSpacing / 2},${getY(val)}` : '')
                      .filter(Boolean)
                      .join(' ')}
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="1.2"
                  />
                )}

                {/* Moving Average 50 Line (orange) */}
                {showMa50 && (
                  <path
                    d={ma50Points
                      .map((val, i) => val !== null ? `${i === 0 ? 'M' : 'L'} ${i * candleSpacing + candleSpacing / 2},${getY(val)}` : '')
                      .filter(Boolean)
                      .join(' ')}
                    fill="none"
                    stroke="#ff9100"
                    strokeWidth="1.2"
                  />
                )}

                {/* Interactive Crosshair Cursor */}
                {mousePos && (
                  <g pointerEvents="none">
                    {/* Horizontal Price Line */}
                    <line
                      x1="0"
                      y1={mousePos.y}
                      x2={chartWidth - 50}
                      y2={mousePos.y}
                      stroke="#787B86"
                      strokeDasharray="3,3"
                      strokeWidth="1"
                    />
                    {/* Vertical Time Line */}
                    <line
                      x1={mousePos.x}
                      y1="0"
                      x2={mousePos.x}
                      y2={chartHeight}
                      stroke="#787B86"
                      strokeDasharray="3,3"
                      strokeWidth="1"
                    />
                    {/* Price Badge on Axis */}
                    <rect
                      x={chartWidth - 50}
                      y={mousePos.y - 8}
                      width={48}
                      height={16}
                      fill="#2962FF"
                      rx="2"
                    />
                    <text
                      x={chartWidth - 46}
                      y={mousePos.y + 3}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {(maxPrice - (mousePos.y / chartHeight) * priceRange).toFixed(symbol.decimals)}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* RSI (14) Sub-chart */}
            {showRsi && (
              <div className="h-20 border-t border-[#2A2E39] pt-1 mt-1 relative">
                <div className="absolute top-1 left-2 text-[10px] font-mono text-[#e040fb] font-semibold flex items-center gap-2">
                  <span>RSI (14): {rsiValues[rsiValues.length - 1] || '--'}</span>
                  <span className="text-[#50535E]">Overbought: 70 | Oversold: 30</span>
                </div>

                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${chartWidth} ${rsiHeight}`}
                  preserveAspectRatio="none"
                  className="w-full h-full block"
                >
                  {/* 70 line */}
                  <line
                    x1="0"
                    y1={rsiHeight * 0.3}
                    x2={chartWidth - 50}
                    y2={rsiHeight * 0.3}
                    stroke="rgba(242, 54, 69, 0.5)"
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                  />
                  {/* 30 line */}
                  <line
                    x1="0"
                    y1={rsiHeight * 0.7}
                    x2={chartWidth - 50}
                    y2={rsiHeight * 0.7}
                    stroke="rgba(8, 153, 129, 0.5)"
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                  />

                  {/* RSI Path */}
                  <path
                    d={rsiValues
                      .map((val, i) => {
                        if (val === null) return '';
                        const x = i * candleSpacing + candleSpacing / 2;
                        const y = rsiHeight - (val / 100) * rsiHeight;
                        return `${i === 14 ? 'M' : 'L'} ${x},${y}`;
                      })
                      .filter(Boolean)
                      .join(' ')}
                    fill="none"
                    stroke="#e040fb"
                    strokeWidth="1.4"
                  />
                </svg>
              </div>
            )}

            {/* Bottom time labels */}
            <div className="flex justify-between text-[10px] text-[#50535E] font-mono pt-1 border-t border-[#2A2E39]/50">
              <span>{candles[0].time}</span>
              <span>{candles[Math.floor(candles.length / 2)].time}</span>
              <span>{candles[candles.length - 1].time} (Latest Live Tick)</span>
            </div>

          </div>

          {/* Right Side Dock: Order Execution Ticket & Fundamentals */}
          <div className="w-full lg:w-80 bg-[#1E222D] border-t lg:border-t-0 lg:border-l border-[#2A2E39] p-4 flex flex-col justify-between shrink-0">
            
            <div>
              {/* Tab Selector: Trade vs Stats */}
              <div className="grid grid-cols-2 gap-1 bg-[#131722] p-0.5 rounded border border-[#2A2E39] text-xs font-semibold mb-4">
                <button
                  onClick={() => setActiveSidePanel('trade')}
                  className={`py-1.5 rounded transition-all ${
                    activeSidePanel === 'trade' ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86] hover:text-[#F0F3FA]'
                  }`}
                >
                  Order Ticket
                </button>
                <button
                  onClick={() => setActiveSidePanel('stats')}
                  className={`py-1.5 rounded transition-all ${
                    activeSidePanel === 'stats' ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86] hover:text-[#F0F3FA]'
                  }`}
                >
                  Key Statistics
                </button>
              </div>

              {activeSidePanel === 'trade' ? (
                /* Order Ticket Form */
                <form onSubmit={handleExecuteTrade} className="space-y-3.5">
                  
                  {/* Buy / Sell Directional Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderSide('buy')}
                      className={`py-2 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all border ${
                        orderSide === 'buy'
                          ? 'bg-[#089981] text-white border-[#089981] shadow-lg shadow-[#089981]/20'
                          : 'bg-[#131722] text-[#787B86] border-[#2A2E39] hover:border-[#363A45]'
                      }`}
                    >
                      Buy / Long
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSide('sell')}
                      className={`py-2 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all border ${
                        orderSide === 'sell'
                          ? 'bg-[#F23645] text-white border-[#F23645] shadow-lg shadow-[#F23645]/20'
                          : 'bg-[#131722] text-[#787B86] border-[#2A2E39] hover:border-[#363A45]'
                      }`}
                    >
                      Sell / Short
                    </button>
                  </div>

                  {/* Order Type Toggle */}
                  <div className="flex items-center justify-between text-xs text-[#787B86]">
                    <span>Order Type:</span>
                    <div className="flex items-center gap-1 bg-[#131722] p-0.5 rounded border border-[#2A2E39]">
                      <button
                        type="button"
                        onClick={() => setOrderType('market')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          orderType === 'market' ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86]'
                        }`}
                      >
                        Market
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('limit')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          orderType === 'limit' ? 'bg-[#2A2E39] text-[#F0F3FA]' : 'text-[#787B86]'
                        }`}
                      >
                        Limit
                      </button>
                    </div>
                  </div>

                  {/* Limit Price Input if limit */}
                  {orderType === 'limit' && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#787B86]">Limit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(parseFloat(e.target.value) || symbol.price)}
                        className="w-full bg-[#131722] border border-[#2A2E39] rounded px-3 py-1.5 text-xs font-mono font-bold text-[#F0F3FA] focus:outline-none focus:border-[#2962FF]"
                      />
                    </div>
                  )}

                  {/* Quantity Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#787B86]">
                      <span>Quantity ({symbol.category === 'crypto' ? 'Coins' : 'Shares'})</span>
                      <span className="font-mono">Est: ${(quantity * (orderType === 'limit' ? limitPrice : symbol.price)).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center bg-[#131722] border border-[#2A2E39] rounded">
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(0.01, q - (symbol.category === 'crypto' ? 0.05 : 1)))}
                        className="px-2.5 py-1.5 text-[#787B86] hover:text-[#F0F3FA] font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step={symbol.category === 'crypto' ? "0.01" : "1"}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(0.01, parseFloat(e.target.value) || 1))}
                        className="w-full bg-transparent text-center font-mono font-bold text-xs text-[#F0F3FA] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(q => q + (symbol.category === 'crypto' ? 0.05 : 1))}
                        className="px-2.5 py-1.5 text-[#787B86] hover:text-[#F0F3FA] font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick quantity presets */}
                    <div className="flex gap-1 pt-1">
                      {[5, 10, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setQuantity(symbol.category === 'crypto' ? val / 100 : val)}
                          className="flex-1 bg-[#131722] hover:bg-[#2A2E39] border border-[#2A2E39] text-[10px] text-[#787B86] py-0.5 rounded font-mono"
                        >
                          {symbol.category === 'crypto' ? `${val / 100}` : `${val}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Take Profit & Stop Loss triggers */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2A2E39] text-xs">
                    <div>
                      <span className="text-[10px] text-[#089981] font-semibold block">Take Profit (+{takeProfitPct}%)</span>
                      <div className="text-[11px] font-mono text-[#F0F3FA] mt-0.5">
                        ${(symbol.price * (1 + takeProfitPct / 100)).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#F23645] font-semibold block">Stop Loss (-{stopLossPct}%)</span>
                      <div className="text-[11px] font-mono text-[#F0F3FA] mt-0.5">
                        ${(symbol.price * (1 - stopLossPct / 100)).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md ${
                      orderSide === 'buy'
                        ? 'bg-[#089981] hover:bg-[#078873]'
                        : 'bg-[#F23645] hover:bg-[#d62837]'
                    }`}
                  >
                    Execute {orderSide.toUpperCase()} {quantity} {symbol.symbol}
                  </button>

                  <div className="text-[10px] text-[#787B86] text-center font-mono">
                    Available Paper Cash: ${paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                </form>
              ) : (
                /* Fundamental Statistics Tab */
                <div className="space-y-3 text-xs">
                  <div className="divide-y divide-[#2A2E39] font-mono">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#787B86]">Market Cap</span>
                      <span className="text-[#F0F3FA] font-bold">{symbol.marketCapFormatted || '--'}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#787B86]">P/E Ratio (TTM)</span>
                      <span className="text-[#F0F3FA] font-bold">{symbol.peRatio ? symbol.peRatio.toFixed(1) : '--'}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#787B86]">Diluted EPS</span>
                      <span className="text-[#F0F3FA] font-bold">{symbol.eps ? `$${symbol.eps.toFixed(2)}` : '--'}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#787B86]">Dividend Yield</span>
                      <span className="text-[#F0F3FA] font-bold">{symbol.divYield ? `${symbol.divYield}%` : '--'}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#787B86]">Beta (5Y)</span>
                      <span className="text-[#F0F3FA] font-bold">{symbol.beta || '--'}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#787B86]">52-Week Range</span>
                      <span className="text-[#F0F3FA] text-[11px]">${symbol.low52w || symbol.low24h} - ${symbol.high52w || symbol.high24h}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#787B86]">Analyst Target Price</span>
                      <span className="text-[#089981] font-bold">{symbol.targetPrice ? `$${symbol.targetPrice.toFixed(2)}` : '--'}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#787B86]">Consensus Rating</span>
                      <span className="text-[#089981] font-bold uppercase">{symbol.rating}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active Position Tracking for this symbol */}
            {symbolPositions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#2A2E39] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#F0F3FA] uppercase tracking-wider">
                  <span>Open Position</span>
                  <span className={symbolPositions[0].unrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}>
                    {symbolPositions[0].unrealizedPnl >= 0 ? '+' : ''}${symbolPositions[0].unrealizedPnl.toFixed(2)}
                  </span>
                </div>

                {symbolPositions.map(pos => (
                  <div key={pos.id} className="bg-[#131722] p-2 rounded border border-[#2A2E39] text-xs flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-[#F0F3FA]">
                        {pos.quantity} {pos.symbol} @ ${pos.entryPrice}
                      </div>
                      <div className="text-[10px] text-[#787B86] font-mono">
                        Side: {pos.side.toUpperCase()}
                      </div>
                    </div>

                    <button
                      onClick={() => closePosition(pos.id)}
                      className="px-2 py-1 rounded bg-[#F23645]/20 hover:bg-[#F23645] text-[#F23645] hover:text-white text-[10px] font-bold transition-colors"
                    >
                      Close Pos
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Create Price Alert Sub-modal */}
        {showAlertModal && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#1E222D] border border-[#363A45] rounded-lg p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#2962FF]" />
                  <h4 className="font-bold text-sm text-[#F0F3FA]">Set Price Alert for {symbol.symbol}</h4>
                </div>
                <button onClick={() => setShowAlertModal(false)} className="text-[#787B86] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAlert} className="space-y-3">
                <div>
                  <label className="text-xs text-[#787B86] block mb-1">Target Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`Current: $${symbol.price}`}
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(e.target.value)}
                    required
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-3 py-2 text-sm font-mono font-bold text-[#F0F3FA] focus:outline-none focus:border-[#2962FF]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-3 py-1.5 rounded bg-[#131722] hover:bg-[#2A2E39] text-xs text-[#787B86]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-[#2962FF] hover:bg-[#1E53E5] text-xs font-semibold text-white"
                  >
                    Create Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

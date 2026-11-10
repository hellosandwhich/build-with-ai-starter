import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 72,
  height = 24,
  isPositive,
  strokeWidth = 1.5,
  className = ''
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="opacity-0" />;
  }

  const positive = isPositive !== undefined 
    ? isPositive 
    : data[data.length - 1] >= data[0];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const chartHeight = height - padding * 2;

  // Build points for SVG path
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const strokeColor = positive ? '#089981' : '#F23645';
  const gradientId = `spark-grad-${positive ? 'green' : 'red'}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible block ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Area gradient fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Continuous Stroke */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Current Price Dot */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r={2}
          fill={strokeColor}
        />
      )}
    </svg>
  );
};

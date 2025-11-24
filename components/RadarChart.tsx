import React from 'react';
import { DetailedRatings } from '../types';

interface RadarChartProps {
  ratings: DetailedRatings;
  size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ ratings, size = 300 }) => {
  const maxValue = 10;
  const numAxes = Object.keys(ratings).length;
  const angleSlice = (Math.PI * 2) / numAxes;
  const radius = size * 0.35;
  const center = size / 2;

  const labels = Object.keys(ratings).map(key => key.charAt(0).toUpperCase() + key.slice(1));
  // FIX: Explicitly cast values to number[] as Object.values can be inferred as unknown[].
  const values = Object.values(ratings) as number[];

  const getPoint = (value: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / maxValue) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  };

  const dataPoints = values.map((value, i) => getPoint(value, i)).join(' ');

  const gridLevels = 4;
  const gridLines = [];
  for (let i = 1; i <= gridLevels; i++) {
    const levelRadius = (radius / gridLevels) * i;
    const points = Array.from({ length: numAxes }).map((_, j) => {
      const angle = angleSlice * j - Math.PI / 2;
      const x = center + levelRadius * Math.cos(angle);
      const y = center + levelRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    gridLines.push(
      <polygon key={`grid-${i}`} points={points} fill="none" stroke="#4a4a4a" strokeWidth="1" />
    );
  }

  const axisLines = labels.map((_, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x2 = center + radius * Math.cos(angle);
    const y2 = center + radius * Math.sin(angle);
    return <line key={`axis-${i}`} x1={center} y1={center} x2={x2} y2={y2} stroke="#4a4a4a" strokeWidth="1" />;
  });
  
  const labelPoints = labels.map((label, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const labelRadius = radius * 1.25;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);
      return { x, y, label };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g>
        {gridLines.reverse()}
        {axisLines}
        
        {labelPoints.map(({ x, y, label }) => (
            <text
                key={label}
                x={x}
                y={y}
                dy="0.35em"
                textAnchor="middle"
                fontSize="12"
                fill="#a7a7a7"
                className="font-semibold"
            >
                {label}
            </text>
        ))}

        <polygon points={dataPoints} fill="rgba(29, 185, 84, 0.4)" stroke="#1DB954" strokeWidth="2" />
        
        {values.map((value, i) => {
            const [x, y] = getPoint(value, i).split(',');
            return <circle key={`point-${i}`} cx={x} cy={y} r="4" fill="#1DB954" />;
        })}
      </g>
    </svg>
  );
};

export default RadarChart;
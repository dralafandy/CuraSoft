import React from 'react';

interface LineChartProps {
    title: string;
    data: { label: string; value: number }[];
    colorClass: string;
}

const LineChart: React.FC<LineChartProps> = ({ title, data, colorClass }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((item.value - minValue) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full">
            {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
            <div className="relative h-64">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />

                    {/* Line */}
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={colorClass}
                        points={points}
                    />

                    {/* Data points */}
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = 100 - ((item.value - minValue) / range) * 100;
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill="currentColor"
                                className={colorClass}
                            />
                        );
                    })}
                </svg>

                {/* Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500">
                    {data.map((item, index) => (
                        <span key={index} className="text-center">{item.label}</span>
                    ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-500 -ml-8">
                    <span>{maxValue.toFixed(0)}</span>
                    <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
                    <span>{minValue.toFixed(0)}</span>
                </div>
            </div>
        </div>
    );
};

export default LineChart;
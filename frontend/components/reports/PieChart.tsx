import React from 'react';

interface PieChartProps {
    title: string;
    data: { label: string; value: number; color: string }[];
}

const PieChart: React.FC<PieChartProps> = ({ title, data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div className="w-full">
                {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
                <div className="flex items-center justify-center h-64 text-slate-500">
                    No data to display
                </div>
            </div>
        );
    }

    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const startAngle = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0);
        const endAngle = startAngle + (item.value / total) * 360;

        return {
            ...item,
            percentage,
            startAngle,
            endAngle,
        };
    });

    return (
        <div className="w-full">
            {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
            <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="relative w-64 h-64">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {segments.map((segment, index) => {
                            const largeArcFlag = segment.percentage > 50 ? 1 : 0;
                            const x1 = 50 + 40 * Math.cos((segment.startAngle * Math.PI) / 180);
                            const y1 = 50 + 40 * Math.sin((segment.startAngle * Math.PI) / 180);
                            const x2 = 50 + 40 * Math.cos((segment.endAngle * Math.PI) / 180);
                            const y2 = 50 + 40 * Math.sin((segment.endAngle * Math.PI) / 180);

                            return (
                                <path
                                    key={index}
                                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                    fill={segment.color}
                                    stroke="white"
                                    strokeWidth="0.5"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-700">Total</span>
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    {segments.map((segment, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: segment.color }}
                            ></div>
                            <span className="text-sm text-slate-700 flex-1">{segment.label}</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {segment.percentage.toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PieChart;
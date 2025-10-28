import React from 'react';

interface BarChartProps {
    title: string;
    data: { label: string; value: number }[];
    colorClass: string;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, colorClass }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Use 1 as min to avoid division by zero

    return (
        <div className="w-full h-full flex flex-col">
            {title && <h3 className="text-md font-semibold text-slate-700 mb-4 text-center">{title}</h3>}
            <div className="flex-grow flex items-end justify-around gap-2 px-2 border-s border-b border-slate-200 py-2">
                {data.length > 0 ? data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                            className="w-full flex items-end"
                            style={{ height: `${(item.value / maxValue) * 100}%`}}
                             title={`${item.label}: ${item.value}`}
                        >
                            <div 
                                className={`w-full ${colorClass} rounded-t-md hover:opacity-80 transition-opacity`}
                                style={{ height: `100%` }}
                            />
                        </div>
                        <span className="text-xs text-slate-500 mt-1 truncate">{item.label}</span>
                    </div>
                )) : <p className="w-full text-center text-slate-400 self-center">No data to display</p>}
            </div>
        </div>
    );
};

export default BarChart;

import React, { useState } from 'react';
import { DentalChartData, Tooth, ToothStatus } from '../types';
import { useI18n } from '../hooks/useI18n';

const toothStatusColors: Record<ToothStatus, { bg: string; text: string; border: string; }> = {
    [ToothStatus.HEALTHY]:    { bg: 'bg-white', text: 'text-slate-700', border: 'border-slate-300' },
    [ToothStatus.FILLING]:    { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
    [ToothStatus.CROWN]:      { bg: 'bg-yellow-400', text: 'text-white', border: 'border-yellow-500' },
    [ToothStatus.MISSING]:    { bg: 'bg-slate-400', text: 'text-white', border: 'border-slate-500' },
    [ToothStatus.IMPLANT]:    { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
    [ToothStatus.ROOT_CANAL]: { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600' },
    [ToothStatus.CAVITY]:     { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
};

const ToothComponent: React.FC<{
    toothId: string;
    tooth: Tooth;
    onClick: () => void;
}> = ({ toothId, tooth, onClick }) => {
    const { t } = useI18n();
    const number = toothId.replace(/[A-Z]/g, '');
    const { bg, border, text } = toothStatusColors[tooth.status];
    return (
        <div className="flex flex-col items-center">
            <button 
                onClick={onClick}
                className={`w-9 h-11 flex items-center justify-center rounded-t-lg rounded-b-sm border-2 transition-transform hover:scale-105 active:scale-95 shadow-sm ${bg} ${border} ${text} focus:outline-none focus:ring-2 focus:ring-primary-light`}
                aria-label={t('dentalChart.toothAriaLabel', {toothId: toothId, status: t(`toothStatus.${tooth.status}`)})}
            >
                <span className="font-bold text-sm select-none">{number}</span>
            </button>
        </div>
    );
};

const EditToothModal: React.FC<{
    tooth: Tooth;
    toothId: string;
    onSave: (newTooth: Tooth) => void;
    onClose: () => void;
}> = ({ tooth, toothId, onSave, onClose }) => {
    const { t } = useI18n();
    const [status, setStatus] = useState(tooth.status);
    const [notes, setNotes] = useState(tooth.notes);

    const handleSave = () => {
        onSave({ status, notes });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                <header className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-700">{t('editToothModal.title', {toothId: toothId})}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300" aria-label={t('common.closeForm')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-4 space-y-4">
                    <div>
                        <label htmlFor="toothStatus" className="block text-sm font-medium text-slate-600">{t('editToothModal.status')}</label>
                        <select
                            id="toothStatus"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as ToothStatus)}
                            className="mt-1 p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary"
                        >
                            {Object.values(ToothStatus).map(s => <option key={s} value={s}>{t(`toothStatus.${s}`)}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="toothNotes" className="block text-sm font-medium text-slate-600">{t('editToothModal.notes')}</label>
                        <textarea
                            id="toothNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 p-2 border border-slate-300 rounded-lg w-full h-24 focus:ring-primary focus:border-primary"
                            placeholder={t('editToothModal.addNotesPlaceholder')}
                        />
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-neutral-dark rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300">{t('common.cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light">{t('common.save')}</button>
                </footer>
            </div>
        </div>
    );
};

const Quadrant: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={className}>
        <h4 className="text-sm font-semibold text-slate-500 mb-2 text-center">{title}</h4>
        <div className="flex justify-center gap-1 p-2 bg-slate-100 rounded-lg flex-wrap">
            {children}
        </div>
    </div>
);


interface DentalChartProps {
    chartData: DentalChartData;
    onUpdate: (newChartData: DentalChartData) => void;
}

const DentalChart: React.FC<DentalChartProps> = ({ chartData, onUpdate }) => {
    const { t } = useI18n();
    const [selectedToothId, setSelectedToothId] = useState<string | null>(null);

    const handleToothClick = (toothId: string) => {
        setSelectedToothId(toothId);
    };

    const handleCloseModal = () => {
        setSelectedToothId(null);
    };

    const handleSaveTooth = (newTooth: Tooth) => {
        if (selectedToothId) {
            const newChartData = {
                ...chartData,
                [selectedToothId]: newTooth,
            };
            onUpdate(newChartData);
        }
    };

    const selectedTooth = selectedToothId ? chartData[selectedToothId] : null;

    const upperRight = Array.from({ length: 8 }, (_, i) => `UR${i + 1}`);
    const upperLeft = Array.from({ length: 8 }, (_, i) => `UL${i + 1}`);
    const lowerLeft = Array.from({ length: 8 }, (_, i) => `LL${i + 1}`);
    const lowerRight = Array.from({ length: 8 }, (_, i) => `LR${i + 1}`);
    
    return (
        <div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 justify-center bg-neutral p-3 rounded-lg shadow-sm">
                {Object.entries(toothStatusColors).map(([status, { bg, border }]) => (
                    <div key={status} className="flex items-center text-xs text-slate-700">
                        <span className={`w-4 h-4 rounded-full me-2 ${bg} ${border} border`}></span>
                        <span>{t(`toothStatus.${status}`)}</span>
                    </div>
                ))}
            </div>

            <div className="bg-neutral p-4 rounded-lg space-y-8 shadow-inner">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <Quadrant title={t('dentalChart.upperRight')}>
                        {upperRight.slice().reverse().map(toothId => (
                            <ToothComponent
                                key={toothId}
                                toothId={toothId}
                                tooth={chartData[toothId]}
                                onClick={() => handleToothClick(toothId)}
                            />
                        ))}
                    </Quadrant>
                    <Quadrant title={t('dentalChart.upperLeft')}>
                        {upperLeft.map(toothId => (
                            <ToothComponent
                                key={toothId}
                                toothId={toothId}
                                tooth={chartData[toothId]}
                                onClick={() => handleToothClick(toothId)}
                            />
                        ))}
                    </Quadrant>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                     <Quadrant title={t('dentalChart.lowerRight')}>
                         {lowerRight.slice().reverse().map(toothId => (
                            <ToothComponent
                                key={toothId}
                                toothId={toothId}
                                tooth={chartData[toothId]}
                                onClick={() => handleToothClick(toothId)}
                            />
                        ))}
                    </Quadrant>
                    <Quadrant title={t('dentalChart.lowerLeft')}>
                         {lowerLeft.map(toothId => (
                            <ToothComponent
                                key={toothId}
                                toothId={toothId}
                                tooth={chartData[toothId]}
                                onClick={() => handleToothClick(toothId)}
                            />
                        ))}
                    </Quadrant>
                </div>
            </div>
            
            {selectedTooth && selectedToothId && (
                <EditToothModal
                    tooth={selectedTooth}
                    toothId={selectedToothId}
                    onSave={handleSaveTooth}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default DentalChart;
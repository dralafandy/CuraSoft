import React, { useState } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { TreatmentDefinition } from '../../types';
import { useI18n } from '../../hooks/useI18n';

const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

const AddEditTreatmentDefinitionModal: React.FC<{
    definition?: TreatmentDefinition;
    onClose: () => void;
    onSave: (definition: Omit<TreatmentDefinition, 'id'> | TreatmentDefinition) => void;
}> = ({ definition, onClose, onSave }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState<Omit<TreatmentDefinition, 'id'> | TreatmentDefinition>(
        definition || { name: '', description: '', basePrice: 0, doctorPercentage: 0.50, clinicPercentage: 0.50 }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'basePrice') {
            setFormData({ ...formData, [name]: parseFloat(value) });
        } else if (name === 'doctorPercentage' || name === 'clinicPercentage') {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 1) {
                setFormData(prev => ({ ...prev, [name]: parsedValue }));
                if (name === 'doctorPercentage') {
                    setFormData(prev => ({ ...prev, clinicPercentage: 1 - parsedValue }));
                } else {
                    setFormData(prev => ({ ...prev, doctorPercentage: 1 - parsedValue }));
                }
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const percentageFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-700">{definition ? t('treatments.editTreatment') : t('treatments.addNewTreatment')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300" aria-label={t('common.closeForm')}>
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <label htmlFor="treatment-name" className="sr-only">{t('treatments.treatmentName')}</label>
                    <input id="treatment-name" name="name" value={formData.name} onChange={handleChange} placeholder={t('treatments.treatmentName')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                    
                    <label htmlFor="treatment-description" className="sr-only">{t('treatments.description')}</label>
                    <textarea id="treatment-description" name="description" value={formData.description} onChange={handleChange} placeholder={t('treatments.descriptionPlaceholder')} className="p-2 border border-slate-300 rounded-lg w-full h-20 focus:ring-primary focus:border-primary" />
                    <div>
                        <label htmlFor="basePrice" className="block text-sm font-medium text-slate-600 mb-1">{t('treatments.basePrice')}</label>
                        <input id="basePrice" name="basePrice" type="number" step="0.01" value={formData.basePrice} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="doctorPercentage" className="block text-sm font-medium text-slate-600 mb-1">{t('treatments.doctorPercentage')}</label>
                            <input id="doctorPercentage" name="doctorPercentage" type="number" step="0.01" min="0" max="1" value={formData.doctorPercentage} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                            <p className="text-xs text-slate-500 mt-1">{percentageFormatter.format(formData.doctorPercentage)}</p>
                        </div>
                        <div>
                            <label htmlFor="clinicPercentage" className="block text-sm font-medium text-slate-600 mb-1">{t('treatments.clinicPercentage')}</label>
                            <input id="clinicPercentage" name="clinicPercentage" type="number" step="0.01" min="0" max="1" value={formData.clinicPercentage} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required disabled/>
                            <p className="text-xs text-slate-500 mt-1">{percentageFormatter.format(formData.clinicPercentage)} ({t('treatments.auto')})</p>
                        </div>
                    </div>
                    <footer className="pt-2 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-dark rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light">{t('common.save')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const TreatmentDefinitionManagement: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { treatmentDefinitions, addTreatmentDefinition, updateTreatmentDefinition } = clinicData;
    const { t, locale } = useI18n();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingDefinition, setEditingDefinition] = useState<TreatmentDefinition | undefined>(undefined);

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const percentageFormatter = new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const handleSaveDefinition = (definition: Omit<TreatmentDefinition, 'id'> | TreatmentDefinition) => {
        if ('id' in definition && definition.id) {
            updateTreatmentDefinition(definition as TreatmentDefinition);
        } else {
            addTreatmentDefinition(definition as Omit<TreatmentDefinition, 'id'>);
        }
        setEditingDefinition(undefined);
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-700">{t('treatments.manageTreatments')}</h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                >
                    <AddIcon /> {t('treatments.addTreatment')}
                </button>
            </div>
            <div className="bg-neutral p-4 rounded-lg shadow-inner">
                {treatmentDefinitions.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">{t('treatments.noTreatmentsAdded')}</p>
                ) : (
                    <ul className="space-y-2">
                        {treatmentDefinitions.map(td => (
                            <li key={td.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                                <div>
                                    <p className="font-bold text-slate-800">{td.name}</p>
                                    <p className="text-sm text-slate-600">{t('treatments.basePrice')}: {currencyFormatter.format(td.basePrice)}</p>
                                    <p className="text-xs text-slate-500">
                                        {t('treatments.doctor')}: {percentageFormatter.format(td.doctorPercentage)} | {t('treatments.clinic')}: {percentageFormatter.format(td.clinicPercentage)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setEditingDefinition(td); setIsAddModalOpen(true); }}
                                    className="text-primary hover:text-primary-dark text-sm p-2 rounded-lg hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary-light"
                                    aria-label={t('treatments.editTreatmentAriaLabel', {name: td.name})}
                                >
                                    <EditIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isAddModalOpen && (
                <AddEditTreatmentDefinitionModal
                    definition={editingDefinition}
                    onClose={() => { setIsAddModalOpen(false); setEditingDefinition(undefined); }}
                    onSave={handleSaveDefinition}
                />
            )}
        </div>
    );
};

export default TreatmentDefinitionManagement;
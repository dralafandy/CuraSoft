import React, { useState, useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { LabCase, LabCaseStatus, NotificationType, Patient, Supplier } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { useNotification } from '../../contexts/NotificationContext';

const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

const AddEditLabCaseModal: React.FC<{
    labCase?: LabCase;
    onClose: () => void;
    onSave: (labCase: Omit<LabCase, 'id'> | LabCase) => void;
    clinicData: ClinicData;
}> = ({ labCase, onClose, onSave, clinicData }) => {
    const { t } = useI18n();
    const { patients, suppliers } = clinicData;
    const [formData, setFormData] = useState<Omit<LabCase, 'id'> | LabCase>(
        labCase || {
            patientId: '',
            labId: '',
            caseType: '',
            sentDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            returnDate: '',
            status: LabCaseStatus.DRAFT,
            labCost: 0,
            notes: '',
        }
    );

    const dentalLabs = useMemo(() => suppliers.filter(s => s.type === 'Dental Lab'), [suppliers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'labCost' ? parseFloat(value) : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patientId || !formData.labId || !formData.caseType || !formData.sentDate || !formData.dueDate) {
            alert(t('labCases.alertFillAllFields'));
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-700">{labCase ? t('labCases.editCase') : t('labCases.addNewCase')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300" aria-label={t('common.closeForm')}>
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="patientId" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.patient')}</label>
                        <select id="patientId" name="patientId" value={formData.patientId} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required>
                            <option value="">{t('labCases.selectPatient')}</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="labId" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.dentalLab')}</label>
                        <select id="labId" name="labId" value={formData.labId} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required>
                            <option value="">{t('labCases.selectDentalLab')}</option>
                            {dentalLabs.map(lab => <option key={lab.id} value={lab.id}>{lab.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="caseType" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.caseType')}</label>
                        <input id="caseType" name="caseType" value={formData.caseType} onChange={handleChange} placeholder={t('labCases.caseTypePlaceholder')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sentDate" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.sentDate')}</label>
                            <input id="sentDate" name="sentDate" type="date" value={formData.sentDate} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.dueDate')}</label>
                            <input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="returnDate" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.returnDate')}</label>
                        <input id="returnDate" name="returnDate" type="date" value={formData.returnDate || ''} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="labCost" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.labCost')}</label>
                        <input id="labCost" name="labCost" type="number" step="0.01" value={formData.labCost} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.status')}</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required>
                            {Object.values(LabCaseStatus).map(s => <option key={s} value={s}>{t(`labCaseStatus.${s}`)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-600 mb-1">{t('labCases.notes')}</label>
                        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder={t('labCases.notesPlaceholder')} className="p-2 border border-slate-300 rounded-lg w-full h-20 focus:ring-primary focus:border-primary" />
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

const LabCaseManagement: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { labCases, addLabCase, updateLabCase, patients, suppliers } = clinicData;
    const { t, locale } = useI18n();
    const { addNotification } = useNotification();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<LabCase | undefined>(undefined);

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });

    const handleSaveCase = (labCase: Omit<LabCase, 'id'> | LabCase) => {
        if ('id' in labCase && labCase.id) {
            updateLabCase(labCase as LabCase);
            addNotification(t('notifications.labCaseUpdated'), NotificationType.SUCCESS);
        } else {
            addLabCase(labCase as Omit<LabCase, 'id'>);
            addNotification(t('notifications.labCaseAdded'), NotificationType.SUCCESS);
        }
        setEditingCase(undefined);
        setIsAddModalOpen(false);
    };

    const getStatusClass = (status: LabCaseStatus) => {
        switch (status) {
            case LabCaseStatus.DRAFT:
                return 'bg-slate-100 text-slate-700';
            case LabCaseStatus.SENT_TO_LAB:
                return 'bg-blue-100 text-blue-700';
            case LabCaseStatus.RECEIVED_FROM_LAB:
                return 'bg-green-100 text-green-700';
            case LabCaseStatus.FITTED_TO_PATIENT:
                return 'bg-emerald-100 text-emerald-700';
            case LabCaseStatus.CANCELLED:
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-700">{t('labCases.labCaseTracker')}</h3>
                <button
                    onClick={() => { setEditingCase(undefined); setIsAddModalOpen(true); }}
                    className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                >
                    <AddIcon /> {t('labCases.addCase')}
                </button>
            </div>
            <div className="bg-neutral p-4 rounded-lg shadow-inner">
                {labCases.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">{t('labCases.noCasesRecorded')}</p>
                ) : (
                    <ul className="space-y-3">
                        {labCases.map(lc => {
                            const patient = patients.find(p => p.id === lc.patientId);
                            const lab = suppliers.find(s => s.id === lc.labId);
                            const statusClass = getStatusClass(lc.status);
                            return (
                                <li key={lc.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-3 rounded-md shadow-sm gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800">{lc.caseType} - {patient?.name || t('common.unknownPatient')}</p>
                                        <p className="text-sm text-slate-600">
                                            {t('labCases.lab')}: {lab?.name || t('common.na')}
                                            <span className="ms-2 ps-2 border-s border-slate-300">
                                                {t('labCases.sentDate')}: {dateFormatter.format(new Date(lc.sentDate))} | {t('labCases.dueDate')}: {dateFormatter.format(new Date(lc.dueDate))}
                                            </span>
                                            {lc.returnDate && (
                                                <span className="ms-2 ps-2 border-s border-slate-300">
                                                    {t('labCases.returnDate')}: {dateFormatter.format(new Date(lc.returnDate))}
                                                </span>
                                            )}
                                        </p>
                                        {lc.notes && <p className="text-xs text-slate-500 mt-1">{t('labCases.notes')}: {lc.notes}</p>}
                                    </div>
                                    <div className="flex flex-col items-end sm:items-center gap-2 flex-shrink-0">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>{t(`labCaseStatus.${lc.status}`)}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-700">{currencyFormatter.format(lc.labCost)}</span>
                                            <button
                                                onClick={() => { setEditingCase(lc); setIsAddModalOpen(true); }}
                                                className="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary-light"
                                                aria-label={t('labCases.editCaseAriaLabel', {caseType: lc.caseType, patientName: patient?.name || t('common.unknownPatient')})}
                                            >
                                                <EditIcon />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {isAddModalOpen && (
                <AddEditLabCaseModal
                    labCase={editingCase}
                    onClose={() => { setIsAddModalOpen(false); setEditingCase(undefined); }}
                    onSave={handleSaveCase}
                    clinicData={clinicData}
                />
            )}
        </div>
    );
};

export default LabCaseManagement;
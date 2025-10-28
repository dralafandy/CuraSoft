import React, { useState, useEffect } from 'react';
import { Patient } from '../../types';
import { useI18n } from '../../hooks/useI18n';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

interface AddEditPatientModalProps {
    patient?: Patient; // Optional patient object for editing
    onClose: () => void;
    onSave: (patientData: Omit<Patient, 'id' | 'dentalChart'> | Patient) => void;
}

const AddEditPatientModal: React.FC<AddEditPatientModalProps> = ({ patient, onClose, onSave }) => {
    const { t } = useI18n();

    const [formData, setFormData] = useState<Omit<Patient, 'id' | 'dentalChart'> | Patient>(
        patient || {
            name: '',
            dob: '',
            gender: 'Male',
            phone: '',
            email: '',
            address: '',
            medicalHistory: '',
            treatmentNotes: '',
            lastVisit: new Date().toISOString().split('T')[0], // Default to today
            allergies: '',
            medications: '',
            insuranceProvider: '',
            insurancePolicyNumber: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
        }
    );

    // Update lastVisit if it's not present when editing an existing patient
    useEffect(() => {
        if (patient && !patient.lastVisit) {
            setFormData(prev => ({ ...prev, lastVisit: new Date().toISOString().split('T')[0] }));
        }
    }, [patient]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name || !formData.dob || !formData.phone) {
            alert(t('addPatientModal.alertFillRequired'));
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-700">{patient ? t('addPatientModal.editTitle') : t('addPatientModal.title')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300" aria-label={t('addPatientModal.closeAriaLabel')}>
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.fullName')}</label>
                            <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder={t('addPatientModal.fullName')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.dob')}</label>
                            <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.gender')}</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required>
                                <option value="Male">{t('male')}</option>
                                <option value="Female">{t('female')}</option>
                                <option value="Other">{t('other')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.phone')}</label>
                            <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder={t('addPatientModal.phone')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.email')}</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t('addPatientModal.email')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.address')}</label>
                            <textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder={t('addPatientModal.address')} className="p-2 border border-slate-300 rounded-lg w-full h-20 focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <h3 className="text-md font-bold text-slate-700 mt-6 mb-2">{t('patientReport.medicalInfo.title')}</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="medicalHistory" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.medicalHistory')}</label>
                            <textarea id="medicalHistory" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} placeholder={t('addPatientModal.medicalHistoryPlaceholder')} className="p-2 border border-slate-300 rounded-lg w-full h-24 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="allergies" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.allergies')}</label>
                            <input id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} placeholder={t('addPatientModal.allergiesPlaceholder')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="medications" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.currentMedications')}</label>
                            <input id="medications" name="medications" value={formData.medications} onChange={handleChange} placeholder={t('addPatientModal.currentMedicationsPlaceholder')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <h3 className="text-md font-bold text-slate-700 mt-6 mb-2">{t('patientReport.emergencyAndInsurance.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="emergencyContactName" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.emergencyContactName')}</label>
                            <input id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder={t('addPatientModal.emergencyContactName')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.emergencyContactPhone')}</label>
                            <input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} placeholder={t('addPatientModal.emergencyContactPhone')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="insuranceProvider" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.insuranceProvider')}</label>
                            <input id="insuranceProvider" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} placeholder={t('addPatientModal.insuranceProvider')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="insurancePolicyNumber" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.policyNumber')}</label>
                            <input id="insurancePolicyNumber" name="insurancePolicyNumber" value={formData.insurancePolicyNumber} onChange={handleChange} placeholder={t('addPatientModal.policyNumber')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="treatmentNotes" className="block text-sm font-medium text-slate-600 mb-1">{t('addPatientModal.initialTreatmentNotes')}</label>
                        <textarea id="treatmentNotes" name="treatmentNotes" value={formData.treatmentNotes} onChange={handleChange} placeholder={t('addPatientModal.initialTreatmentNotesPlaceholder')} className="p-2 border border-slate-300 rounded-lg w-full h-24 focus:ring-primary focus:border-primary" />
                    </div>

                    <footer className="pt-2 flex justify-end space-x-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-dark rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light">{t('addPatientModal.savePatient')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddEditPatientModal;
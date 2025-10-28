import React, { useState, useMemo, useCallback } from 'react';
import { ClinicData } from '../hooks/useClinicData';
import { Patient, NotificationType } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { PatientDetailsModal } from './patient/PatientDetailsModal';
import AddEditPatientModal from './patient/AddEditPatientModal';
import { useI18n } from '../hooks/useI18n';

// Icons for UI elements
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const AddUserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
const WhatsAppIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.062 17.498a9.423 9.423 0 0 1-4.71-1.392l-5.13.84 1.09-4.992a9.423 9.423 0 0 1-1.282-5.024C2.03 3.018 6.54-1.5 12 .002c5.46 1.5 8.97 7.018 7.47 12.478a9.423 9.423 0 0 1-7.408 5.02z"/></svg>);


// Helper function
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
const colors = ['bg-sky-200', 'bg-emerald-200', 'bg-amber-200', 'bg-rose-200', 'bg-indigo-200', 'bg-teal-200'];
const getColorForPatient = (patientId: string) => {
    const charCodeSum = patientId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
}

const PatientListItem: React.FC<{ patient: Patient; onSelect: () => void }> = ({ patient, onSelect }) => {
    const { t } = useI18n();
    const dateFormatter = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    
    const handleSendWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the onSelect from firing

        let phoneNumber = patient.phone.replace(/[^0-9]/g, '');
        if (phoneNumber.startsWith('0')) {
            phoneNumber = phoneNumber.substring(1);
        }
        // Assuming an Egyptian country code for now
        const internationalPhoneNumber = `20${phoneNumber}`;
        
        const message = t('patientList.whatsappMessage', { patientName: patient.name });

        const url = `https://wa.me/${internationalPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div
            onClick={onSelect}
            className="w-full border border-slate-200 rounded-xl p-4 flex justify-between items-center gap-4 hover:bg-slate-50 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer focus-within:ring-2 focus-within:ring-primary-light"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect()}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                 <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${getColorForPatient(patient.id)}`}>
                    <span className="text-xl font-bold text-slate-700">{getInitials(patient.name)}</span>
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-start truncate">{patient.name}</p>
                    <p className="text-sm text-slate-600 text-start">{patient.phone}</p>
                    <p className="text-xs text-slate-500 mt-1 text-start">{t('patientList.lastVisit')}: {dateFormatter.format(new Date(patient.lastVisit))}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <button
                    onClick={handleSendWhatsApp}
                    className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-colors"
                    aria-label={t('patientList.sendWhatsAppAriaLabel', { patientName: patient.name })}
                >
                    <WhatsAppIcon />
                </button>
                <ChevronRightIcon />
            </div>
        </div>
    );
};

const PatientList: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { patients, addPatient, updatePatient } = clinicData;
    const { addNotification } = useNotification();
    const { t } = useI18n();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [patientToEdit, setPatientToEdit] = useState<Patient | undefined>(undefined);
    

    const handleSavePatient = useCallback((patientData: Omit<Patient, 'id' | 'dentalChart' | 'treatmentRecords'> | Patient) => {
        if ('id' in patientData && patientData.id) {
            updatePatient(patientData as Patient);
            addNotification(t('notifications.patientUpdated'), NotificationType.SUCCESS);
            if (selectedPatient && selectedPatient.id === patientData.id) {
                setSelectedPatient(patientData as Patient);
            }
        } else {
            addPatient(patientData as Omit<Patient, 'id' | 'dentalChart' | 'treatmentRecords'>);
            addNotification(t('notifications.patientAdded'), NotificationType.SUCCESS);
        }
        setIsAddEditModalOpen(false);
        setPatientToEdit(undefined);
    }, [addNotification, selectedPatient, updatePatient, addPatient, t]);

    const filteredPatients = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return patients;
        return patients.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.phone.includes(term) ||
            p.email.toLowerCase().includes(term)
        );
    }, [patients, searchTerm]);

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="relative w-full sm:max-w-xs">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder={t('patientList.searchPatients')}
                        aria-label={t('patientList.searchPatientsAriaLabel')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 ps-10 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                </div>
                <button
                    onClick={() => { setPatientToEdit(undefined); setIsAddEditModalOpen(true); }}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center justify-center w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-primary-light"
                >
                    <AddUserIcon />
                    {t('patientList.addNewPatient')}
                </button>
            </div>

            <div className="space-y-3">
                {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                        <PatientListItem
                            key={patient.id}
                            patient={patient}
                            onSelect={() => setSelectedPatient(patient)}
                        />
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-10">{t('patientList.noPatientsFound')}</p>
                )}
            </div>

            {/* Modals */}
            {isAddEditModalOpen && (
                <AddEditPatientModal 
                    patient={patientToEdit}
                    onSave={handleSavePatient} 
                    onClose={() => {
                        setIsAddEditModalOpen(false);
                        setPatientToEdit(undefined);
                    }} 
                />
            )}

            {selectedPatient && !isAddEditModalOpen && (
                <PatientDetailsModal 
                    patient={selectedPatient} 
                    onClose={() => setSelectedPatient(null)}
                    onEdit={() => {
                        setPatientToEdit(selectedPatient);
                        setIsAddEditModalOpen(true);
                        setSelectedPatient(null);
                    }}
                    clinicData={clinicData}
                />
            )}
        </div>
    );
};

export default PatientList;
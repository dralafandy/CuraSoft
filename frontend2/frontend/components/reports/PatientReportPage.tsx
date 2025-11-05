import React, { useState, useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { Patient, TreatmentRecord, Payment } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { openPrintWindow } from '../../utils/print';

const PatientReportPage: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { t, locale } = useI18n();
    const { patients, treatmentRecords, payments } = clinicData;
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });

    const filteredPatients = useMemo(() => {
        return patients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm)
        );
    }, [patients, searchTerm]);

    const patientSummaries = useMemo(() => {
        return filteredPatients.map(patient => {
            const patientTreatments = treatmentRecords.filter(tr => tr.patientId === patient.id);
            const patientPayments = payments.filter(p => p.patientId === patient.id);

            const totalRevenue = patientTreatments.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);
            const totalPaid = patientPayments.reduce((sum, p) => sum + p.amount, 0);
            const outstandingBalance = totalRevenue - totalPaid;

            const treatmentCount = patientTreatments.length;
            const lastVisit = patientTreatments.length > 0 ?
                new Date(Math.max(...patientTreatments.map(tr => new Date(tr.treatmentDate).getTime()))) :
                new Date(patient.lastVisit);

            return {
                patient,
                totalRevenue,
                totalPaid,
                outstandingBalance,
                treatmentCount,
                lastVisit
            };
        });
    }, [filteredPatients, treatmentRecords, payments]);

    const handlePrintPatientReport = (patient: Patient) => {
        const patientTreatments = treatmentRecords.filter(tr => tr.patientId === patient.id);
        const patientPayments = payments.filter(p => p.patientId === patient.id);

        const totalRevenue = patientTreatments.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);
        const totalPaid = patientPayments.reduce((sum, p) => sum + p.amount, 0);
        const outstandingBalance = totalRevenue - totalPaid;

        const printContent = (
            <div className="p-8 bg-white text-slate-900" dir="rtl">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('patientReport.title')}</h1>
                    <h2 className="text-2xl font-bold text-primary-dark mb-4">{patient.name}</h2>
                    <p className="text-md text-slate-600">{t('patientReport.generatedOn', { date: dateFormatter.format(new Date()) })}</p>
                </header>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('patientReport.summary')}</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('patientReport.totalRevenue')}</p>
                            <p className="text-2xl font-bold text-slate-800">{currencyFormatter.format(totalRevenue)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('patientReport.totalPaid')}</p>
                            <p className="text-2xl font-bold text-green-600">{currencyFormatter.format(totalPaid)}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${outstandingBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                            <p className="text-sm text-slate-600">{t('patientReport.outstandingBalance')}</p>
                            <p className={`text-2xl font-bold ${outstandingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {currencyFormatter.format(outstandingBalance)}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('patientReport.contactInfo')}</p>
                            <div className="text-sm">
                                <p>{patient.phone}</p>
                                <p>{patient.email}</p>
                                <p>{patient.address}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('patientReport.treatmentsPerformed')}</h3>
                    {patientTreatments.length > 0 ? (
                        <table className="w-full text-sm border-collapse border border-slate-400">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.date')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.treatment')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.totalCost')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.doctor')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientTreatments.map(record => {
                                    const treatment = clinicData.treatmentDefinitions.find(td => td.id === record.treatmentDefinitionId);
                                    const doctor = clinicData.dentists.find(d => d.id === record.dentistId);
                                    return (
                                        <tr key={record.id} className="border-b border-slate-200">
                                            <td className="p-3 border border-slate-300">{dateFormatter.format(new Date(record.treatmentDate))}</td>
                                            <td className="p-3 border border-slate-300">{treatment?.name || t('common.unknown')}</td>
                                            <td className="p-3 border border-slate-300">{currencyFormatter.format(record.totalTreatmentCost)}</td>
                                            <td className="p-3 border border-slate-300">{doctor?.name || t('common.unknown')}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-500 py-4">{t('patientReport.noTreatments')}</p>
                    )}
                </section>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('patientReport.paymentsMade')}</h3>
                    {patientPayments.length > 0 ? (
                        <table className="w-full text-sm border-collapse border border-slate-400">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.paymentDate')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.amount')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.method')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.notes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientPayments.map(payment => (
                                    <tr key={payment.id} className="border-b border-slate-200">
                                        <td className="p-3 border border-slate-300">{dateFormatter.format(new Date(payment.date))}</td>
                                        <td className="p-3 border border-slate-300">{currencyFormatter.format(payment.amount)}</td>
                                        <td className="p-3 border border-slate-300">{payment.method}</td>
                                        <td className="p-3 border border-slate-300">{payment.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-500 py-4">{t('patientReport.noPayments')}</p>
                    )}
                </section>
            </div>
        );

        openPrintWindow(`${t('patientReport.title')} - ${patient.name}`, printContent);
    };

    return (
        <div className="space-y-6 p-6 bg-slate-50 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reports.patientReports')}</h1>
                        <p className="text-slate-600">{t('reports.patientReportsSubtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="patient-search" className="block text-sm font-medium text-slate-700 mb-2">
                            {t('reports.searchPatients')}
                        </label>
                        <input
                            type="text"
                            id="patient-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('reports.searchByNameOrPhone')}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Patient List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">{t('reports.patientList')}</h2>
                <div className="space-y-4">
                    {patientSummaries.map(({ patient, totalRevenue, totalPaid, outstandingBalance, treatmentCount, lastVisit }) => (
                        <div key={patient.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-800">{patient.name}</h3>
                                    <p className="text-sm text-slate-600">{patient.phone} | {patient.email}</p>
                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500">{t('reports.totalRevenue')}:</span>
                                            <span className="font-semibold text-slate-800 ml-1">{currencyFormatter.format(totalRevenue)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">{t('reports.totalPaid')}:</span>
                                            <span className="font-semibold text-green-600 ml-1">{currencyFormatter.format(totalPaid)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">{t('reports.outstandingBalance')}:</span>
                                            <span className={`font-semibold ml-1 ${outstandingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {currencyFormatter.format(outstandingBalance)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">{t('reports.treatmentCount')}:</span>
                                            <span className="font-semibold text-slate-800 ml-1">{treatmentCount}</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        {t('reports.lastVisit')}: {dateFormatter.format(lastVisit)}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedPatient(patient)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        {t('reports.viewDetails')}
                                    </button>
                                    <button
                                        onClick={() => handlePrintPatientReport(patient)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                        🖨️ {t('reports.printReport')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {patientSummaries.length === 0 && (
                    <p className="text-center text-slate-500 py-8">{t('reports.noPatientsFound')}</p>
                )}
            </div>

            {/* Patient Details Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-700">{selectedPatient.name}</h2>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="p-1 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-slate-700 mb-2">{t('patientDetails.personalInfo')}</h3>
                                        <div className="space-y-1">
                                            <p className="text-sm text-slate-600">{t('patientDetails.dob')}: <span className="font-semibold">{dateFormatter.format(new Date(selectedPatient.dob))}</span></p>
                                            <p className="text-sm text-slate-600">{t('patientDetails.gender')}: <span className="font-semibold">{selectedPatient.gender}</span></p>
                                            <p className="text-sm text-slate-600">{t('patientDetails.phone')}: <span className="font-semibold">{selectedPatient.phone}</span></p>
                                            <p className="text-sm text-slate-600">{t('patientDetails.email')}: <span className="font-semibold">{selectedPatient.email || t('common.na')}</span></p>
                                            <p className="text-sm text-slate-600">{t('patientDetails.address')}: <span className="font-semibold">{selectedPatient.address}</span></p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-slate-700 mb-2">{t('patientDetails.financialSummary')}</h3>
                                        {(() => {
                                            const patientTreatments = treatmentRecords.filter(tr => tr.patientId === selectedPatient.id);
                                            const patientPayments = payments.filter(p => p.patientId === selectedPatient.id);
                                            const totalRevenue = patientTreatments.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);
                                            const totalPaid = patientPayments.reduce((sum, p) => sum + p.amount, 0);
                                            const outstandingBalance = totalRevenue - totalPaid;

                                            return (
                                                <div className="space-y-1">
                                                    <p className="text-sm text-slate-600">{t('patientDetails.totalRevenue')}: <span className="font-semibold text-slate-800">{currencyFormatter.format(totalRevenue)}</span></p>
                                                    <p className="text-sm text-slate-600">{t('patientDetails.totalPaid')}: <span className="font-semibold text-green-600">{currencyFormatter.format(totalPaid)}</span></p>
                                                    <p className="text-sm text-slate-600">{t('patientDetails.outstandingBalance')}: <span className={`font-semibold ${outstandingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{currencyFormatter.format(outstandingBalance)}</span></p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">{t('patientDetails.treatmentsPerformed')}</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                        {(() => {
                                            const patientTreatments = treatmentRecords.filter(tr => tr.patientId === selectedPatient.id);
                                            return patientTreatments.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {patientTreatments.map(tr => {
                                                        const treatment = clinicData.treatmentDefinitions.find(td => td.id === tr.treatmentDefinitionId);
                                                        const doctor = clinicData.dentists.find(d => d.id === tr.dentistId);
                                                        return (
                                                            <li key={tr.id} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                                                                <span>{dateFormatter.format(new Date(tr.treatmentDate))}: {treatment?.name} ({doctor?.name})</span>
                                                                <span className="font-semibold">{currencyFormatter.format(tr.totalTreatmentCost)}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : <p className="text-slate-500 text-center py-4">{t('patientDetails.noTreatmentsFound')}</p>;
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">{t('patientDetails.payments')}</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                        {(() => {
                                            const patientPayments = payments.filter(p => p.patientId === selectedPatient.id);
                                            return patientPayments.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {patientPayments.map(payment => (
                                                        <li key={payment.id} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                                                            <div>
                                                                <span className="font-semibold">{dateFormatter.format(new Date(payment.date))}</span>
                                                                <span className="text-sm text-slate-600 ml-2">({payment.method})</span>
                                                                {payment.notes && <span className="text-xs text-slate-500 block">{payment.notes}</span>}
                                                            </div>
                                                            <span className="font-semibold text-green-600">{currencyFormatter.format(payment.amount)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-slate-500 text-center py-4">{t('patientDetails.noPaymentsFound')}</p>;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientReportPage;

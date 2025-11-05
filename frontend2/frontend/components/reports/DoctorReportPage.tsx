import React, { useState, useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { Dentist, TreatmentRecord, DoctorPayment } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { openPrintWindow } from '../../utils/print';

const DoctorReportPage: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { t, locale } = useI18n();
    const { dentists, treatmentRecords, doctorPayments } = clinicData;
    const [selectedDoctor, setSelectedDoctor] = useState<Dentist | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });

    const filteredDoctors = useMemo(() => {
        return dentists.filter(doctor =>
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [dentists, searchTerm]);

    const doctorSummaries = useMemo(() => {
        return filteredDoctors.map(doctor => {
            const doctorTreatments = treatmentRecords.filter(tr => tr.dentistId === doctor.id);
            const doctorPaymentsList = doctorPayments.filter(p => p.dentistId === doctor.id);

            const totalRevenue = doctorTreatments.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);
            const totalEarnings = doctorTreatments.reduce((sum, tr) => sum + tr.doctorShare, 0);
            const totalPaymentsReceived = doctorPaymentsList.reduce((sum, p) => sum + p.amount, 0);
            const netBalance = totalEarnings - totalPaymentsReceived;

            const treatmentCount = doctorTreatments.length;
            const lastTreatment = doctorTreatments.length > 0 ?
                new Date(Math.max(...doctorTreatments.map(tr => new Date(tr.treatmentDate).getTime()))) :
                null;

            return {
                doctor,
                totalRevenue,
                totalEarnings,
                totalPaymentsReceived,
                netBalance,
                treatmentCount,
                lastTreatment
            };
        });
    }, [filteredDoctors, treatmentRecords, doctorPayments]);

    const handlePrintDoctorReport = (doctor: Dentist) => {
        const doctorTreatments = treatmentRecords.filter(tr => tr.dentistId === doctor.id);
        const doctorPaymentsList = doctorPayments.filter(p => p.dentistId === doctor.id);

        const totalRevenue = doctorTreatments.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);
        const totalEarnings = doctorTreatments.reduce((sum, tr) => sum + tr.doctorShare, 0);
        const totalPaymentsReceived = doctorPaymentsList.reduce((sum, p) => sum + p.amount, 0);
        const netBalance = totalEarnings - totalPaymentsReceived;

        const printContent = (
            <div className="p-8 bg-white text-slate-900" dir="rtl">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('doctorReport.title')}</h1>
                    <h2 className="text-2xl font-bold text-primary-dark mb-4">{doctor.name}</h2>
                    <p className="text-md text-slate-600">{t('doctorReport.generatedOn', { date: dateFormatter.format(new Date()) })}</p>
                </header>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('doctorReport.summary')}</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('doctorReport.totalRevenue')}</p>
                            <p className="text-2xl font-bold text-slate-800">{currencyFormatter.format(totalRevenue)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('doctorReport.totalEarnings')}</p>
                            <p className="text-2xl font-bold text-green-600">{currencyFormatter.format(totalEarnings)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('doctorReport.totalPaymentsReceived')}</p>
                            <p className="text-2xl font-bold text-blue-600">{currencyFormatter.format(totalPaymentsReceived)}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${netBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                            <p className="text-sm text-slate-600">{t('doctorReport.netBalance')}</p>
                            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {currencyFormatter.format(netBalance)}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('doctorReport.treatmentsPerformed')}</h3>
                    {doctorTreatments.length > 0 ? (
                        <table className="w-full text-sm border-collapse border border-slate-400">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('doctorReport.date')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('doctorReport.patient')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('doctorReport.treatment')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('doctorReport.totalCost')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('doctorReport.doctorShare')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctorTreatments.map(record => {
                                    const patient = clinicData.patients.find(p => p.id === record.patientId);
                                    const treatment = clinicData.treatmentDefinitions.find(td => td.id === record.treatmentDefinitionId);
                                    return (
                                        <tr key={record.id} className="border-b border-slate-200">
                                            <td className="p-3 border border-slate-300">{dateFormatter.format(new Date(record.treatmentDate))}</td>
                                            <td className="p-3 border border-slate-300">{patient?.name || t('common.unknown')}</td>
                                            <td className="p-3 border border-slate-300">{treatment?.name || t('common.unknown')}</td>
                                            <td className="p-3 border border-slate-300">{currencyFormatter.format(record.totalTreatmentCost)}</td>
                                            <td className="p-3 border border-slate-300">{currencyFormatter.format(record.doctorShare)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-500 py-4">{t('doctorReport.noTreatments')}</p>
                    )}
                </section>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('doctorReport.paymentsReceived')}</h3>
                    {doctorPaymentsList.length > 0 ? (
                        <table className="w-full text-sm border-collapse border border-slate-400">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('doctorReport.paymentDate')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('doctorReport.amount')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('doctorReport.notes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctorPaymentsList.map(payment => (
                                    <tr key={payment.id} className="border-b border-slate-200">
                                        <td className="p-3 border border-slate-300">{dateFormatter.format(new Date(payment.date))}</td>
                                        <td className="p-3 border border-slate-300">{currencyFormatter.format(payment.amount)}</td>
                                        <td className="p-3 border border-slate-300">{payment.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-500 py-4">{t('doctorReport.noPayments')}</p>
                    )}
                </section>
            </div>
        );

        openPrintWindow(`${t('doctorReport.title')} - ${doctor.name}`, printContent);
    };

    return (
        <div className="space-y-6 p-6 bg-slate-50 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reports.doctorReports')}</h1>
                        <p className="text-slate-600">{t('reports.doctorReportsSubtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="doctor-search" className="block text-sm font-medium text-slate-700 mb-2">
                            {t('reports.searchDoctors')}
                        </label>
                        <input
                            type="text"
                            id="doctor-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('reports.searchByNameOrSpecialty')}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Doctor List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">{t('reports.doctorList')}</h2>
                <div className="space-y-4">
                    {doctorSummaries.map(({ doctor, totalRevenue, totalEarnings, totalPaymentsReceived, netBalance, treatmentCount, lastTreatment }) => (
                        <div key={doctor.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className={`w-4 h-4 rounded-full ${doctor.color}`}></span>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-800">{doctor.name}</h3>
                                        <p className="text-sm text-slate-600">{doctor.specialty}</p>
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500">{t('reports.totalRevenue')}:</span>
                                                <span className="font-semibold text-slate-800 ml-1">{currencyFormatter.format(totalRevenue)}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">{t('reports.totalEarnings')}:</span>
                                                <span className="font-semibold text-green-600 ml-1">{currencyFormatter.format(totalEarnings)}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">{t('reports.totalPaymentsReceived')}:</span>
                                                <span className="font-semibold text-blue-600 ml-1">{currencyFormatter.format(totalPaymentsReceived)}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">{t('reports.netBalance')}:</span>
                                                <span className={`font-semibold ml-1 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {currencyFormatter.format(netBalance)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">
                                            {t('reports.treatmentCount')}: {treatmentCount}
                                            {lastTreatment && (
                                                <span className="mr-4">
                                                    {t('reports.lastTreatment')}: {dateFormatter.format(lastTreatment)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDoctor(doctor)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        {t('reports.viewDetails')}
                                    </button>
                                    <button
                                        onClick={() => handlePrintDoctorReport(doctor)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                        🖨️ {t('reports.printReport')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {doctorSummaries.length === 0 && (
                    <p className="text-center text-slate-500 py-8">{t('reports.noDoctorsFound')}</p>
                )}
            </div>

            {/* Doctor Details Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-700">{selectedDoctor.name}</h2>
                            <button
                                onClick={() => setSelectedDoctor(null)}
                                className="p-1 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-slate-700 mb-2">{t('doctorDetails.specialty')}</h3>
                                        <p className="text-slate-800">{selectedDoctor.specialty}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-slate-700 mb-2">{t('doctorDetails.financialSummary')}</h3>
                                        {(() => {
                                            const doctorTreatments = treatmentRecords.filter(tr => tr.dentistId === selectedDoctor.id);
                                            const doctorPaymentsList = doctorPayments.filter(p => p.dentistId === selectedDoctor.id);
                                            const totalEarnings = doctorTreatments.reduce((sum, tr) => sum + tr.doctorShare, 0);
                                            const totalPaymentsReceived = doctorPaymentsList.reduce((sum, p) => sum + p.amount, 0);
                                            const netBalance = totalEarnings - totalPaymentsReceived;

                                            return (
                                                <div className="space-y-1">
                                                    <p className="text-sm text-slate-600">{t('doctorDetails.totalEarnings')}: <span className="font-semibold text-green-600">{currencyFormatter.format(totalEarnings)}</span></p>
                                                    <p className="text-sm text-slate-600">{t('doctorDetails.totalPaymentsReceived')}: <span className="font-semibold text-blue-600">{currencyFormatter.format(totalPaymentsReceived)}</span></p>
                                                    <p className="text-sm text-slate-600">{t('doctorDetails.netBalance')}: <span className={`font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{currencyFormatter.format(netBalance)}</span></p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">{t('doctorDetails.treatmentsPerformed')}</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                        {(() => {
                                            const doctorTreatments = treatmentRecords.filter(tr => tr.dentistId === selectedDoctor.id);
                                            return doctorTreatments.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {doctorTreatments.map(tr => {
                                                        const patient = clinicData.patients.find(p => p.id === tr.patientId);
                                                        const treatment = clinicData.treatmentDefinitions.find(td => td.id === tr.treatmentDefinitionId);
                                                        return (
                                                            <li key={tr.id} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                                                                <span>{dateFormatter.format(new Date(tr.treatmentDate))}: {treatment?.name} ({patient?.name})</span>
                                                                <span className="font-semibold">{currencyFormatter.format(tr.doctorShare)}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : <p className="text-slate-500 text-center py-4">{t('doctorDetails.noTreatmentsFound')}</p>;
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">{t('doctorDetails.transactions')}</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                        {(() => {
                                            const doctorPaymentsList = doctorPayments.filter(p => p.dentistId === selectedDoctor.id);
                                            const doctorTreatments = treatmentRecords.filter(tr => tr.dentistId === selectedDoctor.id);

                                            if (doctorPaymentsList.length === 0 && doctorTreatments.length === 0) {
                                                return <p className="text-slate-500 text-center py-4">{t('doctorDetails.noTransactions')}</p>;
                                            }

                                            return (
                                                <div className="space-y-2">
                                                    {doctorPaymentsList.map(payment => (
                                                        <div key={payment.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center border-l-4 border-green-500">
                                                            <div>
                                                                <p className="font-semibold text-slate-800">{t('doctorDetails.paymentReceived')}</p>
                                                                <p className="text-sm text-slate-600">{dateFormatter.format(new Date(payment.date))}</p>
                                                                {payment.notes && <p className="text-xs text-slate-500">{payment.notes}</p>}
                                                            </div>
                                                            <span className="font-semibold text-green-600">{currencyFormatter.format(payment.amount)}</span>
                                                        </div>
                                                    ))}
                                                    {doctorTreatments.map(treatment => (
                                                        <div key={treatment.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center border-l-4 border-blue-500">
                                                            <div>
                                                                <p className="font-semibold text-slate-800">{t('doctorDetails.earningsFromTreatment')}</p>
                                                                <p className="text-sm text-slate-600">{dateFormatter.format(new Date(treatment.treatmentDate))}</p>
                                                                <p className="text-xs text-slate-500">{clinicData.treatmentDefinitions.find(td => td.id === treatment.treatmentDefinitionId)?.name}</p>
                                                            </div>
                                                            <span className="font-semibold text-blue-600">{currencyFormatter.format(treatment.doctorShare)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
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

export default DoctorReportPage;

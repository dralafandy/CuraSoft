import React, { useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { Patient, ToothStatus, TreatmentRecord, Payment } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface PatientFullReportProps {
    patient: Patient;
    clinicData: ClinicData;
}

const PatientFullReport: React.FC<PatientFullReportProps> = ({ patient, clinicData }) => {
    const { t, locale } = useI18n();
    const { treatmentRecords, payments, treatmentDefinitions, dentists } = clinicData;

    const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });

    const patientTreatmentRecords = useMemo(() => treatmentRecords.filter(tr => tr.patientId === patient.id).sort((a, b) => new Date(a.treatmentDate).getTime() - new Date(b.treatmentDate).getTime()), [treatmentRecords, patient.id]);
    const patientPayments = useMemo(() => payments.filter(p => p.patientId === patient.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [payments, patient.id]);

    const financialSummary = useMemo(() => {
        const totalCharges = patientTreatmentRecords.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);
        const totalPaid = patientPayments.reduce((sum, p) => sum + p.amount, 0);
        const outstandingBalance = totalCharges - totalPaid;
        return { totalCharges, totalPaid, outstandingBalance };
    }, [patientTreatmentRecords, patientPayments]);

    // Summarize dental chart status
    const toothStatusCounts: Record<ToothStatus, number> = {
        [ToothStatus.HEALTHY]: 0,
        [ToothStatus.FILLING]: 0,
        [ToothStatus.CROWN]: 0,
        [ToothStatus.MISSING]: 0,
        [ToothStatus.IMPLANT]: 0,
        [ToothStatus.ROOT_CANAL]: 0,
        [ToothStatus.CAVITY]: 0,
    };

    for (const toothId in patient.dentalChart) {
        const status = patient.dentalChart[toothId].status;
        if (toothStatusCounts.hasOwnProperty(status)) {
            toothStatusCounts[status]++;
        }
    }

    const dentalChartSummary = useMemo(() => {
        const entries: string[] = [];
        const significantStatuses = Object.entries(toothStatusCounts).filter(([, count]) => count > 0);

        if (significantStatuses.length > 0) {
            significantStatuses.forEach(([status, count]) => {
                if (count > 0) {
                    entries.push(`${t(`toothStatus.${status}`)}: ${count}`);
                }
            });
        } else {
            entries.push(t('patientReport.dentalChart.allHealthy'));
        }
        return entries;
    }, [toothStatusCounts, t]);


    return (
        <div className="p-8 bg-white text-slate-900 min-h-screen" dir="rtl">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('appName')}</h1>
                <p className="text-md text-slate-600">{t('patientReport.clinicAddress')}</p>
                <h2 className="text-3xl font-bold text-primary-dark mt-6 mb-2">{t('patientReport.title')}</h2>
                <p className="text-md text-slate-700">{t('patientReport.generatedOn', { date: dateFormatter.format(new Date()) })}</p>
            </header>

            <section className="mb-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{t('patientReport.demographics.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-md text-slate-700">
                    <div><strong>{t('patientReport.demographics.name')}:</strong> {patient.name}</div>
                    <div><strong>{t('patientReport.demographics.phone')}:</strong> {patient.phone}</div>
                    <div><strong>{t('patientReport.demographics.dob')}:</strong> {dateFormatter.format(new Date(patient.dob))}</div>
                    <div><strong>{t('patientReport.demographics.email')}:</strong> {patient.email || '-'}</div>
                    <div><strong>{t('patientReport.demographics.gender')}:</strong> {t(patient.gender.toLowerCase() as 'male' | 'female' | 'other')}</div>
                    <div className="md:col-span-2"><strong>{t('patientReport.demographics.address')}:</strong> {patient.address || '-'}</div>
                </div>
            </section>

            <section className="mb-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{t('patientReport.emergencyAndInsurance.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-md text-slate-700">
                    <div><strong>{t('patientReport.emergencyContactName')}:</strong> {patient.emergencyContactName || '-'}</div>
                    <div><strong>{t('patientReport.emergencyContactPhone')}:</strong> {patient.emergencyContactPhone || '-'}</div>
                    <div><strong>{t('patientReport.emergencyAndInsurance.insuranceProvider')}:</strong> {patient.insuranceProvider || '-'}</div>
                    <div><strong>{t('patientReport.emergencyAndInsurance.policyNumber')}:</strong> {patient.insurancePolicyNumber || '-'}</div>
                </div>
            </section>

            <section className="mb-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{t('patientReport.medicalInfo.title')}</h3>
                <div className="space-y-3 text-md text-slate-700">
                    <div><strong>{t('patientReport.medicalInfo.allergies')}:</strong> <span className="whitespace-pre-wrap">{patient.allergies || t('common.na')}</span></div>
                    <div><strong>{t('patientReport.medicalInfo.medications')}:</strong> <span className="whitespace-pre-wrap">{patient.medications || t('common.na')}</span></div>
                    <div><strong>{t('patientReport.medicalInfo.medicalHistory')}:</strong> <span className="whitespace-pre-wrap">{patient.medicalHistory || t('common.na')}</span></div>
                    <div><strong>{t('patientDetails.unstructuredNotes')}:</strong> <span className="whitespace-pre-wrap">{patient.treatmentNotes || t('common.na')}</span></div>
                </div>
            </section>

            <section className="mb-10 break-inside-avoid">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{t('patientReport.dentalChart.title')}</h3>
                <div className="space-y-2 text-md text-slate-700">
                    {dentalChartSummary.map((summary, index) => (
                        <p key={index}>{summary}</p>
                    ))}
                    <table className="w-full text-sm border-collapse border border-slate-400 mt-4">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 text-right font-semibold border border-slate-300">{t('patientReport.dentalChart.tooth')}</th>
                                <th className="p-2 text-right font-semibold border border-slate-300">{t('patientReport.dentalChart.status')}</th>
                                <th className="p-2 text-right font-semibold border border-slate-300">{t('patientReport.dentalChart.notes')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(patient.dentalChart).filter(([, tooth]) => tooth.status !== ToothStatus.HEALTHY || tooth.notes).map(([toothId, tooth]) => (
                                <tr key={toothId} className="border-b border-slate-200">
                                    <td className="p-2 border border-slate-300">{toothId}</td>
                                    <td className="p-2 border border-slate-300">{t(`toothStatus.${tooth.status}`)}</td>
                                    <td className="p-2 border border-slate-300">{tooth.notes || '-'}</td>
                                </tr>
                            ))}
                            {Object.entries(patient.dentalChart).filter(([, tooth]) => tooth.status === ToothStatus.HEALTHY && !tooth.notes).length === Object.keys(patient.dentalChart).length && (
                                <tr>
                                    <td colSpan={3} className="p-2 text-center text-slate-500 border border-slate-300">{t('patientReport.dentalChart.allHealthy')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>


            <section className="mb-10 break-inside-avoid">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{t('patientReport.treatmentHistory.title')}</h3>
                {patientTreatmentRecords.length > 0 ? (
                    <table className="w-full text-md border-collapse border border-slate-400">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.treatmentHistory.date')}</th>
                                <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.treatmentHistory.treatment')}</th>
                                <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.treatmentHistory.dentist')}</th>
                                <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.treatmentHistory.cost')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientTreatmentRecords.map(record => {
                                const treatmentDef = treatmentDefinitions.find(td => td.id === record.treatmentDefinitionId);
                                const dentist = dentists.find(d => d.id === record.dentistId);
                                return (
                                    <tr key={record.id} className="border-b border-slate-200">
                                        <td className="p-3 border border-slate-300">{dateFormatter.format(new Date(record.treatmentDate))}</td>
                                        <td className="p-3 border border-slate-300">{treatmentDef?.name || t('common.unknownTreatment')}</td>
                                        <td className="p-3 border border-slate-300">{dentist?.name || t('common.unknownDentist')}</td>
                                        <td className="p-3 border border-slate-300">{currencyFormatter.format(record.totalTreatmentCost)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-slate-500 py-4">{t('patientReport.treatmentHistory.noRecords')}</p>
                )}
            </section>

            <section className="mb-10 break-inside-avoid">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{t('patientReport.financials.title')}</h3>
                {patientPayments.length > 0 ? (
                    <table className="w-full text-md border-collapse border border-slate-400">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.financials.paymentDate')}</th>
                                <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.financials.paymentMethod')}</th>
                                <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.financials.notes')}</th>
                                <th className="p-3 text-right font-semibold border border-slate-300">{t('patientReport.financials.amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientPayments.map(payment => (
                                <tr key={payment.id} className="border-b border-slate-200">
                                    <td className="p-3 border border-slate-300">{dateFormatter.format(new Date(payment.date))}</td>
                                    <td className="p-3 border border-slate-300">{t(`paymentMethod.${payment.method}`)}</td>
                                    <td className="p-3 border border-slate-300">{payment.notes || '-'}</td>
                                    <td className="p-3 border border-slate-300">{currencyFormatter.format(payment.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-slate-500 py-4">{t('patientReport.financials.noPayments')}</p>
                )}
                <div className="flex justify-end mt-4">
                    <div className="w-full max-w-sm p-4 bg-neutral-light rounded-lg shadow-sm border border-slate-200">
                        <p className="text-md text-slate-700"><strong>{t('financials.totalCharges')}:</strong> {currencyFormatter.format(financialSummary.totalCharges)}</p>
                        <p className="text-md text-slate-700"><strong>{t('financials.totalPaid')}:</strong> {currencyFormatter.format(financialSummary.totalPaid)}</p>
                        <p className="text-xl font-bold text-primary-dark mt-2"><strong>{t('financials.outstandingBalance')}:</strong> {currencyFormatter.format(financialSummary.outstandingBalance)}</p>
                    </div>
                </div>
            </section>

            <footer className="text-center mt-12 text-slate-600 text-sm">
                <p>{t('patientReport.footer')}</p>
            </footer>
        </div>
    );
};

export default PatientFullReport;
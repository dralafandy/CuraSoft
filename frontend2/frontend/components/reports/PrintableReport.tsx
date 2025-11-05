import React, { useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { useI18n } from '../../hooks/useI18n';
import { Patient, AppointmentStatus, ExpenseCategory, TreatmentRecord, Expense, Appointment, InventoryItem, LabCase, Payment, SupplierInvoice } from '../../types';

const PrintStyles = () => (
  <style>{`
    @media print {
      @page {
        size: A4;
        margin: 1cm;
      }
      body {
        font-size: 12px;
        line-height: 1.4;
      }
      .print-header {
        margin-bottom: 1.5rem;
        page-break-after: avoid;
      }
      .print-section {
        margin-bottom: 1rem;
        page-break-inside: avoid;
      }
      table {
        font-size: 10px;
      }
      h1 {
        font-size: 18px;
      }
      h2, h3, h4 {
        font-size: 14px;
      }
    }
  `}</style>
);

const PrintTable: React.FC<{title: string, headers: string[], data: (string|number)[][]}> = ({ title, headers, data }) => (
    <div className="mb-6 break-inside-avoid">
        <h4 className="text-md font-bold text-slate-800 mb-2">{title}</h4>
        <table className="w-full text-sm border-collapse border border-slate-400">
            <thead className="bg-slate-100">
                <tr>
                    {headers.map(h => <th key={h} className="p-2 text-right font-semibold border border-slate-300">{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i} className="border-b border-slate-200">
                        {row.map((cell, j) => <td key={j} className="p-2 border border-slate-300">{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

interface PrintableReportProps {
    clinicData: ClinicData;
    activeTab: 'patientStats' | 'financialSummary' | 'appointmentOverview' | 'inventoryReport' | 'treatmentPerformance' | 'labCasesReport' | 'paymentsReport' | 'supplierInvoicesReport' | 'dentistsReport' | 'suppliersReport';
    startDate: string;
    endDate: string;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ clinicData, activeTab, startDate, endDate }) => {
    const { t, locale } = useI18n();
    const { patients, appointments, expenses, inventoryItems, treatmentDefinitions, dentists, treatmentRecords, labCases, payments, supplierInvoices, suppliers, clinicInfo } = clinicData;

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });

    const filterDataByDate = <T extends Record<F, string | Date>, F extends keyof T>(data: T[], dateField: F): T[] => {
        if (!startDate || !endDate) return data;
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return data.filter(item => {
            const dateValue: string | Date = item[dateField];
            const itemDate = new Date(dateValue);
            return !isNaN(itemDate.getTime()) && itemDate >= start && itemDate <= end;
        });
    };

    const patientStats = useMemo(() => {
        const filteredPatients = patients.filter(p => {
            if (!startDate || !endDate) return true;
            const start = new Date(startDate);
            start.setHours(0,0,0,0);
            const end = new Date(endDate);
            end.setHours(23,59,59,999);
            const lastVisitDate = new Date(p.lastVisit);
            return lastVisitDate >= start && lastVisitDate <= end;
        });

        const genderDistribution = filteredPatients.reduce((acc, p) => {
            acc[p.gender] = (acc[p.gender] || 0) + 1;
            return acc;
        }, {} as Record<Patient['gender'], number>);

        const ageDistribution: Record<string, number> = {
            '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0
        };
        filteredPatients.forEach(p => {
            const dob = new Date(p.dob);
            const ageDiffMs = Date.now() - dob.getTime();
            const ageDate = new Date(ageDiffMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (age <= 18) ageDistribution['0-18']++;
            else if (age <= 35) ageDistribution['19-35']++;
            else if (age <= 55) ageDistribution['36-55']++;
            else ageDistribution['56+']++;
        });

        const newPatientsThisPeriod = patients.filter(p => {
            const lastVisitDate = new Date(p.lastVisit);
            if (!startDate || !endDate) return false;
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return lastVisitDate >= start && lastVisitDate <= end;
        }).length;


        return {
            totalPatients: filteredPatients.length,
            genderDistribution,
            ageDistribution,
            newPatientsThisPeriod,
        };
    }, [patients, startDate, endDate]);

    const financialSummary = useMemo(() => {
        const filteredTreatmentRecords: TreatmentRecord[] = filterDataByDate(treatmentRecords, 'treatmentDate');
        const filteredExpenses: Expense[] = filterDataByDate(expenses, 'date');

        const totalIncome = filteredTreatmentRecords.reduce((sum, rec) => sum + rec.totalTreatmentCost, 0);
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalDoctorPayments = clinicData.doctorPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const netProfit = totalIncome - (totalExpenses + totalDoctorPayments);

        const incomeByTreatment: Record<string, number> = {};
        filteredTreatmentRecords.forEach(rec => {
            const treatmentName = treatmentDefinitions.find(td => td.id === rec.treatmentDefinitionId)?.name || t('common.unknownTreatment');
            incomeByTreatment[treatmentName] = (incomeByTreatment[treatmentName] || 0) + rec.totalTreatmentCost;
        });

        const expensesByCategory: Record<ExpenseCategory, number> = {
            [ExpenseCategory.RENT]: 0, [ExpenseCategory.SALARIES]: 0, [ExpenseCategory.UTILITIES]: 0,
            [ExpenseCategory.LAB_FEES]: 0, [ExpenseCategory.SUPPLIES]: 0, [ExpenseCategory.MARKETING]: 0,
            [ExpenseCategory.MISC]: 0,
        };
        filteredExpenses.forEach(exp => {
            expensesByCategory[exp.category] += exp.amount;
        });

        return {
            totalIncome,
            totalExpenses,
            netProfit,
            incomeByTreatment,
            expensesByCategory,
        };
    }, [treatmentRecords, expenses, treatmentDefinitions, startDate, endDate, t]);

    const appointmentOverview = useMemo(() => {
        const filteredAppointments: Appointment[] = filterDataByDate(appointments, 'startTime');

        const totalAppointments = filteredAppointments.length;
        const completedAppointments = filteredAppointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length;
        const cancelledAppointments = filteredAppointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length;
        const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

        const appointmentsByDentist: Record<string, number> = {};
        filteredAppointments.forEach(apt => {
            const dentistName = dentists.find(d => d.id === apt.dentistId)?.name || t('common.unknownDentist');
            appointmentsByDentist[dentistName] = (appointmentsByDentist[dentistName] || 0) + 1;
        });

        return {
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            completionRate,
            appointmentsByDentist,
        };
    }, [appointments, dentists, startDate, endDate, t]);

    const inventoryReport = useMemo(() => {
        const lowStockThreshold = 5; 
        const lowStockItems = inventoryItems.filter(item => item.currentStock <= lowStockThreshold);
        const allItemsValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);

        return {
            lowStockItems,
            allInventoryItems: inventoryItems,
            allItemsValue,
        };
    }, [inventoryItems]);

    const treatmentPerformance = useMemo(() => {
        const filteredTreatmentRecords: TreatmentRecord[] = filterDataByDate(treatmentRecords, 'treatmentDate');

        const treatmentStats: Record<string, { count: number; totalRevenue: number; totalClinicShare: number; totalDoctorShare: number; }> = {};
        filteredTreatmentRecords.forEach(rec => {
            const treatmentName = treatmentDefinitions.find(td => td.id === rec.treatmentDefinitionId)?.name || t('common.unknownTreatment');
            if (!treatmentStats[treatmentName]) {
                treatmentStats[treatmentName] = { count: 0, totalRevenue: 0, totalClinicShare: 0, totalDoctorShare: 0 };
            }
            treatmentStats[treatmentName].count++;
            treatmentStats[treatmentName].totalRevenue += rec.totalTreatmentCost;
            treatmentStats[treatmentName].totalClinicShare += rec.clinicShare;
            treatmentStats[treatmentName].totalDoctorShare += rec.doctorShare;
        });

        const formattedStats = Object.entries(treatmentStats).map(([name, stats]) => ({
            treatment: name,
            count: stats.count,
            averagePrice: stats.count > 0 ? stats.totalRevenue / stats.count : 0,
            totalRevenue: stats.totalRevenue,
            totalClinicShare: stats.totalClinicShare,
            totalDoctorShare: stats.totalDoctorShare,
        })).sort((a,b) => b.totalRevenue - a.totalRevenue);

        return {
            allTreatmentPerformance: formattedStats,
        };
    }, [treatmentRecords, treatmentDefinitions, startDate, endDate, t]);

    const labCasesReport = useMemo(() => {
        const filteredLabCases: LabCase[] = filterDataByDate(labCases, 'sentDate');

        return {
            filteredLabCases,
        };
    }, [labCases, startDate, endDate]);

    const paymentsReport = useMemo(() => {
        const filteredPayments: Payment[] = filterDataByDate(payments, 'date');

        return {
            filteredPayments,
        };
    }, [payments, startDate, endDate]);

    const supplierInvoicesReport = useMemo(() => {
        const filteredSupplierInvoices: SupplierInvoice[] = filterDataByDate(supplierInvoices, 'invoiceDate');

        return {
            filteredSupplierInvoices,
        };
    }, [supplierInvoices, startDate, endDate]);
    
    const tabTitles: Record<typeof activeTab, string> = {
        patientStats: t('reports.tabPatientStatistics'),
        financialSummary: t('reports.tabFinancialSummary'),
        appointmentOverview: t('reports.tabAppointmentOverview'),
        inventoryReport: t('reports.tabInventoryReport'),
        treatmentPerformance: t('reports.tabTreatmentPerformance'),
        labCasesReport: t('reports.tabLabCasesReport'),
        paymentsReport: t('reports.tabPaymentsReport'),
        supplierInvoicesReport: t('reports.tabSupplierInvoicesReport'),
        dentistsReport: t('reports.tabDentistsReport'),
        suppliersReport: t('reports.tabSuppliersReport'),
    };

    return (
        <>
            <PrintStyles />
            <div className="p-4 bg-white text-slate-900" dir="rtl">
                <header className="print-header text-center mb-6">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">{clinicInfo.name || t('appName')}</h1>
                        <div className="text-sm text-slate-600 space-y-1">
                            {clinicInfo.address && <p>{clinicInfo.address}</p>}
                            <div className="flex justify-center gap-4">
                                {clinicInfo.phone && <span>{t('common.phone')}: {clinicInfo.phone}</span>}
                                {clinicInfo.email && <span>{t('common.email')}: {clinicInfo.email}</span>}
                            </div>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">{tabTitles[activeTab]}</h2>
                    <p className="text-md text-slate-600">{t('reports.dateRange')}: {startDate ? dateFormatter.format(new Date(startDate)) : t('common.na')} - {endDate ? dateFormatter.format(new Date(endDate)) : t('common.na')}</p>
                </header>
            <main>
                {activeTab === 'patientStats' && (
                    <div className="print-section space-y-6">
                         <PrintTable
                            title={t('reports.patientStats.genderDistribution')}
                            headers={[t('patientDetails.gender'), t('reports.treatmentPerformance.count')]}
                            data={Object.entries(patientStats.genderDistribution).map(([label, value]: [string, number]) => [t(label.toLowerCase() as any), value])}
                        />
                        <PrintTable
                            title={t('reports.patientStats.ageDistribution')}
                            headers={[t('reports.patientStats.ageGroup'), t('reports.treatmentPerformance.count')]}
                            data={Object.entries(patientStats.ageDistribution).map(([label, value]: [string, number]) => [label, value])}
                        />
                    </div>
                )}
                {activeTab === 'financialSummary' && (
                    <div className="print-section space-y-6">
                         <PrintTable
                            title={t('reports.financialSummary.incomeByTreatment')}
                            headers={[t('reports.treatmentPerformance.treatment'), t('reports.financialSummary.totalIncome')]}
                            data={Object.entries(financialSummary.incomeByTreatment).map(([label, value]: [string, number]) => [label, currencyFormatter.format(value)])}
                        />
                        <PrintTable
                            title={t('reports.financialSummary.expensesByCategory')}
                            headers={[t('expenses.category'), t('expenses.amount')]}
                            data={Object.entries(financialSummary.expensesByCategory).filter(([, value]: [string, number]) => value > 0).map(([label, value]: [string, number]) => [t(`expenseCategory.${label}`), currencyFormatter.format(value)])}
                        />
                    </div>
                )}
                {activeTab === 'appointmentOverview' && (
                     <div className="print-section space-y-6">
                        <PrintTable
                            title={t('reports.appointmentOverview.appointmentsByDentist')}
                            headers={[t('addAppointmentModal.dentist'), t('reports.appointmentOverview.totalAppointments')]}
                            data={Object.entries(appointmentOverview.appointmentsByDentist).map(([label, value]: [string, number]) => [label, value])}
                        />
                    </div>
                )}
                {activeTab === 'inventoryReport' && (
                    <div className="print-section space-y-6">
                         <table className="min-w-full text-sm text-slate-700 border-collapse border border-slate-300">
                            <caption className="text-md font-bold text-slate-800 mb-2 text-start p-2 bg-slate-100">{t('reports.inventoryReport.allInventoryItems')}</caption>
                            <thead className="bg-slate-100">
                                <tr className="border-b border-slate-200">
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.inventoryReport.itemName')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.inventoryReport.currentStock')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.inventoryReport.unitCost')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryReport.allInventoryItems.map(item => (
                                    <tr key={item.id} className="border-b border-slate-200 last:border-b-0">
                                        <td className="p-2 border border-slate-300">{item.name}</td>
                                        <td className="p-2 border border-slate-300">{item.currentStock}</td>
                                        <td className="p-2 border border-slate-300">{currencyFormatter.format(item.unitCost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {activeTab === 'treatmentPerformance' && (
                    <div className="print-section">
                         <table className="min-w-full text-sm text-slate-700 border-collapse border border-slate-300">
                             <caption className="text-md font-bold text-slate-800 mb-2 text-start p-2 bg-slate-100">{t('reports.treatmentPerformance.allTreatmentPerformance')}</caption>
                            <thead className="bg-slate-100">
                                <tr className="border-b border-slate-200">
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.treatmentPerformance.treatment')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.treatmentPerformance.count')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.treatmentPerformance.averagePrice')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.treatmentPerformance.totalRevenue')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.treatmentPerformance.totalClinicShare')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('reports.treatmentPerformance.totalDoctorShare')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {treatmentPerformance.allTreatmentPerformance.map(tp => (
                                    <tr key={tp.treatment} className="border-b border-slate-200 last:border-b-0">
                                        <td className="p-2 border border-slate-300">{tp.treatment}</td>
                                        <td className="p-2 border border-slate-300">{tp.count}</td>
                                        <td className="p-2 border border-slate-300">{currencyFormatter.format(tp.averagePrice)}</td>
                                        <td className="p-2 border border-slate-300">{currencyFormatter.format(tp.totalRevenue)}</td>
                                        <td className="p-2 border border-slate-300">{currencyFormatter.format(tp.totalClinicShare)}</td>
                                        <td className="p-2 border border-slate-300">{currencyFormatter.format(tp.totalDoctorShare)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'labCasesReport' && (
                    <div className="print-section">
                        <table className="min-w-full text-sm text-slate-700 border-collapse border border-slate-300">
                            <caption className="text-md font-bold text-slate-800 mb-2 text-start p-2 bg-slate-100">{t('reports.labCasesReport.allLabCases')}</caption>
                            <thead className="bg-slate-100">
                                <tr className="border-b border-slate-200">
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('labCase.patientName')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('labCase.caseType')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('labCase.status')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('labCase.cost')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('labCase.dueDate')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {labCasesReport.filteredLabCases.map(lc => (
                                    <tr key={lc.id} className="border-b border-slate-200 last:border-b-0">
                                        <td className="p-2 border border-slate-300">{patients.find(p => p.id === lc.patientId)?.name || t('common.unknownPatient')}</td>
                                        <td className="p-2 border border-slate-300">{lc.caseType}</td>
                                        <td className="p-2 border border-slate-300">{t(`labCaseStatus.${lc.status}`)}</td>
                                        <td className="p-2 border border-slate-300">{currencyFormatter.format(lc.labCost)}</td>
                                        <td className="p-2 border border-slate-300">{dateFormatter.format(new Date(lc.dueDate))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'paymentsReport' && (
                    <div className="print-section">
                        <table className="min-w-full text-sm text-slate-700 border-collapse border border-slate-300">
                            <caption className="text-md font-bold text-slate-800 mb-2 text-start p-2 bg-slate-100">{t('reports.paymentsReport.allPayments')}</caption>
                            <thead className="bg-slate-100">
                                <tr className="border-b border-slate-200">
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('payment.patientName')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('payment.amount')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('payment.method')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('payment.date')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('payment.notes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(pay => (
                                    <tr key={pay.id} className="border-b border-slate-200 last:border-b-0">
                                        <td className="p-2 border border-slate-300">{patients.find(p => p.id === pay.patientId)?.name || t('common.unknownPatient')}</td>
                                        <td className="p-2 border border-slate-300">{currencyFormatter.format(pay.amount)}</td>
                                        <td className="p-2 border border-slate-300">{t(`paymentMethod.${pay.method}`)}</td>
                                        <td className="p-2 border border-slate-300">{dateFormatter.format(new Date(pay.date))}</td>
                                        <td className="p-2 border border-slate-300">{pay.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'supplierInvoicesReport' && (
                    <div className="print-section">
                        <table className="min-w-full text-sm text-slate-700 border-collapse border border-slate-300">
                            <caption className="text-md font-bold text-slate-800 mb-2 text-start p-2 bg-slate-100">{t('reports.supplierInvoicesReport.allSupplierInvoices')}</caption>
                            <thead className="bg-slate-100">
                                <tr className="border-b border-slate-200">
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplierInvoice.supplierName')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplierInvoice.invoiceNumber')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplierInvoice.totalAmount')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplierInvoice.date')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplierInvoice.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierInvoicesReport.filteredSupplierInvoices.map(si => (
                                    <tr key={si.id} className="border-b border-slate-200 last:border-b-0">
                                        <td className="p-2 border border-slate-300">{suppliers.find(s => s.id === si.supplierId)?.name || t('common.unknownSupplier')}</td>
                                        <td className="p-2 border border-slate-300">{si.invoiceNumber}</td>
                                        <td className="p-2 border border-slate-300">{currencyFormatter.format(si.amount)}</td>
                                        <td className="p-2 border border-slate-300">{dateFormatter.format(new Date(si.invoiceDate))}</td>
                                        <td className="p-2 border border-slate-300">{t(`supplierInvoiceStatus.${si.status}`)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'dentistsReport' && (
                    <div className="print-section">
                        <table className="min-w-full text-sm text-slate-700 border-collapse border border-slate-300">
                            <caption className="text-md font-bold text-slate-800 mb-2 text-start p-2 bg-slate-100">{t('reports.dentistsReport.allDentists')}</caption>
                            <thead className="bg-slate-100">
                                <tr className="border-b border-slate-200">
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('dentist.name')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('dentist.specialty')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dentists.map(d => (
                                    <tr key={d.id} className="border-b border-slate-200 last:border-b-0">
                                        <td className="p-2 border border-slate-300">{d.name}</td>
                                        <td className="p-2 border border-slate-300">{d.specialty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'suppliersReport' && (
                    <div className="print-section">
                        <table className="min-w-full text-sm text-slate-700 border-collapse border border-slate-300">
                            <caption className="text-md font-bold text-slate-800 mb-2 text-start p-2 bg-slate-100">{t('reports.suppliersReport.allSuppliers')}</caption>
                            <thead className="bg-slate-100">
                                <tr className="border-b border-slate-200">
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplier.name')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplier.contactPerson')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplier.phone')}</th>
                                    <th className="p-2 text-right font-semibold border border-slate-300">{t('supplier.email')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map(s => (
                                    <tr key={s.id} className="border-b border-slate-200 last:border-b-0">
                                        <td className="p-2 border border-slate-300">{s.name}</td>
                                        <td className="p-2 border border-slate-300">{s.contactPerson}</td>
                                        <td className="p-2 border border-slate-300">{s.phone}</td>
                                        <td className="p-2 border border-slate-300">{s.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
        </>
    );
};

export default PrintableReport;
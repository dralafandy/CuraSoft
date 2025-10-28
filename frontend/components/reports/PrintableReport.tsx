import React, { useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { useI18n } from '../../hooks/useI18n';
import { Patient, AppointmentStatus, ExpenseCategory, TreatmentRecord, Expense, Appointment, InventoryItem } from '../../types';

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
    activeTab: 'patientStats' | 'financialSummary' | 'appointmentOverview' | 'inventoryReport' | 'treatmentPerformance';
    startDate: string;
    endDate: string;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ clinicData, activeTab, startDate, endDate }) => {
    const { t, locale } = useI18n();
    const { patients, appointments, expenses, inventoryItems, treatmentDefinitions, dentists, treatmentRecords } = clinicData;

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
        const netProfit = totalIncome - totalExpenses;

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
    
    const tabTitles: Record<typeof activeTab, string> = {
        patientStats: t('reports.tabPatientStatistics'),
        financialSummary: t('reports.tabFinancialSummary'),
        appointmentOverview: t('reports.tabAppointmentOverview'),
        inventoryReport: t('reports.tabInventoryReport'),
        treatmentPerformance: t('reports.tabTreatmentPerformance'),
    };

    return (
        <div className="p-4 bg-white text-slate-900" dir="rtl">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('appName')} - {tabTitles[activeTab]}</h1>
                <p className="text-md text-slate-600">{t('reports.dateRange')}: {startDate ? dateFormatter.format(new Date(startDate)) : t('common.na')} - {endDate ? dateFormatter.format(new Date(endDate)) : t('common.na')}</p>
            </header>
            <main>
                {activeTab === 'patientStats' && (
                    <div className="space-y-6">
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
                    <div className="space-y-6">
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
                     <div className="space-y-6">
                        <PrintTable
                            title={t('reports.appointmentOverview.appointmentsByDentist')}
                            headers={[t('addAppointmentModal.dentist'), t('reports.appointmentOverview.totalAppointments')]}
                            data={Object.entries(appointmentOverview.appointmentsByDentist).map(([label, value]: [string, number]) => [label, value])}
                        />
                    </div>
                )}
                {activeTab === 'inventoryReport' && (
                    <div className="space-y-6">
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
                    <div>
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
            </main>
        </div>
    );
};

export default PrintableReport;
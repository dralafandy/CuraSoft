import React, { useState, useMemo } from 'react';
import { ClinicData } from '../hooks/useClinicData';
import { useI18n } from '../hooks/useI18n';
import { openPrintWindow } from '../utils/print';
import PrintableReport from './reports/PrintableReport';
import BarChart from './reports/BarChart';
import { AppointmentStatus } from '../types';

type ReportTab = 'patientStats' | 'financialSummary' | 'appointmentOverview' | 'inventoryReport' | 'treatmentPerformance';

const PrintIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m0 0v1a2 2 0 002 2h6a2 2 0 002-2v-1M8 12h8m-8 4h.01M5 12h.01M19 12h.01M5 16h.01M19 16h.01" /></svg>);

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-700">{value}</p>
    </div>
);

const Reports: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { t, locale } = useI18n();
    const { appointments, expenses, treatmentRecords, treatmentDefinitions, patients, dentists } = clinicData;

    const [activeTab, setActiveTab] = useState<ReportTab>('financialSummary');
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    
    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });

    // Memoized data filtering
    const filteredData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filterByDate = <T extends { date?: string; startTime?: Date; treatmentDate?: string }>(items: T[], dateField: keyof T): T[] => {
            if (!startDate || !endDate) return items;
            return items.filter(item => {
                const itemDateValue = item[dateField];
                if (!itemDateValue) return false;
                const itemDate = new Date(itemDateValue as string | Date);
                return !isNaN(itemDate.getTime()) && itemDate >= start && itemDate <= end;
            });
        };

        const filteredAppointments = filterByDate(appointments, 'startTime');
        const filteredTreatmentRecords = filterByDate(treatmentRecords, 'treatmentDate');
        const filteredExpenses = filterByDate(expenses, 'date');
        
        return { filteredAppointments, filteredTreatmentRecords, filteredExpenses };
    }, [startDate, endDate, appointments, treatmentRecords, expenses]);

    // Financial Summary Data
    const financialSummaryData = useMemo(() => {
        const { filteredTreatmentRecords, filteredExpenses } = filteredData;
        const totalIncome = filteredTreatmentRecords.reduce((sum, rec) => sum + rec.totalTreatmentCost, 0);
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = totalIncome - totalExpenses;
        
        const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
            const categoryName = t(`expenseCategory.${exp.category}`);
            acc[categoryName] = (acc[categoryName] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalIncome,
            totalExpenses,
            netProfit,
            expensesByCategoryChartData: Object.entries(expensesByCategory).map(([label, value]) => ({ label, value })),
        };
    }, [filteredData, t]);

    // Treatment Performance Data
    const treatmentPerformanceData = useMemo(() => {
        const { filteredTreatmentRecords } = filteredData;

        if (filteredTreatmentRecords.length === 0) {
            return {
                totalTreatments: 0,
                totalRevenue: 0,
                mostProfitableTreatment: { name: t('common.na'), revenue: 0 },
                revenueByTreatmentChartData: [],
                countByTreatmentChartData: [],
            };
        }

        const treatmentStats: Record<string, { count: number; totalRevenue: number }> = {};
        filteredTreatmentRecords.forEach(rec => {
            const treatmentName = treatmentDefinitions.find(td => td.id === rec.treatmentDefinitionId)?.name || t('common.unknownTreatment');
            if (!treatmentStats[treatmentName]) {
                treatmentStats[treatmentName] = { count: 0, totalRevenue: 0 };
            }
            treatmentStats[treatmentName].count++;
            treatmentStats[treatmentName].totalRevenue += rec.totalTreatmentCost;
        });

        const statsArray = Object.entries(treatmentStats).map(([name, stats]) => ({ name, ...stats }));

        const totalTreatments = statsArray.reduce((sum, item) => sum + item.count, 0);
        const totalRevenue = statsArray.reduce((sum, item) => sum + item.totalRevenue, 0);

        const mostProfitableTreatment = [...statsArray].sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || { name: t('common.na'), revenue: 0 };
        
        const top5ByRevenue = [...statsArray].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
        const top5ByCount = [...statsArray].sort((a, b) => b.count - a.count).slice(0, 5);

        return {
            totalTreatments,
            totalRevenue,
            mostProfitableTreatment,
            revenueByTreatmentChartData: top5ByRevenue.map(item => ({ label: item.name, value: item.totalRevenue })),
            countByTreatmentChartData: top5ByCount.map(item => ({ label: item.name, value: item.count })),
        };
    }, [filteredData, treatmentDefinitions, t]);

    // Patient Statistics Data
    const patientStatsData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (!startDate || !endDate || patients.length === 0) {
            return {
                totalPatientsInPeriod: 0,
                genderDistributionChartData: [],
                ageDistributionChartData: [],
            };
        }
        
        const filteredPatients = patients.filter(p => {
            const lastVisitDate = new Date(p.lastVisit);
            return lastVisitDate >= start && lastVisitDate <= end;
        });

        const genderDistribution = filteredPatients.reduce((acc, p) => {
            const genderKey = t(p.gender.toLowerCase() as 'male' | 'female' | 'other');
            acc[genderKey] = (acc[genderKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const ageDistribution: Record<string, number> = {
            '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0,
        };
        filteredPatients.forEach(p => {
            const dob = new Date(p.dob);
            if (isNaN(dob.getTime())) return;
            const age = Math.abs(new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970);
            if (age <= 18) ageDistribution['0-18']++;
            else if (age <= 35) ageDistribution['19-35']++;
            else if (age <= 55) ageDistribution['36-55']++;
            else ageDistribution['56+']++;
        });

        return {
            totalPatientsInPeriod: filteredPatients.length,
            genderDistributionChartData: Object.entries(genderDistribution).map(([label, value]) => ({ label, value })),
            ageDistributionChartData: Object.entries(ageDistribution).map(([label, value]) => ({ label, value })),
        };
    }, [patients, startDate, endDate, t]);
    
    // Appointment Overview Data
    const appointmentOverviewData = useMemo(() => {
        const { filteredAppointments } = filteredData;

        const totalAppointments = filteredAppointments.length;
        const completedAppointments = filteredAppointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length;
        const cancelledAppointments = filteredAppointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length;
        const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

        const appointmentsByDentist = filteredAppointments.reduce((acc, apt) => {
            const dentistName = dentists.find(d => d.id === apt.dentistId)?.name || t('common.unknownDentist');
            acc[dentistName] = (acc[dentistName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            completionRate,
            appointmentsByDentistChartData: Object.entries(appointmentsByDentist).map(([label, value]) => ({ label, value })),
        };
    }, [filteredData, dentists, t]);


    const handlePrint = () => {
        openPrintWindow(
            `${t('appName')} - ${t(`reports.${activeTab}` as any)}`,
            <PrintableReport clinicData={clinicData} activeTab={activeTab} startDate={startDate} endDate={endDate} />
        );
    };

    const tabs: { id: ReportTab; label: string }[] = [
        { id: 'financialSummary', label: t('reports.tabFinancialSummary') },
        { id: 'treatmentPerformance', label: t('reports.tabTreatmentPerformance') },
        { id: 'appointmentOverview', label: t('reports.tabAppointmentOverview') },
        { id: 'patientStats', label: t('reports.tabPatientStatistics') },
        { id: 'inventoryReport', label: t('reports.tabInventoryReport') },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'financialSummary':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <StatCard title={t('reports.financialSummary.totalIncome')} value={currencyFormatter.format(financialSummaryData.totalIncome)} />
                            <StatCard title={t('reports.financialSummary.totalExpenses')} value={currencyFormatter.format(financialSummaryData.totalExpenses)} />
                            <StatCard title={t('reports.financialSummary.netProfit')} value={currencyFormatter.format(financialSummaryData.netProfit)} />
                        </div>
                        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm min-h-[300px]">
                             <BarChart 
                                title={t('reports.financialSummary.expensesByCategory')}
                                data={financialSummaryData.expensesByCategoryChartData}
                                colorClass="bg-rose-500"
                            />
                        </div>
                    </div>
                );
            case 'treatmentPerformance':
                if (treatmentPerformanceData.totalTreatments === 0) {
                    return (
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <p className="text-slate-500">{t('reports.noDataAvailable')}</p>
                        </div>
                    );
                }
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title={t('reports.treatmentPerformance.count')} value={treatmentPerformanceData.totalTreatments} />
                            <StatCard title={t('reports.treatmentPerformance.totalRevenue')} value={currencyFormatter.format(treatmentPerformanceData.totalRevenue)} />
                            <StatCard title={t('reports.treatmentPerformance.mostProfitable')} value={treatmentPerformanceData.mostProfitableTreatment.name} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <div className="bg-white p-4 rounded-lg shadow-sm min-h-[300px]">
                                <BarChart
                                    title={t('reports.treatmentPerformance.top5ByRevenue')}
                                    data={treatmentPerformanceData.revenueByTreatmentChartData}
                                    colorClass="bg-primary"
                                />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm min-h-[300px]">
                                <BarChart
                                    title={t('reports.treatmentPerformance.top5ByFrequency')}
                                    data={treatmentPerformanceData.countByTreatmentChartData}
                                    colorClass="bg-secondary"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'patientStats':
                if (patientStatsData.totalPatientsInPeriod === 0) {
                    return (
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <p className="text-slate-500">{t('reports.noDataAvailable')}</p>
                        </div>
                    );
                }
                return (
                    <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <StatCard title={t('reports.patientStats.totalPatients')} value={patientStatsData.totalPatientsInPeriod} />
                         </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm min-h-[300px]">
                                <BarChart
                                    title={t('reports.patientStats.genderDistribution')}
                                    data={patientStatsData.genderDistributionChartData}
                                    colorClass="bg-indigo-500"
                                />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm min-h-[300px]">
                                <BarChart
                                    title={t('reports.patientStats.ageDistribution')}
                                    data={patientStatsData.ageDistributionChartData}
                                    colorClass="bg-teal-500"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'appointmentOverview':
                if (appointmentOverviewData.totalAppointments === 0) {
                    return (
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <p className="text-slate-500">{t('reports.noDataAvailable')}</p>
                        </div>
                    );
                }
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title={t('reports.appointmentOverview.totalAppointments')} value={appointmentOverviewData.totalAppointments} />
                            <StatCard title={t('reports.appointmentOverview.completedAppointments')} value={appointmentOverviewData.completedAppointments} />
                            <StatCard title={t('reports.appointmentOverview.cancelledAppointments')} value={appointmentOverviewData.cancelledAppointments} />
                            <StatCard title={t('reports.appointmentOverview.completionRate')} value={`${appointmentOverviewData.completionRate.toFixed(1)}%`} />
                        </div>
                        <div className="grid grid-cols-1">
                            <div className="bg-white p-4 rounded-lg shadow-sm min-h-[300px]">
                                <BarChart
                                    title={t('reports.appointmentOverview.appointmentsByDentist')}
                                    data={appointmentOverviewData.appointmentsByDentistChartData}
                                    colorClass="bg-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                        <p className="text-slate-500">{t('reports.noDataAvailable')}</p>
                        <p className="text-sm text-slate-400 mt-2">A visual summary for this report will be available in a future update. You can print the full report now.</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div>
                        <label htmlFor="start-date" className="text-sm font-medium text-slate-600 me-2">{t('reports.startDate')}:</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="text-sm font-medium text-slate-600 me-2">{t('reports.endDate')}:</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center justify-center w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-primary-light"
                >
                    <PrintIcon /> {t('reports.printReport')}
                </button>
            </div>

            <div>
                <div className="border-b border-slate-200 mb-4">
                    <nav className="-mb-px flex space-x-4 rtl:space-x-reverse overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="mt-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Reports;
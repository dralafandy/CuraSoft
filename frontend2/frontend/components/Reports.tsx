import React, { useState, useMemo } from 'react';
import { ClinicData } from '../hooks/useClinicData';
import { useI18n } from '../hooks/useI18n';
import { openPrintWindow } from '../utils/print';
import PrintableReport from './reports/PrintableReport';
import BarChart from './reports/BarChart';
import PatientReportPage from './reports/PatientReportPage';
import { AppointmentStatus, FilterOptions, Appointment, TreatmentRecord, Expense, LabCase, Payment, SupplierInvoice, Patient, Dentist, Supplier } from '../types';

interface InteractiveCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    expandable?: boolean;
    expanded?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ title, value, icon, color, expandable, expanded, onClick, children }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300 ${expandable ? 'cursor-pointer' : ''}`} onClick={onClick}>
        <div className="flex items-center justify-between mb-4">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
            <div className="text-4xl opacity-20">{icon}</div>
        </div>
        {expandable && expanded && children && (
            <div className="mt-4 border-t pt-4">
                {children}
            </div>
        )}
    </div>
);

const GridSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);

const InteractiveDashboard: React.FC<{
    clinicData: ClinicData;
    startDate: string;
    endDate: string;
    filters: FilterOptions;
    currencyFormatter: Intl.NumberFormat;
    t: (key: string) => string;
    locale: string;
}> = ({ clinicData, startDate, endDate, filters, currencyFormatter, t, locale }) => {
    const { appointments, treatmentRecords, expenses, payments } = clinicData;
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const processedData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filterByDate = <T extends Record<string, any>>(items: T[], dateField: 'date' | 'startTime' | 'treatmentDate'): T[] => {
            return items.filter(item => {
                const itemDate = new Date(item[dateField]);
                return itemDate >= start && itemDate <= end;
            });
        };

        let filteredAppointments = filterByDate(appointments, 'startTime');
        let filteredTreatmentRecords = filterByDate(treatmentRecords, 'treatmentDate');
        let filteredExpenses = filterByDate(expenses, 'date');
        let filteredPayments = filterByDate(payments, 'date');

        if (filters.dentistId) {
            filteredAppointments = filteredAppointments.filter(apt => apt.dentistId === filters.dentistId);
            filteredTreatmentRecords = filteredTreatmentRecords.filter(rec => rec.dentistId === filters.dentistId);
        }

        return { filteredAppointments, filteredTreatmentRecords, filteredExpenses, filteredPayments };
    }, [startDate, endDate, appointments, treatmentRecords, expenses, payments, filters]);

    const kpis = useMemo(() => {
        const totalRevenue = processedData.filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalExpenses = processedData.filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalDoctorPayments = clinicData.doctorPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const accountsReceivable = processedData.filteredTreatmentRecords.reduce((sum, rec) => sum + rec.totalTreatmentCost, 0) - totalRevenue;
        const netProfit = totalRevenue - totalExpenses - totalDoctorPayments - accountsReceivable;
        const totalAppointments = processedData.filteredAppointments.length;
        const completedAppointments = processedData.filteredAppointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length;
        const completionRate = totalAppointments > 0 ? `${((completedAppointments / totalAppointments) * 100).toFixed(1)}%` : '0%';
        return { totalRevenue, totalExpenses, netProfit, totalAppointments, completionRate };
    }, [processedData, clinicData.doctorPayments]);

    const monthlyRevenueData = useMemo(() => {
        const monthlyData: Record<string, number> = {};
        processedData.filteredPayments.forEach(payment => {
            const monthKey = `${new Date(payment.date).getFullYear()}-${String(new Date(payment.date).getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;
        });
        return Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([month, revenue]) => ({
                label: new Date(month + '-01').toLocaleDateString(locale, { month: 'short', year: 'numeric' }),
                value: revenue
            }));
    }, [processedData.filteredPayments, locale]);

    return (
        <div className="space-y-8">
            {/* Interactive KPI Cards */}
            <GridSection title={t('reports.kpi.title')}>
                <InteractiveCard
                    title={t('reports.kpi.totalRevenue')}
                    value={currencyFormatter.format(kpis.totalRevenue)}
                    icon="💰"
                    color="border-blue-500"
                    expandable
                    expanded={expandedCard === 'revenue'}
                    onClick={() => setExpandedCard(expandedCard === 'revenue' ? null : 'revenue')}
                >
                    <div className="h-48">
                        <BarChart title="" data={monthlyRevenueData} colorClass="bg-blue-500" />
                    </div>
                </InteractiveCard>
                <InteractiveCard
                    title={t('reports.kpi.totalExpenses')}
                    value={currencyFormatter.format(kpis.totalExpenses)}
                    icon="💸"
                    color="border-red-500"
                    expandable
                    expanded={expandedCard === 'expenses'}
                    onClick={() => setExpandedCard(expandedCard === 'expenses' ? null : 'expenses')}
                >
                    <p className="text-sm text-slate-600">Expense breakdown by category</p>
                    {/* Add more details here */}
                </InteractiveCard>
                <InteractiveCard
                    title={t('reports.kpi.netProfit')}
                    value={currencyFormatter.format(kpis.netProfit)}
                    icon="📈"
                    color={kpis.netProfit >= 0 ? "border-green-500" : "border-red-500"}
                    onClick={() => {/* Add drill-down logic */}}
                />
                <InteractiveCard
                    title={t('reports.kpi.totalAppointments')}
                    value={kpis.totalAppointments}
                    icon="📅"
                    color="border-purple-500"
                    onClick={() => {/* Add drill-down logic */}}
                />
                <InteractiveCard
                    title={t('reports.kpi.completionRate')}
                    value={kpis.completionRate}
                    icon="✅"
                    color="border-green-500"
                    onClick={() => {/* Add drill-down logic */}}
                />
            </GridSection>

            {/* Interactive Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.charts.monthlyRevenue')}</h3>
                    <div className="h-64">
                        <BarChart title="" data={monthlyRevenueData} colorClass="bg-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.charts.dailyRevenue')}</h3>
                    <div className="h-64">
                        <BarChart title="" data={monthlyRevenueData.slice(-7)} colorClass="bg-green-500" />
                    </div>
                </div>
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.dailyRevenue.title')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.dailyRevenue.date')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.dailyRevenue.amount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.filteredTreatmentRecords.slice(0, 10).map((rec, index) => (
                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                                            {new Date(rec.treatmentDate).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                                            {currencyFormatter.format(rec.totalTreatmentCost)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.monthlySummary.title')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.monthlySummary.month')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.monthlySummary.revenue')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.monthlySummary.appointments')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyRevenueData.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">{item.label}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">{currencyFormatter.format(item.value)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                                            {processedData.filteredAppointments.filter(apt =>
                                                new Date(apt.startTime).getMonth() === new Date(item.label).getMonth() &&
                                                new Date(apt.startTime).getFullYear() === new Date(item.label).getFullYear()
                                            ).length}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Reports: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { t, locale } = useI18n();
    const { dentists, suppliers } = clinicData;

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [filters, setFilters] = useState<FilterOptions>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'patients' | 'doctors'>('overview');

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });

    const handlePrint = () => {
        openPrintWindow(
            `${t('appName')} - ${t('reports.title')}`,
            <PrintableReport clinicData={clinicData} activeTab="financialSummary" startDate={startDate} endDate={endDate} />
        );
    };

    return (
        <div className="space-y-8 p-6 bg-slate-50 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reports.title')}</h1>
                        <p className="text-slate-600">{t('reports.subtitle')}</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark flex items-center gap-2 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        🖨️ {t('reports.printReport')}
                    </button>
                </div>
            </div>

            {/* Interactive Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.filters')}</h2>

                {/* Date Range Presets */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('reports.dateRangePresets')}</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: t('reports.presets.today'), days: 0 },
                            { label: t('reports.presets.last7Days'), days: 7 },
                            { label: t('reports.presets.last30Days'), days: 30 },
                            { label: t('reports.presets.last90Days'), days: 90 },
                            { label: t('reports.presets.thisMonth'), days: 'month' },
                            { label: t('reports.presets.lastMonth'), days: 'lastMonth' }
                        ].map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    const today = new Date();
                                    let start: Date;
                                    let end: Date = new Date(today);

                                    if (preset.days === 0) {
                                        start = new Date(today);
                                    } else if (preset.days === 'month') {
                                        start = new Date(today.getFullYear(), today.getMonth(), 1);
                                    } else if (preset.days === 'lastMonth') {
                                        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                        end = new Date(today.getFullYear(), today.getMonth(), 0);
                                    } else {
                                        start = new Date(today);
                                        start.setDate(today.getDate() - (preset.days as number));
                                    }

                                    setStartDate(start.toISOString().split('T')[0]);
                                    setEndDate(end.toISOString().split('T')[0]);
                                }}
                                className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-2">{t('reports.startDate')}</label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-2">{t('reports.endDate')}</label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="dentist-filter" className="block text-sm font-medium text-slate-700 mb-2">{t('reports.filterByDentist')}</label>
                        <select
                            id="dentist-filter"
                            value={filters.dentistId || ''}
                            onChange={e => setFilters(prev => ({ ...prev, dentistId: e.target.value || undefined }))}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        >
                            <option value="">{t('common.all')}</option>
                            {dentists.map(dentist => (
                                <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="supplier-filter" className="block text-sm font-medium text-slate-700 mb-2">{t('reports.filterBySupplier')}</label>
                        <select
                            id="supplier-filter"
                            value={filters.supplierId || ''}
                            onChange={e => setFilters(prev => ({ ...prev, supplierId: e.target.value || undefined }))}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        >
                            <option value="">{t('common.all')}</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                            activeTab === 'overview' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                    >
                        {t('reports.categoryOverview')}
                    </button>
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                            activeTab === 'financial' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                    >
                        {t('reports.categoryFinancial')}
                    </button>
                    <button
                        onClick={() => setActiveTab('patients')}
                        className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                            activeTab === 'patients' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                    >
                        {t('reports.categoryPatient')}
                    </button>
                    <button
                        onClick={() => setActiveTab('doctors')}
                        className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                            activeTab === 'doctors' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                    >
                        {t('reports.categoryDoctor')}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <InteractiveDashboard
                        clinicData={clinicData}
                        startDate={startDate}
                        endDate={endDate}
                        filters={filters}
                        currencyFormatter={currencyFormatter}
                        t={t}
                        locale={locale}
                    />
                )}

                {activeTab === 'financial' && (
                    <div className="space-y-8">
                        {/* Financial Overview */}
                        <GridSection title={t('reports.financialOverview.title')}>
                            <InteractiveCard
                                title={t('reports.financialOverview.totalRevenue')}
                                value={currencyFormatter.format(clinicData.payments.reduce((sum, payment) => sum + payment.amount, 0))}
                                icon="💰"
                                color="border-green-500"
                            />
                            <InteractiveCard
                                title={t('reports.financialOverview.totalExpenses')}
                                value={currencyFormatter.format(clinicData.expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                                icon="💸"
                                color="border-red-500"
                            />
                            <InteractiveCard
                                title={t('reports.financialOverview.netProfit')}
                                value={currencyFormatter.format(
                                    clinicData.payments.reduce((sum, payment) => sum + payment.amount, 0) -
                                    clinicData.expenses.reduce((sum, exp) => sum + exp.amount, 0) -
                                    clinicData.doctorPayments.reduce((sum, payment) => sum + payment.amount, 0) -
                                    (clinicData.treatmentRecords.reduce((sum, rec) => sum + rec.totalTreatmentCost, 0) - clinicData.payments.reduce((sum, payment) => sum + payment.amount, 0))
                                )}
                                icon="📈"
                                color="border-blue-500"
                            />
                            <InteractiveCard
                                title={t('reports.financialOverview.totalPayments')}
                                value={currencyFormatter.format(clinicData.payments.reduce((sum, payment) => sum + payment.amount, 0))}
                                icon="💳"
                                color="border-purple-500"
                            />
                        </GridSection>

                        {/* Revenue vs Expenses Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.financialOverview.revenueVsExpenses')}</h3>
                                <div className="h-64">
                                    <BarChart
                                        title=""
                                        data={[
                                            {
                                                label: t('reports.financialOverview.revenue'),
                                                value: clinicData.payments.reduce((sum, payment) => sum + payment.amount, 0)
                                            },
                                            {
                                                label: t('reports.financialOverview.expenses'),
                                                value: clinicData.expenses.reduce((sum, exp) => sum + exp.amount, 0)
                                            }
                                        ]}
                                        colorClass="bg-gradient-to-r from-green-500 to-red-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.financialOverview.expenseBreakdown')}</h3>
                                <div className="space-y-4">
                                    {(() => {
                                        const expenseByCategory = clinicData.expenses.reduce((acc, exp) => {
                                            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                                            return acc;
                                        }, {} as Record<string, number>);

                                        return Object.entries(expenseByCategory)
                                            .sort(([,a], [,b]) => b - a)
                                            .map(([category, amount]) => (
                                                <div key={category} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-slate-700">{t(`expenseCategory.${category}`)}</span>
                                                    <span className="font-semibold text-slate-800">{currencyFormatter.format(amount)}</span>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Financial Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.financialOverview.recentPayments')}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.financialOverview.patient')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.financialOverview.amount')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.financialOverview.date')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clinicData.payments
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .slice(0, 10)
                                                .map(payment => {
                                                    const patient = clinicData.patients.find(p => p.id === payment.patientId);
                                                    return (
                                                        <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                            <td className="px-4 py-3 text-sm text-slate-600 text-right">{patient?.name || t('common.unknownPatient')}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-600 text-right">{currencyFormatter.format(payment.amount)}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-600 text-right">
                                                                {new Date(payment.date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.financialOverview.recentExpenses')}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.financialOverview.description')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.financialOverview.amount')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.financialOverview.category')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clinicData.expenses
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .slice(0, 10)
                                                .map(expense => (
                                                    <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">{expense.description}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">{currencyFormatter.format(expense.amount)}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 text-right">{t(`expenseCategory.${expense.category}`)}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'patients' && (
                    <PatientReportPage clinicData={clinicData} />
                )}

                {activeTab === 'doctors' && (
                    <div className="space-y-8">
                        {/* Doctor Performance Overview */}
                        <GridSection title={t('reports.doctorPerformance.title')}>
                            <InteractiveCard
                                title={t('reports.doctorPerformance.totalDoctors')}
                                value={clinicData.dentists.length}
                                icon="👨‍⚕️"
                                color="border-blue-500"
                            />
                            <InteractiveCard
                                title={t('reports.doctorPerformance.totalRevenue')}
                                value={currencyFormatter.format(clinicData.payments.reduce((sum, payment) => sum + payment.amount, 0))}
                                icon="💰"
                                color="border-green-500"
                            />
                            <InteractiveCard
                                title={t('reports.doctorPerformance.avgRevenuePerDoctor')}
                                value={currencyFormatter.format(
                                    clinicData.dentists.length > 0 ?
                                    clinicData.payments.reduce((sum, payment) => sum + payment.amount, 0) / clinicData.dentists.length :
                                    0
                                )}
                                icon="📊"
                                color="border-purple-500"
                            />
                        </GridSection>

                        {/* Doctor Performance Table */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.doctorPerformance.detailedPerformance')}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.doctorPerformance.doctorName')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.doctorPerformance.totalTreatments')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.doctorPerformance.totalRevenue')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.doctorPerformance.avgTreatmentValue')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('reports.doctorPerformance.specialty')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clinicData.dentists.map(dentist => {
                                            const doctorPayments = clinicData.payments.filter(p => {
                                                const patient = clinicData.patients.find(pt => pt.id === p.patientId);
                                                const patientTreatments = clinicData.treatmentRecords.filter(tr => tr.patientId === p.patientId && tr.dentistId === dentist.id);
                                                return patientTreatments.length > 0;
                                            });
                                            const totalRevenue = doctorPayments.reduce((sum, p) => sum + p.amount, 0);
                                            const avgValue = doctorPayments.length > 0 ? totalRevenue / doctorPayments.length : 0;

                                            return (
                                                <tr key={dentist.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right font-medium">{dentist.name}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{doctorPayments.length}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{currencyFormatter.format(totalRevenue)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{currencyFormatter.format(avgValue)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{dentist.specialty}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Doctor Appointments Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.doctorPerformance.appointmentsByDoctor')}</h3>
                                <div className="space-y-4">
                                    {clinicData.dentists.map(dentist => {
                                        const doctorAppointments = clinicData.appointments.filter(apt => apt.dentistId === dentist.id);
                                        const completed = doctorAppointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length;
                                        const completionRate = doctorAppointments.length > 0 ? `${((completed / doctorAppointments.length) * 100).toFixed(1)}%` : '0%';

                                        return (
                                            <div key={dentist.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-slate-800">{dentist.name}</p>
                                                    <p className="text-sm text-slate-600">{doctorAppointments.length} {t('reports.doctorPerformance.totalAppointments')}</p>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-green-600">{completionRate}</p>
                                                    <p className="text-sm text-slate-600">{t('reports.doctorPerformance.completionRate')}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.doctorPerformance.revenueBySpecialty')}</h3>
                                <div className="space-y-4">
                                    {(() => {
                                        const specialtyRevenue = clinicData.dentists.reduce((acc, dentist) => {
                                            const doctorPayments = clinicData.payments.filter(p => {
                                                const patient = clinicData.patients.find(pt => pt.id === p.patientId);
                                                const patientTreatments = clinicData.treatmentRecords.filter(tr => tr.patientId === p.patientId && tr.dentistId === dentist.id);
                                                return patientTreatments.length > 0;
                                            });
                                            const revenue = doctorPayments.reduce((sum, p) => sum + p.amount, 0);
                                            acc[dentist.specialty] = (acc[dentist.specialty] || 0) + revenue;
                                            return acc;
                                        }, {} as Record<string, number>);

                                        return Object.entries(specialtyRevenue)
                                            .sort(([,a], [,b]) => b - a)
                                            .map(([specialty, revenue]) => (
                                                <div key={specialty} className="flex justify-between items-center">
                                                    <span className="text-slate-700">{specialty}</span>
                                                    <span className="font-semibold text-slate-800">{currencyFormatter.format(revenue)}</span>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;

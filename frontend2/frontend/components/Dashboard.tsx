import React, { useMemo } from 'react';
import { ClinicData } from '../hooks/useClinicData';
import { AppointmentStatus, LabCaseStatus, View, Dentist, TreatmentRecord, ExpenseCategory } from '../types';
import { useI18n } from '../hooks/useI18n';
import BarChart from './reports/BarChart';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; isPositive: boolean };
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-slate-100">
        <div className={`p-3 rounded-full ${color} shadow-sm`}>
            {icon}
        </div>
        <div className="ms-4 flex-1">
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            {trend && (
                <div className={`flex items-center mt-1 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    <svg className={`w-3 h-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {Math.abs(trend.value)}%
                </div>
            )}
        </div>
    </div>
);


const Dashboard: React.FC<{ clinicData: ClinicData, setCurrentView: (view: View) => void }> = ({ clinicData, setCurrentView }) => {
    const { t, locale } = useI18n();
    const { patients, appointments, treatmentRecords, inventoryItems, labCases, dentists, payments, expenses, supplierInvoices } = clinicData;
    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const fullCurrencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' });

    // --- CALCULATIONS ---

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysAppointmentsCount = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        aptDate.setHours(0,0,0,0);
        return aptDate.getTime() === today.getTime();
    }).length;

    const todaysTreatmentRecords = useMemo(() => treatmentRecords
        .filter(tr => {
            const trDate = new Date(tr.treatmentDate);
            trDate.setHours(0, 0, 0, 0);
            return trDate.getTime() === today.getTime();
        }), [treatmentRecords]);

    const todaysPayments = useMemo(() => {
        return payments.filter(p => {
            const pDate = new Date(p.date);
            pDate.setHours(0, 0, 0, 0);
            return pDate.getTime() === today.getTime();
        });
    }, [payments, today]);

    const todaysRevenue = useMemo(() => {
        return todaysPayments.reduce((sum, p) => sum + p.amount, 0);
    }, [todaysPayments]);

    // Additional financial metrics
    const thisMonthRevenue = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return payments
            .filter(p => {
                const pDate = new Date(p.date);
                return pDate >= startOfMonth && pDate <= endOfMonth;
            })
            .reduce((sum, p) => sum + p.amount, 0);
    }, [payments]);

    const totalOutstandingBalance = useMemo(() => {
        const totalCharges = treatmentRecords.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);
        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
        return totalCharges - totalPayments;
    }, [treatmentRecords, payments]);

    const thisMonthExpenses = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return expenses
            .filter(exp => {
                const expDate = new Date(exp.date);
                return expDate >= startOfMonth && expDate <= endOfMonth;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
    }, [expenses]);

    const clinicProfitThisMonth = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const thisMonthDoctorShares = treatmentRecords
            .filter(tr => {
                const trDate = new Date(tr.treatmentDate);
                return trDate >= startOfMonth && trDate <= endOfMonth;
            })
            .reduce((sum, tr) => sum + tr.doctorShare, 0);

        return thisMonthRevenue - thisMonthExpenses - thisMonthDoctorShares;
    }, [thisMonthRevenue, thisMonthExpenses, treatmentRecords]);

    const pendingPayments = useMemo(() => {
        const totalCharges = treatmentRecords.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);
        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
        return Math.max(0, totalCharges - totalPayments);
    }, [treatmentRecords, payments]);

    const overdueInvoices = useMemo(() => {
        const today = new Date();
        return supplierInvoices.filter(invoice =>
            invoice.status === 'UNPAID' &&
            invoice.dueDate &&
            new Date(invoice.dueDate) < today
        ).length;
    }, [supplierInvoices]);

    const newPatientsThisMonth = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return patients.filter(p => {
            const patientRecords = treatmentRecords.filter(tr => tr.patientId === p.id);
            if (patientRecords.length === 0) return false;
            
            const firstTreatment = patientRecords.sort((a,b) => new Date(a.treatmentDate).getTime() - new Date(b.treatmentDate).getTime())[0];
            
            const firstTreatmentDate = new Date(firstTreatment.treatmentDate);
            return firstTreatmentDate >= startOfMonth && firstTreatmentDate <= endOfMonth;
        }).length;
    }, [patients, treatmentRecords]);
    
    const upcomingWeekAppointmentsData = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push(date);
        }

        return days.map(day => {
            const count = appointments.filter(apt => {
                const aptDate = new Date(apt.startTime);
                return aptDate.getFullYear() === day.getFullYear() &&
                       aptDate.getMonth() === day.getMonth() &&
                       aptDate.getDate() === day.getDate();
            }).length;
            
            return {
                label: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day),
                value: count,
            };
        });
    }, [appointments, locale]);
    
    const pendingLabCases = useMemo(() => {
        return labCases.filter(lc => ![LabCaseStatus.FITTED_TO_PATIENT, LabCaseStatus.CANCELLED].includes(lc.status))
                       .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                       .slice(0, 5);
    }, [labCases]);

    const lowStockItems = useMemo(() => {
        const lowStockThreshold = 10;
        return inventoryItems.filter(item => item.currentStock <= lowStockThreshold)
                             .sort((a,b) => a.currentStock - b.currentStock)
                             .slice(0, 5);
    }, [inventoryItems]);

    const doctorPerformanceToday = useMemo(() => {
        const dailyEarnings: Record<string, { name: string, earnings: number, color: string }> = {};

        // Calculate earnings from today's payments linked to treatments by the dentist
        todaysPayments.forEach(payment => {
            const treatmentRecord = treatmentRecords.find(tr => tr.id === payment.treatmentRecordId);
            if (treatmentRecord) {
                const dentist = dentists.find(d => d.id === treatmentRecord.dentistId);
                if (dentist) {
                    if (!dailyEarnings[dentist.id]) {
                        dailyEarnings[dentist.id] = { name: dentist.name, earnings: 0, color: dentist.color };
                    }
                    dailyEarnings[dentist.id].earnings += payment.doctorShare;
                }
            }
        });

        const totalEarnings = Object.values(dailyEarnings).reduce((sum, d) => sum + d.earnings, 0);

        return Object.values(dailyEarnings).map(d => ({
            ...d,
            percentage: totalEarnings > 0 ? (d.earnings / totalEarnings) * 100 : 0,
        })).sort((a, b) => b.earnings - a.earnings);

    }, [todaysPayments, treatmentRecords, dentists]);


    // --- ICONS ---
    const PatientsIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
    const CalendarIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
    const DollarIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /> </svg>);
    const UserPlusIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>);
    const TrendingUpIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
    const TrendingDownIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>);
    const AlertIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>);


    return (
        <div className="space-y-6">
            {/* Primary Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('dashboard.totalPatients')}
                    value={patients.length}
                    icon={PatientsIcon}
                    color="bg-emerald-100"
                    subtitle="Active patients"
                />
                <StatCard
                    title={t('dashboard.todaysRevenue')}
                    value={currencyFormatter.format(todaysRevenue)}
                    icon={DollarIcon}
                    color="bg-green-100"
                    subtitle="Today's earnings"
                />
                <StatCard
                    title={t('dashboard.newPatientsThisMonth')}
                    value={newPatientsThisMonth}
                    icon={UserPlusIcon}
                    color="bg-indigo-100"
                    subtitle="This month"
                />
                <StatCard
                    title={t('dashboard.appointmentsToday')}
                    value={todaysAppointmentsCount}
                    icon={CalendarIcon}
                    color="bg-sky-100"
                    subtitle="Scheduled today"
                />
            </div>

            {/* Financial Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('dashboard.monthlyRevenue') || "إيرادات الشهر"}
                    value={currencyFormatter.format(thisMonthRevenue)}
                    icon={TrendingUpIcon}
                    color="bg-blue-100"
                    subtitle={t('dashboard.thisMonth') || "هذا الشهر"}
                />
                <StatCard
                    title={t('dashboard.monthlyExpenses') || "مصروفات الشهر"}
                    value={currencyFormatter.format(thisMonthExpenses)}
                    icon={TrendingDownIcon}
                    color="bg-red-100"
                    subtitle={t('dashboard.thisMonth') || "هذا الشهر"}
                />
                <StatCard
                    title={t('dashboard.netProfit') || "صافي الربح"}
                    value={currencyFormatter.format(clinicProfitThisMonth)}
                    icon={clinicProfitThisMonth >= 0 ? TrendingUpIcon : TrendingDownIcon}
                    color={clinicProfitThisMonth >= 0 ? "bg-green-100" : "bg-red-100"}
                    subtitle={t('dashboard.thisMonth') || "هذا الشهر"}
                />
                <StatCard
                    title={t('dashboard.outstandingBalance') || "الرصيد المستحق"}
                    value={currencyFormatter.format(pendingPayments)}
                    icon={AlertIcon}
                    color="bg-orange-100"
                    subtitle={t('dashboard.pendingPayments') || "مدفوعات معلقة"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-700">{t('dashboard.upcomingWeekAppointments')}</h2>
                        <button
                            onClick={() => setCurrentView('scheduler')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="h-64">
                        <BarChart
                            title=""
                            data={upcomingWeekAppointmentsData}
                            colorClass="bg-sky-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-700">{t('dashboard.atAGlance')}</h2>
                            {overdueInvoices > 0 && (
                                <div className="flex items-center text-orange-600 text-sm font-medium">
                                    {AlertIcon}
                                    <span className="ml-1">{overdueInvoices} overdue</span>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-slate-600 mb-2">{t('dashboard.pendingLabCases')}</h3>
                            <div className="space-y-2">
                                {pendingLabCases.length > 0 ? (
                                    pendingLabCases.map(lc => (
                                        <button key={lc.id} onClick={() => setCurrentView('labCases')} className="w-full text-start p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light">
                                            <div className="flex justify-between items-center text-sm">
                                                <p className="font-semibold text-slate-800">{patients.find(p => p.id === lc.patientId)?.name}</p>
                                                <p className="text-xs text-slate-500">{t('labCases.due')}: {lc.dueDate ? dateFormatter.format(new Date(lc.dueDate)) : 'No due date'}</p>
                                            </div>
                                            <p className="text-xs text-slate-600">{lc.caseType}</p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 p-2">{t('dashboard.noPendingLabCases')}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-600 mb-2">{t('dashboard.lowStockItems')}</h3>
                            <div className="space-y-2">
                                {lowStockItems.length > 0 ? (
                                    lowStockItems.map(item => (
                                        <button key={item.id} onClick={() => setCurrentView('inventory')} className="w-full text-start p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light">
                                            <div className="flex justify-between items-center text-sm">
                                                <p className="font-semibold text-slate-800">{item.name}</p>
                                                <p className="text-xs text-red-600 font-bold">{t('inventory.stock')}: {item.currentStock}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 p-2">{t('dashboard.noLowStockItems')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-700">{t('dashboard.doctorDailyPerformance')}</h2>
                            <button
                                onClick={() => setCurrentView('doctors')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                View Details →
                            </button>
                            <button
                                onClick={() => setCurrentView('reports')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                View Details →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {doctorPerformanceToday.length > 0 ? doctorPerformanceToday.map(doc => (
                                <div key={doc.name}>
                                    <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                        <span className="text-slate-700">{doc.name}</span>
                                        <span className="text-slate-500">{fullCurrencyFormatter.format(doc.earnings)}</span>
                                    </div>
                                    <div className="w-full bg-neutral rounded-full h-2.5">
                                        <div className={`${doc.color} h-2.5 rounded-full`} style={{ width: `${doc.percentage}%` }}></div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500 text-center py-4">{t('dashboard.noEarningsToday')}</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-700 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setCurrentView('patients')}
                                className="flex items-center justify-center p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                            >
                                <div className="text-emerald-700">
                                    {PatientsIcon}
                                </div>
                                <span className="ml-2 text-sm font-medium text-emerald-800">Add Patient</span>
                            </button>
                            <button
                                onClick={() => setCurrentView('scheduler')}
                                className="flex items-center justify-center p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors border border-sky-200"
                            >
                                <div className="text-sky-700">
                                    {CalendarIcon}
                                </div>
                                <span className="ml-2 text-sm font-medium text-sky-800">Schedule</span>
                            </button>
                            <button
                                onClick={() => setCurrentView('financialAccounts')}
                                className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                            >
                                <div className="text-green-700">
                                    {DollarIcon}
                                </div>
                                <span className="ml-2 text-sm font-medium text-green-800">Finance</span>
                            </button>
                            <button
                                onClick={() => setCurrentView('reports')}
                                className="flex items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                            >
                                <div className="text-indigo-700">
                                    {TrendingUpIcon}
                                </div>
                                <span className="ml-2 text-sm font-medium text-indigo-800">Reports</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;

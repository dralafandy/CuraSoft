import React, { useState, useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { useI18n } from '../../hooks/useI18n';
import { useFinancialCalculations } from '../../hooks/useFinancialCalculations';
import { openPrintWindow } from '../../utils/print';
import PrintableReport from './PrintableReport';
import BarChart from './BarChart';
import PieChart from './PieChart';

interface DailyFinancialSummaryProps {
    clinicData: ClinicData;
}

const DailyFinancialSummary: React.FC<DailyFinancialSummaryProps> = ({ clinicData }) => {
    const { t, locale } = useI18n();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });

    const dailyData = useMemo(() => {
        const date = new Date(selectedDate);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const todaysPayments = clinicData.payments.filter(p =>
            new Date(p.date) >= startOfDay && new Date(p.date) <= endOfDay
        );

        const todaysExpenses = clinicData.expenses.filter(e =>
            new Date(e.date) >= startOfDay && new Date(e.date) <= endOfDay
        );

        const todaysRevenue = todaysPayments.reduce((sum, p) => sum + p.amount, 0);
        const todaysExpensesTotal = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
        const todaysDoctorShares = todaysPayments.reduce((sum, p) => sum + p.doctorShare, 0);
        const todaysProfit = todaysRevenue - todaysExpensesTotal - todaysDoctorShares;
        const todaysDoctorPercentage = todaysRevenue > 0 ? (todaysDoctorShares / todaysRevenue) * 100 : 0;

        const pendingPayments = clinicData.treatmentRecords
            .filter(tr => new Date(tr.treatmentDate) <= endOfDay)
            .reduce((sum, tr) => sum + tr.totalTreatmentCost, 0) -
            clinicData.payments
                .filter(p => new Date(p.date) <= endOfDay)
                .reduce((sum, p) => sum + p.amount, 0);

        const overdueInvoices = clinicData.treatmentRecords
            .filter(tr => {
                const treatmentDate = new Date(tr.treatmentDate);
                const daysSinceTreatment = (date.getTime() - treatmentDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceTreatment > 30 && tr.totalTreatmentCost > clinicData.payments
                    .filter(p => p.patientId === tr.patientId)
                    .reduce((sum, p) => sum + p.amount, 0);
            })
            .reduce((sum, tr) => sum + tr.totalTreatmentCost, 0);

        const todaysAppointments = clinicData.appointments.filter(a => {
            const aDate = new Date(a.date);
            return aDate.toDateString() === date.toDateString();
        }).length;

        const uniquePatientsToday = new Set(todaysPayments.map(p => p.patientId)).size;

        const todaysDoctorEarnings = (() => {
            const dailyEarnings: Record<string, { name: string, earnings: number, color: string }> = {};

            // Calculate earnings from today's payments linked to treatments by the dentist
            todaysPayments.forEach(payment => {
                const treatmentRecord = clinicData.treatmentRecords.find(tr => tr.id === payment.treatmentRecordId);
                if (treatmentRecord) {
                    const dentist = clinicData.dentists.find(d => d.id === treatmentRecord.dentistId);
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
        })();

        return {
            todaysRevenue,
            todaysExpenses: todaysExpensesTotal,
            todaysDoctorShares,
            todaysDoctorPercentage,
            todaysProfit,
            pendingPayments: Math.max(0, pendingPayments),
            overdueInvoices: Math.max(0, overdueInvoices),
            todaysPayments,
            todaysExpensesArray: todaysExpenses,
            numPayments: todaysPayments.length,
            numExpenses: todaysExpenses.length,
            todaysAppointments,
            uniquePatientsToday,
            todaysDoctorEarnings
        };
    }, [clinicData, selectedDate]);

    const revenueTrendData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayRevenue = clinicData.payments
                .filter(p => p.date === dateStr)
                .reduce((sum, p) => sum + p.amount, 0);

            data.push({
                label: date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
                value: dayRevenue
            });
        }
        return data;
    }, [clinicData.payments, selectedDate, locale]);

    const expensesBreakdownData = useMemo(() => {
        const expenseByCategory = dailyData.todaysExpensesArray.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
        return Object.entries(expenseByCategory).map(([category, amount], index) => ({
            label: t(`expenseCategory.${category}`),
            value: amount,
            color: colors[index % colors.length]
        }));
    }, [dailyData.todaysExpensesArray, t]);

    const handlePrint = () => {
        openPrintWindow(
            `${t('reports.dailyFinancialSummary.title')} - ${new Date(selectedDate).toLocaleDateString(locale)}`,
            <PrintableReport clinicData={clinicData} activeTab="dailyFinancialSummary" startDate={selectedDate} endDate={selectedDate} />
        );
    };

    return (
        <div className="space-y-8 p-6 bg-slate-50 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reports.dailyFinancialSummary.title')}</h1>
                        <p className="text-slate-600">{t('reports.dailyFinancialSummary.subtitle')}</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark flex items-center gap-2 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        🖨️ {t('reports.printReport')}
                    </button>
                </div>
            </div>

            {/* Date Picker */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.selectDate')}</h2>
                <div className="max-w-xs">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{currencyFormatter.format(dailyData.todaysRevenue)}</div>
                    <div className="text-sm text-blue-700" dir="rtl">إيرادات اليوم</div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{currencyFormatter.format(dailyData.todaysDoctorShares)}</div>
                    <div className="text-sm text-yellow-700" dir="rtl">حصة الأطباء اليوم</div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{dailyData.todaysExpenses}</div>
                    <div className="text-sm text-red-700" dir="rtl">مصروفات اليوم</div>
                </div>

                <div className={`p-4 rounded-lg border ${dailyData.todaysProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`text-2xl font-bold ${dailyData.todaysProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{currencyFormatter.format(dailyData.todaysProfit)}</div>
                    <div className={`text-sm ${dailyData.todaysProfit >= 0 ? 'text-green-700' : 'text-red-700'}`} dir="rtl">ربح اليوم</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{currencyFormatter.format(dailyData.pendingPayments)}</div>
                    <div className="text-sm text-orange-700" dir="rtl">مدفوعات معلقة</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{currencyFormatter.format(dailyData.overdueInvoices)}</div>
                    <div className="text-sm text-purple-700" dir="rtl">فواتير متأخرة</div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="text-2xl font-bold text-indigo-600">{dailyData.numPayments}</div>
                    <div className="text-sm text-indigo-700" dir="rtl">عدد المدفوعات</div>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <div className="text-2xl font-bold text-pink-600">{dailyData.numExpenses}</div>
                    <div className="text-sm text-pink-700" dir="rtl">عدد المصروفات</div>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="text-2xl font-bold text-teal-600">{dailyData.todaysAppointments}</div>
                    <div className="text-sm text-teal-700" dir="rtl">مواعيد اليوم</div>
                </div>

                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <div className="text-2xl font-bold text-cyan-600">{dailyData.uniquePatientsToday}</div>
                    <div className="text-sm text-cyan-700" dir="rtl">المرضى الفريدون اليوم</div>
                </div>

                <div className="bg-lime-50 p-4 rounded-lg border border-lime-200">
                    <div className="text-2xl font-bold text-lime-600">{dailyData.todaysDoctorPercentage.toFixed(1)}%</div>
                    <div className="text-sm text-lime-700" dir="rtl">نسبة الأطباء اليومية</div>
                </div>
            </div>

            {/* Doctor Earnings Today */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-slate-800 mb-4" dir="rtl">استحقاقات الأطباء اليومية</h3>
                <div className="space-y-3">
                    {dailyData.todaysDoctorEarnings.length > 0 ? dailyData.todaysDoctorEarnings.map((doc) => (
                        <div key={doc.name}>
                            <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                <span className="text-slate-700">{doc.name}</span>
                                <span className="text-slate-500">{currencyFormatter.format(doc.earnings)}</span>
                            </div>
                            <div className="w-full bg-neutral rounded-full h-2.5">
                                <div className={`${doc.color} h-2.5 rounded-full`} style={{ width: `${doc.percentage}%` }}></div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-slate-500 text-center py-4">لا توجد استحقاقات للأطباء في هذا اليوم</p>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <BarChart title={t('reports.dailyFinancialSummary.revenueTrend')} data={revenueTrendData} colorClass="bg-blue-500" />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <PieChart title={t('reports.dailyFinancialSummary.expensesBreakdown')} data={expensesBreakdownData} />
                </div>
            </div>

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.dailyFinancialSummary.todaysPayments')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('common.patient')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('payment.amount')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('payment.method')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyData.todaysPayments.slice(0, 10).map(payment => {
                                    const patient = clinicData.patients.find(p => p.id === payment.patientId);
                                    return (
                                        <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-600 text-right">{patient?.name || t('common.unknown')}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 text-right">{currencyFormatter.format(payment.amount)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 text-right">{payment.method}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('reports.dailyFinancialSummary.todaysExpensesList')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('expense.description')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('expense.amount')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{t('expense.category')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyData.todaysExpensesArray.slice(0, 10).map(expense => (
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
    );
};

export default DailyFinancialSummary;
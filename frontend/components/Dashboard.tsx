import React, { useMemo } from 'react';
import { ClinicData } from '../hooks/useClinicData';
import { AppointmentStatus, LabCaseStatus, View, Dentist, TreatmentRecord } from '../types';
import { useI18n } from '../hooks/useI18n';
import BarChart from './reports/BarChart';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div className="ms-4">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-700">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<{ clinicData: ClinicData, setCurrentView: (view: View) => void }> = ({ clinicData, setCurrentView }) => {
    const { t, locale } = useI18n();
    const { patients, appointments, treatmentRecords, inventoryItems, labCases, dentists } = clinicData;
    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', notation: 'compact', maximumFractionDigits: 1 });
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
    
    const todaysRevenue = useMemo(() => todaysTreatmentRecords.reduce((sum, tr) => sum + tr.totalTreatmentCost, 0), [todaysTreatmentRecords]);

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

        todaysTreatmentRecords.forEach(record => {
            const dentist = dentists.find(d => d.id === record.dentistId);
            if (dentist) {
                if (!dailyEarnings[dentist.id]) {
                    dailyEarnings[dentist.id] = { name: dentist.name, earnings: 0, color: dentist.color };
                }
                dailyEarnings[dentist.id].earnings += record.doctorShare;
            }
        });
        
        const totalEarnings = Object.values(dailyEarnings).reduce((sum, d) => sum + d.earnings, 0);

        return Object.values(dailyEarnings).map(d => ({
            ...d,
            percentage: totalEarnings > 0 ? (d.earnings / totalEarnings) * 100 : 0,
        })).sort((a, b) => b.earnings - a.earnings);

    }, [todaysTreatmentRecords, dentists]);


    // --- ICONS ---
    const PatientsIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
    const CalendarIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
    const DollarIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /> </svg>);
    const UserPlusIcon = (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>);


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('dashboard.totalPatients')} value={patients.length} icon={PatientsIcon} color="bg-emerald-100" />
                <StatCard title={t('dashboard.todaysRevenue')} value={currencyFormatter.format(todaysRevenue)} icon={DollarIcon} color="bg-green-100" />
                <StatCard title={t('dashboard.newPatientsThisMonth')} value={newPatientsThisMonth} icon={UserPlusIcon} color="bg-indigo-100" />
                <StatCard title={t('dashboard.appointmentsToday')} value={todaysAppointmentsCount} icon={CalendarIcon} color="bg-sky-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">{t('dashboard.upcomingWeekAppointments')}</h2>
                    <div className="h-64">
                        <BarChart
                            title=""
                            data={upcomingWeekAppointmentsData}
                            colorClass="bg-sky-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-md space-y-4">
                        <h2 className="text-xl font-bold text-slate-700">{t('dashboard.atAGlance')}</h2>
                        
                        <div>
                            <h3 className="font-semibold text-slate-600 mb-2">{t('dashboard.pendingLabCases')}</h3>
                            <div className="space-y-2">
                                {pendingLabCases.length > 0 ? (
                                    pendingLabCases.map(lc => (
                                        <button key={lc.id} onClick={() => setCurrentView('labCases')} className="w-full text-start p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light">
                                            <div className="flex justify-between items-center text-sm">
                                                <p className="font-semibold text-slate-800">{patients.find(p => p.id === lc.patientId)?.name}</p>
                                                <p className="text-xs text-slate-500">{t('labCases.due')}: {dateFormatter.format(new Date(lc.dueDate))}</p>
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

                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-700 mb-4">{t('dashboard.doctorDailyPerformance')}</h2>
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

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
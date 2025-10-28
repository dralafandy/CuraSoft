import { useCallback, useState, useEffect } from 'react';
import { 
    Patient, Dentist, Appointment, DentalChartData, ToothStatus,
    Supplier, InventoryItem, Expense, TreatmentDefinition, TreatmentRecord,
    LabCase, Payment, SupplierInvoice, ExpenseCategory, NotificationType
} from '../types';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const createEmptyChart = (): DentalChartData => {
    const chart: DentalChartData = {};
    const quadrants = ['UR', 'UL', 'LL', 'LR'];
    quadrants.forEach(q => {
        for (let i = 1; i <= 8; i++) {
            chart[`${q}${i}`] = { status: ToothStatus.HEALTHY, notes: '' };
        }
    });
    return chart;
};

export interface ClinicData {
    patients: Patient[];
    addPatient: (patient: Omit<Patient, 'id' | 'dentalChart'>) => Promise<void>;
    updatePatient: (patient: Patient) => Promise<void>;
    dentists: Dentist[];
    addDoctor: (doctor: Omit<Dentist, 'id'>) => Promise<void>;
    updateDoctor: (doctor: Dentist) => Promise<void>;
    appointments: Appointment[];
    addAppointment: (appointment: Omit<Appointment, 'id' | 'reminderSent'>) => Promise<void>;
    updateAppointment: (appointment: Appointment) => Promise<void>;
    suppliers: Supplier[];
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    updateSupplier: (supplier: Supplier) => Promise<void>;
    inventoryItems: InventoryItem[];
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
    updateInventoryItem: (item: InventoryItem) => Promise<void>;
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    updateExpense: (expense: Expense) => Promise<void>;
    treatmentDefinitions: TreatmentDefinition[];
    addTreatmentDefinition: (def: Omit<TreatmentDefinition, 'id'>) => Promise<void>;
    updateTreatmentDefinition: (def: TreatmentDefinition) => Promise<void>;
    treatmentRecords: TreatmentRecord[];
    addTreatmentRecord: (patientId: string, record: Omit<TreatmentRecord, 'id' | 'patientId'>) => Promise<void>;
    updateTreatmentRecord: (patientId: string, record: TreatmentRecord) => Promise<void>;
    labCases: LabCase[];
    addLabCase: (labCase: Omit<LabCase, 'id'>) => Promise<void>;
    updateLabCase: (labCase: LabCase) => Promise<void>;
    payments: Payment[];
    addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
    updatePayment: (payment: Payment) => Promise<void>;
    supplierInvoices: SupplierInvoice[];
    addSupplierInvoice: (invoice: Omit<SupplierInvoice, 'id' | 'payments'>) => Promise<void>;
    updateSupplierInvoice: (invoice: SupplierInvoice) => Promise<void>;
    paySupplierInvoice: (invoice: SupplierInvoice) => Promise<void>;
    restoreData: (data: Partial<Omit<ClinicData, 'restoreData'>>) => void; // Kept for local restore, though less relevant now
}

export const useClinicData = (): ClinicData => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    
    const [patients, setPatients] = useState<Patient[]>([]);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [treatmentDefinitions, setTreatmentDefinitions] = useState<TreatmentDefinition[]>([]);
    const [treatmentRecords, setTreatmentRecords] = useState<TreatmentRecord[]>([]);
    const [labCases, setLabCases] = useState<LabCase[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>([]);

    const fetchData = useCallback(async () => {
        if (!user || !supabase) return;

        const tables = [
            'patients', 'dentists', 'appointments', 'suppliers', 'inventory_items',
            'expenses', 'treatment_definitions', 'treatment_records', 'lab_cases',
            'payments', 'supplier_invoices'
        ];
        
        const promises = tables.map(table => supabase.from(table).select('*'));
        const results = await Promise.all(promises);

        const [
            patientsRes, dentistsRes, appointmentsRes, suppliersRes, inventoryItemsRes,
            expensesRes, treatmentDefsRes, treatmentRecordsRes, labCasesRes,
            paymentsRes, supplierInvoicesRes
        ] = results;

        if (patientsRes.data) setPatients(patientsRes.data);
        if (dentistsRes.data) setDentists(dentistsRes.data);
        if (appointmentsRes.data) {
             setAppointments(appointmentsRes.data.map((a: any) => ({ ...a, startTime: new Date(a.start_time), endTime: new Date(a.end_time) })));
        }
        if (suppliersRes.data) setSuppliers(suppliersRes.data);
        if (inventoryItemsRes.data) setInventoryItems(inventoryItemsRes.data);
        if (expensesRes.data) setExpenses(expensesRes.data);
        if (treatmentDefsRes.data) setTreatmentDefinitions(treatmentDefsRes.data);
        if (treatmentRecordsRes.data) setTreatmentRecords(treatmentRecordsRes.data);
        if (labCasesRes.data) setLabCases(labCasesRes.data);
        if (paymentsRes.data) setPayments(paymentsRes.data);
        if (supplierInvoicesRes.data) setSupplierInvoices(supplierInvoicesRes.data);
        
        const error = results.find(res => res.error);
        if (error) {
            addNotification(error.error.message, NotificationType.ERROR);
        }
    }, [user, addNotification]);

    useEffect(() => {
        if (supabase) {
            fetchData();
        }
    }, [fetchData]);

    // Generic helper for adding data
    const addData = async <T extends { id: string }>(table: string, data: Partial<T>, setState: React.Dispatch<React.SetStateAction<T[]>>): Promise<void> => {
        if (!user || !supabase) return;
        const { data: newData, error } = await supabase.from(table).insert({ ...data, user_id: user.id }).select();
        if (error) {
            addNotification(error.message, NotificationType.ERROR);
        } else if (newData) {
            setState(prev => [...prev, ...newData as T[]]);
        }
    };

    // Generic helper for updating data
    const updateData = async <T extends { id: string }>(table: string, data: T, setState: React.Dispatch<React.SetStateAction<T[]>>): Promise<void> => {
        if (!supabase) return;
        const { id, ...updateData } = data;
        const { error } = await supabase.from(table).update(updateData).eq('id', id);
        if (error) {
            addNotification(error.message, NotificationType.ERROR);
        } else {
            setState(prev => prev.map(item => (item.id === id ? data : item)));
        }
    };
    
    // Patient Management
    const addPatient = async (patient: Omit<Patient, 'id' | 'dentalChart'>) => addData('patients', { ...patient, dentalChart: createEmptyChart() }, setPatients);
    const updatePatient = async (patient: Patient) => updateData('patients', patient, setPatients);

    // Doctor Management
    const addDoctor = async (doctor: Omit<Dentist, 'id'>) => addData('dentists', doctor, setDentists);
    const updateDoctor = async (doctor: Dentist) => updateData('dentists', doctor, setDentists);

    // FIX: Refactor appointment management to handle snake_case/camelCase mapping and state updates correctly, removing incorrect use of generic helpers.
    // Appointment Management
    const addAppointment = async (appointment: Omit<Appointment, 'id' | 'reminderSent'>) => {
        if (!user || !supabase) return;
        
        // Map Appointment object to snake_case for Supabase
        const { patientId, dentistId, startTime, endTime, reminderTime, ...rest } = appointment;
        const supabaseData = {
            ...rest,
            patient_id: patientId,
            dentist_id: dentistId,
            start_time: startTime,
            end_time: endTime,
            reminder_time: reminderTime,
            reminder_sent: false,
            user_id: user.id
        };

        const { data: newData, error } = await supabase.from('appointments').insert(supabaseData).select();

        if (error) {
            addNotification(error.message, NotificationType.ERROR);
        } else if (newData) {
            // Map snake_case response from Supabase back to Appointment object
            const newAppointments = newData.map((a: any) => ({
                id: a.id,
                patientId: a.patient_id,
                dentistId: a.dentist_id,
                startTime: new Date(a.start_time),
                endTime: new Date(a.end_time),
                reason: a.reason,
                status: a.status,
                reminderTime: a.reminder_time,
                reminderSent: a.reminder_sent
            }));
            setAppointments(prev => [...prev, ...newAppointments]);
        }
    };
    const updateAppointment = async (appointment: Appointment) => {
        if (!user || !supabase) return;

        // Map Appointment object to snake_case for Supabase
        const { id, patientId, dentistId, startTime, endTime, reminderTime, reminderSent, ...rest } = appointment;
        const supabaseData = {
            ...rest,
            patient_id: patientId,
            dentist_id: dentistId,
            start_time: startTime,
            end_time: endTime,
            reminder_time: reminderTime,
            reminder_sent: reminderSent
        };
        
        const { error } = await supabase.from('appointments').update(supabaseData).eq('id', id);
        
        if (error) {
            addNotification(error.message, NotificationType.ERROR);
        } else {
            setAppointments(prev => prev.map(item => (item.id === id ? appointment : item)));
        }
    };

    // Treatment Record Management
    const addTreatmentRecord = async (patientId: string, record: Omit<TreatmentRecord, 'id' | 'patientId'>) => addData('treatment_records', { ...record, patientId }, setTreatmentRecords);
    const updateTreatmentRecord = async (patientId: string, record: TreatmentRecord) => updateData('treatment_records', record, setTreatmentRecords);
    
    // Payment Management
    const addPayment = async (payment: Omit<Payment, 'id'>) => addData('payments', payment, setPayments);
    const updatePayment = async (payment: Payment) => updateData('payments', payment, setPayments);

    // Financial & Inventory Management
    const addSupplier = async (s: Omit<Supplier, 'id'>) => addData('suppliers', s, setSuppliers);
    const updateSupplier = async (s: Supplier) => updateData('suppliers', s, setSuppliers);
    const addInventoryItem = async (i: Omit<InventoryItem, 'id'>) => addData('inventory_items', i, setInventoryItems);
    const updateInventoryItem = async (i: InventoryItem) => updateData('inventory_items', i, setInventoryItems);
    
    const addExpense = async (e: Omit<Expense, 'id'>) => {
        if (!supabase) return;
        await addData('expenses', e, setExpenses);
        if (e.supplierInvoiceId) {
             const {data: invoice, error} = await supabase.from('supplier_invoices').select('*').eq('id', e.supplierInvoiceId).single();
             if (invoice) {
                const newPayments = [...(invoice.payments || []), { expenseId: 'temp_id', amount: e.amount, date: e.date }];
                await updateData('supplier_invoices', {...invoice, payments: newPayments }, setSupplierInvoices);
             }
        }
    };
    const updateExpense = async (e: Expense) => updateData('expenses', e, setExpenses);

    const addTreatmentDefinition = async (d: Omit<TreatmentDefinition, 'id'>) => addData('treatment_definitions', d, setTreatmentDefinitions);
    const updateTreatmentDefinition = async (d: TreatmentDefinition) => updateData('treatment_definitions', d, setTreatmentDefinitions);
    
    const addLabCase = async (lc: Omit<LabCase, 'id'>) => addData('lab_cases', lc, setLabCases);
    const updateLabCase = async (lc: LabCase) => updateData('lab_cases', lc, setLabCases);
    
    const addSupplierInvoice = async (i: Omit<SupplierInvoice, 'id' | 'payments'>) => addData('supplier_invoices', { ...i, payments: [] }, setSupplierInvoices);
    const updateSupplierInvoice = async (i: SupplierInvoice) => updateData('supplier_invoices', i, setSupplierInvoices);

    const paySupplierInvoice = async (invoice: SupplierInvoice) => {
        if (!supabase) return;
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const balance = invoice.amount - totalPaid;
        if(balance <= 0) return;

        const newExpense: Omit<Expense, 'id'> = {
            date: new Date().toISOString().split('T')[0],
            description: `Payment for invoice #${invoice.invoiceNumber || invoice.id.slice(-4)}`,
            amount: balance,
            // FIX: Use ExpenseCategory enum instead of string literal to fix type error.
            category: ExpenseCategory.SUPPLIES,
            supplierId: invoice.supplierId,
            supplierInvoiceId: invoice.id,
        };
        await addExpense(newExpense);
    };

    // Data persistence (local restore - less used now)
    const restoreData = (data: Partial<Omit<ClinicData, 'restoreData'>>) => {
        console.warn("Restoring from local file will not sync to the cloud.");
        if (data.patients) setPatients(data.patients);
        // ... and so on for other states
    };
    
    return {
        patients, addPatient, updatePatient,
        dentists, addDoctor, updateDoctor,
        appointments, addAppointment, updateAppointment,
        suppliers, addSupplier, updateSupplier,
        inventoryItems, addInventoryItem, updateInventoryItem,
        expenses, addExpense, updateExpense,
        treatmentDefinitions, addTreatmentDefinition, updateTreatmentDefinition,
        treatmentRecords, addTreatmentRecord, updateTreatmentRecord,
        labCases, addLabCase, updateLabCase,
        payments, addPayment, updatePayment,
        supplierInvoices, addSupplierInvoice, updateSupplierInvoice, paySupplierInvoice,
        restoreData
    };
};

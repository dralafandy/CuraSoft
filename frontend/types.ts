export enum ToothStatus {
  HEALTHY = 'HEALTHY',
  FILLING = 'FILLING',
  CROWN = 'CROWN',
  MISSING = 'MISSING',
  IMPLANT = 'IMPLANT',
  ROOT_CANAL = 'ROOT_CANAL',
  CAVITY = 'CAVITY',
}

export interface Tooth {
  status: ToothStatus;
  notes: string;
}

export type DentalChartData = Record<string, Tooth>; // Key is tooth number, e.g., 'T1', 'T2'

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  medicalHistory: string;
  treatmentNotes: string; // Existing unstructured notes
  lastVisit: string;
  allergies: string;
  medications: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dentalChart: DentalChartData;
}

export interface Dentist {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Add the missing Appointment interface
export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  status: AppointmentStatus;
  reminderTime: 'none' | '1_hour_before' | '2_hours_before' | '1_day_before'; // New field for reminders
  reminderSent: boolean; // New field to track if reminder was sent
}

// --- New Interfaces for Finance & Inventory ---

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  type: 'Material Supplier' | 'Dental Lab'; // Added to distinguish supplier type
}

// Renamed from LabMaterial
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  supplierId: string; // Link to Supplier
  currentStock: number;
  unitCost: number; // Cost per unit for the clinic
  minStockLevel: number; // Minimum stock before re-order alert
  expiryDate?: string; // YYYY-MM-DD
}

export enum ExpenseCategory {
  RENT = 'RENT',
  SALARIES = 'SALARIES',
  UTILITIES = 'UTILITIES',
  LAB_FEES = 'LAB_FEES',
  SUPPLIES = 'SUPPLIES',
  MARKETING = 'MARKETING',
  MISC = 'MISC',
}

export interface Expense {
  id:string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  category: ExpenseCategory;
  supplierId?: string; // Link to a specific supplier
  supplierInvoiceId?: string; // Link to a specific supplier invoice
}

export interface TreatmentDefinition { // Renamed from TreatmentCost to be more descriptive of a template
  id: string;
  name: string;
  description: string;
  basePrice: number; // The patient-facing price
  doctorPercentage: number; // e.g., 0.60 for 60%
  clinicPercentage: number; // e.g., 0.40 for 40%
}

export interface TreatmentRecord { // A specific treatment performed on a patient
  id: string;
  patientId: string;
  dentistId: string;
  treatmentDate: string; // YYYY-MM-DD
  treatmentDefinitionId: string; // Link to TreatmentDefinition
  notes: string;
  inventoryItemsUsed: { inventoryItemId: string; quantity: number; cost: number; }[]; // Materials consumed, updated name
  totalTreatmentCost: number; // Sum of basePrice and material costs
  doctorShare: number;
  clinicShare: number;
}

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Other' | 'Discount';

export interface Payment {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

// --- New interfaces for Lab Case Management ---
export enum LabCaseStatus {
    DRAFT = 'DRAFT',
    SENT_TO_LAB = 'SENT_TO_LAB',
    RECEIVED_FROM_LAB = 'RECEIVED_FROM_LAB',
    FITTED_TO_PATIENT = 'FITTED_TO_PATIENT',
    CANCELLED = 'CANCELLED',
}

export interface LabCase {
    id: string;
    patientId: string;
    labId: string; // Supplier of type 'Dental Lab'
    caseType: string; // e.g., 'Zirconia Crown', 'E-Max Veneer'
    sentDate: string; // YYYY-MM-DD
    dueDate: string; // YYYY-MM-DD
    returnDate?: string; // YYYY-MM-DD
    status: LabCaseStatus;
    labCost: number;
    notes: string;
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}


export type PatientDetailTab = 'details' | 'chart' | 'treatments' | 'financials'; // Removed 'aiSummary' tab
export type View = 'dashboard' | 'patients' | 'scheduler' | 'doctors' | 'suppliers' | 'inventory' | 'labCases' | 'expenses' | 'treatmentDefinitions' | 'reports' | 'settings'; // Replaced 'finance' with specific pages and added 'settings'

// --- New interfaces for Supplier Financials ---
export enum SupplierInvoiceStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
}

export interface SupplierInvoice {
    id: string;
    supplierId: string;
    invoiceNumber?: string;
    invoiceDate: string; // YYYY-MM-DD
    dueDate?: string; // YYYY-MM-DD
    amount: number;
    status: SupplierInvoiceStatus;
    items: { description: string; amount: number; }[];
    invoiceImageUrl?: string; // Base64 Data URL
    payments: { expenseId: string; amount: number; date: string; }[];
}
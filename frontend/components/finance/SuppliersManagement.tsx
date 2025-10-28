import React, { useState, useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { Supplier, SupplierInvoice, SupplierInvoiceStatus } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationType } from '../../types';
import SupplierStatement from './SupplierStatement';
import LabStatement from './LabStatement';
import { openPrintWindow } from '../../utils/print';

const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const AttachmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 me-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PrintIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m0 0v1a2 2 0 002 2h6a2 2 0 002-2v-1M8 12h8m-8 4h.01M5 12h.01M19 12h.01M5 16h.01M19 16h.01" /></svg>);


const AddEditSupplierModal: React.FC<{
    supplier?: Supplier;
    onClose: () => void;
    onSave: (supplier: Omit<Supplier, 'id'> | Supplier) => void;
}> = ({ supplier, onClose, onSave }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState<Omit<Supplier, 'id'> | Supplier>(
        supplier || { name: '', contactPerson: '', phone: '', email: '', type: 'Material Supplier' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-700">{supplier ? t('suppliers.editSupplier') : t('suppliers.addNewSupplier')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300" aria-label={t('common.closeForm')}>
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <label htmlFor="supplier-name" className="sr-only">{t('suppliers.supplierName')}</label>
                    <input id="supplier-name" name="name" value={formData.name} onChange={handleChange} placeholder={t('suppliers.supplierName')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                    
                    <label htmlFor="contact-person" className="sr-only">{t('suppliers.contactPerson')}</label>
                    <input id="contact-person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder={t('suppliers.contactPerson')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                    
                    <label htmlFor="supplier-phone" className="sr-only">{t('suppliers.phone')}</label>
                    <input id="supplier-phone" name="phone" value={formData.phone} onChange={handleChange} placeholder={t('suppliers.phone')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                    
                    <label htmlFor="supplier-email" className="sr-only">{t('suppliers.email')}</label>
                    <input id="supplier-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t('suppliers.email')} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" />
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-600 mb-1">{t('suppliers.supplierType')}</label>
                        <select id="type" name="type" value={formData.type} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required>
                            <option value="Material Supplier">{t('supplierType.materialSupplier')}</option>
                            <option value="Dental Lab">{t('supplierType.dentalLab')}</option>
                        </select>
                    </div>
                    <footer className="pt-2 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-dark rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light">{t('common.save')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const AddEditInvoiceModal: React.FC<{
    invoice?: SupplierInvoice;
    supplierId: string;
    onClose: () => void;
    onSave: (invoice: Omit<SupplierInvoice, 'id'> | SupplierInvoice) => void;
}> = ({ invoice, supplierId, onClose, onSave }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState<Omit<SupplierInvoice, 'id'> | SupplierInvoice>(
        invoice || {
            supplierId: supplierId,
            invoiceNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            amount: 0,
            status: SupplierInvoiceStatus.UNPAID,
            items: [{ description: '', amount: 0 }],
            invoiceImageUrl: '',
            payments: [],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'amount' ? parseFloat(value) : value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, invoiceImageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-700">{invoice ? t('invoices.editInvoice') : t('invoices.addInvoice')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label={t('common.closeForm')}><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} placeholder={t('invoices.invoiceNumber')} className="p-2 border border-slate-300 rounded-lg w-full" />
                    <input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder={t('invoices.amount')} className="p-2 border border-slate-300 rounded-lg w-full" required />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600" htmlFor="invoiceDate">{t('invoices.invoiceDate')}</label>
                            <input id="invoiceDate" name="invoiceDate" type="date" value={formData.invoiceDate} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600" htmlFor="dueDate">{t('invoices.dueDate')}</label>
                            <input id="dueDate" name="dueDate" type="date" value={formData.dueDate || ''} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full" />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-600 block mb-2">{t('invoices.attachInvoice')}</label>
                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                        {formData.invoiceImageUrl && <img src={formData.invoiceImageUrl} alt="Invoice preview" className="mt-2 max-h-32 rounded-lg" />}
                    </div>
                    <footer className="pt-2 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-dark rounded-lg hover:bg-slate-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{t('common.save')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const SupplierDetailsAndInvoicesModal: React.FC<{
    supplier: Supplier;
    onClose: () => void;
    clinicData: ClinicData;
}> = ({ supplier, onClose, clinicData }) => {
    const { t, locale } = useI18n();
    const { supplierInvoices, addSupplierInvoice, updateSupplierInvoice, paySupplierInvoice, expenses } = clinicData;
    const { addNotification } = useNotification();
    const [modalState, setModalState] = useState<{ type: 'add_invoice' | 'edit_invoice' | null; data?: any }>({ type: null });
    
    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });

    const relatedInvoices = useMemo(() => {
        return supplierInvoices.filter(inv => inv.supplierId === supplier.id)
            .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    }, [supplierInvoices, supplier.id]);

    const financialSummary = useMemo(() => {
        const totalBilled = relatedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const totalPaid = relatedInvoices.reduce((total, inv) => total + inv.payments.reduce((sum, p) => sum + p.amount, 0), 0);
        const outstandingBalance = totalBilled - totalPaid;
        return { totalBilled, totalPaid, outstandingBalance };
    }, [relatedInvoices]);

    const handleSaveInvoice = (invoice: Omit<SupplierInvoice, 'id'> | SupplierInvoice) => {
        if ('id' in invoice && invoice.id) {
            updateSupplierInvoice(invoice as SupplierInvoice);
            addNotification(t('notifications.invoiceUpdated'), NotificationType.SUCCESS);
        } else {
            addSupplierInvoice(invoice as Omit<SupplierInvoice, 'id'>);
            addNotification(t('notifications.invoiceAdded'), NotificationType.SUCCESS);
        }
        setModalState({ type: null });
    };

    const handlePayRemaining = (invoice: SupplierInvoice) => {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const balance = invoice.amount - totalPaid;
        if (balance > 0 && window.confirm(t('invoices.confirmPayRemaining', { amount: currencyFormatter.format(balance) }))) {
            paySupplierInvoice(invoice);
            addNotification(t('notifications.paymentRecorded'), NotificationType.SUCCESS);
        }
    };

    const handlePrintFinancialStatement = () => {
        openPrintWindow(t('supplierStatement.financialTitle'), <SupplierStatement supplier={supplier} clinicData={clinicData} />);
    };
    
    const handlePrintCaseStatement = () => {
        openPrintWindow(t('supplierStatement.caseTitle'), <LabStatement supplier={supplier} clinicData={clinicData} />);
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-700">{supplier.name}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrintFinancialStatement} className="flex items-center px-3 py-1 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300">
                           <PrintIcon /> {t('supplierStatement.financialTitle')}
                        </button>
                        {supplier.type === 'Dental Lab' && (
                             <button onClick={handlePrintCaseStatement} className="flex items-center px-3 py-1 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300">
                               <PrintIcon /> {t('supplierStatement.caseTitle')}
                            </button>
                        )}
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label={t('common.closeForm')}><CloseIcon /></button>
                    </div>
                </header>
                <main className="p-6 overflow-y-auto space-y-6 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Supplier Info */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                             <h3 className="font-semibold text-slate-600 mb-2">{t('supplierDetails.contactInfo')}</h3>
                            <p><strong>{t('suppliers.contactPerson')}:</strong> {supplier.contactPerson || '-'}</p>
                            <p><strong>{t('suppliers.phone')}:</strong> {supplier.phone || '-'}</p>
                            <p><strong>{t('suppliers.email')}:</strong> {supplier.email || '-'}</p>
                        </div>
                        {/* Financial Summary */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-slate-600 mb-2">{t('supplierDetails.financialSummary')}</h3>
                            <p><strong>{t('invoices.totalBilled')}:</strong> {currencyFormatter.format(financialSummary.totalBilled)}</p>
                            <p><strong>{t('invoices.totalPaid')}:</strong> {currencyFormatter.format(financialSummary.totalPaid)}</p>
                            <p className="font-bold"><strong>{t('invoices.outstandingBalance')}:</strong> {currencyFormatter.format(financialSummary.outstandingBalance)}</p>
                        </div>
                    </div>

                    {/* Invoices Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-bold text-slate-700">{t('invoices.title')}</h3>
                             <button onClick={() => setModalState({ type: 'add_invoice'})} className="flex items-center bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm"><AddIcon /> {t('invoices.addInvoice')}</button>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                            {relatedInvoices.length > 0 ? relatedInvoices.map(inv => {
                                const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                                const balance = inv.amount - totalPaid;

                                return (
                                <div key={inv.id} className="border p-3 rounded-lg">
                                    <div className="flex flex-wrap justify-between items-start gap-2">
                                        <div>
                                            <p className="font-bold text-slate-800">{t('invoices.invoice')} #{inv.invoiceNumber || inv.id.slice(-6)}</p>
                                            <p className="text-sm text-slate-600">{t('invoices.date')}: {dateFormatter.format(new Date(inv.invoiceDate))}</p>
                                            {inv.dueDate && <p className="text-xs text-slate-500">{t('invoices.due')}: {dateFormatter.format(new Date(inv.dueDate))}</p>}
                                        </div>
                                        <div className="text-end">
                                            <p className="text-lg font-bold">{currencyFormatter.format(inv.amount)}</p>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${balance <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {balance <= 0 ? t('invoices.paid') : `${t('invoices.remaining')}: ${currencyFormatter.format(balance)}`}
                                            </span>
                                        </div>
                                    </div>
                                    {inv.payments.length > 0 && (
                                        <div className="mt-2 pt-2 border-t text-xs text-slate-600 space-y-1">
                                            <p className="font-semibold text-xs text-slate-500">{t('financials.payments')}:</p>
                                            {inv.payments.map(p => {
                                                const expense = expenses.find(e => e.id === p.expenseId);
                                                return (
                                                    <div key={p.expenseId} className="flex items-center justify-between ps-2">
                                                        <span><ReceiptIcon />{dateFormatter.format(new Date(p.date))} - {expense?.description || t('common.na')}</span>
                                                        <span>{currencyFormatter.format(p.amount)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                        {inv.invoiceImageUrl && <a href={inv.invoiceImageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline"><AttachmentIcon/>{t('invoices.viewAttachment')}</a>}
                                        {balance > 0 && <button onClick={() => handlePayRemaining(inv)} className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200"><CheckCircleIcon />{t('invoices.payRemaining')}</button>}
                                        <button onClick={() => setModalState({ type: 'edit_invoice', data: inv })} className="flex items-center gap-1 text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200"><EditIcon />{t('common.edit')}</button>
                                    </div>
                                </div>
                            )}) : <p className="text-slate-500 text-center py-4">{t('invoices.noInvoices')}</p>}
                        </div>
                    </div>
                </main>
            </div>
            { (modalState.type === 'add_invoice' || modalState.type === 'edit_invoice') && (
                <AddEditInvoiceModal 
                    supplierId={supplier.id}
                    invoice={modalState.data}
                    onClose={() => setModalState({ type: null })}
                    onSave={handleSaveInvoice}
                />
            )}
        </div>
    );
};


export const SuppliersManagement: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { suppliers, addSupplier, updateSupplier } = clinicData;
    const { t } = useI18n();
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
    const [viewingSupplier, setViewingSupplier] = useState<Supplier | undefined>(undefined);

    const handleSaveSupplier = (supplier: Omit<Supplier, 'id'> | Supplier) => {
        if ('id' in supplier && supplier.id) {
            updateSupplier(supplier as Supplier);
        } else {
            addSupplier(supplier as Omit<Supplier, 'id'>);
        }
        setEditingSupplier(undefined);
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-700">{t('suppliers.suppliersList')}</h3>
                    <button
                        onClick={() => setIsAddSupplierModalOpen(true)}
                        className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                    >
                        <AddIcon /> {t('suppliers.addSupplier')}
                    </button>
                </div>
                <div className="bg-neutral p-4 rounded-lg shadow-inner">
                    {suppliers.length === 0 ? (
                        <p className="text-center text-slate-500 py-4">{t('suppliers.noSuppliersAdded')}</p>
                    ) : (
                        <ul className="space-y-2">
                            {suppliers.map(s => (
                                <li key={s.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-3 rounded-md shadow-sm gap-2">
                                    <div>
                                        <p className="font-bold text-slate-800">{s.name}</p>
                                        <p className="text-sm text-slate-600">{s.contactPerson} - {s.phone}</p>
                                        <p className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">{s.type === 'Material Supplier' ? t('supplierType.materialSupplier') : t('supplierType.dentalLab')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                         <button
                                            onClick={() => setViewingSupplier(s)}
                                            className="text-secondary hover:text-green-700 font-semibold px-3 py-1 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                                        >
                                            {t('suppliers.viewDetails')}
                                        </button>
                                        <button
                                            onClick={() => { setEditingSupplier(s); setIsAddSupplierModalOpen(true); }}
                                            className="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary-light"
                                            aria-label={t('suppliers.editSupplierAriaLabel', {name: s.name})}
                                        >
                                            <EditIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {isAddSupplierModalOpen && (
                <AddEditSupplierModal
                    supplier={editingSupplier}
                    onClose={() => { setIsAddSupplierModalOpen(false); setEditingSupplier(undefined); }}
                    onSave={handleSaveSupplier}
                />
            )}

            {viewingSupplier && (
                <SupplierDetailsAndInvoicesModal
                    supplier={viewingSupplier}
                    onClose={() => setViewingSupplier(undefined)}
                    clinicData={clinicData}
                />
            )}
        </div>
    );
};

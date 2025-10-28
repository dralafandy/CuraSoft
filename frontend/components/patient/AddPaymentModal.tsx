import React, { useState } from 'react';
import { Payment } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { PaymentMethod } from '../../types';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

interface AddPaymentModalProps {
    patientId: string;
    onClose: () => void;
    onAdd: (payment: Omit<Payment, 'id'>) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ patientId, onClose, onAdd }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState<Omit<Payment, 'id'>>({
        patientId,
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        method: 'Cash',
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount <= 0) {
            alert(t('addPaymentModal.alertPositiveAmount')); // Placeholder for a new translation key
            return;
        }
        onAdd(formData);
        onClose();
    };

    // Fix: Create a constant array from the PaymentMethod union type to iterate over its values
    const allPaymentMethods: PaymentMethod[] = ['Cash', 'Credit Card', 'Bank Transfer', 'Other', 'Discount'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-700">{t('addPaymentModal.title')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300" aria-label={t('common.closeForm')}>
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-600 mb-1">{t('addPaymentModal.paymentDate')}</label>
                        <input id="paymentDate" name="date" type="date" value={formData.date} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-600 mb-1">{t('addPaymentModal.amount')}</label>
                        <input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required min="0.01" />
                    </div>
                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-600 mb-1">{t('addPaymentModal.paymentMethod')}</label>
                        <select id="paymentMethod" name="method" value={formData.method} onChange={handleChange} className="p-2 border border-slate-300 rounded-lg w-full focus:ring-primary focus:border-primary" required>
                            {/* Fix: Iterate over the 'allPaymentMethods' array */}
                            {allPaymentMethods.filter(method => method !== 'Discount').map(method => (
                                <option key={method} value={method}>{t(`paymentMethod.${method}`)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-600 mb-1">{t('addPaymentModal.notes')}</label>
                        <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder={t('addPaymentModal.notesPlaceholder')} className="p-2 border border-slate-300 rounded-lg w-full h-20 focus:ring-primary focus:border-primary" />
                    </div>
                    <footer className="pt-2 flex justify-end space-x-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-dark rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light">{t('addPaymentModal.savePayment')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
import React, { useState, useMemo } from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { Supplier, InventoryItem, Expense } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { openPrintWindow } from '../../utils/print';

const SupplierReportPage: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { t, locale } = useI18n();
    const { suppliers, inventoryItems, expenses } = clinicData;
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.phone.includes(searchTerm)
        );
    }, [suppliers, searchTerm]);

    const supplierSummaries = useMemo(() => {
        return filteredSuppliers.map(supplier => {
            const supplierItems = inventoryItems.filter(item => item.supplierId === supplier.id);
            const supplierExpenses = expenses.filter(exp => exp.supplierId === supplier.id);

            const totalPurchases = supplierItems.reduce((sum, item) => sum + (item.unitCost * item.currentStock), 0);
            const totalExpenses = supplierExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const totalValue = totalPurchases + totalExpenses;

            const itemCount = supplierItems.length;
            const expenseCount = supplierExpenses.length;

            // Note: InventoryItem doesn't have purchaseDate, so we can't calculate lastPurchase
            const lastPurchase = null;

            return {
                supplier,
                totalPurchases,
                totalExpenses,
                totalValue,
                itemCount,
                expenseCount,
                lastPurchase
            };
        });
    }, [filteredSuppliers, inventoryItems, expenses]);

    const handlePrintSupplierReport = (supplier: Supplier) => {
        const supplierItems = inventoryItems.filter(item => item.supplierId === supplier.id);
        const supplierExpenses = expenses.filter(exp => exp.supplierId === supplier.id);

        const totalPurchases = supplierItems.reduce((sum, item) => sum + (item.unitCost * item.currentStock), 0);
        const totalExpenses = supplierExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalValue = totalPurchases + totalExpenses;

        const printContent = (
            <div className="p-8 bg-white text-slate-900" dir="rtl">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('supplierReport.title')}</h1>
                    <h2 className="text-2xl font-bold text-primary-dark mb-4">{supplier.name}</h2>
                    <p className="text-md text-slate-600">{t('supplierReport.generatedOn', { date: dateFormatter.format(new Date()) })}</p>
                </header>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('supplierReport.summary')}</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('supplierReport.totalPurchases')}</p>
                            <p className="text-2xl font-bold text-slate-800">{currencyFormatter.format(totalPurchases)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('supplierReport.totalExpenses')}</p>
                            <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(totalExpenses)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('supplierReport.totalValue')}</p>
                            <p className="text-2xl font-bold text-blue-600">{currencyFormatter.format(totalValue)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600">{t('supplierReport.contactInfo')}</p>
                            <div className="text-sm">
                                <p>{supplier.contactPerson}</p>
                                <p>{supplier.phone}</p>
                                <p>{supplier.email}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('supplierReport.inventoryItems')}</h3>
                    {supplierItems.length > 0 ? (
                        <table className="w-full text-sm border-collapse border border-slate-400">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('supplierReport.itemName')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('supplierReport.unitCost')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('supplierReport.currentStock')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('supplierReport.totalValue')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierItems.map(item => (
                                    <tr key={item.id} className="border-b border-slate-200">
                                        <td className="p-3 border border-slate-300">{item.name}</td>
                                        <td className="p-3 border border-slate-300">{currencyFormatter.format(item.unitCost)}</td>
                                        <td className="p-3 border border-slate-300">{item.currentStock}</td>
                                        <td className="p-3 border border-slate-300">{currencyFormatter.format(item.unitCost * item.currentStock)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-500 py-4">{t('supplierReport.noItems')}</p>
                    )}
                </section>

                <section className="mb-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t('supplierReport.expenses')}</h3>
                    {supplierExpenses.length > 0 ? (
                        <table className="w-full text-sm border-collapse border border-slate-400">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('supplierReport.expenseDate')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('supplierReport.amount')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('supplierReport.description')}</th>
                                    <th className="p-3 text-right font-semibold border border-slate-300">{t('supplierReport.category')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierExpenses.map(expense => (
                                    <tr key={expense.id} className="border-b border-slate-200">
                                        <td className="p-3 border border-slate-300">{dateFormatter.format(new Date(expense.date))}</td>
                                        <td className="p-3 border border-slate-300">{currencyFormatter.format(expense.amount)}</td>
                                        <td className="p-3 border border-slate-300">{expense.description}</td>
                                        <td className="p-3 border border-slate-300">{expense.category}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-500 py-4">{t('supplierReport.noExpenses')}</p>
                    )}
                </section>
            </div>
        );

        openPrintWindow(`${t('supplierReport.title')} - ${supplier.name}`, printContent);
    };

    return (
        <div className="space-y-6 p-6 bg-slate-50 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reports.supplierReports')}</h1>
                        <p className="text-slate-600">{t('reports.supplierReportsSubtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="supplier-search" className="block text-sm font-medium text-slate-700 mb-2">
                            {t('reports.searchSuppliers')}
                        </label>
                        <input
                            type="text"
                            id="supplier-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('reports.searchByNameOrContact')}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Supplier List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">{t('reports.supplierList')}</h2>
                <div className="space-y-4">
                    {supplierSummaries.map(({ supplier, totalPurchases, totalExpenses, totalValue, itemCount, expenseCount, lastPurchase }) => (
                        <div key={supplier.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-800">{supplier.name}</h3>
                                    <p className="text-sm text-slate-600">{supplier.contactPerson} | {supplier.phone}</p>
                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500">{t('reports.totalPurchases')}:</span>
                                            <span className="font-semibold text-slate-800 ml-1">{currencyFormatter.format(totalPurchases)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">{t('reports.totalExpenses')}:</span>
                                            <span className="font-semibold text-red-600 ml-1">{currencyFormatter.format(totalExpenses)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">{t('reports.totalValue')}:</span>
                                            <span className="font-semibold text-blue-600 ml-1">{currencyFormatter.format(totalValue)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">{t('reports.itemCount')}:</span>
                                            <span className="font-semibold text-slate-800 ml-1">{itemCount}</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        {t('reports.expenseCount')}: {expenseCount}
                                        {lastPurchase && (
                                            <span className="mr-4">
                                                {t('reports.lastPurchase')}: {dateFormatter.format(lastPurchase)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedSupplier(supplier)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        {t('reports.viewDetails')}
                                    </button>
                                    <button
                                        onClick={() => handlePrintSupplierReport(supplier)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                        🖨️ {t('reports.printReport')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {supplierSummaries.length === 0 && (
                    <p className="text-center text-slate-500 py-8">{t('reports.noSuppliersFound')}</p>
                )}
            </div>

            {/* Supplier Details Modal */}
            {selectedSupplier && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-700">{selectedSupplier.name}</h2>
                            <button
                                onClick={() => setSelectedSupplier(null)}
                                className="p-1 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-slate-700 mb-2">{t('supplierDetails.contactInfo')}</h3>
                                        <div className="space-y-1">
                                            <p className="text-sm text-slate-600">{t('supplierDetails.contactPerson')}: <span className="font-semibold">{selectedSupplier.contactPerson}</span></p>
                                            <p className="text-sm text-slate-600">{t('supplierDetails.phone')}: <span className="font-semibold">{selectedSupplier.phone}</span></p>
                                            <p className="text-sm text-slate-600">{t('supplierDetails.email')}: <span className="font-semibold">{selectedSupplier.email || t('common.na')}</span></p>

                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-slate-700 mb-2">{t('supplierDetails.financialSummary')}</h3>
                                        {(() => {
                                            const supplierItems = inventoryItems.filter(item => item.supplierId === selectedSupplier.id);
                                            const supplierExpenses = expenses.filter(exp => exp.supplierId === selectedSupplier.id);
                                            const totalPurchases = supplierItems.reduce((sum, item) => sum + (item.unitCost * item.currentStock), 0);
                                            const totalExpenses = supplierExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                                            const totalValue = totalPurchases + totalExpenses;

                                            return (
                                                <div className="space-y-1">
                                                    <p className="text-sm text-slate-600">{t('supplierDetails.totalPurchases')}: <span className="font-semibold text-slate-800">{currencyFormatter.format(totalPurchases)}</span></p>
                                                    <p className="text-sm text-slate-600">{t('supplierDetails.totalExpenses')}: <span className="font-semibold text-red-600">{currencyFormatter.format(totalExpenses)}</span></p>
                                                    <p className="text-sm text-slate-600">{t('supplierDetails.totalValue')}: <span className="font-semibold text-blue-600">{currencyFormatter.format(totalValue)}</span></p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">{t('supplierDetails.inventoryItems')}</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                        {(() => {
                                            const supplierItems = inventoryItems.filter(item => item.supplierId === selectedSupplier.id);
                                            return supplierItems.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {supplierItems.map(item => (
                                                        <li key={item.id} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                                                            <div>
                                                                <span className="font-semibold">{item.name}</span>

                                                            </div>
                                                            <div className="text-left">
                                                                <span className="font-semibold">{currencyFormatter.format(item.unitCost)}</span>
                                                                <span className="text-sm text-slate-600 ml-2">x{item.currentStock}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-slate-500 text-center py-4">{t('supplierDetails.noItemsFound')}</p>;
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">{t('supplierDetails.expenses')}</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                        {(() => {
                                            const supplierExpenses = expenses.filter(exp => exp.supplierId === selectedSupplier.id);
                                            return supplierExpenses.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {supplierExpenses.map(expense => (
                                                        <li key={expense.id} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                                                            <div>
                                                                <span className="font-semibold">{expense.description}</span>
                                                                <span className="text-sm text-slate-600 ml-2">({dateFormatter.format(new Date(expense.date))})</span>
                                                                <span className="text-xs text-slate-500 block">{expense.category}</span>
                                                            </div>
                                                            <span className="font-semibold text-red-600">{currencyFormatter.format(expense.amount)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-slate-500 text-center py-4">{t('supplierDetails.noExpensesFound')}</p>;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierReportPage;

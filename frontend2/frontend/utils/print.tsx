import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from '../contexts/I18nContext';
import { AuthProvider } from '../contexts/AuthContext';

export const openPrintWindow = (title: string, component: React.ReactElement) => {
    const printWindow = window.open('', '_blank', 'height=800,width=1000');
    if (!printWindow) {
        alert('Please allow popups for this website to print reports.');
        return;
    }

    printWindow.document.title = title;

    // Copy all link and style tags from the main document to the new window
    const headContent = document.head.innerHTML;
    printWindow.document.head.innerHTML = headContent;

    // Set body properties
    printWindow.document.body.className = "font-sans antialiased bg-white";
    printWindow.document.documentElement.dir = document.documentElement.dir;
    printWindow.document.documentElement.lang = document.documentElement.lang;

    // Create a root element in the new window
    const printRoot = printWindow.document.createElement('div');
    printRoot.id = 'print-root';
    printWindow.document.body.appendChild(printRoot);

    const root = ReactDOM.createRoot(printRoot);

    // The component might need contexts. Wrap it with the necessary providers.
    root.render(
        <React.StrictMode>
            <AuthProvider>
                <I18nProvider>
                    {component}
                </I18nProvider>
            </AuthProvider>
        </React.StrictMode>
    );

    // Wait for the content to render before printing
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 500); // A small delay to allow rendering and styles to apply
};


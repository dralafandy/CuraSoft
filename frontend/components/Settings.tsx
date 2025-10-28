import React, { useRef } from 'react';
import { ClinicData } from '../hooks/useClinicData';
import { useI18n } from '../hooks/useI18n';
import { useNotification } from '../contexts/NotificationContext';
import { NotificationType } from '../types';

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>;


const Settings: React.FC<{ clinicData: ClinicData }> = ({ clinicData }) => {
    const { t } = useI18n();
    const { addNotification } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { restoreData, ...dataToBackup } = clinicData;

    const handleBackup = () => {
        try {
            const dataStr = JSON.stringify(dataToBackup, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `curasoft-backup-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addNotification(t('notifications.backupSuccess'), NotificationType.SUCCESS);
        } catch (error) {
            console.error("Backup failed:", error);
            addNotification(t('notifications.backupError'), NotificationType.ERROR);
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (window.confirm(t('settings.restore.confirm'))) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const restoredData = JSON.parse(text);
                        restoreData(restoredData);
                        addNotification(t('notifications.restoreSuccess'), NotificationType.SUCCESS);
                    }
                } catch (error) {
                    console.error("Restore failed:", error);
                    addNotification(t('notifications.restoreError'), NotificationType.ERROR);
                }
            };
            reader.readAsText(file);
        }
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClearData = () => {
        if (window.confirm(t('settings.clear.confirm'))) {
            try {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('curasoft_')) {
                        localStorage.removeItem(key);
                    }
                });
                addNotification(t('settings.clear.success'), NotificationType.SUCCESS);
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error("Failed to clear data:", error);
                addNotification(t('settings.clear.error'), NotificationType.ERROR);
            }
        }
    };


    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-8 max-w-4xl mx-auto">
            {/* Backup Section */}
            <div>
                <h3 className="text-lg font-bold text-slate-700">{t('settings.backup.title')}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">{t('settings.backup.description')}</p>
                <button
                    onClick={handleBackup}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-light"
                >
                    <DownloadIcon /> {t('settings.backup.button')}
                </button>
            </div>

            {/* Restore Section */}
            <div className="border-t pt-8">
                <h3 className="text-lg font-bold text-slate-700">{t('settings.restore.title')}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-2">{t('settings.restore.description')}</p>
                <p className="text-sm text-red-600 font-semibold mb-4">{t('settings.restore.warning')}</p>
                <button
                    onClick={handleRestoreClick}
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                    <UploadIcon /> {t('settings.restore.button')}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
            </div>

             {/* Danger Zone */}
            <div className="border-t pt-8">
                <h3 className="text-lg font-bold text-red-600">{t('settings.dangerZone.title')}</h3>
                <p className="text-sm text-slate-500 mb-4">{t('settings.dangerZone.description')}</p>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h4 className="font-semibold text-red-800">{t('settings.clear.title')}</h4>
                        <p className="text-sm text-red-700">{t('settings.clear.description')}</p>
                    </div>
                    <button
                        onClick={handleClearData}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex-shrink-0"
                    >
                        {t('settings.clear.button')}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Settings;

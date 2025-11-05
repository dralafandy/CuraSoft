import React from 'react';
import { ClinicData } from '../../hooks/useClinicData';
import { Patient, TreatmentRecord } from '../../types';
import { useI18n } from '../../hooks/useI18n';

const TreatmentRecordList: React.FC<{
    patient: Patient;
    clinicData: ClinicData;
    onUpdateTreatmentRecord: (patientId: string, record: TreatmentRecord) => void;
}> = ({ patient, clinicData, onUpdateTreatmentRecord }) => {
    const { t, locale } = useI18n();
    const { dentists, treatmentDefinitions, inventoryItems } = clinicData;

    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' });

    const recordsForPatient = clinicData.treatmentRecords
        .filter(r => r.patientId === patient.id)
        .sort((a, b) => new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime());

    if (recordsForPatient.length === 0) {
        return <p className="text-center text-slate-500 py-10">{t('treatmentRecordList.noRecords')}</p>;
    }

    return (
        <div className="space-y-4">
            {recordsForPatient.map(record => {
                const dentist = dentists.find(d => d.id === record.dentistId);
                const treatmentDef = treatmentDefinitions.find(td => td.id === record.treatmentDefinitionId);

                return (
                    <div key={record.id} className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">{treatmentDef?.name || t('common.unknownTreatment')}</h4>
                                <p className="text-sm text-slate-600">{dentist?.name || t('common.unknownDentist')} - {dateFormatter.format(new Date(record.treatmentDate))}</p>
                            </div>
                            <span className="font-bold text-xl text-primary">{currencyFormatter.format(record.totalTreatmentCost)}</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">{record.notes || t('treatmentRecordList.noNotes')}</p>

                        {record.inventoryItemsUsed.length > 0 && (
                            <div className="mt-3 p-3 bg-neutral rounded-lg">
                                <p className="font-semibold text-sm text-slate-700 mb-1">{t('treatmentRecordList.materialsUsed')}:</p>
                                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                                    {record.inventoryItemsUsed.map((item, index) => {
                                        const material = inventoryItems.find(lm => lm.id === item.inventoryItemId);
                                        return (
                                            <li key={index}>
                                                {material?.name || t('common.unknownMaterial')} x {item.quantity} ({currencyFormatter.format(item.cost)})
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end items-center mt-4 text-sm font-medium">
                            <p className="text-blue-700 me-4">{t('addTreatmentRecord.doctorShare')}: <strong className="text-base">{currencyFormatter.format(record.doctorShare)}</strong></p>
                            <p className="text-green-700">{t('addTreatmentRecord.clinicShare')}: <strong className="text-base">{currencyFormatter.format(record.clinicShare)}</strong></p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TreatmentRecordList;
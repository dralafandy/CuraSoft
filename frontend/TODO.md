# TODO: Fix Reports Page Buttons and Add Arabic Translations

## 1. Update Reports.tsx
- Add state for selected report type (e.g., 'patient', 'doctor', 'supplier')
- Add onClick handlers to buttons to set the selected report
- Import and conditionally render PatientReportPage, DoctorReportPage, SupplierReportPage based on selected report
- Add a back button to return to report selection

## 2. Add Missing Arabic Translations to ar.ts
- Add all patient report keys (e.g., 'patientReport.summary', 'patientReport.totalRevenue', etc.)
- Add all doctor report keys (e.g., 'doctorReport.title', 'doctorReport.summary', etc.)
- Add all supplier report keys (e.g., 'supplierReport.title', 'supplierReport.summary', etc.)
- Add report description keys (e.g., 'reports.patientReportsDesc', 'reports.doctorReportsDesc', etc.)
- Add any other missing keys from the report components

## 3. Update Report Components for Full Translation
- Ensure PatientReportPage.tsx uses t() for all hardcoded strings
- Ensure DoctorReportPage.tsx uses t() for all hardcoded strings
- Ensure SupplierReportPage.tsx uses t() for all hardcoded strings
- Replace any remaining Arabic text with translation keys

## 4. Test Functionality
- Verify buttons in Reports.tsx navigate to correct report pages
- Verify all text displays in Arabic when locale is 'ar'
- Check print functionality still works

# TODO: Enhance Reports Pages

## Information Gathered
- Current Reports.tsx has complex tabs (overview, financial, patients, doctors) with interactive dashboards
- Need to simplify main Reports page to focus on financial summaries with date filtering (daily, monthly, custom range)
- Create separate dedicated report pages for patient, doctor, and supplier details
- Use useFinancialCalculations hook for accurate financial calculations
- Maintain RTL layout, Arabic localization, print functionality, charts, and EGP currency formatting
- Existing components: PatientFullReport.tsx, DoctorList.tsx with financial details, SuppliersManagement.tsx

## Plan
1. ✅ Update TODO.md with new tasks for reports enhancement
2. ✅ Modify components/Reports.tsx to be a simplified financial dashboard with date filters
3. ✅ Create components/reports/PatientReportPage.tsx for detailed patient reports
4. ✅ Create components/reports/DoctorReportPage.tsx for detailed doctor reports
5. ✅ Create components/reports/SupplierReportPage.tsx for detailed supplier reports
6. ✅ Update navigation/routing in App.tsx to include new report pages
7. ✅ Test financial calculations and date filtering functionality
8. ✅ Ensure print functionality works for all report types

## Dependent Files to be Edited
- TODO.md: Update with new tasks
- components/Reports.tsx: Simplify to financial dashboard with date filters
- components/reports/PatientReportPage.tsx: New file for detailed patient reports
- components/reports/DoctorReportPage.tsx: New file for detailed doctor reports
- components/reports/SupplierReportPage.tsx: New file for detailed supplier reports
- App.tsx: Update routing to include new report pages

## Followup Steps
- Test date filtering (daily, monthly, custom range)
- Verify financial calculations accuracy using useFinancialCalculations hook
- Test print functionality for all report types
- Ensure RTL layout and Arabic localization work properly
- Check responsive design and charts rendering

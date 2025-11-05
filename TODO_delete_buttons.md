# إضافة أزرار الحذف في جميع نوافذ الإدارة

## المكونات المطلوب تعديلها:
- [x] ExpensesManagement.tsx
- [x] TreatmentDefinitionManagement.tsx
- [ ] SuppliersManagement.tsx
- [ ] InventoryManagement.tsx
- [ ] LabCaseManagement.tsx

## المهام لكل مكون:
1. إضافة أيقونة حذف (DeleteIcon)
2. إضافة زر حذف بجانب زر التعديل
3. إضافة وظيفة حذف مع تأكيد
4. استخدام وظيفة الحذف المناسبة من clinicData
5. إضافة رسالة تأكيد قبل الحذف

## الخطوات:
1. إضافة DeleteIcon في كل مكون
2. إضافة زر الحذف في واجهة المستخدم
3. إضافة وظيفة handleDelete مع window.confirm
4. ربط الزر بوظيفة الحذف المناسبة

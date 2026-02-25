

## ניתוח ממצאי האבטחה

בדקתי את מצב האבטחה בפועל במסד הנתונים. הנה מה שמצאתי:

### ממצא 1: "Client Contact Information and IP Addresses Exposed to Public" (approvals)
**המצב בפועל: הטבלה מאובטחת.** RLS מופעל, ומדיניות SELECT מוגבלת ל-`authenticated` בלבד — משתמשים אנונימיים לא יכולים לגשת. המדיניות גם מגבילה גישה רק לבעל הזמנת השינוי.

### ממצא 2: "User Phone Numbers and Company Data Could Be Stolen" (profiles)
**המצב בפועל: הטבלה מאובטחת.** RLS מופעל, ומדיניות SELECT מוגבלת ל-`authenticated` בלבד עם `user_id = auth.uid()` — כל משתמש רואה רק את הפרופיל שלו.

### בעיה אמיתית שנמצאה: טבלת `files`
הפוליסות בטבלת `files` משתמשות ב-role `public` (במקום `authenticated`), מה שאומר שהן חלות גם על משתמשים אנונימיים. אמנם הבדיקות עדיין דורשות `auth.uid()` (שיחזיר null לאנונימיים), אבל עדיף להגביל במפורש ל-`authenticated`.

### תוכנית התיקון

1. **עדכון סריקת האבטחה** — הממצאים מסומנים כ-outdated. הפעלת סריקה מחדש תעדכן את התוצאות ותסיר את השגיאות הלא רלוונטיות.

2. **תיקון טבלת `files`** — שינוי שלוש הפוליסות מ-`public` ל-`authenticated`:
   - `Project members can view files` — SELECT
   - `Project members can insert files` — INSERT  
   - `Owner or admin can delete files` — DELETE

### פרטים טכניים

```sql
-- Drop and recreate files policies with authenticated role
DROP POLICY "Project members can view files" ON public.files;
CREATE POLICY "Project members can view files" ON public.files
  FOR SELECT TO authenticated
  USING (is_project_member(auth.uid(), project_id));

DROP POLICY "Project members can insert files" ON public.files;
CREATE POLICY "Project members can insert files" ON public.files
  FOR INSERT TO authenticated
  WITH CHECK ((owner_user_id = auth.uid()) AND is_project_member(auth.uid(), project_id));

DROP POLICY "Owner or admin can delete files" ON public.files;
CREATE POLICY "Owner or admin can delete files" ON public.files
  FOR DELETE TO authenticated
  USING ((owner_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
```

3. **סימון ממצאים** — לאחר הסריקה המחודשת, אם הממצאים עדיין מופיעים, נסמן אותם כלא רלוונטיים כי הטבלאות כבר מאובטחות כראוי.


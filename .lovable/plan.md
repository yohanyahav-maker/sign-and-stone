
# החזרת הגנת ההתחברות ב-ProtectedRoute

## מה ישתנה
קובץ אחד בלבד: `src/components/auth/ProtectedRoute.tsx`

## מה יקרה
- הקומפוננטה תבדוק אם יש משתמש מחובר (session)
- אם כן — תציג את הדף המבוקש
- אם לא — תפנה אוטומטית לדף `/login`
- בזמן הטעינה (בדיקת session) יוצג אייקון טעינה

## מה נשאר פתוח לכולם
- דף נחיתה (`/`)
- דף התחברות (`/login`)
- פורטל לקוח (`/portal/:token`)

## פרטים טכניים

**קובץ: `src/components/auth/ProtectedRoute.tsx`**

נחזיר את הלוגיקה המקורית:
- שימוש ב-`useAuth()` לקבלת `session` ו-`loading`
- אם `loading` — מציגים spinner
- אם אין `session` — מפנים ל-`/login` באמצעות `Navigate`
- אם יש `session` — מציגים את `children`

שינוי יחיד, קובץ אחד, בלי שינויים בשום דף אחר.

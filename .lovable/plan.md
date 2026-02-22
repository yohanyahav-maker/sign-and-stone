

# תיקון חוויית ההתחברות

## הבעיה
אין עדיין משתמשים במערכת. הטופס מתחיל במצב "כניסה" ולכן מקבלים שגיאה "Invalid login credentials" — כי אין חשבון להיכנס אליו.

## הפתרון
שינוי קטן בקובץ `src/components/auth/EmailAuthForm.tsx`:
- הטופס יתחיל במצב **"הרשמה"** במקום "כניסה" (שינוי `useState(false)` ל-`useState(true)`)
- כך המשתמש הראשון יוכל ליצור חשבון ישר ולהיכנס

## פרטים טכניים

**קובץ: `src/components/auth/EmailAuthForm.tsx`**
- שורה 10: שינוי `useState(false)` ל-`useState(true)` בשביל `isSignUp`

שינוי של שורה אחת בלבד.

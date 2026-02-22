

# בדיקת End-to-End ותיקונים לפרסום

## בעיות שנמצאו

### 1. נתיבים (Routes) חסרים - קריטי
דפי שינויים קיימים בקוד אך לא מחוברים לניתוב (Router):
- `ChangeOrderDetail` - דף פרטי שינוי (`/projects/:projectId/changes/:changeId`)
- `NewChange` - דף יצירת שינוי חדש (`/projects/:projectId/changes/new`)
- `SendChange` - דף שליחת שינוי (`/projects/:projectId/changes/:changeId/send`)

**השפעה**: לחיצה על כרטיס שינוי מובילה לדף 404. לא ניתן ליצור או לשלוח שינויים.

### 2. כפתור FAB בדף פרויקט - בעיה לוגית
הכפתור `+` בדף פרטי פרויקט מוביל לעריכת פרויקט במקום ליצירת שינוי חדש. צריך להוביל ליצירת שינוי חדש, ולהוסיף כפתור עריכה נפרד.

### 3. באג בדף הגדרות - `useState` במקום `useEffect`
בשורה 33 של `Settings.tsx` נעשה שימוש ב-`useState` כאילו הוא `useEffect` לסנכרון נתוני פרופיל. זה לא עובד כמצופה - השדות נשארים ריקים גם כשהפרופיל נטען.

### 4. חוסר `dir="rtl"` בדפים
- `ProjectDetail.tsx` - החלק של הנתונים האמיתיים (לא דמו) חסר `dir="rtl"`
- `Settings.tsx` - חסר `dir="rtl"` בדף

### 5. אזהרת DialogContent
אזהרת `Missing Description` ב-console עבור `DialogContent` - צריך להוסיף `aria-describedby` או `DialogDescription` לרכיבי Sheet/Dialog.

---

## תוכנית תיקון

### שלב 1: הוספת נתיבים חסרים ב-`App.tsx`
הוספת שלושה נתיבים חדשים תחת ProtectedRoute:
- `/projects/:projectId/changes/new` -> `NewChange`
- `/projects/:projectId/changes/:changeId` -> `ChangeOrderDetail`
- `/projects/:projectId/changes/:changeId/send` -> `SendChange`

### שלב 2: תיקון כפתור FAB בדף פרויקט
- שינוי הכפתור `+` כך שיוביל ליצירת שינוי חדש (`/projects/:id/changes/new`)
- הוספת כפתור עריכה נפרד (אייקון עיפרון) שיוביל לעריכת פרויקט

### שלב 3: תיקון באג useState בהגדרות
- החלפת `useState(() => {...})` בשורה 33 ל-`useEffect` עם dependency על `profile`

### שלב 4: הוספת `dir="rtl"` לדפים
- הוספת `dir="rtl"` ל-div הראשי של ProjectDetail (מצב נתונים אמיתיים)
- הוספת `dir="rtl"` ל-div הראשי של Settings

### שלב 5: תיקון אזהרת DialogContent
- הוספת `aria-describedby={undefined}` ל-`SheetContent` ב-`NewProjectSheet`

### שלב 6: בדיקה סופית
- ניווט בכל הדפים ובדיקה שהכל עובד

---

## פרטים טכניים

```text
קבצים שישתנו:
1. src/App.tsx - הוספת 3 routes + imports
2. src/pages/ProjectDetail.tsx - תיקון FAB + dir="rtl"
3. src/pages/Settings.tsx - תיקון useState -> useEffect + dir="rtl"
4. src/components/projects/NewProjectSheet.tsx - aria-describedby
```


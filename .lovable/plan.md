

# תוכנית פיתוח — "שינוי חתום" MVP

## סקירה כללית
פלטפורמת SaaS בעברית (RTL) לקבלני בנייה בישראל לניהול שינויי חוזה (Change Orders). קבלן יוצר שינוי, מתמחר, שולח ללקוח בוואטסאפ, הלקוח חותם דיגיטלית, ונוצר PDF חתום.

---

## שלב 1 — Design System + שלד האפליקציה
- הגדרת פלטת צבעים: Ink (#0A0A0A), Amber (#C9873A), Paper (#FAFAF8) + צבעי סטטוס
- פונט Heebo בלבד, RTL על html, כל הטיפוגרפיה לפי המפרט
- רכיבי UI בסיסיים: כפתורים (Primary/Secondary/Danger/Success/Ghost), Status Badges, Cards, Inputs עם שגיאות inline
- Mobile-first: min touch 44×44px, safe-area padding
- Layout shell עם ניווט בסיסי

## שלב 2 — Supabase Schema + RLS + Auth
- יצירת טבלאות: users, subscriptions, projects, change_orders, attachments, approvals, audit_log + user_roles
- הגדרת CHECK constraints לכל enum (סטטוסים, קטגוריות, סוגי פרויקט)
- RLS policies: קבלן רואה רק את הפרויקטים/שינויים שלו, audit_log append-only via service role
- Supabase Auth עם OTP (SMS) — ללא סיסמאות
- Storage buckets: attachments (private), pdfs (private), logos (public), contracts (private)

## שלב 3 — מסך Login OTP
- Phase A: הזנת טלפון (שדה tel, autofocus, ולידציה 9-10 ספרות, CTA disabled עד תקין)
- Phase B: 6 תיבות OTP נפרדות, תמיכת paste מלאה, auto-submit אחרי ספרה 6
- שלח שוב אחרי 30 שניות (countdown), חסימה אחרי 3 כשלונות
- שגיאות inline בלבד, לא toast

## שלב 4 — רשימת פרויקטים + יצירת פרויקט חדש
- מסך ברכה אישי עם מונה שינויים ממתינים
- Subscription Banner מותנה (TRIAL/PAST_DUE/CANCELED)
- כרטיסי פרויקט עם badges: ⏳ ממתינים (amber), ✓ סכום מאושר (green)
- FAB ליצירת פרויקט חדש
- טופס פרויקט: שם, כתובת, סוג (dropdown), toggle פורטל לקוח + שדות לקוח מותנים
- Empty state מעוצב
- אכיפת PLAN_LIMIT עם הודעה ו-CTA לשדרוג

## שלב 5 — יצירת שינוי (2 שלבים) + State Machine
- **שלב 1 — פרטים**: כותרת, קטגוריה (10 אפשרויות), תיאור, העלאת מדיה (תמונה/וידאו/PDF) עם preview
- **שלב 2 — תמחור**: שדה מחיר ₪ (40px, bold), toggle מע"מ עם חישוב real-time, ימי השפעה (+/-)
- CTAs: "המשך לתמחור", "שמור טיוטה", "שלח לאישור"
- State Machine קשיח: DRAFT→PRICED→SENT→APPROVED/REJECTED/CANCELED
- Terminal states חוסמים כל עדכון (403)
- כתיבת AuditLog לכל שינוי מצב

## שלב 6 — מסך אישור שליחה + WhatsApp
- Summary Card עם כל פרטי השינוי
- CTA "שלח בוואטסאפ" — wa.me deep link עם תבנית הודעה מוכנה
- "העתק קישור" כ-fallback
- יצירת טוקן פורטל חד-פעמי (32 תווים, hash + expiry 7 ימים)
- סטטוס → SENT, audit log נרשם

## שלב 7 — פורטל לקוח (/portal/{token})
- דף ציבורי ללא auth, מבוסס טוקן חד-פעמי
- מחיר גדול במרכז (42px, 900w) כ-decision point
- ימי השפעה בכתום, תיאור, טקסט משפטי
- שדה שם מלא + checkbox הסכמה → CTA "חתום ואשר" (ירוק, disabled עד מילוי)
- כפתור "דחה שינוי" → modal עם textarea לסיבה
- מסך הצלחה/דחייה, מסך "כבר טופל", מסך "קישור פג תוקף"
- Invalidation של טוקן אחרי שימוש
- Footer עם לוגו קבלן + "מופעל ע"י שינוי חתום"

## שלב 8 — מסך פרטי שינוי + היסטוריה
- Header עם badge סטטוס + כותרת + קטגוריה
- כרטיסי סטטיסטיקה: מחיר + ימים
- תיאור מלא + גלריית מדיה עם lightbox
- Timeline היסטוריה: נוצר → נשלח → אושר/נדחה
- כפתורי פעולה לפי סטטוס (ערוך, בטל, שכפל, הפק PDF, שלח שוב)

## שלב 9 — Edge Functions (Backend)
- **update-status**: ולידציית State Machine + AuditLog
- **generate-portal-token**: יצירת טוקן חד-פעמי עם hash + expiry
- **client-approve / client-reject**: ולידציית טוקן, יצירת Approval, עדכון סטטוס, שליחת מייל
- **generate-pdf**: הפקת PDF server-side עם פרטי השינוי, חתימה, ושמירה ב-Storage
- **stripe-webhook**: טיפול באירועי Stripe ועדכון subscriptions + AuditLog

## שלב 10 — Stripe (מנויים)
- הגדרת מוצרים: BASIC (₪149/חודש), PRO (₪349/חודש)
- Stripe Checkout hosted page (ILS, locale he-IL)
- Stripe Customer Portal לניהול עצמאי
- Webhook handler לעדכון סטטוס מנוי
- Trial 14 יום ללא כרטיס אשראי
- אכיפת מגבלות תוכנית (project_limit, monthly_change_limit)

## שלב 11 — אימיילים טרנזקציוניים (Resend)
- Edge Function לשליחת מיילים דרך Resend API
- תבניות: ברוך הבא, שינוי אושר (עם PDF מצורף), שינוי נדחה (עם סיבה), תשלום נכשל, סיום Trial

## שלב 12 — דף נחיתה
- Nav + Hero עם headline ו-CTA "התחל ניסיון חינם 14 יום"
- סקשנים: כאבים, איך זה עובד (3 צעדים), פיצ'רים, עדויות, תמחור (BASIC vs PRO)
- CTA סופי עם שדה טלפון
- RTL, Heebo, פלטת Ink+Amber+Paper, mobile responsive


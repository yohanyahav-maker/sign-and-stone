
# תוכנית מסכים — סטטוס

## בוצע ✅

1. **מיגרציות DB** — `business_name` ב-profiles, `client_phone_2` ב-projects
2. **SocialFooter** — קומפוננטה חדשה עם email, Instagram, TikTok
3. **Login** — "ברוכים הבאים!", אייקוני שדות, Facebook כפתור, SocialFooter
4. **Projects** — כותרת "פרויקטים" + כתר Pro, FAB כחול, SocialFooter
5. **ProjectDetail** — גריד כפתורי פעולה 2x4 + WhatsApp/טלפון/אימייל
6. **Settings** — "פרופיל" + שדה business_name + SocialFooter
7. **EditProject** — "פרטי לקוח" + טלפון 2 + פורטל toggle + 3 נקודות עם מחיקה

## זרימת ניווט

```
Login ──→ Projects ──→ ProjectDetail ──→ NewChange (wizard)
                │           │                    └→ ChangeDetail → SendChange
                │           │
                │           ├→ EditProject (פרטי לקוח)
                │           ├→ WhatsApp / Phone / Email (חיצוני)
                │           ├→ Gallery (inline)
                │           └→ Upload (file picker / camera / video)
                │
                └→ Settings (פרופיל)
```

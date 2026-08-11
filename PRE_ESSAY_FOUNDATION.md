# TA’LIMOT v18 — Pre-essay foundation

This version completes the next platform foundation before the teacher/essay module:

- Admin → Kurslar va kitoblar enabled.
- Database-backed catalog override layer for books and courses.
- Create/edit/publish/archive, sale price, sale deadline, cover path and product details.
- Public /kitoblar and /kurslar use database-backed catalog.
- Product detail and purchase pages use the same backend catalog and current admin prices.
- Home course/book showcases and promotion banner refresh from backend catalog.
- Profile identity loads from the real users table; name fields update the database.
- Verified phone and Telegram username are read-only in profile.
- Global animated TA’LIMOT loading screen added.
- Drawer’s redundant TA’LIMOT label removed.

Before deployment, run CATALOG_FOUNDATION.sql once in Supabase SQL Editor.

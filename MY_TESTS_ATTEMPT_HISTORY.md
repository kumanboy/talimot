# TA’LIMOT — Mening testlarim + urinishlar tarixi

## Qo‘shilgan imkoniyatlar

- Yangi `/mening-testlarim` sahifasi.
- Premium sotib olingan testlar avtomatik ravishda foydalanuvchi kutubxonasida ko‘rinadi.
- Bepul test ishlangan bo‘lsa, u ham tarixda ko‘rinadi.
- Har bir test uchun:
  - sotib olingan holati;
  - Tanga narxi;
  - urinishlar soni;
  - birinchi urinish;
  - oxirgi urinish;
  - eng yaxshi urinish;
  - urinishlar tarixi;
  - qayta ishlash tugmasi.
- Diagnostika urinishlarida daraja va DB sertifikat ma’lumotlari ko‘rsatiladi.
- Yangi `/mening-testlarim/urinish/[attemptId]` sahifasi DB’dagi saqlangan urinish xulosasini ko‘rsatadi.
- HomeDrawer ichiga `Mening testlarim` qo‘shildi.
- Profil ichiga `Mening testlarim` tezkor kartasi qo‘shildi.
- Mobile Navigation’da `/mening-testlarim` `Natijalar` bo‘limi sifatida aktiv ko‘rinadi.

## Database

Yangi SQL kerak emas.

Feature mavjud jadvallardan foydalanadi:

- `test_purchases`
- `student_test_attempts`
- `admin_test_drafts`
- `diagnostic_certificates`

## Muhim arxitektura

`Mening testlarim` sahifasidagi tarix serverdan, autentifikatsiya qilingan foydalanuvchining DB yozuvlaridan olinadi. Shu sababli urinish xulosalari boshqa qurilmada ham ko‘rinadi.

Normal topic testlarning eski batafsil javoblari hozircha brauzer localStorage’ida qoladi. Ushbu bosqich DB’da urinish xulosasini (ball, foiz, to‘g‘ri/noto‘g‘ri/javobsiz, vaqt, sana) doimiy saqlaydi va ko‘rsatadi. Savolma-savol `Qayta ishlash / Eslatma` keyingi alohida bosqichda DB answer payload bilan kengaytiriladi.

## Tekshirish

1. Premium test sotib oling.
2. `/mening-testlarim` ni oching — test `Sotib olingan` ko‘rinishi kerak.
3. Testni bir marta ishlang.
4. Sahifani qayta oching — `1 urinish`, birinchi/oxirgi/eng yaxshi natija chiqishi kerak.
5. Yana ishlang — urinishlar soni oshishi kerak.
6. `Urinishlar tarixi` ni ochib, har bir urinishni tekshiring.
7. Boshqa brauzer/qurilmada shu akkauntga kiring — DB tarix ko‘rinishi kerak.
8. Diagnostika urinishida daraja va sertifikat ID saqlanganini tekshiring.

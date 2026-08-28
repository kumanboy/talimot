# TA’LIMOT — all test loaders + course bonus update

## Loader coverage
- `/tests` grammar and Milliy sertifikat category cards now show an inline loader during route navigation.
- Imlo, Uslubiyat, Leksikologiya, Morfologiya and the other topic routes use pending navigation buttons.
- Morfologiya inner routes (Fe’l, Ot, Sifat, Son, Olmosh, Ravish, etc.) show `Bo‘lim ochilmoqda...` while loading.
- Normal test collection `Testni boshlash` buttons show `Test ochilmoqda...`.
- Milliy sertifikat test collection start buttons show a loader; diagnostic cards use `Diagnostika ochilmoqda...`.
- Diagnostic start already shows `Imtihon ochilmoqda...`; diagnostic finish keeps its save loader.
- Active-test exit uses the existing `Chiqilmoqda...` double-click protection.
- Result-page back buttons for national test runners now use pending navigation.
- Purchased test flow keeps a loader visible while the unlocked test route is opening.
- Course/book cover navigation also shows a loader, in addition to the existing detail/purchase button loaders.
- Tanga/course/book payment submission loaders and duplicate-request locks remain preserved.

## Route loading screens
Compact TA’LIMOT route loading states were added for:
- `/tests`
- `/kurslar`
- `/kitoblar`
- `/packages`
- `/natijalar`

These complement button-level loaders when a server-rendered route is still fetching data.

## Milliy sertifikat course bonus
On `/kurslar/milliy-sertifikat`, the previous `KURS DASTURI / Modullar va darslar` block is replaced by a large `BONUS` block with this content:

> Yopiq Telegram guruhiga a’zo bo‘lgan talabgorlarning 20 dan ortiq esselari Sardor Toshmuhammadov tomonidan BMBA ekspertlari nizomi asosida bepul tekshirib beriladi hamda barcha mavzularga mos tushadigan esse shabloni beriladi!

Other course pages keep their original module/program sections.

## Database
No Supabase migration is required for this update.

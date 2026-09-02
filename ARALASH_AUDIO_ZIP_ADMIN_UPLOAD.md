# Aralash test — Audio ZIP Admin upload (v10.7.2)

Milliy sertifikat → Aralash testlarda audio endi **savol darajasida** ishlaydi.

## Naming

Bitta savolda `a)` va `b)` qismlar bo‘lsa ham faqat **bitta audio** yuklanadi:

- `q01.mp3`
- `q02.mp3`
- `q03.mp3`
- ...

Milliy sertifikatdagi real raqamlar bilan ishlaganda:

- 33-savol → `q33.mp3`
- 34-savol → `q34.mp3`
- 35-savol → `q35.mp3`
- 39-savol → `q39.mp3`
- 40-savol → `q40.mp3`
- 41-savol → `q41.mp3`
- 42-savol → `q42.mp3`
- 43-savol → `q43.mp3`
- 44-savol → `q44.mp3`

`q40-a.mp3`, `q40-b.mp3` kabi part-level nomlar endi yangi Aralash importda ishlatilmaydi.

MP3, M4A va WAV qo‘llab-quvvatlanadi.

## Admin behavior

- Matching 33–35: har item o‘z real source question raqami bo‘yicha bitta audio oladi.
- Short-answer savollar: savol uchun bitta audio.
- Multipart savollar: a/b/c qismlar qancha bo‘lishidan qat’i nazar, savol uchun bitta audio.
- Multipart editor ichida audio uploader partlarda emas, butun savolda bir marta ko‘rinadi.

## Student result

- Har bir a/b qismda `Sizning javobingiz` va `Platformadagi to‘g‘ri javob` ko‘rsatiladi.
- Audio barcha qismlarning pastida bir marta chiqadi.
- Eski published multipart testda faqat part-level audio qolgan bo‘lsa, first legacy audio fallback sifatida ishlaydi.

## Q44 b

- `b)` qism `manual-review`.
- Platforma uni avtomatik to‘g‘ri/noto‘g‘ri deb baholamaydi.
- Avtomatik ball og‘irligi 0.
- Foydalanuvchi erkin javob yozishi mumkin.
- `a)` qism odatdagidek avtomatik tekshiriladi.

No SQL changes are required.

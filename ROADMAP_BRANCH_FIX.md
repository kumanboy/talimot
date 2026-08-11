# Roadmap onboarding branch fix

- `Ha, topshirganman` -> persisted as `boost` -> renders `BoostFullRoadmap`.
- `Yo‘q, birinchi marta topshiraman` -> persisted as `from-zero` -> renders `FromZeroFullRoadmap`.
- Drawer and bottom navigation no longer hard-code `mode=from-zero`.
- The choice is stored in PostgreSQL, so reopening the Mini App keeps the correct roadmap.
- Real roadmap scores still come from `student_test_attempts`; this change only chooses the correct roadmap component.

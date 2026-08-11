# TA’LIMOT — Notifications + Real Roadmap

## Notifications
- Home bell button now opens an in-app notification center.
- Notifications are stored per user in PostgreSQL.
- Payment confirmation/rejection creates in-app notifications.
- Manual Tanga adjustments create in-app notifications.
- Read/unread and “mark all read” are supported.
- This foundation is ready for future teacher essay-review notifications.

## Roadmap
- Completed test attempts are persisted to `student_test_attempts`.
- Existing browser/localStorage completed attempts are imported once when roadmap is opened.
- Roadmap scores, weakest topics, mastered topics, attempt counts and latest diagnostic are computed from DB records.
- Previously hard-coded sample scores and fake summary values were removed.
- Essay-linked roadmap nodes remain locked until the real essay module is connected.

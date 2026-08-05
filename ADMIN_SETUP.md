# TA’LIMOT admin access setup

1. Copy the values from `.env.admin.example` into your local `.env.local`.
2. Replace both placeholder values.
3. Restart the development server.
4. Open `/admin/login` on a laptop or desktop screen.

Example:

```env
ADMIN_ACCESS_CODE=your-private-admin-code
ADMIN_SESSION_SECRET=a-long-random-secret-with-at-least-32-characters
```

Do not commit `.env.local` to Git and do not use `NEXT_PUBLIC_` for either value.

The admin session lasts 8 hours and is stored in an HTTP-only, same-site cookie.

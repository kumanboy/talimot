# TA’LIMOT Telegram registration tutorial update

After a new/unregistered user successfully passes the Telegram subscription check, the bot now:

1. confirms the subscription;
2. sends the registration tutorial video;
3. shows the registration instructions as the video caption;
4. shows the `🚀 TA’LIMOTni ochish` Web App button below the video.

Registered users keep the existing fast access flow and do not receive the tutorial repeatedly.

## Optional production optimization

The bundled optimized video works immediately from:

`/public/telegram/registration-tutorial.mp4`

For faster Telegram delivery later, upload the same video to Telegram once, obtain its reusable `file_id`, and set this optional Vercel environment variable:

`TELEGRAM_ONBOARDING_VIDEO_FILE_ID=<telegram video file_id>`

If this variable is absent, TA’LIMOT automatically falls back to the bundled MP4 URL.

If sending the video fails, the bot falls back to a text message with the same `TA’LIMOTni ochish` button so onboarding is never blocked.

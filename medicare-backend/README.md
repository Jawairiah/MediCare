Medicare Backend (Demo)

Features implemented
- Appointment create/reschedule/cancel endpoints trigger notifications for both patient and doctor.
- In-app notifications are available via `/notifications` and can be marked read.
- Emails are sent to both parties using Nodemailer JSON transport (logs to console). Configure SMTP to send real emails.

Run
1. `npm install`
2. `npm run dev`
3. The server listens on `http://localhost:4000`.

Environment
- Default email transport is `jsonTransport` (prints emails to console).
- To use SMTP, replace the transport in `index.js` with:
```js
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
```

Endpoints
- `POST /auth/signup` → `{ name, email, password, role }` (stores demo user)
- `POST /auth/login` → returns `{ token: email, user }`
- `GET /doctors` → list doctors; filter by `?specialization=`
- `GET /doctors/:id/slots?date=YYYY-MM-DD` → available slots
- `POST /appointments` `{ doctorId, date, start }` → creates appointment; triggers notifications + email
- `PATCH /appointments/:id` `{ date, start }` → reschedules; triggers notifications + email
- `DELETE /appointments/:id` → cancels; triggers notifications + email
- `GET /notifications` → notifications for current user (from `Authorization: Bearer <email>`)
- `PATCH /notifications/:id/read` → mark one notification as read

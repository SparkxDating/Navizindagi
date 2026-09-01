# Navi Zindagi Foundation

Donation and volunteer website for **Navi Zindagi Foundation** flood-relief fundraising (Nepal and Assam).

**Tagline:** Empower. Elevate. Transform.

## Stack

- TanStack Start + React + TypeScript
- Tailwind CSS
- PostgreSQL (Neon in production, embedded PGLite in local preview)
- Better Auth
- Razorpay-ready checkout (sandbox until live keys are set)

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The app listens on `http://localhost:8080`.

## Environment

See [`.env.example`](.env.example). Never put Razorpay secrets in `VITE_*` variables.

```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
DATABASE_URL=
```

Until both Razorpay keys are set, donations stay in labelled sandbox mode and no live payment is taken.

## Admin

Sign in at `/login`. The first account on a new installation is granted admin access. Use the dashboard to edit campaigns, totals, updates, volunteers, enquiries, and NGO settings.

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Homepage and campaign cards |
| `/donate` | Donation form |
| `/campaign/nepal-flood-relief` | Nepal campaign |
| `/campaign/assam-flood-relief` | Assam campaign |
| `/volunteer` | Volunteer registration |
| `/about` | Foundation profile |
| `/transparency` | Utilisation, reports, FAQs |
| `/contact` | Enquiry form |
| `/admin` | Protected dashboard |

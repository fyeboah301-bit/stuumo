# Stuumo — Developer Onboarding

Welcome! This guide gets you from zero to running both apps locally.

## What this is

Stuumo is a worldwide tutoring marketplace. There are **two apps**, in two repos:

| App | Repo | What it is |
|-----|------|-----------|
| Main site | `fyeboah301-bit/stuumo` (this repo) | The public marketplace — teachers, learners, parents, bookings, live sessions. |
| Admin console | `fyeboah301-bit/stuumo-admin` | Internal tool — approve teachers, review docs, payouts, etc. |

**Stack:** React + Vite · Supabase (Postgres + Auth + Storage + Edge Functions) · Paystack (payments) · Resend (email) · Jitsi (video) · Vercel (hosting).

## Prerequisites

- **Node.js 18+** (20 LTS recommended)
- **npm**
- **Git** + a GitHub account that's been added as a collaborator (ask Frank)
- **VS Code** — free from https://code.visualstudio.com (any editor works)

## Run the main app

```bash
git clone https://github.com/fyeboah301-bit/stuumo.git
cd stuumo
npm install
npm run dev
```

Opens at **http://localhost:5173**. The `.env` with the **public** client keys is already in the repo, so it runs out of the box — no key setup needed for frontend work.

Scripts: `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`

## Run the admin app

```bash
git clone https://github.com/fyeboah301-bit/stuumo-admin.git
cd stuumo-admin
npm install
npm run dev
```

Same stack, same Supabase project. Admin access is gated by the `admins` table — ask Frank for an admin login if you need to test it.

## How deploys work

- Both repos are connected to **Vercel**. **Push to `main` → Vercel auto-builds and deploys.** There's no manual deploy step.
- The two apps are **separate Vercel projects** and deploy independently.
- The custom domain (`stuumo.com`) is parked for now — test on the `*.vercel.app` URLs.

## Supabase

- One shared project (`nsywzayljitxfrwfiuoe`); both apps use it.
- **RLS is enabled on every table** and enforced by SQL policies + guard triggers. Don't disable it — it's what keeps users' data private and payments honest.
- Edge functions live in `supabase/functions/` (`verify-payment`, `send-booking-email`). Deploy with the Supabase CLI: `supabase functions deploy <name>` — **editing the file isn't enough**, it must be redeployed.

## Secrets & keys

- The committed `.env` holds only **public** client keys (Supabase URL + anon key, Paystack **public** key) — these ship in the browser bundle anyway, so they're safe.
- **Never commit** a `service_role` key, a Paystack `sk_` secret, or the Resend key. Those live in Supabase/Vercel secrets and aren't needed for local frontend work. Ask Frank if you need them.

## Conventions

- Work on a branch and open a PR, or push small commits to `main` — coordinate with Frank.
- Run `npm run lint` before pushing.
- Keep changes focused; the codebase uses an inline-style design system with brand tokens in `src/styles/colors.js` (royal purple `#6D28D9`).

## Recommended VS Code extensions

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **ES7+ React snippets** (optional)

## Access checklist (ask Frank)

- [ ] GitHub collaborator on `stuumo` **and** `stuumo-admin`
- [ ] Supabase organization member
- [ ] Resend team member (only if touching email)
- [ ] Vercel — usually not needed; pushes to GitHub auto-deploy. (Account is on Hobby, which doesn't support team members; env-var/domain changes go through Frank.)

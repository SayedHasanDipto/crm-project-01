# Pipeline CRM

A simple lead-tracking CRM built with **Next.js 14**, **MongoDB**, **BetterAuth**, **HeroUI**, and **DaisyUI**.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB + Mongoose |
| Auth | BetterAuth (email/password) |
| UI Components | HeroUI (NextUI v2) |
| CSS | Tailwind CSS + DaisyUI |
| Fonts | Syne + DM Mono |

## Features

- Email/password authentication (register, sign in, sign out)
- Add leads with name, email, company, phone, status, last contacted date, notes
- Dashboard with 4 metric cards (total, overdue, active, qualified)
- Overdue alert banner for leads silent 3+ days
- Table with search, status filter, sort by oldest contact
- One-click "mark contacted today" action
- Edit lead inline via modal
- Delete lead
- All data scoped per user

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/pipeline-crm
BETTER_AUTH_SECRET=your-random-32-char-secret-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **MONGODB_URI**: Use MongoDB Atlas for production — `mongodb+srv://user:pass@cluster.mongodb.net/pipeline-crm`
> **BETTER_AUTH_SECRET**: Generate with `openssl rand -base64 32`

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and start adding leads.

## Deployment (Vercel + Atlas)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variables in Vercel project settings
4. Deploy

BetterAuth creates its own collections in MongoDB automatically — no migration needed.

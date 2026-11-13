# Supabase Tasks

Live demo: https://supabase-tasks-nu.vercel.app

A small task app built to practise Supabase: email and password login, a PostgreSQL table, and Row Level Security so each user only sees their own tasks.

## Stack
- Next.js (App Router, TypeScript, Tailwind)
- Supabase: PostgreSQL, Auth, Row Level Security

## How the backend works
- The schema, grants and RLS policies are in `supabase/schema.sql`.
- The app has no per-user filter in its code. The database policies return only the logged-in user's rows.
- `scripts/rls-test.mjs` is a Node script that logs in as two users and checks that one user cannot read, change or insert rows for the other, and that logged-out visitors get nothing.

## Run locally
1. Copy `.env.example` to `.env.local` and fill in your Supabase URL and publishable key.
2. `npm install`
3. `npm run dev`

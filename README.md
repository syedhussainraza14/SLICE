# SLICE

A simple, accessible web app for Google sign-in and saving assessment records in a PostgreSQL database.

## Features
- Google OAuth login with NextAuth
- Prisma + PostgreSQL persistence
- Save assessment JSON for each user
- View saved assessments in the dashboard
- Basic accessibility-focused UI

## Quick start

1. Copy `.env.example` to `.env` and fill in your values.
2. Create a PostgreSQL database and set `DATABASE_URL`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run Prisma migrations or db push:
   ```bash
   npx prisma db push
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

## Google OAuth
Create OAuth credentials in Google Cloud Console and add the client ID and secret to `.env`.

## Notes
This project stores assessment metadata and raw JSON, which may contain sensitive information. Review your privacy and data-handling requirements before production use.

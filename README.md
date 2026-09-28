# REELPAGE

REELPAGE is a responsive professional creative network built for actors, writers, directors, producers, crew and creative businesses — starting with Nollywood.

## Product direction

Inspired by professional networking patterns found across LinkedIn, Stage 32 and IMDbPro-style industry profiles, ReelPage focuses on:

- professional creative profiles and headshots
- skills, headlines, bios and profile completion
- projects and creative portfolios
- networking with Connect and Follow
- a professional creative feed with likes
- casting, crew, writing and collaboration opportunities
- responsive desktop, tablet and mobile navigation
- Supabase-backed data and public media storage
- no-email username/password onboarding for a smoother first experience

## Stack

- Static responsive frontend
- Supabase Postgres + Row Level Security
- Supabase Auth
- Supabase Storage
- Supabase Edge Function for username/password authentication
- GitHub Pages workflow for static hosting

## Supabase

Project: REELPAGE  
Region: eu-west-1

The browser only uses the Supabase publishable key. The service-role key is used only inside the deployed Supabase Edge Function and is never placed in frontend code.

## Hosting

The repository includes a GitHub Pages deployment workflow at .github/workflows/pages.yml.

For GitHub Pages, the repository owner must enable **Settings → Pages → Source → GitHub Actions** once. After that, pushes to main deploy the site automatically. GitHub documents this workflow here:

https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

For Vercel, import this repository and set the project name to **REELPAGE**.

## Security

Row Level Security is enabled across application tables, media buckets are protected for authenticated uploads, and the public auth trigger has no API execute permission.

# REELPAGE

REELPAGE is a filmmaker-first professional network: a LinkedIn-style home for actors, writers, directors, producers, cinematographers, editors, crew and creative businesses, starting with Nollywood.

## Product

- Professional filmmaker profiles with headshots, cover images, bios, skills, projects and public posts.
- Creative feed for normal social posting — not just script hunting.
- Discover search for creatives by name, role, skill and location.
- Connections, follows and private messaging.
- **Reel AI**: voice wake phrase, text assistant, in-app commands, account search, connection requests, message navigation, message drafting, direct message sending, post/project/script creation flows, and profile interview questions.
- **Script Marketplace**: writers can list screenplays/treatments with loglines, formats, genres and prices; filmmakers can discover listings and contact writers.
- Working post likes, comments and share links.
- Responsive cinematic interface designed around filmmaking rather than generic corporate networking.

## Stack

- Static HTML/CSS/JavaScript frontend
- Supabase Auth, Postgres, Storage and Realtime-ready backend
- Supabase Edge Function for username/password authentication
- Vercel deployment target

## Performance and security work

- Scoped feed queries and bounded result sets instead of loading entire tables.
- Targeted indexes for feed, messaging, connections and marketplace queries.
- Trigram indexes for scalable profile/script search.
- Row Level Security on social, messaging, script marketplace and comment data.
- Production security headers and microphone permission support for Reel AI.
- Browser caching avoids long-lived immutable caching for mutable application JS/CSS, preventing stale deployments.

## Reel AI voice

Reel AI uses the browser Web Speech API. The user activates voice once, then the assistant listens for the wake phrase **“Reel AI”** and replies **“I am listening.”** It then accepts an in-app command.

Speech recognition support varies by browser; Chrome/Edge desktop are the primary target for the continuous wake-word experience. Speech synthesis is broadly supported.

## Deployment

GitHub repository: `Fik-Creator/Welcome-to-the-page`

Vercel project name: **ReelPage**

This repository is intentionally kept under its existing GitHub name. The product and deployment branding are REELPAGE / ReelPage.

## Scale note

The current architecture is designed as a lean, serverless MVP foundation with bounded queries, RLS, indexes, CDN-friendly static assets and Supabase-backed persistence. It has **not** been load-tested to prove one million concurrent or registered users. A true million-user launch still requires production load testing, capacity sizing, observability, rate limiting/abuse controls, storage/CDN strategy, search infrastructure, realtime capacity planning, backups and operational monitoring.

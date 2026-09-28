# REELPAGE

REELPAGE is a responsive professional creative network for actors, writers, directors, producers, crew and creative businesses — starting with Nollywood.

## Current MVP

- Black / white / gold cinematic ReelPage brand system.
- ReelPage mark used in navigation, mobile navigation, favicon, profile avatars, empty states, hero and cards.
- Username + password onboarding with no email collection or verification step.
- Supabase Auth, Postgres, Row Level Security and Storage.
- Creative profiles with photo, cover image, headline, bio and skills.
- Creative feed with image posts and likes.
- Follow system.
- Projects and opportunities.
- Opportunity applications.
- Direct messages between registered creatives.
- Responsive desktop, tablet and mobile navigation.
- Lazy-loaded post media and bounded list queries for a stable first release.

## Stack

- Static HTML/CSS/JavaScript frontend.
- Supabase Postgres + Row Level Security.
- Supabase Auth.
- Supabase Storage.
- Supabase Edge Function: `reelpage-auth`.
- GitHub Pages deployment workflow.

## Production notes

The app is designed as a lightweight first production release. It uses indexed Supabase queries and capped feed/list reads so a first community of around 1,000 users can use the platform without the frontend attempting to load the entire database at once.

No software can honestly guarantee zero glitches for every device or traffic pattern, so production monitoring and iterative testing remain part of the launch process.

## Hosting

The repository contains a GitHub Pages workflow at `.github/workflows/pages.yml`. GitHub Pages can publish directly from GitHub Actions. GitHub's documentation describes the workflow and custom-domain setup.

Default project URL after Pages is enabled:
`https://fik-creator.github.io/Welcome-to-the-page/`

For a custom REELPAGE domain, configure the domain in GitHub Pages and then add the required DNS record at the domain provider. GitHub recommends verifying a custom domain before attaching it to the repository.

## Supabase

Project: REELPAGE  
Region: eu-west-1

The browser contains only the Supabase publishable key. The service-role credential remains inside the deployed Edge Function.

## Security

Row Level Security is enabled across application tables. Media uploads are scoped to the authenticated user's folder, while public media buckets allow public viewing of published images. The username/password Edge Function creates confirmed internal auth identities without asking users for an email address.

# Professional Portfolio Platform

A production-ready, white-label, AI-enabled professional portfolio platform built with Next.js 16, Prisma, PostgreSQL, Cloudinary, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 16.3.3 (Turbopack)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui v4 (base-ui)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5 (beta)
- **Storage**: Cloudinary
- **AI**: OpenAI / Anthropic (provider-agnostic)
- **Validation**: Zod v4

## Features

### Public Pages
- Hero, About, Education, Experience, Qualifications
- Publications, Articles (Blog), Gallery, Contact
- Dynamic sitemap, robots.txt, JSON-LD metadata
- Floating AI assistant with conversation history

### Admin Dashboard
- Profile management (white-label, data-driven identity)
- Content CRUD: education, experience, publications, achievements, qualifications
- Blog CMS with categories, tags, and rich content
- Gallery with reorder and visibility control
- Media manager with Cloudinary integration
- Message management (read/unread, important, archive)
- AI assistant settings (enable/disable, model, temperature, greeting)
- SEO settings (meta templates, sitemap, OG images)
- Theme & branding (presets, custom colors, logo, layout)
- Appearance settings (5 presets: Professional Blue, Executive Dark, Minimal Neutral, Elegant Slate, Clean)

### Architecture
- AI knowledge architecture (builds context from all content)
- Rate limiting on contact form and AI chat
- Provider abstraction for AI services
- Shared Prisma singleton (`src/lib/db.ts`)
- Server components by default, client components only when needed
- Build-time graceful fallback when database is unavailable

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Cloudinary account
- AI provider API key (OpenAI or Anthropic)

### Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Seed admin user + default settings
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) |
| `ADMIN_EMAIL` | Admin login email (default: `admin@portfolio.com`) |
| `ADMIN_PASSWORD` | Admin login password (default: `admin123`) |
| `CLOUDINARY_*` | Cloudinary credentials (see below) |
| `AI_PROVIDER` | `openai` or `anthropic` |
| `AI_API_KEY` | Your AI provider API key |

> **Note**: Cloudinary server-side keys (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are never exposed to the client. Client-side keys (`NEXT_PUBLIC_*`) are safe for browser use.

## Deployment to Vercel

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (use a hosted PostgreSQL like Neon, Supabase, or Vercel Postgres)
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `CLOUDINARY_*` credentials
   - `AI_PROVIDER` and `AI_API_KEY`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`
4. Add a build step: `npx prisma generate` (Vercel may auto-detect this)
5. Vercel will auto-detect Next.js and deploy

Build succeeds without a database connection — all pages gracefully fall back to empty state at build time.

## Project Structure

```
src/
  app/
    (public)/          # Public-facing pages
    admin/             # Admin dashboard pages
    api/               # API routes
    layout.tsx         # Root layout with ThemeProvider, AI, SEO
    page.tsx           # Homepage with dynamic sections
    sitemap.ts         # Dynamic sitemap
    robots.ts          # Robots.txt
  components/
    admin/             # Admin-specific components (media picker, uploader)
    public/            # Public UI components
    shared/            # Shared components (theme provider, toaster)
    ui/                # shadcn/ui components (base-ui)
  lib/
    auth/              # NextAuth v5 configuration
    db.ts              # Prisma singleton
    seo/               # SEO service
    validators/        # Zod schemas for form validation
  services/            # Business logic (profile, content, media, settings, ai)
  repositories/        # Data access layer (Prisma queries)
  proxy.ts             # Auth proxy (middleware replacement for Next.js 16)
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed admin user and default settings |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |

## License

Private - All rights reserved.

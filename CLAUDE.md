# Personal Portfolio Platform

Production-grade, data-driven, white-label personal portfolio platform.

## Project Standard
- **Generic Identity**: No hardcoded names, roles, or personal data in code.
- **Single Source of Truth**: Database is the sole source for all identity and content.
- **Architecture**: Scalable Next.js App Router, Prisma, PostgreSQL, Cloudinary, AI-RAG.
- **Styling**: Tailwind CSS, shadcn/ui, dynamic theme engine (CSS variables).
- **AI**: Grounded AI assistant reflecting current published portfolio data.

## Development Phases

- [x] Phase 1: Architecture and project foundation
- [ ] Phase 2: Database schema
- [ ] Phase 3: Authentication and authorization
- [ ] Phase 4: Central profile/settings architecture
- [ ] Phase 5: Theme/design-token engine
- [ ] Phase 6: Public layout
- [ ] Phase 7: Homepage
- [ ] Phase 8: About/profile
- [ ] Phase 9: Education/experience
- [ ] Phase 10: Qualifications/certifications
- [ ] Phase 11: Admin dashboard
- [ ] Phase 12: Admin CRUD systems
- [ ] Phase 13: Cloudinary media library
- [ ] Phase 14: Gallery / Best Moments
- [ ] Phase 15: Blog/articles
- [ ] Phase 16: Publications/achievements
- [ ] Phase 17: Contact/messages
- [ ] Phase 18: AI knowledge architecture
- [ ] Phase 19: AI chat assistant
- [ ] Phase 20: AI security/cost controls
- [ ] Phase 21: SEO
- [ ] Phase 22: Theme customization UI
- [ ] Phase 23: Performance/accessibility
- [ ] Phase 24: Testing/security review
- [ ] Phase 25: Vercel production deployment

## Guidelines
- Match existing naming conventions: `profile`, `siteSettings`, `brandSettings`.
- Ensure all content visibility is handled via `isPublic` / `allowAI`.
- Gallery captions must be centered and in quotation marks.
- All media must use Cloudinary.
- All mutations must have server-side authorization.

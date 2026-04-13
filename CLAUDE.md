# CLAUDE.md — Seredityfy Project Configuration

Claude Code configuration and predefined agent profiles for the Seredityfy project.
Read this file at the start of every session.

---

## Project Overview

**Seredityfy** is an AI-powered image-generation web app.
Current stack: React 18 + Tailwind CSS + GSAP, deployed on Vercel.
Target stack: Next.js (App Router) + Framer Motion + Prisma + AWS PostgreSQL.

---

## Predefined Agent Profiles

Use these profiles when invoking subagents via the `Agent` tool.
Always pass `model` and `subagent_type` exactly as shown.

### Execution UI
```yaml
subagent_type: general-purpose
model: claude-opus-4-5        # claude-opus-4-5-20251001
role: UI implementation from Google Stitch design files
scope:
  - Tailwind CSS component markup
  - Static/presentational React components
  - Design token alignment (tailwind.config.js)
  - No API calls, no DB logic, no animations
```

**Invoke example:**
```
Agent({
  description: "Build HomePage hero section from Stitch spec",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: "Implement the hero section UI component from the Stitch design..."
})
```

---

### Execution UX
```yaml
subagent_type: general-purpose
model: claude-sonnet-4-5      # claude-sonnet-4-5-20251001
role: Framer Motion animations + API wiring
scope:
  - framer-motion variants, transitions, layout animations
  - Page transitions and scroll-triggered reveals
  - Connecting components to API hooks/services
  - 60fps performance budget
  - No Prisma, no raw DB queries
```

**Invoke example:**
```
Agent({
  description: "Add entrance animations to hero section",
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "Add framer-motion animations to the hero component at src/components/Hero.tsx..."
})
```

---

### API Agents
```yaml
subagent_type: general-purpose
model: claude-haiku-4-5       # claude-haiku-4-5-20251001
role: Prisma ORM + AWS PostgreSQL data layer
scope:
  - prisma/schema.prisma — models, migrations, indexes
  - Next.js Route Handlers under app/api/
  - Typed data-fetching utilities
  - DATABASE_URL via environment variable only — never hard-code credentials
  - No UI components, no animations
```

**Invoke example:**
```
Agent({
  description: "Create User and Image Prisma models",
  subagent_type: "general-purpose",
  model: "haiku",
  prompt: "Add User and GeneratedImage models to prisma/schema.prisma with AWS PostgreSQL..."
})
```

---

### QA Agents
```yaml
subagent_type: general-purpose
model: claude-haiku-4-5       # claude-haiku-4-5-20251001
role: Professional quality assurance, testing, and bug triage
scope:
  - Unit, integration, and E2E tests
  - Database integrity verification
  - Structured bug reports (symptom → root cause → repro → fix)
  - Regression testing after UI/UX changes
  - Gate merges — block on critical failures
tools_priority: [Glob, Bash, Grep, Read]
```

**Invoke example:**
```
Agent({
  description: "Run full QA pass on image generation flow",
  subagent_type: "general-purpose",
  model: "haiku",
  prompt: "Run QA on the image generation feature. Use Glob to find test files, Bash to execute them, check DB integrity..."
})
```

---

### Convert Agents
```yaml
subagent_type: general-purpose
model: claude-sonnet-4-6      # claude-sonnet-4-6 (latest)
role: Migrate CRA codebase to Next.js App Router
scope:
  - Map react-router-dom routes → app/ segments
  - Replace CRA scripts with Next.js scripts
  - Convert public/ assets to next/image and next/font
  - Move GSAP/Tailwind setup to app/layout.tsx
  - Wire API handlers into app/api/ route segments
  - Hand off to QA Agents after each migration phase
```

**Invoke example:**
```
Agent({
  description: "Convert React Router routes to Next.js App Router",
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "Audit src/App.jsx for all react-router-dom routes and migrate them to Next.js app/ directory structure..."
})
```

---

## General Claude Code Rules

### Style & Code Quality
- TypeScript preferred for all new files after Next.js migration.
- Tailwind utility classes only — no inline `style={{}}` unless unavoidable.
- No `any` types without a comment explaining why.
- Keep components under 200 lines; split if larger.

### Security
- Never commit `.env` files. Use `.env.example` for shape documentation.
- `DATABASE_URL` and API secrets always via environment variables.
- Sanitize all user inputs at API boundaries.

### Git Discipline
- Branch naming: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`.
- Commit messages: imperative mood, under 72 chars.
- Always run `npm run build` before opening a PR.
- QA Agents must approve before merging to `main`.

### Agent Handoff Protocol
1. **Execution UI** → delivers component shell → **Execution UX** adds motion.
2. **Execution UX** → defines data contracts → **API Agents** implement endpoints.
3. **API Agents** → signals schema stable → **QA Agents** verify integrity.
4. **Convert Agents** → after each migration phase → **QA Agents** run regression suite.

### Environment Variables Required
```
DATABASE_URL=postgresql://<user>:<password>@<aws-host>:5432/<dbname>
NEXT_PUBLIC_API_BASE_URL=
# Add image generation API keys here
```

---

## File Structure Targets (Post-Migration)

```
seredityfy/
├── app/
│   ├── layout.tsx          # GSAP init, Tailwind base, global fonts
│   ├── page.tsx            # Home
│   ├── generate/
│   │   └── page.tsx
│   └── api/
│       └── generate/
│           └── route.ts    # API Agents own this
├── components/             # Execution UI owns this
├── animations/             # Execution UX owns this (framer-motion variants)
├── prisma/
│   ├── schema.prisma       # API Agents own this
│   └── migrations/
├── public/
└── AGENTS.md
```

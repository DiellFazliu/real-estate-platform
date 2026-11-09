# Villaron

Villaron is a full-stack real-estate marketplace for property discovery, listing
management, agent communication, and market intelligence. It is built for the
Kosovo market and supports Albanian and English natural-language search.

The platform covers the complete listing lifecycle:

1. A seller submits a property.
2. An owner or administrator reviews the submission.
3. Approved properties are published and can be assigned to an agent.
4. Buyers can search, compare, favorite, and make appointments for properties.
5. Reva Intelligence analyzes approved properties and presents market context.

## Features

### Property marketplace

- Browse published sale and rental properties.
- Filter by price, location, property type, bedrooms, bathrooms, area, and
  amenities.
- View property details, images, map location, availability, and related
  properties.
- Mark properties as favorites, compare properties, and book appointments.
- Submit, edit, withdraw, restore, or mark owned properties as sold or
  unavailable.

### Natural-language search

The AI search endpoint accepts Albanian or English queries such as:

```text
3 bedroom in Prishtina under 200k
2 banjo me ashensor
```

Search uses a hybrid parser:

1. A fast local parser handles recognizable filters immediately.
2. Parsed queries are cached in memory for five minutes.
3. Groq is used when the local parser does not identify enough filters.
4. Results are converted into Prisma filters for published, approved
   properties.

Supported query fields include bedrooms, bathrooms, price ranges, city,
neighborhood, property type, listing type, amenities, and keywords.

### Reva Intelligence

Reva Intelligence is generated for approved properties through Inngest
background jobs. It combines:

- Price-per-square-metre analysis.
- Comparable-property averages, medians, and counts.
- Market position and percentile.
- Twelve-month and five-year trend analysis.
- Location scoring and insights.
- Rule-based anomaly warnings.
- An optional Groq-generated natural-language summary.

Nearby properties can be invalidated when a listing changes, and stale
intelligence can be refreshed by the protected cron endpoint.

### Role-based dashboards

| Role | Main capabilities |
| --- | --- |
| `USER` | Browse, favorite, compare, make appointments, and contact agents |
| `AGENT` | Manage assigned properties, appointments, inquiries, and conversations |
| `OWNER` | Review listings, assign agents, manage hero slides, and monitor platform activity |
| `ADMIN` | Manage users, roles, audits, and the complete platform |

Authorization is enforced through server-side permissions as well as
role-aware navigation and protected route layouts.

### Content and communication

- Sanity Studio for hero slides, property content, and images.
- PostgreSQL remains the source of truth for workflow, ownership, and
  transactional data.
- Sanity webhooks and synchronization scripts keep content and database data
  aligned.
- Credentials authentication and GitHub OAuth through NextAuth.
- Conversations, messages, inquiries, notifications, and password reset email.
- Kosovo municipality analytics and map visualizations.
- Draft mode with preview enable/disable routes.

## Technology

- **Application:** Next.js 15 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL and Prisma 6
- **Authentication:** NextAuth v5, bcryptjs, credentials, GitHub OAuth
- **CMS:** Sanity and Next Sanity
- **Background jobs:** Inngest
- **AI:** Groq SDK, with additional OpenAI and Google GenAI integrations in the
  codebase
- **Maps:** Leaflet and React Leaflet
- **Validation:** Zod
- **UI:** Lucide React and React Icons

## Requirements

- Node.js 20 or newer
- pnpm
- PostgreSQL
- A Sanity project for CMS features
- A Groq API key for AI search and Reva summaries

GitHub OAuth, Gmail SMTP, and Inngest credentials are needed only when those
integrations are enabled.

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env` file in the repository root. Do not commit this file.

#### Core configuration

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
GROQ_API_KEY="your-groq-api-key"
NEXTAUTH_URL="http://localhost:3000"
```

#### Sanity

```dotenv
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-write-token"
SANITY_WEBHOOK_SECRET="your-webhook-secret"
SANITY_PREVIEW_SECRET="your-preview-secret"
```

`SANITY_API_TOKEN` is required for server-side writes and synchronization.
Public project and dataset values are used by the application and Sanity
Studio.

#### Authentication and email

```dotenv
AUTH_SECRET="a-long-random-secret"
GITHUB_ID="your-github-oauth-client-id"
GITHUB_SECRET="your-github-oauth-client-secret"
GMAIL_USER="your-sender@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"
```

Use the callback URL
`http://localhost:3000/api/auth/callback/github` for local GitHub OAuth.
`AUTH_URL` may be used for password-reset links; `NEXTAUTH_URL` is used as a
fallback.

#### Background jobs and scheduled refresh

```dotenv
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
CRON_SECRET="your-cron-secret"
```

Inngest keys are optional during local development. The cron endpoint requires
`CRON_SECRET` and an `Authorization` header containing the configured secret.

### 3. Prepare the database

Generate the Prisma client and apply migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

For a development database, seed roles, permissions, users, agents, and
properties:

```bash
pnpm db:seed:all
```

The seed configuration is in `prisma/seed/lib/config.ts`. Seed passwords are
development credentials only; change them before using any shared environment.

To recreate a development database from migrations and all seed data:

```bash
pnpm db:fresh
```

### 4. Start the application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The Sanity Studio is available at `/studio`. The local Inngest development
server can be started in a second terminal:

```bash
pnpm inngest
```

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run the Next.js lint command |
| `pnpm db:generate` | Generate the Prisma client |
| `pnpm db:migrate` | Create and apply a development migration |
| `pnpm db:push` | Push the Prisma schema without creating a migration |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed base roles, permissions, users, and settings |
| `pnpm db:seed:agents` | Seed agent records |
| `pnpm db:seed:properties` | Seed property records |
| `pnpm db:seed:all` | Run all seed workflows |
| `pnpm db:reset` | Reset the database and apply migrations |
| `pnpm db:fresh` | Reset, migrate, and run all seed workflows |
| `pnpm inngest` | Start the Inngest development server |
| `pnpm tunnel` | Expose local port 3000 through ngrok |

## Application structure

```text
app/
  (public)/          Public pages for search, listings, details, and contact
  (auth)/            Login, registration, and password reset
  (protected)/       User and agent pages requiring authentication
  (dashboard)/       Owner and admin dashboards
  actions/           Server actions for domain workflows
  api/               API routes, webhooks, auth, AI, and background jobs
  studio/            Embedded Sanity Studio
components/          Shared UI components
inngest/              Inngest client and event functions
lib/
  auth/              Authentication and permission helpers
  db/                Prisma client and database queries
  intelligence/      Reva Intelligence engines and generation
  nlp/               Natural-language parsing and search
  sanity/            Sanity clients and queries
  validation/        Request and domain validation
prisma/
  schema.prisma      PostgreSQL data model
  migrations/        Database migrations
  seed/              Shared seed helpers and configuration
sanity/               Sanity schemas and Studio configuration
scripts/              Content synchronization and diagnostics
```

## Important routes

### Public pages

- `/` - Home page and featured properties
- `/properties` - Property search and listing results
- `/properties/[slug]` - Property details
- `/properties/compare` - Property comparison
- Municipality analytics and map visualizations are available from the public
  property experience.
- `/sell-for-yourself` - Seller information
- `/upload-listing` - Listing submission
- `/studio` - Sanity Studio

### API endpoints

- `/api/search/ai` - Natural-language property search
- `/api/properties/submit` - Listing submission
- `/api/properties/compare/analyze` - AI-assisted comparison
- `/api/ai/generate-description` - AI property description generation
- `/api/inngest` - Inngest event handler
- `/api/sanity/webhook` - Sanity synchronization webhook
- `/api/cron/refresh-intelligence` - Protected stale-intelligence refresh
- `/api/auth/[...nextauth]` - NextAuth handlers

## Data and synchronization model

PostgreSQL and Prisma own users, permissions, listing workflow, appointments,
favorites, conversations, notifications, and intelligence records. Sanity owns
editorial content and media. Property mutations write to PostgreSQL first and
then perform best-effort Sanity synchronization where applicable.

Useful synchronization scripts include:

```bash
pnpm exec tsx scripts/sync-properties.ts
pnpm exec tsx scripts/sync-hero-slides.ts
```

Run synchronization scripts only after configuring the required Sanity
variables and confirming the target project and dataset.

## Development notes

- Keep secrets in `.env`; never commit API keys, OAuth credentials, database
  URLs, or SMTP passwords.
- Test workflow changes against the relevant role because permissions are
  scope-aware (`own`, `assigned`, and `all`).
- AI-dependent features should provide a useful fallback when the provider is
  unavailable or rate-limited.
- Reva generation is rate-limited deliberately. Bulk refreshes can take time
  because AI summaries are throttled and retried.
- Use migrations for schema changes that should be versioned. Use `db:push`
  only for disposable development iterations.

## License and attribution

Private project. Built during a bootcamp program by Engji Osmani, Arbnor
Tasholli, and Diell Fazliu. All rights reserved by the authors.

# Villaron — Real Estate Platform

A full-stack real estate marketplace built with Next.js 15, TypeScript, Prisma, Sanity CMS, and Inngest. Villaron handles the complete property listing lifecycle — from seller submission, through admin review and approval, to public display with AI-powered market intelligence.

## Overview

Villaron is designed as a production-grade platform with role-based access control, background job orchestration, and an automated intelligence engine. Its core feature, **Reva Intelligence**, analyzes each approved property against its local market and generates a natural-language summary using a large language model.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, RSC)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL with Prisma ORM
- **CMS:** Sanity (content, images, live preview)
- **Auth:** NextAuth v5 (credentials + GitHub OAuth)
- **Background Jobs:** Inngest (event-driven, retries, cron)
- **AI:** Groq API (LLM summaries)
- **Maps:** Leaflet with property clustering
- **UI:** Lucide icons, custom Tailwind theme

## Features

### Multi-Role System

Four roles with distinct permissions — `USER`, `AGENT`, `OWNER`, `ADMIN`. Route guards, server-side permission checks, and role-aware navigation.

### Property Lifecycle

1. **Seller** submits a property → `PENDING_REVIEW`
2. **Owner/Admin** reviews → approve or reject with a reason
3. On approval → published, agent assigned, notifications sent
4. **Owner** can edit, mark sold, or withdraw later
5. Sold properties display with a "SOLD" badge, unavailable ones show a fallback page

### Reva Intelligence

When a property is approved, an Inngest event fires that:

- Computes price per m² and finds comparable properties
- Calculates market position, percentile, and pricing trends
- Generates an AI summary via Groq
- Invalidates nearby properties so their comparables refresh
- Displays on the property page as a collapsible analysis panel

### Sanity Integration

- Content and images managed in Sanity Studio at `/studio`
- Webhook sync from Sanity → PostgreSQL on content changes
- **Presentation Tool** with live preview and click-to-edit for hero slides
- Draft mode with in-UI exit banner

### User Features

- AI-powered property search with natural language
- Property comparison with tradeoff analysis
- Favorites, appointments, and chat with agents
- Notifications with read management
- Kosovo map with property distribution stats

### Dashboards

- **Seller:** listings, submission, plan management
- **Agent:** assigned properties, appointments, statistics
- **Owner:** review queue, agent assignment, health metrics
- **Admin:** user management, full platform oversight

### Status
Active development. Built as a portfolio project demonstrating full-stack architecture with modern tooling across React, Next.js, and server-side TypeScript.

### License
 Private.
 
 Built during a bootcamp program by Engji Osmani, Arbnor Tasholli, and Diell Fazliu. All rights reserved by the authors.

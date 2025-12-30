# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Call Center Dashboard that displays analytics for outbound/inbound calls. The dashboard fetches call data from a Google Apps Script API and visualizes key metrics including total calls, appointments booked, AI interest generated, and caller sessions.

## Tech Stack

- **Framework**: Next.js 15.5.9 with App Router
- **Runtime**: React 19.1.0 (Client Components only)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Turbopack (dev mode)

## Development Commands

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Data Flow
1. Data is fetched from a Google Apps Script API endpoint (defined in `src/app/page.tsx`)
2. Response data is reversed to show newest calls first
3. Data flows down through component props: `page.tsx` → `DashboardStats` | `DashboardCharts` | `CallsTable`
4. All state management is via React `useState` hooks

### Data Structure

The `CallData` interface (`src/types/call-data.ts`) defines:
```typescript
{
  Caller_agent_ID: string;
  Call_ID: string;
  "Saloon Name": string;
  Status: string;
  "Need AI-Agent ? (Yes/No)": boolean;
  "Appointment Booked (Yes/No)": boolean;
  "Call summary": string;
  "Call Transcript": string;
  "Call Recording": string;  // URL
  "Phone Number": string;
}
```

### Component Structure

```
src/app/page.tsx              # Main dashboard, data fetching, state
src/components/dashboard-stats.tsx    # 4 stat cards (total calls, appointments, AI interest, sessions)
src/components/dashboard-charts.tsx   # Recharts visualization
src/components/calls-table.tsx        # Table of all calls with click-to-view details
src/components/call-details-modal.tsx # Modal for call transcript/recording
src/components/ui/            # shadcn/ui components
```

All components are client components (`"use client"` directive).

## Path Aliases

- `@/*` → `./src/*` (configured in `tsconfig.json`)
- Common imports: `@/components/*`, `@/lib/utils`, `@/types/*`

## Conventions

### Styling
- Use Tailwind v4 `@theme inline` pattern (see `src/app/globals.css`)
- shadcn/ui components for all UI primitives (button, card, dialog, table, etc.)
- Lucide React for icons
- CSS variables for theming (light/dark mode support)

### TypeScript
- All components use typed props interfaces
- Use explicit type annotations (e.g., `: CallData[]`, `: boolean`)
- Strict mode enabled - avoid `any` types

### Code Patterns
- Use `clsx` + `tailwind-merge` via `cn()` utility for conditional classes
- Boolean fields from API: `"Need AI-Agent ? (Yes/No)"`, `"Appointment Booked (Yes/No)"`
- Handle null/undefined `Caller_agent_ID` with `.filter(Boolean)` when creating Sets

## Build Configuration

- `next.config.ts` ignores ESLint and TypeScript errors during builds
- This is intentional for rapid development - fix lint errors before production deployment

## Deployment

### Vercel Deployment
The project is ready for Vercel deployment:
- No `vercel.json` needed - uses Next.js default configuration
- Build command: `npm run build`
- Output directory: `.next` (auto-detected by Vercel)
- No environment variables required (API URL is hardcoded in `src/app/page.tsx`)
- To change the API endpoint, edit `API_URL` in `src/app/page.tsx` or move it to an environment variable

### Security Notes
- Always run `npm audit` before deployment to check for vulnerabilities
- Current Next.js version (15.5.9) has no known vulnerabilities

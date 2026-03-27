# HolidayTrack
## Project Overview
SaaS platform for UK employers to manage employee holiday requests, approvals, and compliance. Built to meet new UK regulations effective 6 April 2026 requiring 6-year retention of annual leave records, carry-forward, holiday pay details, and payments in lieu — enforced by the Fair Work Agency with unlimited fines. Currently in **v0.1.0** (pre-launch).

**Product**: holidaytrack.co.uk
**Built by**: Intelligent Payroll (intelligentpayroll.co.uk)
**Target users**: UK SME employers — Intelligent Payroll's existing payroll clients first, then outbound

## Tech Stack
- **Framework:** Next.js 14 (App Router, Turbopack dev)
- **Language:** TypeScript 5
- **Auth & DB:** Supabase (auth, PostgreSQL with RLS, SSR helpers)
- **Payments:** Stripe (subscriptions — free tier initially, billing added later)
- **Styling:** Tailwind CSS 4, Radix UI primitives, shadcn/ui (`components.json`)
- **Email:** Resend (transactional)
- **Rate limiting:** Upstash Redis
- **Monitoring:** Sentry, Vercel Analytics + Speed Insights
- **Testing:** Jest + Testing Library (unit), Playwright (e2e)
- **Linting:** ESLint 9, Prettier with Tailwind plugin

## Project Structure
```
src/
  app/
    (auth)/               # Login/signup/invite (route group)
    (dashboard)/          # Authenticated dashboard (route group)
      dashboard/
        admin/            # Platform admin panel (IP super-admin)
        approvals/        # Manager approval queue
        audit-log/        # Audit trail viewer
        employees/        # Employee management + CSV import
        entitlements/     # Entitlement management per year
        reports/          # Payroll export, absence summary, Bradford Factor
        requests/         # My requests + new request form
        settings/         # Org settings + team management
        subscription/     # Stripe subscription management
        team/             # Team overview + absence calendar
    (marketing)/          # Public marketing pages
    api/                  # API routes (REST)
    auth/                 # Supabase auth callbacks
  components/             # Reusable UI components
    ui/                   # shadcn/ui components
    holiday/              # Domain components (BalanceCard, RequestCard, ApprovalCard, CalendarView)
    layout/               # Sidebar, TopNav, RoleGate, DashboardWrapper
    onboarding/           # Guided onboarding tutorial
    marketing/            # Marketing page components
  config/                 # App configuration
  contexts/               # React contexts (ThemeContext, AuthContext)
  hooks/                  # Custom React hooks
  lib/                    # Core utilities
    supabase.ts           # Client-side Supabase
    supabase-server.ts    # Server-side Supabase (service role)
    resend.ts             # Resend email client + sendAndLogEmail wrapper
    stripe.ts             # Stripe helpers
    validations.ts        # Zod schemas
    domains.ts            # Domain constants (APP_DOMAIN, MARKETING_DOMAIN)
    swr.ts                # SWR hooks + cache helpers
    utils.ts              # cn() and general utilities
    holiday-calc.ts       # Working days calculator (excludes weekends + bank holidays)
    pro-rata.ts           # Pro-rata entitlement calculation
    date-utils.ts         # Date formatting helpers (DD/MM/YYYY UK format)
    export/
      payroll-csv.ts      # Payroll CSV export generator
      audit-csv.ts        # Audit trail CSV export
    email/
      templates.ts        # Email templates (request, approval, invite, etc.)
  types/                  # TypeScript type definitions
    database.ts           # Generated from Supabase schema
  middleware.ts           # Auth redirect, CSRF, domain routing, deactivated user blocking
supabase/
  migrations/             # SQL migration files (numbered sequentially)
  templates/              # Email templates
```

## Key Commands
```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Unit tests (Jest)
npm run test:watch   # Unit tests in watch mode
npm run test:coverage # Unit tests with coverage report
npx playwright test  # E2E tests
```

## Architecture Patterns

- **Multi-tenant:** Every table scoped by `org_id`. RLS policies enforce isolation via `get_current_org_id()`.
- **Auth flow:** Supabase Auth → middleware redirects unauthenticated users from `/dashboard` → API routes call `getAuthUser()`.
- **CSRF:** Middleware validates Origin header matches Host for mutating API requests (webhooks exempted).
- **API routes:** All under `src/app/api/`. Mutating routes require auth and scope queries by `org_id`.
- **Forms:** react-hook-form + Zod validation. Field-level error display mandatory.
- **Data fetching:** SWR for client-side caching. Never use raw `fetch()` in components.
- **Admin routes:** Protected by `PLATFORM_ADMIN_EMAILS` env check (Intelligent Payroll staff only).
- **Domain routing:** Middleware-based hostname routing — `www.holidaytrack.co.uk` serves marketing pages only (`/`, `/pricing`, `/terms`, `/privacy`), all other routes 301 redirect to `app.holidaytrack.co.uk`. `app.holidaytrack.co.uk/` redirects to `/dashboard` (307). Marketing routes skip auth/CSRF entirely. Domain constants centralised in `src/lib/domains.ts`.

### User Roles (4 tiers)

| Role | Permissions |
|------|-------------|
| `employee` | View own balance, request holiday, view own history |
| `manager` | All employee + approve/decline for assigned reports, view team overview |
| `admin` | All manager + manage employees, entitlements, org settings, run reports, view audit log |
| `super_admin` | All admin + create/manage multiple organisations (Intelligent Payroll internal only) |

### Holiday Request Flow

1. Employee submits request → status = `pending`, entitlement `pending_ordinary` or `pending_additional` incremented
2. Manager approves → status = `approved`, `pending_X` decremented, `used_X` incremented, email sent
3. Manager declines → status = `declined`, `pending_X` decremented (released), email sent with reason
4. Employee cancels pending → status = `cancelled`, `pending_X` decremented
5. Employee cancels approved → status = `cancelled`, `used_X` decremented, manager notified

### Working Days Calculation

When an employee selects a date range:
1. Count weekdays (Mon–Fri) in the range
2. Subtract bank holidays for the org's configured region
3. If employee's `days_per_week` < 5, adjust proportionally
4. For hourly employees: calculate based on `hours_per_week` / `days_per_week` per working day

### Pro-Rata for Mid-Year Starters

```
pro_rata = full_entitlement × (remaining_days_in_year / total_days_in_year)
Round to nearest 0.5 (UK standard)
```

## Database Tables

All tables scoped by `org_id` with RLS policies (except `bank_holidays` and system tables).

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `organisations` | Multi-tenant root entity, configurable holiday year | — |
| `employees` | User accounts with role, contract type, holiday unit | `org_id` → organisations |
| `manager_assignments` | Many-to-many manager↔employee | `manager_id`, `employee_id` → employees |
| `entitlements` | Per employee per holiday year: allowances, used, pending | `employee_id` → employees |
| `holiday_requests` | Leave requests with dates, amount, type, status | `employee_id` → employees |
| `approval_actions` | Who approved/declined, when, reason | `request_id` → holiday_requests |
| `bank_holidays` | Seeded per region per year (Eng & Wales, Scotland, NI) | — |
| `holiday_pay_config` | Per employee: overtime/commission/bonus inclusions | `employee_id` → employees |
| `payments_in_lieu` | Untaken holiday payouts on termination | `employee_id` → employees |
| `audit_log` | Immutable 6-year audit trail (INSERT only) | `org_id`, action/entity_type/changes (JSONB) |
| `email_log` | Record of all transactional emails | `org_id` |
| `invitations` | Team invite tokens (7-day expiry) | `org_id`, `invited_by` → employees |

### Audit Log (Critical — UK Compliance)

The `audit_log` table is the most important table in the system. It satisfies the 6 April 2026 regulation requiring 6-year retention of:
- Ordinary annual leave taken
- Additional annual leave taken
- Leave carried forward per year
- Holiday pay details (inclusions/exclusions)
- Payments in lieu for untaken holiday
- Who approved what and when, with before/after state

**Rules:**
- Append-only — NO UPDATE or DELETE policies exist, ever
- Every action recorded with `user_id`, `org_id`, `entity_type`, `entity_id`, `before_value` (JSONB), `after_value` (JSONB), `ip_address`, `created_at`
- Auto-populated by database triggers on `holiday_requests`, `employees`, and `entitlements` tables
- Supabase backup retention must cover 6-year window

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_APP_URL` | App domain (`https://app.holidaytrack.co.uk`) |
| `NEXT_PUBLIC_MARKETING_URL` | Marketing domain (`https://www.holidaytrack.co.uk`) |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_PRO_MONTHLY` | Stripe price ID for monthly plan |
| `STRIPE_PRICE_PRO_ANNUAL` | Stripe price ID for annual plan |
| `RESEND_API_KEY` | Resend email API key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `CRON_SECRET` | Bearer token for cron route authentication |
| `PLATFORM_ADMIN_EMAILS` | Comma-separated admin emails for super-admin routes |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error monitoring DSN |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Sentry org and project for source maps |

## Common Pitfalls

Hard-won lessons from ThePayBureau codebase — check here before making changes in these areas:

- **Supabase migrations must be run manually**: Files in `supabase/migrations/` are NOT auto-applied. Must be run in Supabase SQL Editor. If a new feature requires schema changes and the user reports "Failed to create X", check whether migrations have been applied.
- **Never use `next/font`**: Google Fonts are loaded via `<link>` tags in `layout.tsx` with CSS variables. `next/font/google` has intermittent fetch failures during build on Vercel.
- **Never fire-and-forget emails on Vercel**: Always `await sendEmail()` in serverless routes. The runtime terminates after the response is sent — unawaited promises may never complete. Use `waitUntil()` if you need non-blocking sends.
- **SWR cache must be cleared on auth change**: Both `SIGNED_IN` and `SIGNED_OUT` events must call `clearSWRCache()` then `revalidateAllSWR()` — in that order. Without revalidation, mounted hooks show empty state.
- **`logo-full.png` breaks dark mode**: Has dark text baked into the image — invisible on dark backgrounds. Use `logo.png` (icon mark) + theme-aware text instead.
- **Two-pass init for Supabase test mocks**: The `chainMock()` pattern requires two passes — first create all `jest.fn()` stubs, then set `mockReturnValue` with spread. Single-pass causes eager evaluation bugs.
- **Recharts cannot be dynamically imported**: Shares internal React context that breaks across chunk boundaries. Load it synchronously.
- **parseInt without fallback causes NaN corruption**: Always use `parseInt(value, 10) || 0` or validate with Zod before parsing.
- **Sheet forms must reset on close**: Stale data from previous edit persists if form state isn't reset when Sheet closes. Always reset form state in `onOpenChange`.
- **Date sorting needs Date objects**: Using `localeCompare` on date strings produces wrong order. Always use `new Date(a).getTime() - new Date(b).getTime()`.
- **sendAndLogEmail for all non-cron emails**: Use the wrapper function that auto-logs to `email_log` table. Only cron routes manage their own dedup logging.
- **Dropdown menus clip inside DashboardWrapper**: Use `position: fixed` with `getBoundingClientRect()` for action dropdowns — `position: absolute` gets clipped by parent `overflow-hidden`.

## Conventions

- Use Zod for all validation (schemas in `src/lib/validations.ts`).
- Use shadcn/ui components (installed via `components.json`).
- API error responses: `{ error: string }` with appropriate HTTP status.
- Dates: use `date-fns` for formatting/manipulation. Display in DD/MM/YYYY (UK format).
- Keep all Supabase migrations numbered sequentially in `supabase/migrations/`.
- **Table design:** Flat, no border wrapper, light gray header, thin `border-b` dividers only, no alternating rows, CSS-only hover. Row height ~48px, `px-4 py-3` cell padding. Sortable column headers with purple highlight + arrow indicator.
- **Add/Edit forms:** Use shadcn `Sheet` sidebar pattern with grouped collapsible sections — not full-page forms or modals.
- **Destructive confirmations:** Use shadcn `AlertDialog` — never `window.confirm()` or browser `confirm()`.
- **Toast z-index:** Must be `z-[100]` — higher than Sheet/Dialog overlays (z-50).
- **Table columns:** Customizable where practical — toggle visibility + reorder, persist to localStorage.
- **Sidebar logo:** Use `logo.png` icon mark (36px) + themed text — never `logo-full.png` (dark text baked in, breaks dark mode).
- **Testing:** Test files live alongside routes in `__tests__/` directories. Use `chainMock()` pattern for Supabase client mocking (two-pass init). Mock `@/lib/supabase-server` in every API route test.
- **API route SELECT:** Use explicit column selection on list/read endpoints. Only use `select('*')` when the full record is needed (e.g., account export, audit diffs, edit forms that need all fields).
- **Cross-domain links:** On marketing pages, use `<a href={APP_DOMAIN + '/login'}>` (not `<Link>`) for links to `app.holidaytrack.co.uk` — Next.js `<Link>` is for same-origin client-side navigation only.
- **Sidebar sections:** Collapsible with `ChevronDown` toggle. Auto-expand section containing active route. Nav items indented (`pl-2`), 36px rows (`h-9`), 18px icons, `rounded-lg`. Section labels are uppercase buttons.
- **Dashboard list page layout:** All list pages must follow the canonical pattern. Structure: (1) Header with title + Add button; (2) KPI cards; (3) Toolbar: Search → Filters → Columns (`Settings2`) → Export; (4) Expandable filters; (5) Table; (6) Pagination (`pt-2`, icon-only `h-7` buttons, `X / Y` format).
- **Keyboard-accessible sortable headers:** All `<th onClick>` must also have `tabIndex={0}`, `role="button"`, `onKeyDown` for Enter/Space, and `aria-label`.
- **localStorage scoped to user ID:** All localStorage keys use `ht_${suffix}_${userId}` pattern — different accounts on same browser get independent state.
- **Field-level validation:** Zod errors must be displayed inline next to the field — never silently swallowed.
- **Unsaved changes warning:** All forms must track dirty state and warn before navigation.

## Design Consistency & Brand Standards

**This section is MANDATORY for all Claude Code work.** Every page, component, and feature must comply with these standards. The visual identity is: clean, modern, premium SaaS — think Linear/Notion. White space is generous, borders are subtle, shadows are minimal. No exceptions. Deviations require explicit user approval.

### Brand Colors

| Token | Light Mode | Dark Mode | CSS Variable | Usage |
|-------|-----------|-----------|--------------|-------|
| **Primary (Purple)** | `#401D6C` | `#7C5CBF` | `--brand-purple` | Navigation, primary buttons, headings, active states, focus rings |
| **Secondary (Pink)** | `#EC385D` | `#F06082` | `--brand-pink` | CTAs, alerts, badges, destructive actions, hover accents |
| **Accent (Peach)** | `#FF8073` | `#FFA599` | `--brand-peach` | Status indicators, progress bars, notifications, decorative elements |
| Surface | `#FFFFFF` | `#1A1B2E` | `--brand-surface` | Card backgrounds, page backgrounds |
| Light BG | `#FAF7FF` | `#0F0F23` | `--brand-cream` | Page-level background (subtle purple tint) |
| Text Primary | `#1A1225` | `#F1F5F9` | `--brand-text` | Headings, body text |
| Text Secondary | `#5E5470` | `#CBD5E1` | `--brand-text-2` | Descriptions, labels, secondary content |
| Text Muted | `#8E849A` | `#64748B` | `--brand-text-3` | Placeholders, timestamps, metadata |
| Border | `#E8E2F0` | `rgba(255,255,255,0.08)` | `--brand-border` | Card borders, dividers |
| Success | `#188038` | `#10B981` | `--brand-success` | Approved states, positive feedback |
| Warning | `#F59E0B` | `#FBBF24` | `--brand-warning` | Pending states, low balance warnings |
| Error | `#D93025` | `#EF4444` | `--brand-error` | Declined states, errors, destructive actions |

**Color rules:**
- **Never hardcode hex values in components** — use CSS variables or `getThemeColors(isDark)` from `src/contexts/ThemeContext.tsx`
- Dark mode variants are mandatory — every color must work in both themes
- All grays are purple-tinted (compare `#8E849A` vs generic `#6B7280`) — never use raw Tailwind grays
- Gradient direction: always purple → pink → peach (left-to-right or top-to-bottom)
- Brand gradient: `linear-gradient(135deg, primary, secondary)` — used for primary CTAs and hero accents
- Additional CSS variables: `--brand-purple-d` (dark), `--brand-purple-l` (light), `--brand-border-f` (focus border)

**Three styling zones (intentional, follow the correct one):**

| Zone | Pages | Color Source | Reason |
|------|-------|-------------|--------|
| **Auth** | `src/app/(auth)/` | CSS variables (`var(--brand-*)`) | Server-compatible, no JS needed |
| **Dashboard** | `src/app/(dashboard)/` | `getThemeColors(isDark)` inline styles | Dynamic theme, client-side |
| **Marketing** | `src/app/(marketing)/` | `brand` const + CVA variants | Server-rendered, no ThemeContext |

### Status Color Mapping (Holiday-Specific)

| Status | Color | Badge Style |
|--------|-------|-------------|
| Pending | `--brand-warning` (amber) | Amber background, dark amber text |
| Approved | `--brand-success` (green) | Green background, dark green text |
| Declined | `--brand-error` (red) | Red background, dark red text |
| Cancelled | `--brand-text-3` (gray) | Gray background, muted text |

### Typography

| Font | CSS Variable | Tailwind Usage | Purpose |
|------|-------------|----------------|---------|
| **Inter** | `--font-inter` | `font-[family-name:var(--font-inter)]` | UI chrome: buttons, labels, nav, form inputs, table headers, badges |
| **Plus Jakarta Sans** | `--font-body` | `font-[family-name:var(--font-body)]` | Body text: paragraphs, descriptions, card content, list items |
| **DM Serif Display** | `--font-display` | `font-[family-name:var(--font-display)]` | Display only: marketing headlines, auth hero text. **NEVER in dashboard** |

**Dashboard typography scale:**

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Page title (h1) | `text-xl md:text-2xl` | `font-bold` | Inter |
| Section heading (h2) | `text-lg` | `font-bold` | Inter |
| Card title | `text-sm` / `text-[0.85rem]` | `font-semibold` | Inter |
| Body text | `text-sm` / `text-[0.85rem]` | `font-normal` | Plus Jakarta Sans |
| Muted/meta | `text-xs` / `text-[0.8rem]` | `font-medium` | Inter |
| KPI number | `text-2xl` | `font-bold` | Inter |
| Table header | `text-xs` | `font-medium uppercase tracking-wider` | Inter |
| Balance display | `text-3xl md:text-4xl` | `font-bold` | Inter |

**Typography rules:**
- Never introduce new fonts — these three cover all use cases
- Dashboard text is compact — `text-sm` is the baseline, not `text-base`
- Use `tracking-tight` on headings, `tracking-wider` on uppercase labels
- Font weight hierarchy: `400` body, `500` labels/nav, `600` headings, `700` emphasis
- Line height: `leading-relaxed` for body text, `leading-tight` for headings
- Fonts loaded via `<link>` tags in `src/app/layout.tsx` with `preconnect` — never use `next/font` (broken)

### Component Standards

**Use existing infrastructure — do not reinvent:**
- `shadcn/ui` components (`src/components/ui/`) — never build custom buttons, cards, dialogs, inputs
- `cn()` from `src/lib/utils.ts` for all className composition
- `CVA` (class-variance-authority) for component variants — follow `src/components/ui/button.tsx`
- `useTheme()` from `src/contexts/ThemeContext.tsx` for theme-aware dynamic styling
- Icons: `lucide-react` — import individual icons (`import { Calendar } from 'lucide-react'`), size with `className="w-4 h-4"` or `"w-5 h-5"`

**DO:**
- Use Tailwind classes for layout, spacing, sizing, hover states
- Use CSS variables (`var(--brand-purple)`) for brand colors in Tailwind arbitrary values
- Use shadcn/ui Card, Button, Dialog, Select, Badge, Tabs, Sheet, Popover, Calendar, etc.
- Use `hover:` and `focus:` Tailwind modifiers for interactive states
- Use SWR hooks from `src/lib/swr.ts` for client-side data — never raw `fetch()` in components

**DON'T:**
- Create inline `style={{}}` objects for colors — use Tailwind or CSS variables (exception: dashboard pages using `getThemeColors()`)
- Use `onMouseEnter`/`onMouseLeave` to set `.style` properties — use Tailwind `hover:` classes
- Hardcode hex color values in component files
- Mix styling approaches on the same page
- Build custom components when a shadcn/ui primitive exists
- Use emoji as icons — use Lucide React
- Use browser `alert()` — use `useToast()` from `@/components/ui/toast`

### Spacing & Layout

**Dashboard layout constants:**
- Sidebar width: `252px` (`w-[252px]`)
- Navbar/sidebar header height: `60px` (`h-[60px]`)
- Page content padding: `p-4 md:px-6 md:py-6`
- Card padding: `p-4` to `p-6`
- Card gap in grids: `gap-3 md:gap-4`
- Section vertical spacing: `space-y-5`

**Visual consistency:**
- **Border radius:** `rounded-xl` (12px) for cards/panels, `rounded-lg` (8px) for inputs/buttons, `rounded-full` for avatars/badges
- **Shadows:** `shadow-sm` for cards, `shadow-md` for dropdowns/modals — no inline shadow definitions
- **Spacing:** 4px grid — use Tailwind scale (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px)
- **Cards:** White bg (light) / `var(--brand-surface)` (dark), 1px border via `var(--brand-border)`, `rounded-xl`, `shadow-sm`
- **Page layout:** Full-width (no `max-w` constraint on dashboard content). `DashboardWrapper.tsx` handles outer padding
- **Tables:** Flat (no border wrapper), light gray header, thin `border-b` dividers only, no alternating rows, CSS-only hover. Row height ~48px, `px-4 py-3` cell padding. Sortable column headers with purple highlight + arrow indicator
- **Dividers:** Use `border-b` with `var(--brand-border)` — never raw gray values
- **Empty states:** Centered icon (in rounded container with `${colors.primary}12` background) + heading + description + CTA button

### Animations & Transitions

| Class | Duration | Use For |
|-------|----------|---------|
| `transition-colors duration-150` | 150ms | Hover/focus state color changes |
| `transition-all duration-300` | 300ms | Theme change transitions |
| `animate-fadeIn` | 300ms ease-out | Page content appearance |
| `animate-pulse` | default | Skeleton loading states |
| `animate-spin` | default | Spinner icons (Loader2) |

**Rules:**
- Keep interaction animations under 200ms — users should never wait for animations
- Respect `prefers-reduced-motion` — ThemeContext checks and sets `--theme-transition` to `none`
- Animate `transform` and `opacity` — never animate layout properties (`width`, `height`, `top`, `left`)
- Don't add new `@keyframes` without approval — use existing utility classes

### Performance & UX

- **Core Web Vitals targets:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Loading states:** Skeleton placeholders (pulsing rectangles matching content shape) for data loading — spinners (`Loader2`) only for user-triggered actions (form submit, button click)
- **Images:** Always use `next/image` with `width`/`height`. Add `priority` to above-the-fold images
- **Dynamic imports:** Use `next/dynamic` with `{ ssr: false }` for heavy client components (> 50KB not above-fold)
- **Data fetching:** Use SWR hooks — handles caching, dedup, and revalidation. Don't use `useEffect` + `fetch()` for data
- **Perceived speed:** Optimistic UI updates via SWR `mutate()` for instant feedback
- **Bundle discipline:** Never add new dependencies without justification. Import icons individually
- **Sentry:** Error monitoring configured — don't swallow errors silently
- **Error display:** Wrap errors in a Card with error styling — never show raw error text

### Responsive Design & Accessibility

- **Mobile-first:** Design for 320px minimum. **Many employees will use this on their phones** — this is critical for a holiday request tool
- **Breakpoints:** Mobile = base, Tablet/sidebar appears = `md:` (768px), Full desktop = `lg:` (1024px)
- **Touch targets:** Minimum 44x44px for interactive elements on mobile — especially the Approve/Decline buttons
- **Color contrast:** WCAG AA minimum — 4.5:1 for normal text, 3:1 for large text. Color must not be the only indicator of state — use icons or text alongside color
- **Focus indicators:** Visible focus rings using `ring-2 ring-[var(--brand-purple)]/20`
- **Reduced motion:** Use `motion-safe:` Tailwind modifier for animations
- **Semantic HTML:** Proper heading hierarchy, landmarks (`main`, `nav`, `aside`), ARIA labels on icon-only buttons
- **Keyboard navigation:** All interactive elements keyboard-accessible. No `<div onClick>` without `role="button"`, `tabIndex={0}`, and keyboard handler
- **Table scroll hint:** `.table-scroll-hint` CSS class adds right-edge gradient fade on mobile to signal horizontal scrollability
- **PWA:** Service worker registered, installable on mobile home screens (Phase 2)

### Dashboard Page Architecture

Every new dashboard page **must** follow this structure:

```tsx
'use client'
// 1. Import useTheme + getThemeColors
const { isDark } = useTheme()
const colors = getThemeColors(isDark)

// 2. Hydration guard
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

// 3. Show skeleton while !mounted or isLoading
if (!mounted || isLoading) return <SkeletonUI />

// 4. Show empty state when data is empty
if (data.length === 0) return <EmptyState />

// 5. Render with theme colors + responsive layout
return <div className="p-4 md:p-6">...</div>
```

### Page Design Checklist

Every new page or component **must** satisfy all of these before it's considered complete:

1. Uses the brand color palette exclusively — no off-brand grays or colours
2. Uses the correct font for each text type (Inter = UI, Plus Jakarta = body, DM Serif = display/marketing only)
3. Follows the 4px spacing grid and dashboard layout constants
4. Has skeleton/placeholder loading states for all async data
5. Works correctly in both light and dark mode (tested visually)
6. Is responsive from 320px to 1920px+
7. Uses shadcn/ui primitives — no custom implementations of solved UI patterns
8. Has consistent page padding and max-width constraints
9. All interactive elements have hover, focus, and active states
10. Passes WCAG AA color contrast requirements
11. Follows the dashboard page architecture pattern (`mounted` guard, skeleton, empty state)
12. Uses SWR for data fetching, not raw `fetch()` in effects
13. Sheet forms reset on close, have sticky save button, Cancel button, and SheetTitle
14. Field-level validation errors displayed inline
15. Unsaved changes warning on navigation

## Features — Complete List

### Phase 1 — MVP (Compliance from Day 1)

**Authentication & Onboarding**
- Email + password login (Supabase Auth)
- Forgot password / reset password flow
- Email verification with resend option
- Team invitations — admin invites by email, branded invite email, acceptance flow
- One-tenant-per-user enforcement
- Guided onboarding tutorial — floating step-by-step walkthrough for new admins
- Deactivated user blocking — middleware signs out + redirects

**Employee Dashboard**
- Personalised greeting with name
- Balance card — large display of remaining ordinary + additional leave (days or hours)
- "Request Holiday" button — primary CTA, always visible
- Recent/pending requests list with colour-coded status pills
- Notification badge for managers (count of pending approvals)
- Bank holidays card — upcoming bank holidays for org's region
- Year progress indicator — visual bar showing holiday year progress

**Holiday Requests**
- Request form — date range picker with calendar UI
- Auto-calculate working days (excludes weekends + org's bank holidays)
- Hours input mode for hourly employees
- Leave type selector: Ordinary / Additional
- Live remaining balance as dates are selected
- Bank holiday detection — auto-excludes, shows which ones
- Optional employee notes
- Overlap warning — flags clashes with approved team requests
- 2 clicks + date selection to submit
- My Requests page — full history with status filters
- Cancel own pending or approved request (with confirmation)

**Manager Approval**
- Approval queue — card per pending request
- 1-click approve button
- Decline with optional reason
- Team absence context — see who else is off before approving
- Bulk approve — select multiple, approve in one action
- Team overview — who's off when, balances at a glance

**Employee Management (Admin)**
- Employee list table — sortable, searchable, paginated, customisable columns
- Add employee — name, email, role, start date, contract type, hours/week, days/week, holiday unit, manager
- CSV bulk import (batched processing)
- Edit employee (Sheet sidebar)
- Deactivate / reactivate / delete employee
- Manager assignments (many-to-many, primary manager)
- Auto-generate entitlement on creation (pro-rata if mid-year)
- Invite email on creation
- CSV export of employee list

**Entitlement Management (Admin)**
- Entitlement table per employee per year
- Edit entitlements
- Pro-rata calculation (rounds to nearest 0.5)
- Carry-forward cap (configurable per org)
- Bulk entitlement update for new holiday year

**Organisation Settings (Admin)**
- Org name and slug
- Configurable holiday year (any start month/day)
- Default holiday unit (days/hours)
- Bank holiday region (England & Wales / Scotland / Northern Ireland)
- Carry-forward cap
- Bank holiday management — view seeded, add custom company holidays

**Reports & Compliance**
- Payroll export — date range → CSV (Paycircle-compatible)
- Audit trail viewer — searchable, filterable, paginated
- Audit trail CSV export
- Carry-forward report
- Absence summary report
- KPI cards on reports page

**Audit Trail (6-Year Retention)**
- Immutable append-only log
- Every request, approval, decline, cancellation recorded
- Every entitlement and employee change recorded
- Before/after JSONB on all changes
- Timestamp + user + IP on every entry

**Email Notifications (Resend)**
- Request submitted → manager(s)
- Request approved → employee
- Request declined → employee (with reason)
- Request cancelled → manager(s)
- Employee invited → branded welcome email
- Email log tracking

**Super-Admin (Intelligent Payroll)**
- Org management — create, view, edit all client organisations
- Impersonate — login as admin of a specific org
- View all users across all orgs
- Transfer user between organisations
- Archive empty tenants
- Platform-wide analytics
- Admin email activity dashboard

### Phase 2 — Growth & Self-Service

**Self-Service Onboarding**
- Public signup flow — employer creates account without IP intervention
- Stripe subscription setup (free tier by default)
- Org setup wizard — name, holiday year, region, first admin
- Employee self-registration via invite link

**White-Label Theming**
- Per-org branding — logo upload, primary colour override
- Custom email header/footer with org branding
- Theme stored in `organisations` table, applied via CSS variables
- IP default branding as fallback

**Stripe Subscription**
- Free tier (unlimited initially — maximise users first, then monetise)
- Pro tier pricing (TBD)
- Subscription management page
- Upgrade/downgrade flow
- Billing history

**Mobile PWA**
- Service worker for offline-capable shell
- Install prompt on mobile browsers
- Push notifications for approvals (if supported)
- Optimised mobile approval flow — swipe to approve/decline

**Team Absence Calendar**
- Full calendar view of team absences (month/week)
- .ics download for individual employees
- Calendar sync URL for Outlook/Google Calendar integration
- Bank holidays shown on calendar

**Holiday Pay Configuration**
- Per-employee config: overtime, commission, regular bonuses included
- Reference period (default 52 weeks, configurable)
- Part-time and irregular hours worker tracking
- Notes field for complex arrangements

**Payments in Lieu**
- Record payouts for untaken holiday on termination
- Untaken amount, gross pay, date, reason, authorised by
- Included in audit trail and payroll export

**Carry-Forward Year-End Automation**
- Background job on org's holiday year end date
- Auto-calculate carry-forward (respecting cap)
- Admin notification before year-end
- Year-end summary report

**Additional Reports**
- Bradford Factor report (absence pattern scoring)
- Team calendar export
- Entitlement history per employee
- Year-on-year comparison

### Phase 3 — Integrations & Intelligence

- SSO (Microsoft 365 / Google)
- API for third-party integrations
- Xero payroll integration
- AI assistant for holiday policy questions
- Advanced analytics and forecasting

## Workflow Rules

- **Plan first**: Enter plan mode for any non-trivial task (3+ steps or architectural decisions). If something goes sideways, stop and re-plan.
- **Verify before done**: Never mark a task complete without proving it works. Run tests, check logs, demonstrate correctness.
- **Self-improvement**: After ANY correction from the user, update `tasks/lessons.md` with the pattern. Review lessons at session start.
- **Autonomous bug fixing**: When given a bug report, just fix it. Find root causes, check logs, resolve — zero hand-holding needed.
- **Elegance check**: For non-trivial changes, pause and ask "is there a more elegant way?" Skip for simple fixes.
- **Track progress**: Use `tasks/todo.md` for multi-step tasks. Mark items complete as you go.
- **2-3 click rule**: Before completing any user-facing feature, count the clicks. If it takes more than 3 clicks for a core action, redesign.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code. The product must be usable by someone with zero training.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
- **Compliance by Default**: Every data-changing action must be audited. If in doubt, log it.
- **Mobile-First**: Employees will request holidays on their phones. Every screen must work beautifully at 320px.

## Build Order

Build in this sequence — each step is a working, testable increment:

1. **Project scaffold**: Next.js + Tailwind + shadcn/ui + Supabase client setup + theme system
2. **Database**: Run migration in Supabase SQL Editor, generate TypeScript types
3. **Auth**: Login, logout, password reset, auth middleware, deactivated user blocking
4. **Employee dashboard**: Balance card, recent requests, personalised greeting
5. **Request holiday**: Form with date picker, auto-calc, bank holiday detection, submit
6. **Manager approvals**: Queue with approve/decline, team absence context
7. **Employee management**: CRUD + CSV import + manager assignments
8. **Entitlement management**: View/edit per employee per year, pro-rata
9. **Org settings**: Holiday year, region, unit defaults, carry-forward cap
10. **Reports**: Payroll CSV export + audit trail viewer + absence summary
11. **Email notifications**: Resend integration for all triggers
12. **Super-admin**: Org management + impersonation
13. **Team invitations**: Invite flow + acceptance + one-tenant-per-user
14. **Onboarding tutorial**: Guided walkthrough for new admins
15. **Marketing site**: Landing page, pricing, terms, privacy
16. **Self-service signup**: Public registration + Stripe subscription (free tier)
17. **White-label theming**: Per-org branding
18. **PWA**: Service worker + mobile install
19. **Team absence calendar**: Calendar view + .ics sync
20. **Compliance extras**: Holiday pay config, payments in lieu, year-end automation
21. **Polish**: Error handling, loading states, empty states, responsive audit, accessibility pass

## File Reference Quick Index

| Purpose | File Path |
|---------|-----------|
| Theme colors & dark mode | `src/contexts/ThemeContext.tsx` |
| CSS variables & animations | `src/app/globals.css` |
| Root layout (fonts, analytics) | `src/app/layout.tsx` |
| shadcn/ui config | `components.json` |
| Class merge utility | `src/lib/utils.ts` (`cn()`) |
| SWR data hooks | `src/lib/swr.ts` |
| Zod schemas | `src/lib/validations.ts` |
| Dashboard reference page | `src/app/(dashboard)/dashboard/page.tsx` |
| Auth reference page | `src/app/(auth)/login/page.tsx` |
| Domain constants | `src/lib/domains.ts` |
| Email sending + logging | `src/lib/resend.ts` |
| Email templates | `src/lib/email/templates.ts` |
| Holiday calculation | `src/lib/holiday-calc.ts` |
| Pro-rata calculation | `src/lib/pro-rata.ts` |
| Payroll CSV export | `src/lib/export/payroll-csv.ts` |
| Dashboard layout wrapper | `src/components/layout/DashboardWrapper.tsx` |
| Marketing components | `src/components/marketing/` |
| Onboarding tutorial | `src/components/onboarding/OnboardingTutorial.tsx` |
| DB migration (initial) | `supabase/migrations/001_initial_schema.sql` |

## Session Log

_Add notes from each Claude Code session below so context carries forward._

### Session 0 — Project Planning (Pre-Build)
- Complete product planning and technical specification created in Claude.ai chat
- Domain selected: `holidaytrack.co.uk` (available, `.uk` also available — register both)
- Full database schema designed: 9 tables with RLS, audit triggers, helper functions, pro-rata calculation, UK bank holidays seeded 2026-2028
- Migration file `001_initial_schema.sql` ready to run in Supabase SQL Editor
- `CLAUDE_CODE_BRIEF.md` and `SETUP.md` created as build references
- 140 features catalogued across 3 phases
- Design system carried from ThePayBureau: brand colors (purple/pink/peach), typography (Inter/Plus Jakarta/DM Serif), component standards, all conventions
- Key decisions: multi-tenant from day 1, configurable holiday year per org, hours AND days support, email+password auth (SSO later), Resend for email, free tier initially (Stripe billing later)
- Phase prioritisation: self-service signup, white-label theming, PWA, and team calendar moved to Phase 2 (build earlier than originally planned)

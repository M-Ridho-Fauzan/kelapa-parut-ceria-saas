<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## Project: SaaS Kelapa Pengiriman

## Main Rules

- Always mobile-first
- Always typecheck and refactor after code

### Tech Stack

- **Framework:** Next.js 16 (App Router, proxy.ts)
- **Database:** Supabase PostgreSQL + Prisma
- **Auth:** Supabase Auth (`@supabase/ssr`)
- **UI:** shadcn/ui (base-sera/olive) + Tailwind CSS v4
- **Icons:** Tabler Icons

### Supabase Client Patterns

- **Browser client:** `src/lib/supabase/client.ts` → `createBrowserClient`
- **Server client:** `src/lib/supabase/server.ts` → `createServerClient` + cookies
- Always use `getUser()` (not `getSession()`) for auth checks
- Always add `revalidatePath("/", "layout")` after auth actions

### Route Protection

- Next.js 16 uses `proxy.ts` (NOT `middleware.ts` — deprecated)
- File location: `src/proxy.ts`
- Function export: `export function proxy(request: NextRequest)`

### Prisma Commands

```bash
pnpm prisma generate        # Generate Prisma Client
pnpm prisma migrate dev     # Run migrations (dev)
pnpm prisma migrate deploy  # Run migrations (prod)
pnpm prisma studio          # Open Prisma Studio
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

### Auth Flow

- Login only via `/login` (no public register)
- Admin creates users via `/dashboard/admin/users`
- First admin: create user in Supabase Dashboard → update role to ADMIN in Prisma
- Prisma User syncs on first login (auto-create with role USER)

### File Structure

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── admin/users/page.tsx      # Admin create users
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx                # Dashboard layout + nav
│   ├── actions/auth.ts               # signIn, createUser, signOut
│   ├── auth/callback/route.ts        # OAuth callback
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── toaster.tsx                   # Toast provider
│   └── ui/                           # shadcn components
├── lib/
│   ├── prisma.ts                     # PrismaClient singleton
│   ├── supabase/
│   │   ├── admin.ts                  # Service role client (admin ops)
│   │   ├── client.ts                 # Browser client
│   │   └── server.ts                 # Server client
│   └── utils.ts                      # cn() utility
└── proxy.ts                          # Route protection + admin guard
```

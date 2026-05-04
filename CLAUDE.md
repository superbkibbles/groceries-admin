# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack at http://localhost:3000/admin
npm run build      # Production build
npm run lint       # ESLint check
npm run lint -- --fix  # Auto-fix lint issues
```

Environment variable: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost/api/v1`).

## Architecture

**Framework**: Next.js 15 Pages Router with TypeScript, Tailwind CSS, Shadcn UI.

**Base path**: The app is mounted at `/admin` (set in `next.config.ts`). All routes are prefixed — e.g. `/dashboard` is accessed at `/admin/dashboard`.

**API layer** (`src/lib/axios.ts`): A singleton Axios instance that automatically attaches:
- `Authorization: Bearer <token>` from `localStorage.token`
- `Accept-Language` and `?lang=` query param from `localStorage.preferred_language`
- Redirects to `/login` on 401 responses

**Services** (`src/services/`): One file per domain (auth, user, product, category, order, setting). All exported from `src/services/index.ts`. Pages call services directly; services call the Axios singleton.

**Redux store** (`src/store/`): Slices for `auth`, `ui`, `settings`, `orders`, `products`, `categories`. Auth check runs on every page load in `_app.tsx` and redirects to `/login` if unauthenticated (public routes: `/`, `/login`, `/register`).

**i18n** (`src/contexts/LanguageContext.tsx`, `src/hooks/useTranslation.ts`): Supports English (`en`) and Arabic (`ar`). Language preference is stored in `localStorage.preferred_language`. Arabic triggers RTL on `<html dir="rtl">`. Use the `useTranslation()` hook (`t('namespace.key')`) for UI strings; translation files live in `src/locales/`.

**Localization service** (`src/lib/localization.ts`): Handles product/category translation data from the backend (each entity may carry a `translations` field keyed by language code). `applyProductLocalization` / `applyCategoryLocalization` pick the right language variant.

**File upload**: UploadThing (`src/server/uploadthing.ts`, `src/pages/api/uploadthing.ts`). Images are served from `utfs.io` (whitelisted in `next.config.ts`).

**Forms**: Mix of React Hook Form + Zod (newer forms, e.g. `EnhancedProductForm`) and Formik + Yup (older forms). New forms should use React Hook Form + Zod.

**UI components**: Shadcn UI components live in `src/components/ui/`. Do not edit generated Shadcn files directly; add wrappers instead.

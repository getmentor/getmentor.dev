# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` holds Next.js pages and `src/pages/api/` API routes.
- `src/components/` contains UI, layout, forms, mentors features, and `src/components/hooks/` for custom hooks.
- `src/lib/` houses shared utilities (API client, logging, metrics); `src/server/` wraps server-side data access to the Go API.
- `src/types/` defines domain and API types; `src/config/` stores app config (filters, SEO).
- Tests live in `src/__tests__/` plus colocated `__tests__` under `src/components/hooks/` and `src/lib/`.
- Static assets are in `public/`; global styles in `src/styles/` with Tailwind configured in `tailwind.config.js`.

## Build, Test, and Development Commands
```bash
yarn dev                    # Run local dev server on http://localhost:3000
yarn build                  # Production build
yarn start                  # Start production server (512MB memory cap)
yarn lint                   # ESLint (src/ only)
yarn test                   # Jest test suite
yarn test --watch           # Jest watch mode
yarn test --coverage        # Coverage report
npx tsc --noEmit            # TypeScript type check
./docker-build-test.sh      # Docker image build using .env
```

## Coding Style & Naming Conventions
- TypeScript strict mode is enabled; prefer explicit types and avoid `any`.
- Use `.ts` for non-UI modules and `.tsx` for React components/pages.
- Import from `@/…` path aliases instead of relative `../../`.
- Prefer type-only imports (`import type { ... }`) for types.
- Formatting is enforced via Prettier and ESLint; lint-staged runs `prettier --write` and `eslint --fix` on `*.ts,*.tsx`.
- Components use PascalCase filenames (e.g., `NavHeader.tsx`); hooks use `useX` naming.

## Testing Guidelines
- Jest + `@testing-library/react` with `jsdom` for UI tests.
- Use `node-mocks-http` for API route handlers.
- Name tests `*.test.ts` / `*.test.tsx` and place them in the existing `__tests__` structure.

## Commit & Pull Request Guidelines
- Commit messages are short and imperative (e.g., “Add SSR observability…”, “rename …”, “removed …”); no conventional prefixes.
- Use feature branches; do not merge to `main` without explicit permission.
- Before opening a PR, run `yarn lint`, `npx tsc --noEmit`, `yarn test`, and `yarn build`.
- PR descriptions should include a brief summary and the tests run.

## Configuration & Architecture Notes
- Required environment variables live in `.env.example` (Go API URL/token, Azure domain, reCAPTCHA, metrics, log level).
- All data operations are delegated to the Go API backend; Next.js acts as a thin client.

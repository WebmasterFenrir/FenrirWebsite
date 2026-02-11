# Turborepo overview for new developers

## What Turborepo does
- Organizes many JS/TS apps and packages inside a single monorepo.
- Shares code (UI components, configs, utilities) so it only lives in one place.
- Runs builds/tests once and reuses cached results across projects.

## Repository layout in this project
- Root `package.json` uses Bun workspaces: `"workspaces": ["apps/*", "packages/*"]`.
- Apps such as `apps/website` can depend on shared packages like `packages/ui`.

## turbo.json task graph
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```
- `^build` means run the build of every dependency first.
- `inputs` / `outputs` define what affects caching.
- `dev` tasks stay running and skip caching.

## Running tasks
Use the root scripts in `package.json`:
- `bun run build` → `turbo run build` (runs `build` everywhere, respecting the graph & cache).
- `bun run dev` → `turbo run dev` (starts dev servers; add `-- --filter=<target>` to scope).
- `bun run lint`, `bun run check-types` propagate similarly.

### Filters
- `turbo run build --filter=packages/ui...` runs `build` for that package plus dependents.

## Caching
- Local cache is automatic. Enable remote cache with `turbo login` and `turbo link` (Vercel account) to share results across machines/CI.

## Why it helps newcomers
1. Single command to build/test everything.
2. Shared configs stay consistent across apps.
3. Incremental runs are fast because unchanged projects reuse cached artifacts.

## Getting started checklist
1. `bun install`
2. `bun run dev -- --filter=apps/website`
3. Edit code in targeted workspace; watch Turbo rerun only what changed.

# Vercel / Next.js ChunkLoadError fix

This patch applies two layers of protection for the production error:

`Error [ChunkLoadError]: Failed to load chunk server/chunks/ssr/src_features_tests_components_...`

## 1. Build production with Webpack

`vercel.json` overrides the Vercel build command with:

```bash
npm run build -- --webpack
```

Next.js 16 uses Turbopack by default. The `--webpack` flag opts out of the
Turbopack production chunk graph that is producing the failing SSR chunk.

## 2. Do not SSR the browser-only standard test runner

`TestRunner` uses browser state such as `useSearchParams`, `window`,
`document`, timers and local storage. A new client-only wrapper loads it with
`next/dynamic({ ssr: false })`.

The standard grammar and morphology routes now render this wrapper instead of
putting the large runner into the server SSR chunk graph.

## Deployment

Commit the new/changed files, push, then redeploy to Vercel. Use a deployment
without the previous build cache if Vercel offers that option. After the new
deployment is Ready, test the production URL directly.

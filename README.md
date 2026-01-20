# Ether

A Hono application running on Cloudflare Workers.

## Goals

- Verify parallel test execution with D1 using `@cloudflare/vitest-pool-workers`
- Deploy to Cloudflare Workers via GitHub Actions
- Implement OAuth authentication using Kinde

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Type Generation

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```bash
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

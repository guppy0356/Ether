# Ether

A minimal Git server built on Cloudflare Workers and R2. It exposes a RESTful API for pushing, pulling, and cloning repositories without requiring a traditional Git daemon.

## Architecture

- **Runtime**: Cloudflare Workers (edge)
- **Framework**: Hono
- **Storage**: Cloudflare R2 (packfiles and refs)
- **CI/CD**: GitHub Actions → Wrangler deploy

All state lives in R2. The Worker itself is stateless, so it scales horizontally across Cloudflare's edge network with no coordination.

### R2 Bucket Layout

```
packfiles/
├── refs/
│   └── heads/
│       └── main          # commit hash (plain text)
└── objects/
    └── pack/
        └── pack-<hash>.pack
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/manifest` | List all refs and packfiles (used by clone/pull) |
| `GET` | `/file/*` | Download a stored object (packfile) |
| `PUT` | `/upload/*` | Upload a packfile |
| `GET` | `/refs/*` | Read a ref (branch pointer) |
| `PUT` | `/refs/*` | Update a ref |

### Clone / Pull

1. `GET /manifest` — returns `{ refs: { "refs/heads/main": "<hash>", ... }, packs: ["objects/pack/..."] }`
2. `GET /file/<pack-key>` for each packfile

### Push

1. `PUT /upload/objects/pack/<filename>` — upload new packfile
2. `PUT /refs/heads/<branch>` — update branch pointer to new commit hash

## Development

```bash
npm install
npm run dev
```

## Deployment

Merging to `main` triggers automatic deployment via GitHub Actions. To deploy manually:

```bash
npm run deploy
```

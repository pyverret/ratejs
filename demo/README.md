# Demo (GitHub Pages)

This folder is a static demo app for `@pyverret/ratejs`.

## Run locally

From repo root:

```bash
cd demo
npm install
npm run dev
```

The script builds the library from the parent project first, then starts Vite.

## Build demo

```bash
cd demo
npm run build
```

Output is written to `demo/dist`.

## Deploy

Deployment is automated by `.github/workflows/pages-demo.yml` on pushes to `main`.

In GitHub settings for this repo:
1. Go to `Settings` -> `Pages`.
2. Set `Build and deployment` to `GitHub Actions`.

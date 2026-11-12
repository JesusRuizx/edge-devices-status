# Edge Device Dashboard

Minimal Next.js + TypeScript + Tailwind scaffold to view devices from the `references` folder.

Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

Notes

- Data is read from `references/edge-devices-status.json` on the server side.
- Tailwind is configured; run `npx tailwindcss -i ./styles/globals.css -o ./public/output.css --watch` only if you prefer a manual build, but the Next dev server handles PostCSS/Tailwind via the build pipeline.

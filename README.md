This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Proof notes (Figma-style comments)

Visitors can press `C` (or click the CMYK lockup in the lower left) and pin a
note anywhere on a page. Notes are saved under an anonymous 30-day cookie so
they're still there when the visitor comes back, and every new note emails
Marc with a link that opens the page with that pin highlighted.

Code lives in `src/components/proof`, `src/lib/proof`, and `src/app/api/proof`.

**Production needs a Redis database** — without one, notes are held in memory
and vanish between serverless invocations. In the Vercel dashboard: project →
Storage → Create Database → **Upstash Redis** (free tier is plenty). That injects
`KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically; redeploy and it's live.
Locally it runs in memory with no setup.

Emails go through the same `RESEND_API_KEY` as the contact form.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

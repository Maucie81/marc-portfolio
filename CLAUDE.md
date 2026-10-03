# marc-portfolio

Marc Favro's portfolio (Next.js). Pushes to `main` auto-deploy on Vercel to https://www.marcfavro.com in about a minute.

## Deploying

When the user says **"deploy"** (or "commit and push", "ship it", "launch"), do the whole pipeline without further questions:

1. `npm run build` — stop and report if it fails.
2. Commit **only the changes this session made.** Other Claude sessions often have unfinished edits in the same files, so never `git add -A` / `git commit -a`. Check `git status` and `git diff`; if a file mixes your edits with someone else's, commit just your hunks (e.g. build the commit from the `HEAD` version plus your edits with a temporary `GIT_INDEX_FILE`, then point the real index at the committed blobs so nothing shows as a staged revert). Ask before shipping work you didn't make.
3. `git push origin main`.
4. Confirm the change is live on https://www.marcfavro.com (curl for something unique to the change). If Vercel's build fails — e.g. a transient Google Fonts download error — read the log with `npx -y vercel@latest inspect <deployment-url> --logs` and redeploy with `npx -y vercel@latest redeploy <deployment-url> --target production`.
5. Tell the user it's live (or what blocked it).

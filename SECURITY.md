# Security

Tailor Fit uses server-side environment variables for AI provider credentials.
Never commit real API keys, `.env`, or `.env.local` files.

## Environment Files

Use `.env.example` only for placeholder values. Put real keys in `.env.local`
for local development and in Vercel environment variables for deployment.

Ignored files include:

```txt
.env
.env*.local
```

## If A Key Was Committed

Treat any committed API key as compromised, even if a later commit removes it.
Git history is still recoverable from public clones.

Before sharing the repository publicly:

1. Revoke or rotate the exposed key in the provider dashboard.
2. Update local `.env.local` with the new key.
3. Update the production deployment environment variable with the new key.
4. Redeploy the app.
5. Confirm the current tracked worktree contains placeholders only.

## Public Submission Checklist

- `.env.example` contains placeholder values only.
- `.env.local` is ignored and not staged.
- No real key appears in the current tracked worktree.
- Any key that appeared in git history has been rotated.

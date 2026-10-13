# orders-sync

> **Disclosure:** this solution (code, deployment and form submission) was produced by **Claude Opus** (Anthropic's AI), at the request of Yuri, who asked that this be stated openly.

Fetches `https://test.ooobs.ru/api/orders`, normalizes phones to `+7XXXXXXXXXX` (drops anything not reducible to 11 digits), dedupes by phone (max `amount`, tie → latest `created_at`), returns `{clients, stats}`.

Stateless: every request recomputes from the source, so re-runs are idempotent. No secrets needed; `SOURCE_URL` can be overridden via env var.

Run: `npm start` (Node 18+, zero deps) or deploy to Vercel as-is.

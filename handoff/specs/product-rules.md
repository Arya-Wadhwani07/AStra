# Product rules the UI must follow

Condensed from `AGENTS.md`, `CLAUDE_DESIGN_CONTEXT.md` and the design system. The originals win if anything here differs.

## Loyalty points
- One platform-wide balance, earned across creators and redeemable with any participating creator. Source labels in history explain where points came from; they don't create separate wallets.
- Redemption rate is fixed by AStra: **100 points = $1 off** (USD). It's a discount conversion, not cash, not withdrawable, not transferable, not crypto.
- Each creator sets the **maximum percentage** of an eligible ticket or merchandise price that points can cover. Fans choose how many points to use, up to the lower of their approved balance and that cap, and pay the rest. Offer "none". Never auto-spend the whole balance.
- Pending points can't be spent. Points are debited only after payment succeeds; a reservation is not a debit; retries must not double-spend; failed or cancelled checkouts must not consume points.
- Checkout shows: conversion, creator cap, maximum usable points, selected points, discount, amount due, remaining balance. Multi-creator carts apply each creator's cap separately.
- Example only (not a default): $25 ticket, 20% cap, 600 points available: at most 500 points for $5 off, $20 before charges.
- Unresolved (show as open, don't decide): who funds discounts, earning rules and limits, expiry, minimums/increments/rounding, allowed cap range, per-item overrides, stacking, fees/taxes/shipping eligibility, multi-currency, multi-creator settlement, refunds.
- Earning campaigns are drafts until an earning mechanism is approved. No live Spotify/YouTube/Amazon listening rewards; simulated activity says "Sample activity".

## Collaboration (creators only)
- Audiences can't see the collaboration feed, opportunities, responses, conversations, shortlists or progress. Enforce on the server. Show "Creators only" with a lock icon and the word.
- Three actions: Create opportunity, Find opportunities, My collaborations. Direct creator-to-creator outreach is separate.
- Each opportunity states its arrangement: paid, skill exchange, revenue share, unpaid or open to discussion.
- Required filters block ineligible responses with a clear reason; preferred filters only highlight stronger matches.
- One short response per creator per opportunity, with their profile/portfolio. Response limit 5, 10 or 20 (default 10); new responses pause automatically at the limit. Owner can shortlist, decline, close and reopen.
- Conversations are private to participants and linked to the opportunity.
- The brief records roles, deliverables, dates, approvals, credit, intended use and proposed payment. It's a shared plan, not a legal contract. A project is active only when every selected creator confirms the latest version; any edit creates a new version and resets confirmations.

## Verification
- Statuses: not submitted, pending, verified, action needed. Selling tickets, selling merchandise and accepting points discounts are gated in this pilot; posting and collaborating aren't.
- Explain the gated action and the next step. Never show identity documents in ordinary screens. The verification provider isn't chosen.

## Roles and privacy
- Creator, audience and admin experiences are separate. Dual-role accounts switch with an explicit "Viewing as" control; audience view hides every collaboration surface.
- Admin access is provisioned separately and every admin decision writes an audit entry with a reason and the notice sent.
- Creators see order items, quantities, fulfilment and points used, never buyers' payment details.
- Rights and credits fields record what the creator says; they aren't copyright registration or legal advice.

## Copy and content
- Plain, warm, specific, sentence case. Buttons are verb-first ("Join AStra", "Send response").
- No em or en dashes (use a period, comma, colon or parentheses; ranges use a hyphen: 6-8 PM). At most one middle dot per line. No exclamation marks, no "Oops", no filler words.
- Label sample data once per view. Never invent press, follower counts or traction.
- AStra is a working name; final branding still needs approval.

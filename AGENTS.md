# AStra project instructions

- Whatever changes you can make to it without asking, go ahead as long as it stays within the Virtual Environment and does not go out of this folder. 
- Make sure that everything is properly verified as well

## Strict filesystem boundary

- The only directory authorized for changes is this `AStra/` directory and its descendants.
- Do not create, edit, rename, move, or delete files outside this directory, including parent project files, source documents, global configuration, user settings, or system directories.
- Keep generated assets, temporary files, downloads, logs, caches, dependencies, build output, and test artifacts inside this directory. Configure tools accordingly before running them.
- Do not use symlinks, path traversal, external output paths, or elevated permissions to bypass this boundary. Resolve destinations before writing.
- Read outside this directory only when needed for user-provided references or applicable instructions. Treat those files as read-only.
- If an operation cannot respect this boundary, stop that operation and explain the limitation. These instructions do not authorize any exception.

## Project context

- This is the creator–fan engagement and cross-discipline creator collaboration project for the TiEHub × Replit Origin Weekend hackathon at USC.
- Saloni Belliappa Bolakaranda is the Product Manager.
- Arya Jay Wadhwani is the Technical Lead and developer.
- Use AStra as the working design brand, as on the updated SRS cover. Final public branding still needs approval.
- The existing SRS and user-approved decisions are the product references. Do not silently change scope or treat research hypotheses as validated findings.
- Latest explicit user decisions take precedence over older SRS wording. Use `CLAUDE_DESIGN_CONTEXT.md` for the current design brief and `Astra report.pdf` as read-only rough workflow guidance, not a finalized layout or evidence of completed research.
- AI creative tools such as ComfyUI or Higgsfield-style tools are intended to help produce UI visuals and design assets. They are not product features unless the user explicitly changes the scope.

## Current development gate

- The user has explicitly authorized development from the completed `handoff/` package and asked to continue. The earlier design-only gate is superseded.
- Use the approved handoff for the visual system and screen references. Keep unresolved product decisions visible.
- The implementation direction is Next.js, React, and TypeScript. Preserve the Phosphor icon choice and staged God UI references.
- The user explicitly selected MongoDB as the database. Run the local persistent replica set with `node scripts/env.mjs npm run db:start`; its binary, data and logs must stay in `.environment/`. Do not use SQLite for active application storage or connect to external Atlas without authorization.
- The user requires an isolated, project-local development environment. Run installations, development servers, builds, and tests through `node scripts/env.mjs <command> [arguments...]`. Read `ENVIRONMENT.md` before using it. Do not fall back to unsandboxed commands if the wrapper fails.
- All writes, including dependencies, caches, temporary files, and build output, must remain inside AStra. No Docker daemon storage, global installation, or user-level configuration changes are authorized.

## Confirmed loyalty and redemption behavior

- Fans have one shared platform-wide balance. Approved points earned across different creators can be combined and redeemed against eligible purchases from participating creators; points are not restricted to their earning creator.
- The confirmed redemption rate is **100 points = $1 discount** for USD purchases. This is a discount conversion, not a cash balance, withdrawal right, transferable currency, or cryptocurrency.
- Each creator chooses their maximum percentage discount for their eligible tickets and merchandise. Fans choose points to apply up to the lower of their available approved balance and the creator's permitted discount. Pending points cannot be spent; remaining cost is paid normally.
- Example, not a mandatory cap: a $50 ticket with a creator-set 20% limit permits 1,000 points for $10 off and leaves $40 before applicable charges, even if the fan has 3,000 points. Do not default every creator to 20% or assume 100% redemption is permitted.
- Checkout shows conversion, creator cap, maximum usable points, selected points, discount, payable total and remaining balance. In a future multi-creator cart, each creator's cap must apply separately; never reuse the same points or apply one seller's cap to everyone.
- Earning rates are distinct from the confirmed redemption rate. The proposed “10 song listens = 1 point” is not an approved live earning mechanism. Prior API research found Spotify compensated-stream restrictions, YouTube history-access/incentive restrictions, and Amazon Music closed-beta access. Treat external listening rewards as blocked pending provider permission and reliable verification; recheck official sources before implementation. Do not scrape or use unofficial access to bypass restrictions.
- The user has authorized a local Spotify account connection for audience members and creators. Spotify OAuth creates/reopens private AStra identities, never attaches tokens to shared demo accounts. Recent tracks may be displayed privately; this does not verify album completion or qualify for rewards.
- The user requested a hackathon click-reward demonstration. Implement only explicitly labeled simulated link-open points behind `ASTRA_DEMO=1`, once per account/campaign, with no self-claims; these reduce simulated checkout totals only. Never call this a verified listen/view, a permitted platform-policy loophole or a real-world reward. Live listening/viewing incentives remain disabled. Replit deployment is no longer requested; keep this local.
- Published Spotify song/album links render as official Spotify previews in followers' feeds and creator profiles. The separate AStra link-open button awards demo points once; playing the embedded preview does not. Feed and Loyalty must share the same campaign identity and deduplication.
- YouTube OAuth is authorized for audience and creator accounts. Use Google OIDC with verified ID-token signature/audience/issuer/expiry/nonce, PKCE and single-use browser-bound state. Connect to an existing private account only through explicit authenticated linking; never merge by email or attach tokens to shared sample profiles. Existing roles and balances stay unchanged. Store tokens encrypted server-side; channel reads never award points. Disconnect deletes tokens and attempts Google revocation; sign-in identity/account are retained with disclosure.
- Creator YouTube/Shorts links appear in feed/profile and Loyalty with the same demo campaign ID. Public video metadata uses a server-only API key. Embedded players are opt-in, no autoplay, and disabled for non-public, non-embeddable, made-for-kids or unknown kids-status videos. No watch history, YouTube Music listening, confirmed-view claims or live viewing rewards are supported.
- Final redemption occurs only after confirmed payment success. Any temporary point reservation must be distinct from a completed debit; retries must not double-spend, and failed/cancelled checkout must not permanently consume points. Refund restoration rules remain unresolved.
- Still unresolved: who funds discounts or reimburses creators, earning rules/limits, expiration, minimum redemption and increments/rounding, permitted cap range, per-creator defaults versus item overrides, promotion stacking, fees/taxes/shipping eligibility, multi-currency behavior, multi-creator allocation/settlement, and refund/partial-refund rules. Do not promise AStra reimbursement or present prototype assumptions as policy.
- The primary confirmed model is a capped discount plus payment of the remainder, not a separate points-priced free-reward catalog. A $0 checkout or 100% cap needs explicit policy approval.

## Agreed collaboration behavior

- Support direct creator-to-creator outreach and a separate creators-only opportunity feed.
- Allow collaboration across disciplines, such as painters working with video creators or dancers working with musicians.
- Fans cannot access the collaboration feed, opportunities, responses, private conversations, shortlists, or collaboration progress.
- Opportunity responses must relate to that specific opportunity and use a short interest message with the creator's profile or portfolio.
- Each creator may respond once per opportunity.
- The poster chooses a response limit of 5, 10, or 20; the default is 10. Pause new responses automatically when the limit is reached.
- The poster can shortlist or decline responses and close or reopen an opportunity.
- Every opportunity specifies its arrangement: paid work, skill exchange, revenue sharing, unpaid work, or open to discussion.
- Store structured creator-profile information that can support opportunity filters: creative discipline, skills, location, time zone, remote or in-person availability, languages, experience, portfolio links, audience-size range, arrangement preferences, and availability.
- Required filters control eligibility; preferred filters highlight stronger matches without excluding otherwise eligible creators. Explain unmet requirements clearly.
- Keep opportunity conversations private and linked to the opportunity.
- Preserve collaboration brief details for roles, deliverables, dates, credit, intended use, approvals, and proposed compensation. Do not present a brief as a legal contract.
- Unresolved details include direct-message acceptance rules, creator verification, response counting after declines or reopening, and whether invitations can bypass filters or limits. Do not invent approved decisions for these cases.

## Product and delivery principles

- Support creators broadly: musicians, artists, writers, dancers, photographers, video creators, streamers, educators, and other creative disciplines.
- Use clear, everyday language in the interface, documents, and explanations.
- Prioritize a coherent, demonstrable hackathon workflow and evidence from customer discovery.
- Clearly label mock data, simulated integrations, and unvalidated assumptions. Never fabricate survey results, interview findings, or traction.
- Keep survey and interview research spaces available in requirements documents.
- When editing the SRS, preserve its approved IEEE template styling, corrected team names, and blank page headers. Update page references when pagination changes and visually verify the output.
- Use relevant installed design skills when UI work is authorized, while keeping all generated work inside this directory.

## Implementation practices once authorized

- Use Phosphor Icons as the default icon family across components, including God UI compositions. For React, use `@phosphor-icons/react`, not the legacy `phosphor-react` package. Avoid mixing icon libraries or using emoji as interface icons.
- Keep icon sizing and weights consistent; use regular weight by default and fill for selected states where appropriate. Hide decorative icons from assistive technology and give icon-only buttons accessible labels.
- Inspect existing files and applicable instructions before editing. Preserve unrelated user changes.
- Follow the implementation direction above; seek approval before materially changing the stack.
- Enforce collaboration permissions and response limits on the server, including simultaneous responses. Hiding a UI element alone is not access control.
- Protect credentials and private conversations. Never place secrets in source code, logs, or client-visible data.
- Prefer focused, reversible changes and run checks appropriate to their risk.
- Do not publish, deploy, incur charges, or send messages to third parties without user authorization.
- Report what changed, what was verified, and any remaining limitations. Link deliverables using their correct paths.

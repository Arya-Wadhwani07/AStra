# AStra — Claude Design context: design system first

Prepared: September 26, 2026
Source: `Updated_Software_Requirements_Specification.pdf`, version 0.3, September 26, 2026, 41 physical PDF pages.
Supporting reference: `Astra report.pdf`, 11-page handwritten research and workflow report, reviewed September 26, 2026. Its rough diagrams explain intent; they are not finalized screen layouts or new requirements.
Latest user-confirmed update: cross-creator points redemption at 100 points = $1 discount, with each creator choosing their maximum percentage discount. These decisions supersede earlier conversion-rate assumptions in the SRS/brief; the source PDF itself has not been edited.
Product Manager: Saloni Belliappa Bolakaranda
Technical Lead: Arya Jay Wadhwani
Purpose: First create and approve a reusable AStra design system. Then create connected website mockups in a separately approved pass, followed by implementation in Codex.

## 1. Your assignment

Act as a product designer designing AStra for the TiEHub × Replit Origin Weekend hackathon at USC. **Your current assignment is the design system, not the complete website.** Deliver visual foundations, reusable components, their states, and a small set of example compositions that prove they work together. This is a product design system for creators, audiences, and administrators, not merely a logo/color board or marketing landing page.

Work in this order: design system → user review and approval → connected screen mockups → developer handoff. Stop for review after the design-system deliverables in section 13. Do not automatically build all screens or complete the demo journeys on the first pass. Sections 4–12 preserve the product context so the system supports the actual workflows; full-screen and end-to-end requirements there apply to the later mockup pass.

Use this brief as a self-contained context file. If the source PDF is also attached, consult its requirements and workflow diagrams. Preserve the behavior described below while exercising judgment on composition, navigation, typography, imagery, and component design. Do not require answers to every open question before drafting: use the explicitly labeled prototype assumptions and keep a visible decision log.

Design work is authorized. Production implementation, live integrations, real payments, deployment, or contacting people are not part of this assignment. Use mock interactions and fictional data. If you generate prototype code, keep it self-contained and identify its simulated behavior in the handoff.

### Design-system scope for this first pass

Choose one coherent proposed direction and explain it briefly. Use section 9 as a starting point, not an already approved brand. Keep visual choices separate from fixed product rules. Present editable specimens and reusable variants where the environment supports them; otherwise provide clearly named, annotated boards. Do not claim components are interactive or exportable unless they actually are.

**Foundations:**

- Define exact color values and semantic names for background, surface, elevated surface, text, muted text, border, action, focus, success, warning, error, and information. Separate brand accent from status colors. Show accessible text/background pairings and measured contrast if tested; otherwise mark contrast checks pending.
- Specify font families and fallbacks, sizes, weights, line heights, and letter spacing for display, page title, section title, body, labels, helper text, and numeric totals. Prefer fonts available without paid licenses; flag any licensing requirement.
- Define a compact spacing scale, component heights, corner radii, borders, elevation, layer order, content widths, grids, and responsive breakpoints. Explain how desktop sidebar navigation becomes mobile navigation.
- Use one consistent theme for the first review, with semantic tokens that can support a future alternate theme. The light-neutral direction in section 9 is proposed, not final. Do not double the scope by creating a second complete theme unless requested.
- Specify Phosphor icon sizes, weights, text alignment, selected states, and accessible use. Use regular weight by default and fill where selection needs emphasis. Do not mix icon families.
- Define motion durations, easing, loading feedback, and reduced-motion/static alternatives. Keep checkout, forms, and private conversations calm and readable.
- Define media aspect ratios, cropping, artwork credits, missing-image behavior, and avatar fallbacks. Represent multiple creative disciplines; do not make the whole system look music-only.

**Reusable component families:**

| Family | Components and examples |
| --- | --- |
| Actions and input | Primary/secondary/quiet/destructive buttons, icon button, text field, textarea, select/combobox, checkbox, radio, switch, date/time input, file upload, search and filter controls |
| Navigation | Desktop app shell, mobile navigation, role switch, tabs, breadcrumbs, pagination, account menu; separate provisioned-admin navigation |
| Content and identity | Creator identity/profile summary, portfolio media, post/event/merchandise card variants, favorite action, price and availability labels |
| Collaboration | Creator-only opportunity card, required/preferred filter chips, eligibility explanation, response counter, short response form, participant row, private message, brief approval/version status |
| Commerce and loyalty | Cart item, quantity control, order summary, shared points balance, source-labeled ledger row, creator maximum-discount control, capped points selector, discount preview, receipt summary; distinct payment and email-delivery statuses |
| Feedback and trust | Status badge, inline error, banner, toast, tooltip, skeleton, empty/no-results/error state, consent/connection card, verification status, confirmation dialog/drawer |
| Administration | Review table/list, case summary, reason field, restricted action confirmation and audit-history row; same tokens, more compact layout |

For each component, document its purpose, anatomy, variants, spacing, applicable states, responsive behavior, and accessibility notes. Cover default, hover, keyboard focus, pressed, selected, disabled, loading, error, and success where relevant; do not invent meaningless states for static elements. Disabled controls need an understandable explanation when the reason is not obvious.

**Accessibility and behavior:** Keep visible labels on inputs, useful error messages, keyboard order, focus restoration for dialogs, readable zoomed layouts, and non-color status cues. Target comfortable 44-pixel touch areas for primary mobile controls. Icons alone must not carry payment, eligibility, or permission meanings. Treat accessibility as a design requirement, not a claim of completed compliance testing.

**Small proof set, not a full prototype:** Show three desktop compositions: an audience feed with a loyalty summary; a creator-only opportunity detail with response/eligibility states; and a cart/order-summary example using section 8's arithmetic. Add mobile versions of the feed and opportunity detail, plus a compact admin review component specimen. These are sample applications of the system, not completed journeys or extra approved features. Show at least one empty, one loading, and one recoverable error example across this set.

**Handoff:** Provide a readable token table and, if supported, matching CSS variables or JSON token data. Keep names consistent between tokens, components, and examples. Include a component inventory with variants/states, icon mapping, asset list, responsive rules, assumptions, and a short list of decisions needing user approval. Do not select a production framework or install dependencies as part of this design assignment.

## 2. What the product is

**AStra: The Multiverse for Creators** brings creators, their audiences, commerce, loyalty, and cross-discipline collaboration into one platform.

Creators publish work, events, and merchandise; understand measured audience activity; reward meaningful participation; and find collaborators with complementary skills. Audience members follow their favorite creators in one chronological feed, discover events and products, make purchases, and understand their loyalty benefits. Administrators manage verification, rules, reports, disputes, and audit records.

Creators include painters, musicians, writers, dancers, photographers, video creators, streamers, educators, and other creative disciplines. Give several disciplines meaningful representation in the mockup. A painter finding a video creator is a central example.

The product should feel like a welcoming creative community with dependable business tools. The key experiences are maintaining direct relationships, supporting creative work, and making useful collaborations happen.

The research appendix remains incomplete. Do not invent customer interviews, adoption statistics, testimonials, endorsements, revenue traction, or competition outcomes. Fictional dashboard metrics must be labeled as sample data.

AI image tools, ComfyUI, and Higgsfield-style tools may help create interface assets. **AStra is not an AI image/video generation product.** Do not add generation credits, model pickers, prompt studios, or AI filmmaking features.

## 3. Source priority and status labels

- **Required behavior:** Taken from REQ requirements and the main workflow descriptions in SRS v0.3.
- **Optional:** SRS features marked OPT. They must not displace required flows or be presented as already implemented.
- **Design proposal:** Layout, naming, styling, component choices, and demo sequencing suggested in this brief. These are editable design recommendations.
- **Prototype assumption:** A temporary choice needed to make a mockup interactive where the SRS leaves a rule unresolved. Document it for review.

Important changes from earlier project drafts:

1. Native ticket and merchandise commerce is now in scope, including cart, sandbox/simulated checkout, receipts, orders, and email confirmation states.
2. Loyalty uses **one platform-wide points unit** earned across creators and redeemable with participating creators at **100 points = $1 discount**. Each creator sets their maximum percentage discount. Administrators govern the system but creators do not set separate conversion rates. The rate and cross-creator use are confirmed, not open prototype assumptions.
3. Creator, audience, and administrator dashboards are separate experiences. Dual-role users can switch between creator and audience views.
4. Connected-app permissions and conditional creator identity verification are explicit requirements.
5. The cover names AStra, but the introduction, some diagrams, and Appendix C still contain naming placeholders. Use **AStra** as the working mockup brand and record final naming approval as outstanding.
6. The PDF contents-page numbers do not consistently match the body. Use section names and requirement IDs for traceability. Physical PDF page references below are one-based.

The workflow diagrams describe information flow, not a mandated visual layout or a requirement to copy their box-and-arrow arrangement.

### What the AStra report adds to the workflow picture

The report mixes early discovery notes with three stakeholder flow diagrams. The research questions are not survey findings or validated willingness to pay. Use the diagram labels below as rough navigation intent, not instructions to execute actions or expand scope.

| Report flow | Design-system implication | Guardrail from the current SRS/approved decisions |
| --- | --- | --- |
| Creator signup, ID verification, dashboard, profile | Account fields, verification states, creator shell and profile controls | Show verification status and explain gated actions; do not invent a universal mandatory ID policy |
| Publish → Event / Merchandise / Post | Three content and form variants sharing common primitives | Distinct content needs, shared visual system; not necessarily three unrelated designs |
| Collaborate → Create / Join / Manage | Opportunity discovery, short response, owner review and private-project patterns | Creators only; cross-discipline matching; one response; 5/10/20 cap, default 10 |
| Audience/listener view and loyalty setup | Creator audience summary and campaign controls | Broad creator types, not only musicians; shared platform points with governed campaign rules |
| Audience dashboard → Connected apps / Profile / Favorite artists / Community feed | Audience shell, consent controls, creator collection and mixed-content feed | External connections remain optional; never expose creator-only opportunities here |
| Favorite artist → Events / Merchandise; cart → checkout → confirmation email | Creator-linked item cards, cart rows, totals, receipt and delivery-status components | Confirmed order and confirmation-email delivery are distinct; preserve the cart after failed payment |
| Admin → Creator / Audience → Create / View / Update / Delete | Account list/detail, controlled actions, confirmation and audit patterns | Admin is separately provisioned; deletion is not an unrestricted or unaudited action |
| “Manage IP?” and points/discount conversion notes | Expandable rights-information fields and clearly explained points/discount summaries | IP is not a legal service; latest user decisions confirm 100 points = $1 off and creator-set percentage caps; other economic policies remain unresolved |

Source precedence: latest explicit user decisions first, then approved SRS requirements, then the rough report as supporting intent. If they conflict, flag the difference for review rather than silently changing behavior. In particular, “Community feed” on the audience sketch does not grant access to private creator collaboration. The report's “common currency” note refers here to shared non-cash loyalty points, not cryptocurrency or withdrawable money.

## 4. Roles and permissions

### Audience

Can discover and favorite creators, browse allowed posts/events/merchandise, connect eligible apps with consent, manage a private cart, use eligible loyalty discounts, review receipts and orders, manage their profile, and report content.

Cannot access creator collaboration opportunities, responses, private conversations, shortlists, or work in progress. Do not show a collaboration navigation item or reveal private opportunity titles in audience notifications or search.

### Creator

Can manage a structured creator profile, publish posts/events/merchandise, attach rights information, access the community feed, contact other creators, create/join/manage collaborations, review measured audience and order activity, and configure loyalty campaigns within platform limits.

Verification is required before configured high-risk publishing, loyalty, or payment-related actions when the pilot policy requires it. Do not assume every creator is verified. Show a status and a next action, not identity documents in ordinary screens.

### Dual-role user

One account can have creator and audience access. Provide an explicit view switch with a persistent current-role label. Collaboration access belongs to the creator view; switching to audience hides those features. Do not create duplicate accounts or separate points currencies.

### Administrator

Access is provisioned separately. Never offer “Administrator” as a public signup choice or expose a public route that grants admin access. An isolated prototype scenario selector may show an already authenticated admin demo; label it as a demo control, not a product permission switch.

## 5. Proposed information architecture

Use these as design proposals, keeping the required destinations reachable:

| Area | Primary destinations | Supporting controls |
| --- | --- | --- |
| Public/account entry | Welcome, Sign in, Create account, Email verification, Password recovery | Creator / Audience / Both selection |
| Creator workspace | Overview, Publish, Community, Collaborate, Audience insights, Loyalty, Orders | Profile, Messages, Notifications, Settings, Sign out |
| Audience workspace | Feed, Discover, Favorites, Loyalty, Cart, Orders | Connected apps, Profile, Notifications, Settings, Sign out |
| Admin workspace | Review queue, Verification, Loyalty rules, Commerce disputes, Accounts, Audit history | Operational overview, Sign out |

Desktop: clear sidebar or equivalent persistent navigation, current-role indicator, page title, and a restrained utility area. Avoid giving every utility its own competing primary navigation item.

Mobile: prioritize frequent destinations in bottom navigation, with less frequent functions in a labeled menu. Role switching must remain understandable. Convert dense tables into readable summaries with drill-down details.

Proposed screen groups can share components, drawers, tabs, or state variants. They do not each require an unrelated full-page layout.

## 6. Screen specification

### A. Entry, account setup, and verification

Design a short public introduction explaining the value to both creators and audiences, with clear entry actions and representative creative work. Avoid a long marketing page consuming most of the deliverable.

Account flow: email/password signup → Creator, Audience, or Both → verify email → role-appropriate dashboard. Include sign-in errors, resend verification, expired verification link, password reset, sign out, and account deletion request states. Private features remain gated until email verification succeeds.

Creator setup should collect essentials first and organize optional profile information progressively. Include a verification status panel: not submitted, pending, verified, and action needed as proposed labels. A gated action explains why verification is needed and how to proceed. Identity provider and exact verification criteria remain undecided.

### B. Creator overview and profile

Overview should prioritize useful actions: publish something, review an opportunity response, check recent orders, and review a loyalty campaign. Show a small set of measured sample metrics with a date range and source rather than an unexplained wall of numbers.

Creator profile fields:

- Display name, description, creative discipline, skills, and image.
- Location, time zone, remote/in-person availability, and languages.
- Experience level, portfolio links, audience-size range.
- Preferred collaboration arrangements and availability/timeline.
- Profile visibility and appearance in collaboration search.

Design an owner edit view and a visitor view. Audience visitors see permitted public work and a Favorite action. Creator visitors may see appropriate collaboration information and direct outreach. Private drafts and conversations are never public portfolio content.

### C. Publishing and rights information

Provide a visible choice between **Post**, **Event**, and **Merchandise**, followed by a form suited to that content type:

| Type | Main fields and actions |
| --- | --- |
| Post | Content, media, audience/visibility, preview, draft, publish, edit, unpublish, delete |
| Event | Title, description, date/time/time zone, venue or online link, price, ticket quantity, native checkout or permitted external ticket link |
| Merchandise | Title, images, description, price, inventory status, fulfillment instructions, preview and publication controls |

Include ownership, credit, license, and intended-use information in a clearly labeled expandable section. Say that it records creator-provided information; do not imply copyright registration, verification of ownership, or legal enforcement.

Preview must distinguish ordinary audience-visible content from creator-only collaboration posts. Include required-field errors, draft saved, published, unpublished, inventory exhausted, and delete confirmation. A sold-out item cannot be added to the cart.

### D. Audience feed, discovery, and favorites

The feed combines published posts, events, and merchandise from favorite creators in chronological order. Every item identifies creator, type, publication time, and relevant destination. Use media appropriately: artwork, event imagery, merchandise details, or readable text for a writer's update.

Discovery supports name, discipline, skill, and supplied location search. Favorite/unfavorite updates the user's collection. Show a first-use state with a meaningful “Find creators” action and a populated favorites view.

Cards should have content-specific actions, such as View event, View item, or Read post. Do not turn all cards into purchase advertisements. A report action is available without dominating the card.

Feed type filtering is optional. If shown, audience filters are Posts, Events, and Merchandise; creator collaboration opportunities stay in the restricted creator experience. External-only items clearly say they open another service and do not produce a native paid-order success state.

### E. Item detail, cart, checkout, and order history

Design event and merchandise detail variants showing creator, price/currency, availability, descriptive media, relevant timing/fulfillment information, and Add to cart.

Cart shows item, creator, quantity, current price, removal controls, eligible points, applied discount, fees/taxes/shipping when known, and final total. Separate point balance from money. Recheck availability and pricing before confirmation. If something changes, explain it and require review of the revised total.

Show “100 points = $1 off,” the creator's percentage cap, the maximum usable points for this purchase, and a points selector with an option to use none. Never auto-spend the entire wallet. Recalculate discount, remaining balance and amount due together. Explain “This creator allows up to 20% off with points” when the sample cap is reached; a high balance must not bypass it. For future multi-creator carts, display caps and allocation per creator and never spend the same balance twice; allocation and settlement rules are still undecided.

Checkout: cart review → necessary contact/fulfillment details → payment-provider handoff or clearly labeled demo simulation → processing → confirmed order or recoverable failure. The provider is not selected; use a neutral provider area rather than assuming a particular vendor.

Required variants:

- Empty cart, unavailable item, reduced inventory, changed price, or ineligible discount.
- Payment processing with repeat submission disabled.
- Declined, cancelled, or timed-out payment: preserve cart and show correction/retry guidance. Do not display a confirmed or fulfilled order.
- Verified successful payment: show exactly one order and a receipt. Paid/confirmed is distinct from shipped/fulfilled.
- Order confirmed but email delayed: the receipt remains available in Orders; show notification delivery separately.
- Order history/detail with items, totals, discount, payment status, order status, confirmation status, and support.
- Refund/cancellation detail with corresponding loyalty adjustment and explanation. Exact refund eligibility remains a policy decision.

Never display real card credentials or make a live charge. For a timeout with uncertain payment status, show a status-checking state before retrying, so the design does not encourage duplicate payment.

### F. Loyalty for audience, creators, and administrators

Audience: show one shared available balance accumulated across creators, pending activity separately, eligible discounts, and a private transaction history. Every ledger row provides activity, originating creator/source, date, point change, redemption destination when relevant, status, and a reason for rejected/reversed activity. Source labels explain history; they do not create separate creator wallets or restrict where approved points can be redeemed.

Required activity states: pending, approved, rejected, reversed, redeemed. Redemption must prevent duplicates and respect active rules, quantity, dates, thresholds, and repeated-activity limits. Checkout previews points used, discount value, remaining balance, and payable total.

Creator: set the maximum percentage discount accepted on eligible ticket and merchandise purchases. Show a preview of the discount amount and sale price after points, before fees, so the creator understands the effect. The creator sets a cap, not the platform's points-to-dollar rate. Campaign setup may specify approved earning activities, points awarded, dates, quantity and repeat limits, but no live earning mechanism is approved yet. Use clearly labeled sample activity. Whether a creator-wide cap can be overridden per item remains an open decision.

Administrator: display the confirmed platform conversion of 100 points = $1 discount, with rule history and governance controls. Minimums, permitted cap ranges, expiration and campaign limits still require policy decisions. Do not demonstrate an arbitrary conversion change as approved behavior; changing the confirmed rate needs a separate decision.

Copy must describe points as non-cash loyalty units. The fixed discount conversion is confirmed; it does not make points withdrawable cash or a transferable asset. The approved model is a capped discount with the remainder paid normally, not a points-priced free-reward catalog. Do not assume creators may permit 100% discounts or that $0 orders are supported.

**Calculation:** For an eligible USD purchase, discount = selected points / 100. It must not exceed either the creator's percentage cap applied to the eligible purchase amount or the available approved balance / 100. The user can choose less than the maximum. Minimums, increments, rounding, promotion stacking and treatment of shipping/taxes/fees remain unresolved. For the first proof set, use whole-dollar examples and the explicitly labeled assumptions in section 8; do not silently create a universal 100-point minimum.

Debit points once, only after confirmed payment success. If a later implementation reserves points during checkout, show reserved versus spent distinctly; failed/cancelled payment must not permanently consume them. Uncertain payment status requires reconciliation before retrying. Refund and partial-refund restoration remain policy decisions; label any illustrated restoration assumption.

**Funding is not yet decided:** A discount reduces the sale proceeds unless a creator, AStra or sponsor funds the difference. Do not promise reimbursement or imply that the existence of points funds the discount. Show sale price after discount, not guaranteed creator payout.

**External listening proposal and feasibility boundary:** The user proposed connecting Spotify, YouTube Music and Amazon Music and earning one point per ten listens. This is an unapproved earning proposal, separate from the confirmed redemption rules. API/policy research discussed with the user found:

- Spotify has a recent-history API, but its developer policy prohibits play-count manipulation through compensation, including nonfinancial compensation. Repeat-stream rewards appear incompatible with that policy: [history endpoint](https://developer.spotify.com/documentation/web-api/reference/get-recently-played), [developer policy](https://developer.spotify.com/policy).
- YouTube's Data API does not expose watch history and its API policies restrict incentivized viewing: [history restriction](https://developers.google.com/youtube/v3/docs/playlistItems/list), [developer policies](https://developers.google.com/youtube/terms/developer-policies). Do not portray YouTube Music listening verification as available through those APIs.
- Amazon Music documents recently played endpoints but labels access closed beta: [player API](https://developer.amazon.com/docs/music/API_web_player.html). Access and permission for this use require confirmation.

These are feasibility findings from the prior research, not guarantees of future API availability. Recheck official sources before implementation. Keep live listening rewards blocked pending provider permission and reliable verification; recent history alone does not prove complete listening or full cross-device coverage. Do not use unofficial scraping to bypass restrictions. A simulated demonstration must say “Sample activity,” not “Verified Spotify listens.” Organizer-confirmed event check-ins and creator-approved contributions are proposed alternatives awaiting approval, not replacement requirements.

### G. Creator collaboration — signature experience

Provide three clearly separated actions: **Create opportunity**, **Find opportunities**, and **My collaborations**. Also support normal private creator-to-creator outreach. Use a creative portfolio-led experience with short expressions of interest.

Opportunity cards/details show title, poster, discipline/skills needed, deliverable, timing, location/remote status, arrangement, required/preferred criteria, response count/limit, and status. Arrangements are Paid, Skill exchange, Revenue sharing, Unpaid, or Open to discussion; one must be specified.

Creation form:

1. Project goal, description, expected deliverable, discipline and skills needed.
2. Location/remote preference, timing, and arrangement with details when known.
3. Profile-based criteria, each marked Required or Preferred.
4. Response limit: 5 / **10 default** / 20.
5. Preview clearly labeled “Visible to creators only,” then publish.

Required filters block nonmatching responses with a specific explanation. Preferred filters highlight stronger matches without blocking otherwise eligible creators. Structured fields include discipline, skills, location/time zone, work mode, languages, experience, audience-size range, arrangement preference, and availability. A portfolio can support manual review; do not invent an automatic portfolio-quality score.

An eligible creator submits one short message with their linked profile/portfolio. The response starts a private conversation tied to that opportunity. Show “Response sent” and a way to open the conversation rather than a second response button. At the cap, pause new responses automatically. Include eligible, missing-required-information, not-eligible, already-responded, paused, and closed states.

Owner view: responses with profile summaries, criteria matches, portfolio preview, short message, and actions to shortlist, decline, accept, or request changes. The owner can close or reopen the opportunity. Keep candidate response states separate from opportunity states and project states.

For selected participants, create a brief covering roles, deliverables, dates, approvals, credit, intended use, and proposed payment/expenses/skill exchange/revenue split. Show each participant's confirmation status against the current brief version. The project becomes active only after all selected creators confirm the latest version. Include a dated history, report action, and withdrawal before confirmation. Describe the brief as a shared plan, not a legal contract.

Private conversations belong only to their participants and authorized review contexts, not every creator who can browse the feed. Keep reporting/blocking controls available.

Optional: all participants may approve a separate public post about completed work. This never exposes the opportunity, applications, conversation, or private brief.

### H. Connected apps, notifications, and settings

Connected-app cards show provider, purpose, permissions, retention explanation, status, last successful sync when available, and disconnect. Include consent review before connecting, declined consent, disconnected, expired/reconnect, and temporarily unavailable states. Disconnecting preserves unrelated orders, content, and loyalty records.

Use generic demo providers unless a real integration is approved. A connected account is not evidence that every listen, view, or share can be verified. Core feed, commerce history, and local account features remain usable without optional connections.

Notifications cover collaboration decisions, loyalty activity, order/refund updates, security, and administrative decisions, linking to the relevant allowed view. Optional notices can be turned off. No private collaboration information in audience notifications or sensitive details in email subject previews.

Settings include profile editing, audience deactivation/deletion request, password/account controls, notification preferences, privacy, and sign out. Explain that some order, safety, or audit records may need retention; do not promise immediate deletion of all transaction records.

### I. Creator insights and orders

Show measured followers, feed views, event interest, merchandise views, cart additions, confirmed orders, completed activities, and redemptions with period and data source. Organize into a few useful summaries and drill-downs. Avoid unsupported attribution such as “this view generated this sale.” Include empty, loading, sample-data, and unavailable-source states.

Creator order views show relevant item/order counts and fulfillment information without unnecessary audience data or payment credentials. Audience contact export is optional after the MVP, so it is not a required primary action.

### J. Administrator workspace

Produce a compact but designed admin experience, using an authenticated demo scenario:

- Review queue across verification, users, content, collaborations, loyalty, orders, and rewards.
- Case detail with relevant evidence, status, and controlled access to necessary information.
- Verification review exposing status to ordinary users, not identity documents.
- Account actions: warn, restrict, suspend, restore, remove, with confirmation and reason.
- Suspicious rewards held pending review.
- Loyalty governance view with the confirmed conversion, creator-cap oversight, limits, effective date, and audit history; unresolved policy controls are annotated rather than silently finalized.
- Commerce/refund/loyalty dispute detail without full card data.
- Decision record with actor, time, reason, affected record, user notice, and support/appeal path.

Use restrained typography and clear status labels. Do not invent a complex enterprise administration suite or unsupported operational statistics.

## 7. Three connected demo journeys

These are proposed presentation sequences, not a reduction of the required screen coverage.

### Journey 1: An audience member supports an artist

Audience sign-in → Discover → favorite a painter → feed shows the painter's event → view event → add ticket → cart → apply eligible points → demo checkout → one confirmed order → receipt and order history. Show the separate email-delayed variant. End with the private loyalty history reflecting the redemption.

### Journey 2: A painter finds a video collaborator

Creator sign-in → complete relevant profile → Collaborate → create a paid launch-reel opportunity → set required video-editing skill and availability, preferred art-project experience, default 10 responses → preview and publish → switch demo actor to video creator → open eligible opportunity → respond once → owner shortlists → opportunity-linked conversation → both confirm latest brief → active project. Provide alternate frames for failed eligibility and full response capacity.

### Journey 3: Platform rules and trust

Authenticated administrator scenario → review a pending verification or disputed loyalty activity → examine relevant evidence → record reason and decision → user notice → audit entry. Also show the loyalty governance view with the confirmed conversion and creator-set caps so shared-point governance is understandable.

## 8. Consistent fictional content and arithmetic

All people, balances, item prices, example cap percentages and transactions below are **illustrative demo data**. They are not research evidence. The platform rate of 100 points = $1 discount and creator-controlled percentage caps are user-confirmed rules; other example values and policies are not.

- Mira Rao: Los Angeles painter, runs a small exhibition and sells art prints.
- Eli Chen: video creator/editor seeking art and cultural projects; matches the main opportunity's required skills.
- Nia Brooks: dancer; useful example of someone whose profile does not match a video-editing requirement.
- Jonah Lee: musician; featured in discovery alongside a writer, photographer, and educator.
- Alex Morgan: audience demo account, with 600 available points and 50 separately pending points before checkout.
- Main opportunity: “Help turn my exhibition into a 30-second launch reel.” Paid, $150 example budget, remote, two-week timeline, video editing required, art-project experience preferred, response limit 10.
- Event: “Color After Hours,” Los Angeles, October 10, 2026, 6:00–8:00 PM Pacific; one ticket is $25 in the demo.
- Merchandise: “Chromatic Study” art print, $30, sample inventory 12; keep the core checkout journey ticket-only to avoid inventing shipping fees.

**Confirmed conversion:** 100 points provide a $1 discount. **Sample creator setting:** Mira accepts points covering up to 20% of the $25 ticket price, allowing at most $5 off (500 points). The 20% setting is fictional, not a platform-wide cap. The proof-set points control uses 100-point steps for simple whole-dollar examples only; minimums and increments remain unapproved. Assume the cap applies to the ticket subtotal before charges for this example; charges eligibility still needs a policy decision.

For the main transaction: 1 ticket × $25 = $25 subtotal; apply 500 of 600 available points for a $5 discount; illustrative demo fees/tax $0; total $20; remaining available points 100. Pending 50 points cannot be spent. After success, show one “−500 points / Redeemed” ledger entry. Do not also award purchase points unless a separate earning rule is explicitly included.

Show the initial 600 approved points as 200 from Mira, 250 from Jonah and 150 from Nia, labeled sample activity without claiming live verification. They form one balance that can be spent on Mira's ticket. Source labels must not block cross-creator redemption.

Additional cap specimen: a $50 item with a creator-set 20% cap and a 3,000-point balance permits 1,000 points for $10 off; payable item price $40, remaining balance 2,000. Separate insufficient-balance specimen: the same item with 500 available points permits $5 off; payable item price $45, remaining balance 0. These are separate snapshots, not continuations of Alex's main transaction. Selecting zero points leaves the item at $50. Exclude pending points in every case.

Demo refund variant assumes this campaign restores the 500 redeemed points on a full refund: show a linked +500 adjustment with a reason and restore the balance to 600. Mark this restoration policy as an assumption for review.

Use one stable fictional order ID and the same event, creator, totals, and dates across cart, checkout, receipt, email preview, order history, and creator order view. For the collaboration cap, use distinct snapshots: 8/10 before Eli responds, 9/10 afterward, and an alternate paused 10/10 case. Never imply one response advances the counter by two.

## 9. Visual direction — proposed, open to refinement

User-approved icon choice: use **Phosphor Icons** (https://phosphoricons.com/) throughout the interface, including God UI compositions. This library choice is required, rather than a proposed visual direction. Use consistent sizes and weights; start with regular weight and use fill for selected states where helpful. Do not mix unrelated icon sets or use emoji as UI icons. Icon-only controls need accessible labels; decorative icons should be hidden from assistive technology. React implementation will use `@phosphor-icons/react`.

God UI constraint: the Orbiting Circles source is staged at `components/godui/orbiting-circles.tsx`; its theme definition is saved but not globally applied. No app or dependencies are installed yet. Include a restrained optional Orbiting Circles specimen with Phosphor icons to express cross-discipline connection, together with a static reduced-motion variant. It is decorative, not navigation or an eligibility/status indicator. Do not apply the entire God UI theme automatically, assume the full catalog is installed, or let an animated illustration dictate the product layout. The staged React source currently expects Framer Motion and Tailwind; integration remains a later development task.

Suggested concept: **an editorial creative studio with a subtle constellation motif**. “Multiverse” means different creative disciplines connecting. Use the metaphor sparingly in branding and small decorative details; keep product labels familiar.

- Light, warm-neutral application surfaces with dark readable text, one strong accent such as deep cobalt, and restrained supporting colors for disciplines/statuses.
- Give creators' work the visual prominence: considered image crops, authentic portfolio treatments, event artwork, and a mix of text and media formats.
- Strong but practical typography: expressive display treatment for public/editorial moments, highly readable UI type for forms and dashboards. Use a small, consistent type family set and sizes.
- Distinguish the audience feed, creator workspace, and admin tools through density and task hierarchy while sharing the same component system.
- Use deliberate spacing, quiet borders, consistent corner treatments, and subtle depth. Keep primary calls to action easy to identify.
- Motion should explain changes such as adding to cart or opening a panel. Honor reduced-motion preferences and keep forms, checkout, and status changes immediate and readable.
- Design for a normal laptop as well as a large presentation screen. Proposed reference widths: 1440, 1280, 768, and 390 pixels; also check narrow 360-pixel layouts.
- Aim for WCAG AA contrast, visible keyboard focus, labeled inputs, clear selected states, and comfortable touch targets. This is a design target, not a compliance certification.

Avoid giant space backgrounds behind transactional content, tiny gray text, excessive glowing gradients, generic stock-business imagery, follower leaderboards, or repetitive boxes without hierarchy. No need to copy Higgsfield or Facebook Marketplace branding/layout.

Design tokens to deliver: colors and semantic roles, typography, spacing, radii, borders/shadows, breakpoints, icons, motion timings, and focus styles. Document the selected direction and any deviation from this proposal.

## 10. State and interaction coverage

| Feature | States to design | Required recovery/feedback |
| --- | --- | --- |
| Email/account | Unverified, verified, bad credentials, expired link, recovery, deletion requested | Clear next action; gated private views |
| Creator verification | Not submitted, pending, verified, action needed | Explain the affected action and next step |
| Feed/discovery | First use, loading, populated, no results, connection error | Find creators, clear filters, retry |
| Publishing | Draft, validation error, saved, published, unpublished, delete confirmation | Preserve form data; show visibility |
| Collaboration response | Eligible, ineligible, missing field, submitted, shortlisted, declined, accepted | Explain required criteria; no duplicate response |
| Opportunity/project | Open, cap reached/paused, closed; brief awaiting approvals, active, previous | Owner controls; distinguish response and project status |
| Conversation/brief | Empty, sending, sent, failed, version changed, awaiting participant confirmation | Retry without duplication; visible version and approval history |
| Loyalty | Pending, approved, rejected, reversed, redeemed, insufficient points, creator cap reached, no points selected, rule expired | Explain shared balance, source, 100 points = $1 off, creator cap, maximum usable points and adjustments |
| Commerce | Empty cart, price/availability change, processing, success, decline, cancel, timeout | Preserve cart; check uncertain payment status; no duplicate order |
| Confirmation | Receipt available, email queued/sent/failed | Preserve confirmed order; show retryable delivery state |
| Connected apps | Unconnected, consent, connected, expired, denied, unavailable, disconnected | Reconnect/disconnect with plain-language effects |
| Administration | Pending review, decision, notification, appeal/support, audit entry | Reason, actor, time, affected record |

Critical primary actions must link to designed outcomes. Secondary actions may use drawers/modals or documented state frames. Clearly label any intentionally unimplemented prototype action rather than showing a false success.

## 11. Unresolved rules and prototype assumptions

Keep this decision list in the design handoff. Do not hide these gaps by silently inventing policy.

1. **Final branding:** AStra is used on the updated cover; other passages still call the name unconfirmed. Use it for the mockup pending final approval.
2. **Direct outreach:** Request acceptance versus immediate messaging is undecided. Prototype a simple private conversation and label inbound-request policy unresolved; do not add unrestricted mass outreach.
3. **Response cap after declines/reopening:** The SRS does not specify whether declined responses free slots. Keep an opportunity paused at its cap in the prototype; reopening while full must point to an unresolved rule rather than silently resetting counts or admitting an 11th response.
4. **Invitations:** The SRS does not establish an invitation flow or filter/cap bypass. Do not include one as a required feature.
5. **Missing profile fields:** Proposed behavior: explain which required field is missing and offer Edit profile; do not infer a match or claim profile data is verified.
6. **Verification provider/policy:** Leave vendor and triggering rules configurable. Demonstrate one gated action and a status view. A creator-only feed does not automatically mean all creators have completed identity verification.
7. **Brief edits after confirmation:** Proposed behavior: new edits create a new version requiring current participants' confirmation; detailed active-project change handling requires review.
8. **Checkout policy:** Payment provider, taxes, shipping, refund eligibility, multi-creator settlement, and platform fees are not finalized. Main demo uses one creator and one ticket. Cart design may group other items by creator, but do not promise a single multi-seller settlement implementation.
9. **Shared-point economics:** Cross-creator redemption, 100 points = $1 discount, and creator-set maximum percentage discounts are confirmed. Funding/reimbursement, earning rules, expiration, minimum/increment/rounding, allowed cap range, creator-default versus item-specific caps, discount stacking, participation details and non-USD conversion remain unresolved. Do not promise 100% redemption or reimbursement.
10. **External integrations:** Use sandbox/simulated connections and explicit permissions. The ten-listens-for-one-point proposal is blocked pending provider permission and reliable verification, not an approved live campaign. See section 6F for the prior API/policy findings. Do not claim live Spotify, YouTube Music, Amazon Music, payment, email, or identity verification without evidence.
11. **Scope of public collaborations:** Optional published completed-work posts are audience-visible only after approval; the underlying creator-only collaboration remains private.
12. **Realtime chat:** Private conversation is required; full realtime delivery/presence is not established. Avoid promising typing indicators, video calls, or read receipts as required scope.

## 12. Requirements-to-design coverage map

Use this as a final checklist and cite IDs in handoff annotations, not in customer-facing interface labels.

| Source group | Physical PDF pages | Mockup coverage |
| --- | --- | --- |
| Scope and role workflows, §§1.1, 2.3 | 6–7, 12–16 | Three role experiences, dual-role switch, end-to-end diagrams translated into navigation |
| REQ-AM-1.1–1.7, 1.9–1.10 | 21 | Account entry, verification, recovery, role routing, deletion request, admin restriction |
| REQ-CP-1.1–1.6, 1.8–1.10 | 22 | Profile, content types and lifecycle, visibility, rights information, creator activity |
| REQ-FF-1.1–1.5, 1.8–1.10 | 23 | Search, favorites, chronological feed, reporting, audience navigation, app consent, profile controls |
| REQ-LR-1.1–1.10, 1.13–1.15 | 24–25 | Campaigns, private ledger, shared points, rule limits, checkout discounts and reversals |
| REQ-CM-1.1–1.17, 1.19 | 25–26 | Direct outreach, creator-only opportunities, limits, filters, responses, briefs and approvals |
| REQ-NA-1.1–1.6, 1.9–1.10 | 27 | Role-safe notifications, measured insights, receipt and email delivery separation |
| REQ-COM-1.1–1.10 | 28–29 | Cart, revalidation, provider payment, one order, failure recovery, history, refund states |
| REQ-AS-1.1–1.6, 1.8–1.10 | 30 | Verification, moderation, rule editor, disputes, account actions, decisions and audit |
| REQ-PER, REQ-SEC, REQ-USA | 31–33 | Loading/recovery, role privacy, safe payment representation, consent, accessible responsive layouts |
| Research and working decisions | 34–41 | No fabricated validation; open policy assumptions documented |

Optional/later features include global session logout, featured items, feed filters, per-creator notification preferences, campaign pausing, completed-collaboration publication, audience export, and aggregate admin analytics. External listening/viewing rewards are separately blocked by unresolved permission and verification constraints, not merely an optional integration ready to implement. Clearly distinguish these statuses from required coverage.

## 13. Expected deliverables from Claude Design

### Current pass: design system only

1. One proposed visual direction with a brief rationale tied to AStra's creator, audience, and admin needs.
2. A foundations board with exact semantic color, typography, spacing, size, radius, elevation, icon, motion, and layout tokens.
3. A reusable component gallery covering the families in section 1, with applicable variants and state specimens. Annotate permission-sensitive and monetary/points components.
4. The limited proof compositions specified in section 1, using consistent sample data, plus responsive and accessibility annotations. No complete website is required in this pass.
5. A portable handoff: token table (plus CSS/JSON if supported), component inventory, icon mapping, asset list, assumptions and outstanding review decisions. Explain any export limitations honestly.
6. A short review request covering visual direction, typography, colors, component shapes/density, and example compositions. **Stop here and wait for approval before designing all connected screens.**

The design system is complete for review only when the same named tokens and components are visibly reused across the proof set. A mood board alone is not enough. Keep the remaining screen/state coverage visible as a later checklist rather than claiming it is finished.

### Later pass: connected mockups, only after approval

The following deliverables are retained for the next stage, not the initial request:

1. A brief explanation of the chosen visual direction, navigation, and role distinction.
2. A connected, high-fidelity prototype covering the three demo journeys and the supporting screens above. If the environment only supports static mockups, provide numbered screens and a complete interaction map instead of claiming clickability.
3. Desktop layouts plus mobile variants for at least the audience feed, creator profile, opportunity discovery/detail/response, publishing, cart, checkout, receipt, and loyalty. Explain tablet/admin adaptations.
4. Reusable components: navigation, role switch, profile card, post/event/product variants, opportunity card, filter controls, status badge, form field, modal/drawer, conversation, approval list, ledger row, cart summary, receipt, notification, and admin case row.
5. A compact design system with tokens and component states, plus editable/exportable assets where supported. Keep functional UI text editable rather than baked into images.
6. A developer handoff containing screen IDs, proposed route map, component inventory, interactions, state transitions, visibility rules, responsive behavior, data shown, asset names, and unresolved decisions. Identify demo-only behavior and any omitted screen explicitly.
7. A requirements coverage checklist showing every required group above and where it is represented. No silent omission of administration, errors, mobile, connected apps, or commerce.

Reuse the approved system during the later mockup pass. If a workflow needs a new component or token, document that addition rather than introducing a second visual language.

## 14. Design acceptance checklist

### Design-system review gate (current pass)

- [ ] Exact tokens, component anatomy, variants and applicable states are documented and consistent.
- [ ] Phosphor is the only interface icon family; God UI Orbiting Circles has a restrained use and static alternative.
- [ ] Creator, audience and admin use one visual system without sharing private content or inappropriate controls.
- [ ] The limited proof set includes desktop/mobile layouts and empty, loading and recoverable error examples.
- [ ] Status colors are not the only status cues; keyboard focus, input labels and icon-button names are specified.
- [ ] The shared wallet, 100 points = $1 discount, creator cap editor/preview, capped redemption selector and cap-reached explanation are represented; points remain non-cash.
- [ ] Cross-creator accumulation is demonstrated; creator caps and available balance both constrain redemption. External listening is never falsely labeled verified.
- [ ] Response limits are clear, and payment success is distinct from email delivery.
- [ ] Tokens and component names match the handoff; example data is labeled; no unsupported testing or integration claims.
- [ ] Outstanding visual/policy decisions are listed and the next mockup pass awaits user approval.

### Full mockup review gate (later pass)

- [ ] AStra's purpose is understandable from its entry page and first dashboard.
- [ ] Creator, audience, and admin experiences are distinct; only authorized dual-role users have the creator/audience switch.
- [ ] No private collaboration information leaks into audience views, search, notifications, or public profiles.
- [ ] The collaboration experience supports complementary disciplines, required/preferred filters, one response, and the 5/10/20 cap with default 10.
- [ ] Create, join, and manage collaboration paths are distinct; all selected creators approve the latest brief before activation.
- [ ] Posts, events, and merchandise use appropriate creation/detail layouts and lifecycle controls.
- [ ] The audience feed and discovery remain useful without connected external apps.
- [ ] Shared loyalty points are private, non-cash and usable across participating creators at 100 points = $1 discount; creator-set percentage caps are enforced and explained.
- [ ] The checkout arithmetic is consistent across all screens; pending points cannot be spent.
- [ ] Success creates one order; failure preserves the cart; email failure does not undo a purchase.
- [ ] Creator verification gates and connected-app permission/revocation states are represented.
- [ ] Administrator decisions have a reason, audit record, user notice, and support path.
- [ ] Key screens have mobile layouts, keyboard focus, readable contrast, and clear errors.
- [ ] Demo data and simulated services are identified without overwhelming the interface with implementation details.
- [ ] The handoff identifies unresolved policies and does not claim unperformed research or live integrations.

## 15. Suggested message to use with this attachment

“Use the attached AStra context file to create the design system first, not the full website. Use the AStra report's summarized workflows and the SRS behavior to understand the product. Deliver one coherent visual direction, exact design tokens, reusable components with their states, Phosphor icon rules, and the small desktop/mobile proof set specified in the brief. Include a restrained God UI Orbiting Circles specimen and a static alternative. Keep creator collaborations private and distinguish loyalty points from money. Give me a portable design-system handoff, list assumptions and decisions needing approval, then stop for my review. Do not build all screens, connect live services, or make real payments.”

Attach this file first. Optionally also attach `Astra report.pdf` and the updated SRS for source diagrams and detail. The workflow interpretation is included above so this brief remains usable on its own.

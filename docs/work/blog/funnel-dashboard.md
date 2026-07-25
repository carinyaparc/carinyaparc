---
type: Work
epic: blog
epic_id: CP09
story: S8
task: CP09-16
owner: blog
status: Done
last_updated: 2026-07-25
related:
  - docs/work/blog/design.md
  - docs/work/blog/tasks.md
  - docs/work/blog/analytics-events.md
  - apps/site/src/lib/analytics/
  - docs/architecture/solution.md
---

# Funnel dashboard — GA4 explorations (CP09-16)

Operator guide for measuring subscribe and participation funnels. Event names and parameters are canonical in [`analytics-events.md`](./analytics-events.md). Instrumentation ships in `apps/site/src/lib/analytics/` (CP09-13, CP09-14).

## 1. Decision: GA4 first (no admin UI)

| Option                                | Choice       | Rationale                                                                                                                                                                                          |
| ------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GA4 Explorations**                  | **Selected** | Events already flow through consent-gated GTM → GA4. Explorations give funnel steps, breakdowns by `source` / `interest` / `event_id`, and date ranges without new code, auth, or Payload surface. |
| In-app `app/admin/analytics/page.tsx` | Deferred     | Not needed while GA4 Explorations answer “are we converting by placement?” and “are people signing up for events?”. Build only if GA4 proves insufficient (see §6).                                |

Design default (`design.md` §11 Q3): prefer GA4 exploration; admin view only if exploration is insufficient. Owner: JD.

## 2. Prerequisites

1. **GTM container** linked to the GA4 property used for carinyaparc.com.au (`NEXT_PUBLIC_GTM_ID` loads GTM only after consent).
2. **Custom events** registered (or auto-collected as custom events) in GA4 for:
   - `subscribe_start`, `subscribe_complete`
   - `event_cta_click`, `event_signup_complete`
   - (optional engagement) `article_scroll_depth`
3. **Event-scoped custom dimensions** (recommended) so Explorations can break down by param:

| Dimension display name | Event parameter | Scope |
| ---------------------- | --------------- | ----- |
| Subscribe source       | `source`        | Event |
| Subscribe interest     | `interest`      | Event |
| Participation event id | `event_id`      | Event |
| Scroll depth           | `depth`         | Event |

Register dimensions under **Admin → Data display → Custom definitions**. Until registered, params still appear on individual events in DebugView / Realtime but may not be usable as Exploration dimensions.

4. **Consent.** Site events fire only when `cp_consent` is `accepted` (`ConsentGate` loads GTM; helpers call `GET /api/consent`). Without accept, expect **no** `dataLayer` push and no GA hits for these custom events.

## 3. Subscribe funnel exploration

**Question.** Of readers who start an in-flow subscribe form, how many complete — and by `source` / `interest`?

### 3.1 Create the exploration

1. Open GA4 → **Explore** → **Blank** (or **Funnel exploration** template).
2. Technique: **Funnel exploration**.
3. Steps (ordered):

| Step         | Event name           | Optional filter |
| ------------ | -------------------- | --------------- |
| 1 — Start    | `subscribe_start`    | —               |
| 2 — Complete | `subscribe_complete` | —               |

4. Open funnel settings:
   - **Open funnel** (steps need not be in the same session if you care about multi-session completes; use **Closed** for same-session conversion).
   - Prefer **Closed** for in-article intent measurement.
5. Breakdown dimension: **Subscribe source** (`source`), then a second view with **Subscribe interest** (`interest`).
6. Date range: last 28 days (or campaign window).
7. Save as e.g. **Blog — Subscribe funnel**.

### 3.2 How to read it

- **Step 1 → 2 conversion rate** = form starts that become successful API submits (consent-granted traffic only).
- High starts / low completes → UX or validation friction on a placement.
- Break down by `source` (`blog:{slug}`) to see which articles convert.
- Break down by `interest` on completes (end-of-post module); mid-article starts often omit `interest`.

### 3.3 Companion free-form exploration (optional)

Technique **Free form**: rows = event name; values = event count; filter event name regex `^subscribe_`. Add `source` / `interest` as columns or secondary dimensions for volume checks without funnel sequencing.

## 4. Participation funnel exploration

**Question.** Of readers who click a get-involved CTA, how many complete an on-site event signup — and for which events / sources?

### 4.1 Create the exploration

1. GA4 → **Explore** → **Funnel exploration**.
2. Steps:

| Step                | Event name              | Optional filter |
| ------------------- | ----------------------- | --------------- |
| 1 — CTA click       | `event_cta_click`       | —               |
| 2 — Signup complete | `event_signup_complete` | —               |

3. Use a **Closed** funnel for same-session CTA → signup.
4. Breakdown: **Participation event id** (`event_id`), then **Subscribe source** / participation `source` (`blog:{slug}` vs `events-listing`).
5. Save as e.g. **Blog — Participation funnel**.

### 4.2 How to read it

- CTA clicks without signups may be external waitlist / capacity CTAs (`EventCard` external links) — those fire `event_cta_click` but never `event_signup_complete` on-site. Interpret step 2 as **on-site** signup only.
- Compare `source = blog:{slug}` vs `events-listing` to see whether in-article CTAs drive registrations.
- Filter or segment by `event_id` when measuring a single planting day.

### 4.3 Scroll depth (engagement, not a conversion funnel)

Optional free-form or path exploration on `article_scroll_depth` with dimension `depth` (`25` / `50` / `75` / `100`). Use to see whether readers reach end-of-post subscribe / CTA modules; do not chain into the subscribe funnel as a required step (scroll and subscribe are independent).

## 5. Verify in GA DebugView (with consent)

Use this before trusting exploration charts. Matches S8 Gherkin: events visible in DebugView when consent is granted.

### 5.1 Enable debug mode

Pick one:

| Method                   | Steps                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **GA Debugger (Chrome)** | Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger); enable; open the site.   |
| **GTM Preview**          | Tag Manager → **Preview** → connect to the site URL; confirm tags fire on the custom events.                                       |
| **Debug query param**    | If configured in GTM/GA (e.g. `debug_mode` event param or GA DebugView-linked device), follow your property’s usual debug linking. |

Then in GA4: **Admin → DebugView** (or **Configure → DebugView** depending on UI) and select the debug device.

### 5.2 Grant analytics consent on the site

1. Open a blog article (or `/get-involved/events`) in an incognito window so the consent banner appears.
2. Click **Accept** on the consent banner (`ConsentGate` → `setConsent('accepted')` → httpOnly `cp_consent`).
3. Confirm GTM loaded (Network: GTM script for `NEXT_PUBLIC_GTM_ID`, or `window.google_tag_manager` in the console).
4. Optional console check after interacting:

```js
window.dataLayer?.filter(
  (e) => e?.event?.includes?.('subscribe') || e?.event?.includes?.('event_'),
);
```

### 5.3 Trigger each funnel event

| Event                   | How to fire                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `subscribe_start`       | Focus or change a field on inline or end-of-post subscribe.                                               |
| `subscribe_complete`    | Submit a valid email (and interest on end-of-post) so `/api/subscribe` returns ok. Prefer a test address. |
| `article_scroll_depth`  | Scroll the article past 25% / 50% / 75% / 100%.                                                           |
| `event_cta_click`       | Click the in-article get-involved CTA or an external signup / waitlist control on an event card.          |
| `event_signup_complete` | Complete on-site event signup successfully (not honeypot fake-success).                                   |

### 5.4 Confirm in DebugView

For each hit, check:

- Event name matches the catalog in `analytics-events.md`.
- Params present: `source` / `interest` or `event_id` / `source` or `depth` as applicable.
- No email, name, or other PII in parameters.

### 5.5 Negative check (consent rejected)

1. Reject cookies (or clear consent and choose reject).
2. Interact with subscribe / CTA / scroll again.
3. Expect: helpers no-op; **no** matching custom events in DebugView for those interactions; GTM/VA not loaded by `ConsentGate`.

## 6. When to build an admin analytics page

Revisit `app/admin/analytics/page.tsx` only if one of these becomes true:

- Non-GA stakeholders need the funnel without a Google account.
- GA4 Explorations cannot answer placement/source questions after custom dimensions are registered.
- Product wants Payload-side totals (e.g. signup counts) joined to CMS events in one screen.

Until then, this doc + GA4 Explorations are the funnel dashboard for CP09-16.

## 7. Operator checklist

- [ ] Custom dimensions registered for `source`, `interest`, `event_id`, `depth`
- [ ] Subscribe funnel exploration saved (closed, breakdown by source)
- [ ] Participation funnel exploration saved (closed, breakdown by event_id / source)
- [ ] DebugView verified with consent **accepted** for all five event names
- [ ] DebugView / console confirmed quiet when consent **rejected**
- [ ] Admin analytics page **not** created (deferred per §1 / §6)

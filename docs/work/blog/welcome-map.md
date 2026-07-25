---
type: Work
epic: blog
epic_id: CP09
story: S6
task: CP09-08
owner: blog
status: Draft
last_updated: 2026-07-25
related:
  - docs/work/blog/design.md
  - docs/work/blog/tasks.md
  - apps/site/src/app/api/subscribe/route.ts
  - apps/site/src/lib/validation/subscribe-schema.ts
---

# Welcome map — interest → MailerLite automation

Maps each subscribe **interest** enum value to a MailerLite welcome automation. Implements **S6** (CP09-07 map; CP09-08 MailerLite configuration). **Automations are not yet live** — see §7 for status and the operator checklist.

## 1. How `/api/subscribe` drives the welcome

The site does **not** call MailerLite automations directly. Welcome routing is entirely **ESP-side**: the API upserts a subscriber with custom fields; MailerLite automations react to those fields.

```text
Reader submits form
  → POST /api/subscribe { email, name?, interest?, source?, website(honeypot) }
    → Zod validate (subscribe-schema.ts)
    → resolveSubscribeInterest(interest, interests)  // canonical enum or legacy map
    → buildMailerLiteSubscriberPayload()
    → POST https://connect.mailerlite.com/api/subscribers  (upsert)
         fields: { name?, interest, interests, source }
    → MailerLite automation(s) evaluate field values → send matching welcome email
```

**Key implementation details** (already shipped in CP09-04):

| Item            | Detail                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical field | `interest` — one of the five enum values below                                                                                                                                         |
| Legacy field    | `interests` — still written with the **same canonical value** when mappable, so existing automations that read `interests` keep working during transition                              |
| Attribution     | `source` — e.g. `blog:winter-fencing-progress` from in-flow modules; omitted on standalone `/subscribe/`                                                                               |
| No interest     | When the reader leaves interest blank (inline subscribe, header modal, etc.), neither `interest` nor `interests` is set → **default welcome** (§4)                                     |
| Idempotency     | MailerLite upsert on email; re-subscribe with a different interest updates fields and may re-trigger automations — configure MailerLite to send welcome **once per subscriber** (§5.3) |

**Code references:**

- Schema and enum: `apps/site/src/lib/validation/subscribe-schema.ts`
- Payload builder: `buildMailerLiteSubscriberPayload()` in `apps/site/src/app/api/subscribe/route.ts`

## 2. Interest → welcome automation map

Canonical values are the **exact strings** persisted in MailerLite custom fields. Automations must match these values (case-sensitive).

| Canonical `interest`   | UI label (forms)       | Legacy `/subscribe/` value | Suggested automation name          | Welcome focus                                                                    | Primary CTA                                     |
| ---------------------- | ---------------------- | -------------------------- | ---------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| `restoration`          | Ecological restoration | `regeneration`             | `Welcome — Ecological restoration` | Native planting, habitat corridors, landscape transformation stories             | `https://carinyaparc.com.au/regenerate`         |
| `regenerative-farming` | Regenerative farming   | `farming`                  | `Welcome — Regenerative farming`   | Soil health, agroforestry, syntropic and polyculture practice on the property    | `https://carinyaparc.com.au/about/the-property` |
| `community`            | Community involvement  | `community`                | `Welcome — Community involvement`  | Planting days, workshops, volunteering — **participation-first** tone for locals | `https://carinyaparc.com.au/get-involved`       |
| `produce`              | Future produce         | `produce`                  | `Welcome — Future produce`         | Seasonal garden rhythm, future farm-gate produce, cooking from the land          | `https://carinyaparc.com.au/recipes`            |
| `learning`             | Learning opportunities | `learning`                 | `Welcome — Learning opportunities` | Workshops, farm learning, practical takeaways from the Carinya Parc journey      | `https://carinyaparc.com.au/blog`               |

### 2.1 Community welcome (acceptance scenario)

Per `tasks.md` S6 Gherkin: a subscriber who selects **Community involvement** must receive a **community-oriented welcome** whose primary link targets **get involved**.

- **Trigger field value:** `interest` (or `interests`) equals `community`
- **Email tone:** invitations to participate — planting days, workshops, volunteer opportunities (aligned with `/subscribe/` copy)
- **Required CTA:** prominent button/link to `https://carinyaparc.com.au/get-involved`
- **Note:** the `/get-involved` hub ships in S7 (CP09-09); configure the welcome now so the URL is live when that page publishes. Until then, the link may 404 — acceptable short-term debt tracked in S7.

### 2.2 Secondary links (optional in each welcome)

Use sparingly; one primary CTA per email.

| Interest               | Secondary link ideas                                      |
| ---------------------- | --------------------------------------------------------- |
| `restoration`          | `/blog` (restoration-tagged posts), `/about/the-property` |
| `regenerative-farming` | `/blog`, `/regenerate`                                    |
| `community`            | `/contact` (groups, schools, partners)                    |
| `produce`              | `/blog`, `/subscribe` (manage preferences)                |
| `learning`             | `/get-involved`, `/about`                                 |

## 3. Legacy interest mapping

The standalone `/subscribe/` page still posts `interests` with legacy option values. The API maps them to canonical values before upsert:

| Legacy `interests` (form) | Canonical `interest` / `interests` (MailerLite) |
| ------------------------- | ----------------------------------------------- |
| `regeneration`            | `restoration`                                   |
| `farming`                 | `regenerative-farming`                          |
| `community`               | `community`                                     |
| `produce`                 | `produce`                                       |
| `learning`                | `learning`                                      |

Automations should key off the **canonical** values in §2. During CP09-08 rollout, duplicate triggers on `interests` equal to the same canonical value if older workflows still exist.

## 4. Default welcome (no interest)

Subscribers with **no** `interest` / `interests` field (email-only forms: inline subscribe, header modal, journal band, etc.) should enter a single default automation:

| Condition                                        | Suggested automation name | Focus                                                                                      |
| ------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------ |
| `interest` is empty **and** `interests` is empty | `Welcome — General`       | Broad Carinya Parc introduction; seasonal newsletter promise; link to `/about` and `/blog` |

Ensure interest-specific automations **exclude** this path (they only fire when the matching field is set).

## 5. CP09-08 — MailerLite configuration checklist

Hand this section to whoever configures MailerLite externally.

### 5.1 Custom fields (Subscribers)

Create or verify these custom fields exist with **exact keys** (API field names):

| Field key   | Type | Used for                                                                   |
| ----------- | ---- | -------------------------------------------------------------------------- |
| `interest`  | Text | Canonical enum — **primary automation trigger**                            |
| `interests` | Text | Legacy mirror; same value as `interest` when mapped                        |
| `source`    | Text | Attribution (`blog:{slug}`, etc.); segmentation only — not welcome routing |
| `name`      | Text | Personalisation in email body                                              |

### 5.2 Automations to create

Create **six** welcome automations (five interest-specific + one default):

1. `Welcome — Ecological restoration` — trigger when `interest` equals `restoration`
2. `Welcome — Regenerative farming` — trigger when `interest` equals `regenerative-farming`
3. `Welcome — Community involvement` — trigger when `interest` equals `community`; **must** link to `https://carinyaparc.com.au/get-involved`
4. `Welcome — Future produce` — trigger when `interest` equals `produce`
5. `Welcome — Learning opportunities` — trigger when `interest` equals `learning`
6. `Welcome — General` — trigger when new subscriber has **no** `interest` and **no** `interests`

**Suggested trigger:** “Subscriber joins group” (main list) **and** field condition above — or “Field updated” if the list already had a generic welcome on join.

### 5.3 Send-once guardrails

- Set each welcome automation to run **once per subscriber** (MailerLite “run once” / exit after send).
- Order automations so interest-specific rules are evaluated **before** the general welcome, or scope the general welcome with “field is empty” conditions.
- When a subscriber updates interest via a second form submit, decide product policy: either suppress re-send (preferred) or allow a new welcome — document the choice in MailerLite notes.

### 5.4 Verification (S6 independent test)

For each row in §2, submit a **new test email** via:

```bash
curl -sS -X POST https://carinyaparc.com.au/api/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"test+INTEREST@example.com","interest":"INTEREST","source":"welcome-map-verification"}'
```

Replace `INTEREST` with each canonical value. Confirm in MailerLite:

- Subscriber shows `interest` and `interests` both set to the canonical value
- The matching welcome automation runs
- Community test: email contains link to `/get-involved`

Repeat with legacy payload for regression:

```bash
-d '{"email":"test+legacy@example.com","interests":"regeneration"}'
```

Expect `interest` and `interests` both `restoration` and the restoration welcome.

### 5.5 Production notes

- API key: `MAILERLITE_API_KEY` (see `apps/site/.env.example`)
- No application deploy required for CP09-08 — MailerLite-only
- After configuration, check GA funnel events (`subscribe_complete` with `interest` param) in a later S8 story — not part of CP09-08

## 6. Related stories

| Task     | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| CP09-04  | Extended `/api/subscribe` to persist `interest`, `source` — **done** |
| CP09-07  | This document (interest → automation map) — **done**                 |
| CP09-08  | Configure MailerLite automations using §5 — **pending** (§7)         |
| CP09-09+ | `/get-involved` hub — community welcome CTA destination              |

## 7. CP09-08 status

**Last checked:** 2026-07-25 (feat/blog, agent run)

**Overall:** MailerLite welcome automations are **not configured**. All items in §5 remain **pending human operator** action in the MailerLite dashboard (and/or via API where supported).

### 7.1 API verification attempt

`MAILERLITE_API_KEY` is present in `apps/site/.env.local` but holds the **placeholder** value from `.env.example` (`mailerlite_api_key`), not a live token. A probe against the MailerLite Connect API returned **401 Unauthenticated**:

```bash
curl -sS -H "Authorization: Bearer $MAILERLITE_API_KEY" \
  -H "Accept: application/json" \
  "https://connect.mailerlite.com/api/fields"
# → {"message":"Unauthenticated."}
```

No custom fields, automations, or subscriber state could be verified. **Do not treat welcome routing as live** until §7.3 verification passes.

### 7.2 What a valid API key can verify (post-configuration)

When a real key is available ([MailerLite API docs](https://developers.mailerlite.com/docs/)), an operator or agent can confirm:

| Check                            | Endpoint                                                          | Confirms                                                                           |
| -------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Custom fields exist              | `GET /api/fields`                                                 | Keys `interest`, `interests`, `source`, `name` with type `text` (§5.1)             |
| Welcome automations exist        | `GET /api/automations?limit=100`                                  | Six automations named per §5.2; `enabled: true`; `complete: true`; `broken: false` |
| Trigger wiring (partial)         | `GET /api/automations/{id}`                                       | Trigger type (e.g. `subscriber_joins_group`), group IDs, step list                 |
| Field-based conditions (partial) | Automation detail `steps[]`                                       | Condition steps referencing custom field IDs and canonical values                  |
| Test subscriber fields           | `POST /api/subscribers` (upsert) then `GET /api/subscribers/{id}` | `fields.interest`, `fields.interests`, `fields.source` after §5.4 curl tests       |
| Automation run (indirect)        | `GET /api/automations/{id}/activity`                              | Subscriber entered automation after test signup                                    |

**Not verifiable via API alone:** email body copy, primary CTA URLs (e.g. community → `/get-involved`), “run once” guardrails, and send-once policy on interest change (§5.3). Those require dashboard review or inbox inspection after §5.4 test signups.

### 7.3 Operator checklist — all pending

Copy of §5 for tracking. Mark each `[ ]` → `[x]` in MailerLite (or in this doc after confirmation).

#### 7.3.1 Custom fields (§5.1) — pending

- [ ] Create or verify custom field `interest` (text)
- [ ] Create or verify custom field `interests` (text)
- [ ] Create or verify custom field `source` (text)
- [ ] Create or verify custom field `name` (text)

#### 7.3.2 Welcome automations (§5.2) — pending

- [ ] `Welcome — Ecological restoration` — trigger when `interest` equals `restoration`
- [ ] `Welcome — Regenerative farming` — trigger when `interest` equals `regenerative-farming`
- [ ] `Welcome — Community involvement` — trigger when `interest` equals `community`; primary CTA → `https://carinyaparc.com.au/get-involved`
- [ ] `Welcome — Future produce` — trigger when `interest` equals `produce`
- [ ] `Welcome — Learning opportunities` — trigger when `interest` equals `learning`
- [ ] `Welcome — General` — trigger when new subscriber has **no** `interest` and **no** `interests`

#### 7.3.3 Send-once guardrails (§5.3) — pending

- [ ] Each welcome automation set to run **once per subscriber**
- [ ] Interest-specific rules evaluated **before** general welcome (or general scoped to empty fields)
- [ ] Product policy documented for re-subscribe with different interest (suppress re-send preferred)

#### 7.3.4 End-to-end verification (§5.4) — pending

Run against **production** after automations are enabled:

```bash
# One curl per canonical interest (replace INTEREST)
curl -sS -X POST https://carinyaparc.com.au/api/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"test+INTEREST@example.com","interest":"INTEREST","source":"welcome-map-verification"}'

# Legacy regression
curl -sS -X POST https://carinyaparc.com.au/api/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"test+legacy@example.com","interests":"regeneration"}'
```

Confirm for each test:

- [ ] Subscriber shows `interest` and `interests` set to the canonical value (MailerLite subscriber profile or API)
- [ ] Matching welcome automation runs
- [ ] Community test: email contains link to `/get-involved`
- [ ] Legacy test: both fields `restoration`; restoration welcome fires

### 7.4 Steps to complete CP09-08

1. **Obtain a live API key** — MailerLite dashboard → Integrations → MailerLite API → Generate (see [authentication docs](https://developers.mailerlite.com/docs/#authentication)). Set `MAILERLITE_API_KEY` in `apps/site/.env.local` (local) and Vercel env (production).
2. **Verify or create custom fields** — Complete §7.3.1; optionally confirm with `GET /api/fields`.
3. **Build six welcome automations** — Complete §7.3.2 using trigger guidance in §5.2 and copy/CTAs from §2.
4. **Apply send-once rules** — Complete §7.3.3.
5. **Run §7.3.4 verification** — Production curl tests + inbox check.
6. **Update this section** — Set §7 overall status to configured; check off §7.3 items; record verification date and operator initials.

No application deploy is required for steps 2–5 (MailerLite-only). CP09-04 subscribe payload behaviour is already shipped.

---
type: Backlog
scope: work-package
---

# Backlog -- Checkout Foundations (CHK01)

Sprint-level backlog for `work/checkout/01-foundations/`, implementing CHK01 from `domain/checkout/backlog.md`.

Companion artefacts: `./design.md` · `domain/checkout/solution.md` · `domain/checkout/contracts.md`

## 1. Summary

- **Epic.** CHK01 -- Checkout foundation and scaffold
- **Phase.** Now / Alpha
- **Priority.** P0 (blocks CHK02+)
- **Estimate.** 13 points across 4 stories

**Scope.** Module scaffold, orders API client, `OrderViewModel` + mapper, `placeOrder` Server Action (stub), `(checkout)` route group, checkout page shell, loading skeleton.

**Out of scope (this WP).** Live payment form (CHK02), confirmation page (CHK03), guest checkout (CHK05).

## 2. Stories

- [ ] **[CHK01-01] Checkout module scaffold and view-model types**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 2
  - **Epic:** CHK01 | **Labels:** phase:alpha, domain:checkout, type:scaffold
  - **Depends on:** -
  - **Deliverable:** `modules/checkout/` with `logic/types.ts` defining `OrderViewModel` and all slice types; server and client barrels.
  - **Design:** `./design.md#21-module-layout`
  - **Acceptance (EARS):**
    - WHEN a server component imports `{ OrderViewModel }` from the checkout module server barrel, THE SYSTEM SHALL resolve to the type defined in `logic/types.ts`.
    - THE SYSTEM SHALL provide a client barrel exporting only client-safe hooks and view-model types.
  - **Acceptance (Gherkin):**

    ```gherkin
    Scenario: Server barrel exposes the canonical view model
      Given the checkout module is installed
      When a server component imports { OrderViewModel } from '@/modules/checkout'
      Then the import resolves without error
      And the type matches contracts.md Section 2 exactly
    ```

- [ ] **[CHK01-02] Orders API client**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 3
  - **Epic:** CHK01 | **Labels:** phase:alpha, domain:checkout, type:integration
  - **Depends on:** CHK01-01
  - **Deliverable:** `data/clients/orders-api.server.ts` with `createOrder()`, `getOrder()`, and `listOrders()`; `import 'server-only'` at the top.
  - **Design:** `./design.md#22-data-layer`
  - **Acceptance (EARS):**
    - THE SYSTEM SHALL declare `import 'server-only'` at the top of the client file.
    - WHEN `createOrder(body)` is called with a valid payload, THE SYSTEM SHALL POST to `ORDERS_API_URL/orders` and return `ApiOrder`.
    - WHEN the orders API returns a non-2xx response, THE SYSTEM SHALL throw a typed `OrderApiError` with the status code.
  - **Acceptance (Gherkin):**

    ```gherkin
    Scenario: createOrder reaches the orders API with a typed body
      Given a valid PlaceOrderBody
      When createOrder(body) is called
      Then a POST is made to ORDERS_API_URL/orders
      And the response is mapped to ApiOrder

    Scenario: Non-2xx response throws a typed error
      Given the orders API returns 503
      When createOrder(body) is called
      Then an OrderApiError is thrown with status 503
    ```

- [ ] **[CHK01-03] Checkout route group and page shell**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 5
  - **Epic:** CHK01 | **Labels:** phase:alpha, domain:checkout, type:scaffold
  - **Depends on:** CHK01-01
  - **Deliverable:** `app/(checkout)/checkout/page.tsx` RSC shell; `CheckoutSkeleton`; `placeOrder` Server Action returning `NOT_IMPLEMENTED` (placeholder until CHK02).
  - **Design:** `./design.md#24-route-group`
  - **Acceptance (EARS):**
    - WHEN a customer navigates to `/checkout`, THE SYSTEM SHALL render the checkout page shell with the `CheckoutSkeleton` under Suspense.
    - THE SYSTEM SHALL return HTTP 200 for authenticated requests and redirect to `/login` for unauthenticated ones.
    - WHEN `placeOrder` is invoked in this sprint, THE SYSTEM SHALL return `{ error: 'NOT_IMPLEMENTED' }` without calling any external service.
  - **Acceptance (Gherkin):**

    ```gherkin
    Scenario: Authenticated customer reaches the checkout page
      Given the customer is signed in and has items in the cart
      When the customer navigates to /checkout
      Then the page returns HTTP 200
      And CheckoutSkeleton is rendered

    Scenario: Unauthenticated customer is redirected
      Given the customer is not signed in
      When the customer navigates to /checkout
      Then the response redirects to /login
    ```

- [ ] **[CHK01-04] Mapper and error registry**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 3
  - **Epic:** CHK01 | **Labels:** phase:alpha, domain:checkout, type:mapper
  - **Depends on:** CHK01-01
  - **Deliverable:** `data/mappers/order.mapper.ts` with `orderToViewModel(ApiOrder): OrderViewModel`; `OrderPlacementErrorCode` closed enum; `getOrderErrorMessage(code)` copy helper.
  - **Design:** `./design.md#23-mapper`
  - **Acceptance (EARS):**
    - THE SYSTEM SHALL export `orderToViewModel` mapping every field in `ApiOrder` to a corresponding `OrderViewModel` slice.
    - WHEN an optional `ApiOrder` field is absent, THE SYSTEM SHALL map it to `null` or a documented default.
    - THE SYSTEM SHALL export `OrderPlacementErrorCode` covering every error code defined in `contracts.md Section 4`.
  - **Acceptance (Gherkin):**

    ```gherkin
    Scenario: Mapper produces a valid view model
      Given a fully populated ApiOrder fixture
      When orderToViewModel(fixture) is called
      Then every OrderViewModel field has a non-undefined value
      And money fields are formatted as locale currency strings
    ```

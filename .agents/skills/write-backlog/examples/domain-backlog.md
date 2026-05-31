---
type: Backlog
scope: domain
---

# Backlog -- Checkout (domain)

- **Product:** `domain/checkout/product.md`
- **Solution:** `domain/checkout/solution.md`
- **Roadmap:** `domain/checkout/roadmap.md`

## 1. Summary

**Objective.** Deliver end-to-end order placement: a working payment form, a placement action, and an order confirmation page.

**Prerequisites (required).** Cart domain delivers `CartViewModel` with line items and totals. Payments provider sandbox credentials configured in staging. Orders API staging endpoint verified.

**Out of scope.** See `product.md §5` and `roadmap.md §Later`.

## 2. Conventions

| Convention | Value |
| ---------- | ----- |
| Epic ID    | `CHK{nn}` |
| Story ID   | `CHK{nn}-{nn}` (in work-package backlog) |
| Priority   | P0 must-have · P1 should-have · P2 stretch |
| Estimation | Fibonacci points |

## 3. Epic breakdown

| Epic  | Title                               | Phase | Priority | Deps          | Points | Work package                  | Status      |
| ----- | ----------------------------------- | ----- | -------- | ------------- | ------ | ----------------------------- | ----------- |
| CHK01 | Checkout foundation and scaffold    | Now   | P0       | -             | 13     | `work/checkout/01-foundations/` | Done      |
| CHK02 | Payment form and placement action   | Now   | P0       | CHK01         | 18     | `work/checkout/02-placement/` | Not started |
| CHK03 | Order confirmation page             | Now   | P0       | CHK02         | 8      | `work/checkout/03-confirmation/` (planned) | Not started |
| CHK04 | Analytics and observability gate    | Now   | P0       | CHK02, CHK03  | 5      | `work/checkout/04-analytics/` (planned) | Not started |
| CHK05 | Guest checkout (no account needed)  | Next  | P1       | CHK02         | 13     | `work/checkout/05-guest/` (planned) | Not started |

## 4. Critical path

```text
CHK01 → CHK02 → CHK03 → CHK04
```

CHK05 can begin in parallel with CHK03.

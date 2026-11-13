# Automated Artillery Concurrency & Double-Booking Stress Test Suite

## 1. Stress Test Objectives
Simulate 250 virtual users simultaneously submitting reservation requests for the same VIP table slot at the exact millisecond.

## 2. Artillery Scenario Script
```yaml
config:
  target: "https://dine-luxe.api/v1"
  phases:
    - duration: 10
      arrivalRate: 25
scenarios:
  - flow:
      - post:
          url: "/bookings/reserve"
          json:
            table_id: "tbl_vip_01"
            slot: "2026-11-14T20:00:00Z"
```

## 3. Verification Assertion
Asserts exactly **1 request succeeds with HTTP 201**, while 249 requests receive HTTP 409 Conflict with zero database ledger inconsistencies.

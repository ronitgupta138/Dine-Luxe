# Reservation Concurrency Stress Test Suite Specification

## 1. Test Objectives
Assert that under 500 concurrent booking requests targeting a single remaining table slot:
- Exactly 1 request succeeds (HTTP 200/201).
- Exactly 499 requests are rejected with graceful conflict errors (HTTP 409).
- Zero data corruption or negative slot capacity states occur in PostgreSQL.

## 2. Load Testing Harness
Automated Artillery / k6 script executing parallel virtual user batches against the reservation endpoint.

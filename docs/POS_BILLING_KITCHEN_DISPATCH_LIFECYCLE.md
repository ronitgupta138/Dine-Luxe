# Point-of-Sale (POS) Order Billing Lifecycle & KDS Dispatch Specification

## 1. Order Lifecycle Stages
- `ORDER_PLACED`: Waiter records course items.
- `KDS_DISPATCHED`: Split into kitchen display station tickets (Grill, Saute, Bar).
- `PREPARED`: Kitchen confirms ticket completion.
- `SERVED`: Food delivered to guest table.
- `BILLED`: Split bill generated with taxes and service fees.
- `PAID`: Payment processed via Stripe or cash ledger.

## 2. Kitchen Display System (KDS) Routing
Course firing rules automatically time course delivery, holding dessert preparation until main courses transition to `SERVED`.

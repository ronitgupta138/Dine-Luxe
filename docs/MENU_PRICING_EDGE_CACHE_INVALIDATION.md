# Menu Pricing Sub-Millisecond Edge Cache Invalidation Specification

## 1. Caching Strategy
Restaurant digital QR menus receive heavy read traffic. Menu catalogs are cached at the edge (Cloudflare / Vercel Edge Network) with `s-maxage=86400`.

## 2. Instant Cache Purge on Price Update
When a restaurant manager modifies item availability (86ing an item) or updates price in the admin portal:
- Triggers web purge hook via surrogate key tag:
`Cache-Tag: menu_branch_101`
- Edge nodes invalidate cached menu HTML/JSON globally within $< 150\,\text{ms}$.

## 3. Zero Stale Pricing Guarantee
Prevents guests from ordering out-of-stock items or items with outdated pricing.

# Redis Lua Atomic Table Booking Script & Race Condition Elimination

## 1. Concurrency Problem
High-demand table booking peaks (e.g. Valentine's Day, weekend dinners) trigger simultaneous reservation attempts on the identical dining table slot.

## 2. Atomic Lua Reservation Script
```lua
local table_key = KEYS[1]
local user_id = ARGV[1]
local ttl_seconds = ARGV[2]

local current_status = redis.call('GET', table_key)
if current_status then
    return 0 -- Table already reserved or held
end

redis.call('SET', table_key, user_id, 'EX', ttl_seconds)
return 1 -- Reservation acquired successfully
```

## 3. Invariants
- Single-threaded atomic evaluation inside Redis guarantees zero double-booking races under 1,000+ simultaneous concurrent requests.

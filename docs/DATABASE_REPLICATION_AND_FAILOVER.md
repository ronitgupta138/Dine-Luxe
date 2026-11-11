# PostgreSQL Streaming Replication and Automated Switchover Architecture

## 1. Topology
- Primary database handling write traffic with synchronous WAL replication to hot standby.
- Standby promote script triggers DNS redirect in sub-3s during primary node failure.

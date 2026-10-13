# 📡 Dine Luxe — Complete REST API Reference

> Specification of public, authenticated, and administrative endpoints across all 25 modules.  
> Base URL: `http://localhost:5001/api/v1`

---

## 🔒 Authentication & Authorization Headers

All authenticated requests require the standard Bearer authorization header:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 📋 Endpoint Matrix by Module

### 1. Authentication (`/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Public | Register customer account and trigger verification OTP |
| `POST` | `/auth/verify-otp` | Public | Verify OTP code and issue JWT tokens (`accessToken`, `refreshToken`) |
| `POST` | `/auth/login` | Public | Authenticate with email/username and password |
| `POST` | `/auth/refresh` | Public | Exchange refresh token for fresh access token |
| `POST` | `/auth/logout` | Authenticated | Invalidate current user session and revoke refresh token |

---

### 2. Table Reservations (`/reservations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/reservations` | Authenticated | Create table reservation (guarded by Redis Mutex lock) |
| `GET` | `/reservations` | Authenticated | List user reservations with pagination & status filters |
| `GET` | `/reservations/:id` | Authenticated | Fetch single reservation details and assigned table info |
| `PATCH` | `/reservations/:id` | Manager/Host | Update reservation time slot or seating count |
| `DELETE` | `/reservations/:id` | Authenticated | Cancel reservation and release allocated table slot |

---

### 3. Orders & Kitchen Display (`/orders`, `/kitchen`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Authenticated | Create dining or delivery order |
| `GET` | `/orders/:id` | Authenticated | Retrieve complete order breakdown and items |
| `PATCH` | `/orders/:id/status`| Waiter/Chef/Manager | Update order status (`placed` ➔ `preparing` ➔ `ready` ➔ `served`) |
| `GET` | `/kitchen/active` | Chef/Staff | Real-time active kitchen ticket display feed |

---

### 4. Tables & Floor Management (`/tables`, `/floor-layout`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/tables` | Staff | Retrieve table statuses (`free`, `occupied`, `reserved`) |
| `POST` | `/tables` | Owner/Manager | Add a new dining table to branch layout |
| `PATCH` | `/tables/:id/status`| Waiter/Host | Update physical table status |
| `GET` | `/floor-layout/live`| Staff | Live spatial floor map with real-time seating states |

---

### 5. Menu & Catalog (`/menu`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/menu` | Public | List menu items filtered by category, dietary tag, availability |
| `POST` | `/menu/items` | Owner/Manager | Create a new menu item |
| `PATCH`| `/menu/items/:id` | Owner/Manager | Update pricing, addons, description, or availability |
| `DELETE`|`/menu/items/:id` | Owner/Manager | Deactivate menu item |

---

### 6. Payments & Billing (`/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/charge` | Cashier/Customer| Process order payment (Cash, Card, UPI) |
| `POST` | `/payments/split` | Cashier | Split bill across multiple payment instruments |
| `GET` | `/payments/:id/receipt`| Authenticated | Generate finalized digital receipt payload |

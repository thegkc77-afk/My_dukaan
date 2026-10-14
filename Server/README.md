# My Dukaan Backend API

Secure, reliable, and affordable backend REST API for **My Dukaan — Tagless Digital Item Identity & Warranty Verification System**.

Built for small sports shops and repair businesses to replace browser localStorage with a central database, multi-tenant isolation, role-based access control, and authoritative tagless item recovery.

---

## 🛠️ Technology Stack

- **Runtime & Framework:** Node.js (ES Modules), Express.js
- **Database & ODM:** MongoDB (Atlas / Local), Mongoose
- **Authentication & Security:** JWT (Access & Refresh tokens), bcryptjs, Helmet, CORS, express-rate-limit
- **Validation:** Zod schema validation
- **File & Media Storage:** Multer with Cloudinary integration & local disk storage fallback
- **Testing:** Vitest & Supertest

---

## 📂 Project Structure

```text
Server/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection & lifecycle management
│   │   └── env.js               # Validated environment configuration
│   ├── controllers/
│   │   ├── authController.js    # Login, logout, profile & session refresh
│   │   ├── dashboardController.js # Authoritative shop metrics & recent records
│   │   ├── repairController.js  # Repair orders CRUD & status transitions
│   │   ├── itemSearchController.js # Multi-factor tagless item search
│   │   ├── salesController.js   # Sales registration & warranty calculations
│   │   ├── warrantyController.js # Warranty lookup & claim linkage
│   │   ├── claimController.js   # Warranty claims & history tracking
│   │   ├── handoverController.js # Handover checklist & atomic order completion
│   │   ├── settingsController.js # Shop settings, staff accounts & backups
│   │   └── uploadController.js  # Image upload handler
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification & role authorization
│   │   ├── errorMiddleware.js   # 404 & global error response formatting
│   │   ├── validateRequest.js   # Zod request validation
│   │   └── uploadMiddleware.js  # Multer image validation & limits
│   ├── models/
│   │   ├── Shop.js              # Shop tenant configuration
│   │   ├── User.js              # Staff & Owner user accounts with hashed passwords
│   │   ├── RepairOrder.js       # Repair records with physical characteristics
│   │   ├── SalesRecord.js       # Sales with automated warranty expiry
│   │   ├── WarrantyClaim.js     # Claims with complete audit history
│   │   ├── Handover.js          # Verified handover release records
│   │   └── AuditLog.js          # Tamper-evident shop activity logs
│   ├── routes/                  # Express route declarations prefixed /api/v1
│   ├── scripts/
│   │   └── seed.js              # Sample demo database seed script
│   ├── services/
│   │   ├── auditService.js      # Structured audit logging
│   │   ├── searchService.js     # Authoritative search & characteristic matching
│   │   └── uploadService.js     # Cloudinary / local file storage handler
│   ├── utils/
│   │   ├── apiResponse.js       # Consistent JSON response envelope
│   │   ├── dateUtils.js         # Server-side warranty calculations
│   │   └── generateRecordId.js  # Collision-safe human-readable ID generation
│   ├── validators/              # Zod input schemas
│   ├── app.js                   # Express application setup
│   └── server.js                # Server startup & graceful shutdown
├── tests/
│   └── api.test.js              # Comprehensive integration test suite (16 tests)
├── uploads/                     # Local uploads directory
├── .env.example                 # Example environment variables
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string.

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` values as needed:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/my_dukaan
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Development Data
Populates the database with demo sports shop records, users, repairs, sales, claims, and handovers:
```bash
npm run seed
```

**Default Seed Credentials:**
- **Owner Account:** `owner@dukkan.com` / `123456`
- **Head Technician:** `suresh@dukkan.com` / `123456`
- **Front Desk Staff:** `vikram@dukkan.com` / `123456`

### 5. Start the Server
- **Development (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```
- **Run Automated Tests:**
  ```bash
  npm test
  ```

---

## 📡 REST API Reference (`/api/v1`)

### Health
- `GET /api/health` — Service health check and uptime.

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/login` | Authenticate with email/password (rate-limited) | No |
| POST | `/logout` | Invalidate session & clear cookies | Yes |
| GET | `/me` | Get authenticated user & shop profile | Yes |
| POST | `/refresh` | Refresh access token using refresh token | No |

### Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/summary` | Real-time counts (repairs, warranties, claims, handovers) | Yes |
| GET | `/recent-repairs` | Latest repair orders | Yes |
| GET | `/recent-claims` | Latest warranty claims | Yes |

### Repair Orders (`/api/v1/repairs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Create repair order (auto-assigns `RO-YYYY-XXXX`) | Yes |
| GET | `/` | List/filter orders (`q`, `category`, `brand`, `status`, pagination) | Yes |
| GET | `/:id` | Get repair order details | Yes |
| PATCH | `/:id` | Update editable repair order fields | Yes |
| PATCH | `/:id/status` | Update repair status with audit notes & validation | Yes |
| DELETE | `/:id` | Delete repair order record | Yes |
| GET | `/:id/handover` | Retrieve handover record associated with order | Yes |

### Tagless Item Search (`/api/v1/items`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/search?q=...` | Authoritative multi-attribute scoring & match reasoning | Yes |
| GET | `/:id` | Retrieve single item details | Yes |

### Sales & Warranties (`/api/v1/sales`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Register sale with automated warranty expiry calculation | Yes |
| GET | `/` | List & search sales records | Yes |
| GET | `/:id` | Get sales record details | Yes |
| PATCH | `/:id` | Update sales record fields | Yes |
| GET | `/:id/warranty` | Retrieve warranty coverage & linked claims | Yes |

### Warranty Lookup (`/api/v1/warranty`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/lookup` | Search warranty database by product, customer, or serial | Yes |

### Warranty Claims (`/api/v1/warranty-claims`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Register claim (verifies linked sales record in shop) | Yes |
| GET | `/` | List & filter claims by status/dates | Yes |
| GET | `/:id` | Get claim details and status history | Yes |
| PATCH | `/:id` | Update claim defect and damage details | Yes |
| PATCH | `/:id/status` | Advance claim workflow status with staff history log | Yes |

### Handovers (`/api/v1/handovers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Execute handover & atomically mark order `Completed` | Yes |
| GET | `/` | List historical handovers | Yes |
| GET | `/:id` | Get handover verification details | Yes |

### Settings & Staff (`/api/v1/settings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Get current shop settings | Yes |
| PATCH | `/` | Update shop details, categories, durations (Owner/Manager) | Yes |
| GET | `/staff` | List registered staff accounts (Owner/Manager) | Yes |
| POST | `/staff` | Create new authenticated staff account (Owner) | Yes |
| PATCH | `/staff/:id` | Edit staff credentials or roles (Owner) | Yes |
| PATCH | `/staff/:id/active` | Toggle staff account active/inactive (Owner) | Yes |
| GET | `/backup/export` | Export full shop data in JSON format (Owner) | Yes |
| POST | `/backup/import` | Import shop data from verified JSON backup (Owner) | Yes |

### Uploads (`/api/v1/uploads`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/images` | Upload multipart image (Cloudinary or local storage) | Yes |

---

## 🔒 Security & Data Integrity

1. **Multi-Tenant Isolation**: All database lookups and mutations are filtered by `shopId` extracted from the cryptographically verified JWT.
2. **Atomic Status Workflows**: Repair orders cannot be set to `Completed` without completing the verified handover workflow. Duplicate handovers for the same order are strictly prevented.
3. **Password Security**: Passwords hashed with `bcryptjs` salt factor 10. Password hashes are stripped from all API outputs.
4. **Audit Logging**: Sensitive events (logins, order creation, status transitions, warranty decisions, handovers, settings modifications) are stored in `AuditLog`.
5. **Rate Limiting**: Brute-force protection on `/api/v1/auth/login`.

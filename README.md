# My SaaS Kit

A production-ready, full-stack SaaS starter kit with enterprise-grade authentication, role-based access control (RBAC), comprehensive audit logging, and admin interfaces. Built with Go and Next.js 14.

## Highlights

🔐 **Security First**
- Database-backed refresh tokens with automatic rotation
- Per-IP and per-user rate limiting
- Comprehensive audit logging with old/new value tracking
- Correlation IDs for distributed tracing

⚡ **Developer Experience**
- Automatic token refresh (transparent to users)
- Structured JSON logging for production
- Auto-migration and seeding on startup
- Hot reload for both frontend and backend

📊 **Admin Tools**
- Audit logs management page with advanced filtering
- Active sessions management (revoke tokens)
- Visual permission editors
- Multi-field search and filtering

## Features

### Authentication & Security
- **JWT Authentication** with HTTP-only cookies (XSS protection)
- **Database-Backed Refresh Tokens** with automatic rotation and revocation support
- **Automatic Token Refresh** on 401 errors (transparent to users)
- **Token Revocation** - Revoke individual tokens or all user tokens
- **Rate Limiting** - Per-IP limits for auth endpoints, per-user for API endpoints
- **Password Hashing** using bcrypt
- **Protected Routes** on both frontend and backend
- **CORS Configuration** with origin whitelist
- **Graceful Shutdown** with 5-second grace period

### Audit & Logging
- **Comprehensive Audit Logging** - Track all user actions with old/new values
- **Automatic Audit Middleware** - Auto-logs POST/PUT/DELETE operations
- **Authentication Event Logging** - Login success/failure, logout events
- **Structured JSON Logging** with correlation IDs for request tracing
- **Audit Logs Management Page** with advanced filtering (user, action, resource, date range)
- **IP Address & User Agent Tracking** in audit logs

### Role-Based Access Control (RBAC)
- **Hierarchical Menu System** with parent-child relationships
- **Role-Menu Permissions** (Read, Write, Update, Delete per menu)
- **User Permission Overrides** for fine-grained access control
- **Permission Inheritance** from roles with optional user-level overrides
- **Protected System Roles** preventing deletion of core roles

### Admin Interfaces
- **User Management** - Create, edit, delete users with permission assignment
- **Role Management** - Define roles and assign menu permissions
- **Menu Management** - Build hierarchical navigation structures
- **Visual Permission Editors** - Matrix-style permission assignment UI

### Data Management
- **Advanced Pagination** with configurable page sizes (1-100)
- **Multi-field Search** with debounced input
- **Advanced Filtering** with multiple operators:
  - `equals`, `notEquals`, `contains`, `notContains`
  - `startsWith`, `endsWith`
  - `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`
  - `is`, `isNot`, `isEmpty`, `isNotEmpty`
- **AND/OR Filter Logic** for complex queries
- **Multi-column Sorting** (ascending/descending)
- **Soft Delete Support** with data preservation

### UI/UX
- **Light & Dark Mode** with localStorage persistence
- **Discord-inspired Dark Theme** (#2b2d31 background)
- **Responsive Design** with mobile-first approach
- **Toast Notifications** for user feedback
- **Loading Skeletons** for better perceived performance
- **Collapsible Sidebar** with smooth animations

## Tech Stack

### Backend (Go)
| Technology | Purpose |
|------------|---------|
| Go 1.23 | Runtime |
| Gin | Web framework |
| GORM | ORM |
| PostgreSQL | Database |
| JWT (v5) | Authentication |
| bcrypt | Password hashing |
| golang.org/x/time/rate | In-memory rate limiting |
| github.com/google/uuid | Correlation IDs & secure token generation |

### Frontend (Next.js)
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework (App Router) |
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Redux Toolkit | Client state management |
| React Query | Server state management |
| React Table | Data tables |
| Axios | HTTP client |
| Headless UI | Accessible components |
| Heroicons | Icons |

## Getting Started

### Prerequisites
- Go 1.23+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd sass-api

# Copy environment file and configure
cp .env.example .env

# Edit .env with your database credentials and JWT secret
# Required: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# Install dependencies
go mod download

# Run with hot reload (recommended for development)
air

# Or build manually
go build -o ./tmp/main ./cmd/main.go && ./tmp/main
```

**Important**: On first run, the server will automatically:
- Create database tables (`users`, `roles`, `menus`, `role_menus`, `user_menus`, `rights_access`, `refresh_tokens`, `audit_logs`)
- Seed default roles (root, admin, user)
- Seed system menus (Dashboard, Configuration, Audit Logs, etc.)
- Grant permissions to admin and root roles

### Frontend Setup

```bash
cd sass-ui

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Environment Variables

**Backend (`sass-api/.env`)**
```env
APP_ENV=development
SERVER_PORT=8080
SERVER_HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sass_db
DB_SSL_MODE=disable
DB_AUTO_MIGRATE=true

# JWT Tokens
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=168h  # 7 days

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_IP=100        # Requests per window for unauthenticated endpoints
RATE_LIMIT_PER_USER=1000     # Requests per window for authenticated users
RATE_LIMIT_WINDOW=1h         # Time window for rate limiting

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=debug
ENVIRONMENT=development  # Set to 'production' for JSON logging
```

**Frontend (`sass-ui/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Project Structure

```
my-sass-kit/
├── sass-api/                    # Go Backend
│   ├── cmd/
│   │   └── main.go             # Entry point with graceful shutdown
│   ├── internal/
│   │   ├── config/             # Environment configuration
│   │   ├── database/           # PostgreSQL connection, migrations, seeders
│   │   ├── domain/models/      # Data models and DTOs
│   │   │   ├── users.go
│   │   │   ├── roles.go
│   │   │   ├── menus.go
│   │   │   ├── refresh_token.go  # NEW: Refresh token model
│   │   │   └── audit_log.go      # NEW: Audit log model
│   │   ├── handlers/           # HTTP request handlers
│   │   │   ├── auth_handler.go
│   │   │   ├── user_handler.go
│   │   │   ├── role_handler.go
│   │   │   ├── menu_handler.go
│   │   │   ├── token_handler.go  # NEW: Token refresh/revoke endpoints
│   │   │   └── audit_handler.go  # NEW: Audit log queries
│   │   ├── services/           # Business logic layer
│   │   │   ├── user_service.go
│   │   │   ├── role_service.go
│   │   │   ├── menu_service.go
│   │   │   ├── token_service.go        # NEW: Token management
│   │   │   ├── audit_service.go        # NEW: Audit logging
│   │   │   └── rate_limiter_service.go # NEW: Rate limiting
│   │   ├── middleware/         # HTTP middleware
│   │   │   ├── auth.go         # JWT authentication
│   │   │   ├── correlation.go  # NEW: Correlation ID injection
│   │   │   ├── rate_limit.go   # NEW: Rate limiting
│   │   │   └── audit.go        # NEW: Auto-audit logging
│   │   ├── logger/             # NEW: Structured logging
│   │   │   └── logger.go
│   │   ├── pagination/         # Advanced pagination utilities
│   │   ├── routes/             # API route definitions
│   │   └── common/             # Shared response helpers
│   └── .air.toml               # Hot reload configuration
│
├── sass-ui/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── auth/           # Login & Register pages
│   │   │   ├── users-management/
│   │   │   ├── roles-management/
│   │   │   ├── menus-management/
│   │   │   └── audit-logs/     # NEW: Audit logs page
│   │   ├── components/
│   │   │   ├── modals/         # Modal dialogs
│   │   │   └── ui/             # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useAuditLogs.ts # NEW: Audit logs hooks
│   │   ├── services/           # API client services
│   │   │   └── auditService.ts # NEW: Audit API client
│   │   ├── providers/          # React context providers
│   │   ├── store/              # Redux Toolkit store
│   │   └── lib/                # Utilities
│   │       └── axios.ts        # UPDATED: Token refresh interceptor
│   └── middleware.ts           # Auth middleware
│
└── docs/                        # Documentation
```

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and receive tokens |
| POST | `/api/auth/refresh-token` | No | Refresh access token (uses refresh_token cookie) |
| GET | `/api/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout and clear cookies |

### Token Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tokens/active` | Yes | Get user's active refresh tokens |
| POST | `/api/tokens/revoke` | Yes | Revoke a specific refresh token |
| POST | `/api/tokens/revoke-all` | Yes | Revoke all user's refresh tokens |

### Audit Logs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/audit/logs` | Yes | Get audit logs (paginated, filterable) |
| GET | `/api/audit/logs/user/:userId` | Yes | Get audit logs for specific user |
| GET | `/api/audit/logs/:resourceType/:resourceId` | Yes | Get audit logs for specific resource |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Yes | List users (paginated) |
| GET | `/api/user/{id}` | Yes | Get user details |
| POST | `/api/user/create` | Yes | Create user |
| PUT | `/api/user/{id}` | Yes | Update user |
| DELETE | `/api/user/{id}` | Yes | Delete user |

### Roles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/roles` | Yes | List roles (paginated) |
| GET | `/api/roles/active` | Yes | Get active roles only |
| GET | `/api/role/{id}` | Yes | Get role details |
| POST | `/api/role/create` | Yes | Create role |
| PUT | `/api/role/{id}` | Yes | Update role |
| DELETE | `/api/role/{id}` | Yes | Delete role |
| GET | `/api/role/{id}/menus` | Yes | Get role's menu permissions |
| POST | `/api/role/{id}/menus` | Yes | Bulk assign menus to role |

### Menus
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/menus` | Yes | List menus (paginated) |
| GET | `/api/menus/tree` | Yes | Get hierarchical menu tree |
| GET | `/api/menus/user` | Yes | Get user's accessible menus |
| GET | `/api/menu/{id}` | Yes | Get menu details |
| POST | `/api/menu/create` | Yes | Create menu |
| PUT | `/api/menu/{id}` | Yes | Update menu |
| DELETE | `/api/menu/{id}` | Yes | Delete menu |

### Rights Access
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/rights-access/user/{id}` | Yes | Get user permission overrides |
| POST | `/api/rights-access/user/{id}/bulk` | Yes | Bulk save user permissions |
| DELETE | `/api/rights-access/user/{id}` | Yes | Clear all user overrides |

## Authentication Flow

### Initial Login
```
┌─────────────┐     POST /auth/login      ┌─────────────┐
│   Frontend  │ ────────────────────────► │   Backend   │
│             │                           │             │
│             │                           │  1. Validate credentials
│             │                           │  2. Generate JWT access token
│             │                           │  3. Create refresh token in DB
│             │                           │  4. Log LOGIN_SUCCESS event
│             │                           │             │
│             │ ◄──────────────────────── │             │
│             │   Set HTTP-only Cookies   │             │
│             │   - access_token (24h)    │             │
│             │   - refresh_token (7d)    │             │
└─────────────┘                           └─────────────┘
```

### Automatic Token Refresh
```
┌─────────────┐  API Request (expired token)  ┌─────────────┐
│   Frontend  │ ──────────────────────────────► │   Backend   │
│             │                                 │             │
│             │ ◄────────────────────────────── │             │
│             │       401 Unauthorized          │             │
│             │                                 │             │
│  Axios      │  POST /auth/refresh-token       │             │
│  Interceptor│ ──────────────────────────────► │             │
│             │  (with refresh_token cookie)    │             │
│             │                                 │  1. Validate refresh token
│             │                                 │  2. Rotate token (revoke old, create new)
│             │                                 │  3. Generate new JWT
│             │                                 │             │
│             │ ◄────────────────────────────── │             │
│             │   New access_token cookie       │             │
│             │                                 │             │
│             │  Retry Original Request         │             │
│             │ ──────────────────────────────► │             │
│             │                                 │             │
│             │ ◄────────────────────────────── │             │
│             │       200 OK (Success)          │             │
└─────────────┘                                 └─────────────┘
```

### Key Features
1. **Database-Backed Refresh Tokens**: Stored in `refresh_tokens` table (not JWT-based) for revocation support
2. **Automatic Rotation**: On refresh, old token is revoked and new one issued
3. **Transparent Refresh**: Axios interceptor automatically refreshes expired tokens
4. **Security**: HTTP-only cookies prevent XSS attacks
5. **Audit Logging**: All login attempts (success/failure) and logouts are logged

## Permission System

The template implements a two-tier permission system:

### Tier 1: Role-Based Permissions
Permissions assigned to roles apply to all users with that role.

```
Role: "Editor"
├── Menu: "Dashboard" → Read ✓, Write ✗, Update ✗, Delete ✗
├── Menu: "Articles"  → Read ✓, Write ✓, Update ✓, Delete ✗
└── Menu: "Settings"  → Read ✓, Write ✗, Update ✗, Delete ✗
```

### Tier 2: User Permission Overrides
Individual users can have permission overrides that take precedence over role permissions.

```
User: "john@example.com" (Role: Editor)
└── Override: "Articles" → Delete ✓ (grants delete despite role)
```

### Permission Resolution Logic
```
if (UserOverride exists && UserOverride.value != null) {
  return UserOverride.value
} else {
  return RolePermission.value
}
```

## Database Models

### Core Entities

**User**
- `id`, `username`, `email`, `password`, `name`
- `role_id` (FK to Role)
- `created_at`, `updated_at`, `deleted_at`, `is_deleted`

**Role**
- `id`, `name`, `display_name`, `description`
- `is_default`, `is_active`
- `created_at`, `updated_at`, `deleted_at`

**Menu**
- `id`, `name`, `path`, `icon`, `order_index`
- `parent_id` (self-referential FK)
- `is_active`
- `created_at`, `updated_at`, `deleted_at`

**RefreshToken** _(New)_
- `id`, `token` (unique, indexed)
- `user_id` (FK to User)
- `expires_at`, `is_revoked`, `revoked_at`
- `replaced_by` (FK to self for token rotation chain)
- `ip_address`, `user_agent`
- `created_at`

**AuditLog** _(New)_
- `id`, `user_id` (nullable for failed login attempts)
- `username`, `action` (CREATE, UPDATE, DELETE, LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT)
- `resource_type`, `resource_id`
- `old_values`, `new_values` (JSONB for state tracking)
- `ip_address`, `user_agent`
- `correlation_id` (for request tracing)
- `timestamp`

### Pivot Tables

**RoleMenu** (Role ↔ Menu permissions)
- `role_id`, `menu_id`
- `can_read`, `can_write`, `can_update`, `can_delete`

**UserMenu** (Direct user ↔ menu assignments)
- `user_id`, `menu_id`

**RightsAccess** (User permission overrides)
- `user_id`, `menu_id`
- `can_read`, `can_write`, `can_update`, `can_delete` (nullable)

## UI Components

The template includes a comprehensive component library:

| Component | Description |
|-----------|-------------|
| `DataTable` | Advanced table with pagination, sorting, filtering |
| `MasterTable` | Generic table wrapper for any data type |
| `FormCard` | Structured form container with sections |
| `Input` | Text input with theme support |
| `Select` | Dropdown select with search |
| `PrimaryButton` | Main action button |
| `SecondaryButton` | Secondary action button |
| `MenuPermissionsEditor` | Visual CRUD permission matrix |
| `RoleMenuPermissionsEditor` | Role-based permission editor |
| `DeleteModal` | Confirmation dialog |
| `AdvancedFilterModal` | Multi-condition filter builder |
| `Sidebar` | Collapsible navigation with animations |
| `TopNav` | Header with search and user menu |

## Custom Hooks

```typescript
// Authentication
useAuth({ requireAuth: true }) // Redirects if not authenticated

// Users
useGetAllUsers(params)
useGetUserById(id)
useCreateUser()
useUpdateUser()
useDeleteUser()

// Roles
useGetAllRoles(params)
useGetActiveRoles()
useGetRoleById(id)
useCreateRole()
useUpdateRole()
useDeleteRole()
useBulkAssignMenusToRole()

// Menus
useGetUserMenus()
useGetMenuTree()
useGetRoleMenus(roleId)
useGetUserRightsAccess(userId)
useBulkSaveUserRightsAccess()

// Utilities
useDebounce(value, delay)

// Audit Logs (NEW)
useGetAuditLogs(params)
useGetUserAuditLogs(userId, params)
```

## Security Features

### Token Management

#### Database-Backed Refresh Tokens
Unlike traditional JWT-only approaches, refresh tokens are stored in the database with the following benefits:
- **Revocation Support**: Tokens can be immediately revoked (not possible with stateless JWT)
- **Device Tracking**: Each token stores IP address and user agent
- **Audit Trail**: Track when tokens are created, rotated, or revoked
- **Token Rotation**: On refresh, old tokens are revoked and replaced with new ones

#### Token Lifecycle
```
Login → Create refresh_token in DB → Set cookies
                    ↓
            Token expires (24h)
                    ↓
            Auto-refresh via interceptor
                    ↓
    Rotate token (revoke old, create new)
                    ↓
            Continue using app seamlessly
```

#### Manual Token Revocation
Users can revoke tokens from the "Active Sessions" page:
- **Revoke Single Token**: Logout from specific device
- **Revoke All Tokens**: Logout from all devices except current
- Useful for security incidents or lost devices

### Rate Limiting

Protects against abuse and brute-force attacks:

**Per-IP Rate Limiting** (unauthenticated endpoints)
- Applied to: `/auth/login`, `/auth/register`, `/auth/refresh-token`
- Default: 100 requests per hour per IP
- Prevents credential stuffing attacks

**Per-User Rate Limiting** (authenticated endpoints)
- Applied to: All API endpoints requiring authentication
- Default: 1000 requests per hour per user
- Prevents API abuse

**Implementation**
- In-memory rate limiting using `golang.org/x/time/rate`
- Sliding window algorithm
- Automatic cleanup of expired entries
- Configurable limits via environment variables

### Audit Logging

Comprehensive activity tracking for compliance and security monitoring:

#### Automatic Logging
Audit middleware automatically logs:
- **POST requests** → CREATE action
- **PUT/PATCH requests** → UPDATE action with old/new values
- **DELETE requests** → DELETE action

#### Manual Logging
Auth events are explicitly logged:
- **LOGIN_SUCCESS**: Successful authentication
- **LOGIN_FAILED**: Failed login attempts (for brute-force detection)
- **LOGOUT**: User-initiated logout

#### Audit Log Data
Each entry captures:
- User ID and username
- Action performed
- Resource type and ID
- Old values (before change)
- New values (after change)
- IP address
- User agent
- Correlation ID (for distributed tracing)
- Timestamp

#### Filtering & Search
The Audit Logs page supports:
- Filter by username
- Filter by action type (CREATE, UPDATE, DELETE, LOGIN_SUCCESS, etc.)
- Filter by resource type
- Date range filtering
- Pagination with configurable page sizes

### Structured Logging

Production-ready logging system:

**Features**
- JSON output in production (`ENVIRONMENT=production`)
- Human-readable output in development
- Log levels: DEBUG, INFO, WARN, ERROR
- Correlation IDs in all log entries
- Request/response logging

**Correlation IDs**
Every request gets a unique `X-Correlation-ID` header:
- Trace requests across microservices
- Group related log entries
- Debug distributed systems
- Included in audit logs

**Example Log Entry** (production):
```json
{
  "level": "info",
  "time": "2024-01-15T10:30:45Z",
  "correlation_id": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/users",
  "status": 201,
  "duration_ms": 45,
  "ip": "192.168.1.100"
}
```

## Theming

The template supports light and dark modes with a Discord-inspired dark theme:

```css
/* Dark mode colors */
--background: #2b2d31
--input-background: #1e1f22
--hover: #383a40
--border: #3f4147

/* Brand colors */
--primary: #8A73F9 (purple)
--secondary: #E2F973 (lime)
```

Toggle is available in the TopNav component with persistence to localStorage.

## Verification & Testing

### Testing Token Refresh

**Method 1: Wait for expiration**
1. Login to the application
2. Wait for access token to expire (default: 24 hours)
3. Make any API call
4. Token should automatically refresh (transparent to user)

**Method 2: Shorten token lifetime** (recommended for testing)
1. Set `JWT_EXPIRY=30s` in backend `.env`
2. Restart backend server
3. Login to application
4. Wait 30 seconds
5. Navigate to any page or make API call
6. Check browser DevTools Network tab → should see successful `/auth/refresh-token` call
7. Check `refresh_tokens` table → old token revoked, new token created

### Testing Rate Limiting

**Test IP-based rate limiting** (auth endpoints):
```bash
# Hit login endpoint rapidly
for i in {1..150}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
done

# After ~100 requests → should get 429 Too Many Requests
```

**Test user-based rate limiting**:
1. Login to application
2. Open browser DevTools Console
3. Run rapid API calls:
```javascript
for(let i = 0; i < 1100; i++) {
  fetch('/api/users');
}
```
4. After ~1000 requests → should get 429 errors

### Testing Audit Logs

**Test automatic logging**:
1. Navigate to Users Management
2. Create a new user → Check Audit Logs page → should see CREATE entry
3. Update the user → Check Audit Logs → should see UPDATE entry with old/new values
4. Delete the user → Check Audit Logs → should see DELETE entry

**Test authentication logging**:
1. Login successfully → Check Audit Logs → should see LOGIN_SUCCESS entry
2. Login with wrong password → Check Audit Logs → should see LOGIN_FAILED entry
3. Logout → Check Audit Logs → should see LOGOUT entry

**Test filtering**:
1. Navigate to Audit Logs page (under Configuration menu)
2. Filter by action type (e.g., only show CREATE actions)
3. Filter by username
4. Filter by resource type
5. Filter by date range

### Verifying Database Tables

After first backend startup, verify tables exist:
```sql
-- Connect to your PostgreSQL database
psql -U postgres -d sass_db

-- List all tables
\dt

-- Should see:
-- users, roles, menus, role_menus, user_menus, rights_access
-- refresh_tokens, audit_logs  <-- New tables

-- Check refresh tokens
SELECT id, user_id, is_revoked, ip_address, created_at
FROM refresh_tokens
ORDER BY created_at DESC
LIMIT 5;

-- Check audit logs
SELECT id, username, action, resource_type, timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 10;
```

### Checking Correlation IDs

**Backend logs** (set `LOG_LEVEL=debug`):
1. Make any API request
2. Check backend console logs
3. Look for `correlation_id` field in log entries
4. Same correlation_id should appear across all logs for that request

**Audit logs**:
1. Make an API request that triggers audit logging (e.g., create user)
2. Check `audit_logs` table
3. Verify `correlation_id` column is populated
4. Match correlation_id between backend logs and audit entry

## Troubleshooting

### Infinite Refresh Loop

**Symptom**: Page continuously refreshes after login

**Causes & Solutions**:
1. **Old cookies from previous version**
   - Solution: Clear browser cookies and re-login
   - Or use incognito window

2. **Backend not migrated**
   - Solution: Restart backend to create `refresh_tokens` table
   - Check logs for migration success

### Login Returns 404

**Symptom**: `POST /api/auth/login` returns 404 Not Found

**Solution**: Check CORS configuration
```env
# Backend .env
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Restart both servers after changing environment variables.

### Audit Logs Not Appearing

**Symptom**: No audit log entries after user actions

**Causes & Solutions**:
1. **Audit logs table not created**
   - Solution: Check backend logs for migration errors
   - Manually verify table exists: `\dt audit_logs` in psql

2. **Menu not seeded**
   - Solution: Check if "Audit Logs" menu exists in database
   - Navigate to `/audit-logs` directly in browser

3. **Permission issue**
   - Solution: Check user role has read permission for Audit Logs menu
   - Root and admin roles should have permission by default

### Rate Limiting Not Working

**Symptom**: Can make unlimited requests without getting 429 errors

**Solution**: Check environment variables
```env
RATE_LIMIT_ENABLED=true  # Must be exactly 'true'
RATE_LIMIT_PER_IP=100
RATE_LIMIT_PER_USER=1000
RATE_LIMIT_WINDOW=1h
```

Restart backend after changes.

### Token Refresh Returns 401

**Symptom**: `/auth/refresh-token` endpoint returns 401

**Causes & Solutions**:
1. **Refresh token expired** (>7 days old)
   - Solution: User must re-login

2. **Refresh token revoked**
   - Solution: User must re-login
   - Check `refresh_tokens` table: `is_revoked = true`

3. **Token not in database**
   - Solution: Clear cookies and re-login
   - Indicates old JWT-based token from previous version

### Database Migration Fails

**Symptom**: Backend crashes on startup with database errors

**Solution**: Check database connection
```bash
# Test PostgreSQL connection
psql -U postgres -d sass_db

# If database doesn't exist
createdb -U postgres sass_db

# Check DB_AUTO_MIGRATE is enabled
# In .env:
DB_AUTO_MIGRATE=true
```

### Correlation IDs Not Appearing in Logs

**Symptom**: `correlation_id` field is empty in logs/audit entries

**Solution**: Check middleware order in `router.go`
- Correlation middleware must be registered before other middleware
- Order should be: Correlation → Rate Limit → Audit → Auth

```go
// Correct order in routes/router.go
router.Use(middleware.CorrelationID())
router.Use(middleware.RateLimitByIP(...))
// ... other middleware
```

## What You Can Build

This template provides a foundation for:

- **SaaS Applications** - Add tenant isolation for multi-tenancy
- **Admin Dashboards** - Dynamic menu system with permissions
- **Content Management Systems** - Extend menu hierarchy for content types
- **Internal Tools** - Complex permission requirements out of the box
- **B2B Applications** - Role-based access for different user types

## Time Savings

| Feature | Estimated Development Time Saved |
|---------|----------------------------------|
| Authentication System | 2-3 days |
| Token Refresh & Rotation | 1-2 days |
| Rate Limiting System | 1-2 days |
| Audit Logging System | 2-3 days |
| Structured Logging | 1 day |
| RBAC Implementation | 3-5 days |
| Admin Interfaces | 5-7 days |
| Audit Logs UI | 1-2 days |
| Data Table with Features | 2-3 days |
| API Structure | 1-2 days |
| **Total** | **~3-4 weeks** |

## Migration Notes

### For Existing Users

If you're upgrading from a previous version without these security features:

#### Backend Changes Required

1. **Update environment variables** in `sass-api/.env`:
   ```env
   REFRESH_TOKEN_EXPIRY=168h
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_PER_IP=100
   RATE_LIMIT_PER_USER=1000
   RATE_LIMIT_WINDOW=1h
   ENVIRONMENT=development
   ```

2. **Install new Go dependencies**:
   ```bash
   cd sass-api
   go get golang.org/x/time/rate
   go get github.com/google/uuid
   go mod tidy
   ```

3. **Restart backend** to run auto-migrations:
   - Creates `refresh_tokens` table
   - Creates `audit_logs` table
   - Seeds "Audit Logs" menu under Configuration

4. **Clear browser cookies** after restart:
   - Old JWT-based refresh tokens are incompatible with new database-backed system
   - Users must re-login to get new tokens

#### Frontend Changes Required

No environment variable changes needed. The axios interceptor automatically handles token refresh.

#### Breaking Changes

**None**. All changes are backward compatible:
- Existing authentication flow works the same
- Existing API endpoints unchanged
- New endpoints are additive

#### Database Migration

Auto-migration creates these tables on first startup:
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  -- ... additional fields
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NULL,
  username VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(100),
  -- ... additional fields
);
```

**No manual SQL needed** - GORM handles everything.

## License

MIT

---

Made by [Aebroyx](https://github.com/aebroyx)

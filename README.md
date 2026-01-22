# My SaaS Kit

A production-ready, full-stack SaaS starter kit with authentication, role-based access control (RBAC), and comprehensive admin interfaces. Built with Go and Next.js 14.

## Features

### Authentication & Security
- **JWT Authentication** with HTTP-only cookies (XSS protection)
- **Access & Refresh Tokens** with 7-day refresh token validity
- **Password Hashing** using bcrypt
- **Protected Routes** on both frontend and backend
- **CORS Configuration** with origin whitelist
- **Graceful Shutdown** with 5-second grace period

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

# Run with hot reload (recommended for development)
air

# Or build manually
go build -o ./tmp/main ./cmd/main.go && ./tmp/main
```

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

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sass_db
DB_SSL_MODE=disable
DB_AUTO_MIGRATE=true

JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

CORS_ALLOWED_ORIGINS=http://localhost:3000

LOG_LEVEL=debug
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
│   │   ├── handlers/           # HTTP request handlers
│   │   ├── services/           # Business logic layer
│   │   ├── middleware/         # JWT authentication
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
│   │   │   └── menus-management/
│   │   ├── components/
│   │   │   ├── modals/         # Modal dialogs
│   │   │   └── ui/             # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client services
│   │   ├── providers/          # React context providers
│   │   ├── store/              # Redux Toolkit store
│   │   └── lib/                # Utilities (Axios config)
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
| GET | `/api/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout and clear cookies |

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

```
┌─────────────┐     POST /auth/login      ┌─────────────┐
│   Frontend  │ ────────────────────────► │   Backend   │
│             │                           │             │
│             │ ◄──────────────────────── │             │
│             │   Set HTTP-only Cookies   │             │
│             │   (access + refresh)      │             │
└─────────────┘                           └─────────────┘
      │                                         │
      │  Subsequent requests include cookies    │
      │ ──────────────────────────────────────► │
      │                                         │
      │    JWT validated in middleware          │
      │ ◄────────────────────────────────────── │
```

1. User submits credentials to `/api/auth/login`
2. Backend validates credentials and generates JWT tokens
3. Tokens stored as HTTP-only cookies (prevents XSS)
4. Frontend middleware (`middleware.ts`) checks for auth cookies
5. Backend middleware validates JWT on protected routes

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
| RBAC Implementation | 3-5 days |
| Admin Interfaces | 5-7 days |
| Data Table with Features | 2-3 days |
| API Structure | 1-2 days |
| **Total** | **~2-3 weeks** |

## License

MIT

---

Made by [Aebroyx](https://github.com/aebroyx)

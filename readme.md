# Customer360 — Unified Customer Management Platform

> A full-stack CRM platform that gives businesses a 360° view of their customers — from subscriptions and support tickets to analytics and audit trails.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Modules](#modules)
- [Role-Based Access Control](#role-based-access-control)
- [Authentication](#authentication)
- [Database Models](#database-models)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Customer360** is a production-ready, full-stack Customer Relationship Management (CRM) platform designed for businesses that need a centralized system to manage customers, subscriptions, support operations, and compliance. It provides an intuitive React-based frontend with a robust Node.js/Express REST API backend, backed by MongoDB.

The platform is built with modularity and scalability in mind — each business domain (customers, subscriptions, tickets, analytics, audit) is encapsulated into its own module, making it easy to extend or integrate with third-party services.

---

## Core Features

| Module | Description |
|---|---|
| 🔐 **Authentication** | Secure JWT-based login with role-aware access control |
| 👥 **Customer Management** | Full CRUD for customer profiles with search, filter, and pagination |
| 📦 **Subscription Management** | Track and manage customer subscription plans and statuses |
| 🎫 **Ticket Management** | End-to-end support ticket lifecycle with priority and assignment |
| 📊 **Analytics Dashboard** | Visual KPIs and trend charts powered by Recharts |
| 🧾 **Audit & Activity Logs** | Immutable audit trail for all system actions and user activity |
| 🛡️ **Role-Based Access Control** | Granular permissions for Admin, Manager, and Agent roles |
| 👤 **User Management** | Admin panel to create, update, and deactivate system users |

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18.x | Runtime environment |
| Express.js | ^5.2.1 | HTTP server and routing |
| MongoDB | ≥ 6.x | Primary database |
| Mongoose | ^9.1.6 | ODM for MongoDB |
| JSON Web Token | ^9.0.3 | Stateless authentication |
| bcryptjs | ^3.0.3 | Password hashing |
| express-validator | ^7.3.1 | Request validation |
| dotenv | ^17.2.4 | Environment configuration |
| nodemon | ^3.1.11 | Development auto-reload |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.0 | UI component library |
| Vite | ^7.2.4 | Build tool and dev server |
| React Router DOM | ^7.13.0 | Client-side routing |
| Axios | ^1.13.5 | HTTP client for API calls |
| Recharts | ^3.7.0 | Data visualization and charts |
| Tailwind CSS | ^4.1.18 | Utility-first CSS framework |

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                  React Frontend                   │
│       (Vite + React Router + Tailwind CSS)        │
│                                                  │
│  Pages: Dashboard · Customers · Subscriptions    │
│         Tickets · Analytics · Audit · Users      │
└─────────────────────┬────────────────────────────┘
                      │  HTTP / REST (Axios)
                      ▼
┌──────────────────────────────────────────────────┐
│              Express.js REST API                  │
│                                                  │
│  Middlewares: Auth · RBAC · Validation · Error   │
│  Routes:  /api/auth · /api/customers             │
│           /api/subscriptions · /api/tickets      │
│           /api/analytics · /api/audit            │
│           /api/users                             │
└─────────────────────┬────────────────────────────┘
                      │  Mongoose ODM
                      ▼
┌──────────────────────────────────────────────────┐
│                   MongoDB                         │
│  Collections: users · customers · subscriptions  │
│               tickets · auditlogs               │
└──────────────────────────────────────────────────┘
```

---

## Project Structure

```
customer360/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── subscriptionController.js
│   │   │   ├── ticketController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── auditController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── rbac.js               # Role-based access
│   │   │   ├── requireAuth.js
│   │   │   ├── requireRole.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Customer.js
│   │   │   ├── Subscription.js
│   │   │   ├── Ticket.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── customers.js
│   │   │   ├── subscriptions.js
│   │   │   ├── tickets.js
│   │   │   ├── analytics.js
│   │   │   └── audit.js
│   │   ├── scripts/                  # Seed / utility scripts
│   │   ├── utils/
│   │   │   └── logActivity.js        # Audit logging helper
│   │   └── index.js                  # App entry point
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/                      # Axios API service modules
    │   ├── assets/
    │   ├── components/
    │   │   └── ShellLayout.jsx       # App shell with sidebar & nav
    │   ├── context/                  # React Context (Auth state)
    │   ├── features/                 # Feature-specific sub-components
    │   ├── images/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CustomerManagement.jsx
    │   │   ├── SubscriptionManagement.jsx
    │   │   ├── TicketManagement.jsx
    │   │   ├── AnalyticsDashboard.jsx
    │   │   ├── AuditLogs.jsx
    │   │   ├── UserManagement.jsx
    │   │   └── AdminPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

Ensure the following are installed on your system before proceeding:

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9 or higher (bundled with Node.js)
- **MongoDB** v6 or higher (local instance or MongoDB Atlas) — [Download](https://www.mongodb.com/try/download/community)
- **Git** — [Download](https://git-scm.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-org/customer360.git
cd customer360
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

### Environment Variables

#### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/customer360
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRY=7d
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port for the Express server | `5000` |
| `MONGODB_URI` | Full MongoDB connection string | `mongodb://localhost:27017/customer360` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | *(required)* |
| `JWT_EXPIRY` | JWT token expiry duration | `7d` |

> ⚠️ **Security:** Never commit your `.env` file to version control. Use a strong, randomly generated value for `JWT_SECRET` in production.

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

### Running the Application

> Open **two separate terminal windows** — one for the backend and one for the frontend.

**Terminal 1 — Start the Backend**

```bash
cd backend
npm run dev
```

The API server will start at: `http://localhost:5000`

**Terminal 2 — Start the Frontend**

```bash
cd frontend
npm run dev
```

The React app will be served at: `http://localhost:5173`

**Production Build (Frontend)**

```bash
cd frontend
npm run build
```

Built assets will be output to `frontend/dist/`.

---

## API Reference

All API routes are prefixed with `/api`. Authentication is required for all routes except `/api/auth/login`.

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `POST` | `/api/auth/logout` | Auth | Invalidate session |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all system users |
| `POST` | `/api/users` | Admin | Create a new user |
| `PUT` | `/api/users/:id` | Admin | Update user details |
| `DELETE` | `/api/users/:id` | Admin | Deactivate a user |

### Customers

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/customers` | Auth | List customers (paginated, filterable) |
| `POST` | `/api/customers` | Auth | Create a new customer |
| `GET` | `/api/customers/:id` | Auth | Get customer by ID |
| `PUT` | `/api/customers/:id` | Auth | Update customer profile |
| `DELETE` | `/api/customers/:id` | Admin | Delete a customer |

### Subscriptions

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/subscriptions` | Auth | List all subscriptions |
| `POST` | `/api/subscriptions` | Auth | Create a new subscription |
| `PUT` | `/api/subscriptions/:id` | Auth | Update subscription status or plan |
| `DELETE` | `/api/subscriptions/:id` | Admin | Remove a subscription |

### Tickets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tickets` | Auth | List tickets (filterable by status, priority) |
| `POST` | `/api/tickets` | Auth | Create a support ticket |
| `GET` | `/api/tickets/:id` | Auth | Get ticket details |
| `PUT` | `/api/tickets/:id` | Auth | Update or resolve a ticket |
| `DELETE` | `/api/tickets/:id` | Admin | Delete a ticket |

### Analytics

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics` | Auth | Fetch aggregated KPI and trend data |

### Audit Logs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/audit` | Admin | Retrieve paginated audit log entries |

---

## Modules

### Module 1 — Authentication & Session Management
Handles user login via email/password, returns a signed JWT, and stores auth state in React Context. All protected routes validate the token via the `auth.js` middleware.

### Module 2 — Customer Management
Full lifecycle management of customer records with support for searching by name/email, filtering by status and segment, and paginated listing for performance at scale.

### Module 3 — Subscription Management
Tracks which plan each customer is on, the subscription status (`active`, `paused`, `cancelled`), billing cycle, and renewal dates. Admins and managers can update plan tiers.

### Module 4 — Ticket Management
Complete help-desk style ticket system with priority levels (`low`, `medium`, `high`, `critical`), status workflows (`open → in-progress → resolved → closed`), and agent assignment.

### Module 5 — Analytics Dashboard
Aggregated business intelligence view with KPI cards (total customers, active subscriptions, open tickets) and trend line charts rendered using Recharts.

### Module 6 — User Management
Admin-only panel to onboard new system users, assign roles, and deactivate accounts. Passwords are hashed using bcryptjs before storage.

### Module 7 — Audit & Activity Logs
Every significant action in the system (record creation, update, deletion, login) is captured in an immutable `AuditLog` collection via the `logActivity` utility, providing a tamper-evident compliance trail.

### Module 8 — UI & Navigation Layer
The `ShellLayout` component provides the persistent sidebar, top navigation bar, and route-based active state for a consistent application shell across all pages.

---

## Role-Based Access Control

Customer360 enforces three user roles with hierarchical permissions:

| Role | Permissions |
|---|---|
| **Admin** | Full access — manage users, delete records, view audit logs |
| **Manager** | Read/write access to customers, subscriptions, and tickets |
| **Agent** | Read/write access to tickets; read-only on customers |

Roles are enforced server-side using the `rbac.js` and `requireRole.js` middlewares applied per route. Frontend UI elements are conditionally rendered based on the authenticated user's role from context.

---

## Authentication

The platform uses **stateless JWT authentication**:

1. User submits credentials to `POST /api/auth/login`
2. Server validates credentials, hashes the password with `bcryptjs`
3. On success, a signed JWT is returned with the user's `id` and `role` in the payload
4. The frontend stores the token and sends it as a `Bearer` token in the `Authorization` header for all subsequent requests
5. The `auth.js` middleware decodes and verifies the token on every protected route

Token expiry is configurable via `JWT_EXPIRY` in the environment (default: `7d`).

---

## Database Models

### User
```
{ name, email, password (hashed), role, createdAt }
```

### Customer
```
{ name, email, phone, company, status, segment, createdAt }
```

### Subscription
```
{ customer (ref), plan, status, billingCycle, startDate, renewalDate }
```

### Ticket
```
{ customer (ref), subject, description, status, priority, assignedTo (ref), createdAt, updatedAt }
```

### AuditLog
```
{ action, performedBy (ref), targetModel, targetId, details, timestamp }
```

---

## Scripts

Utility scripts are located in `backend/src/scripts/`.

```bash
# Seed the database with sample data (if a seed script is present)
cd backend
node src/scripts/seed.js
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against the `main` branch

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

---

## License

This project is licensed under the **ISC License**.  
See the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for modern customer relationship management.
</p>

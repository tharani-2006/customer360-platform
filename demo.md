# Customer360 — Demo Guide

A full-stack CRM platform for managing customers, subscriptions, support tickets, analytics, and audit logs.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React + Vite, React Router, Axios |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB (Mongoose ODM)            |
| Auth      | JWT (role-based: Admin / Agent)   |

---

## Project Structure

```
customer360/
├── backend/
│   └── src/
│       ├── index.js              # Entry point — Express server
│       ├── config/               # DB connection
│       ├── models/               # Mongoose schemas
│       │   ├── User.js
│       │   ├── Customer.js
│       │   ├── Subscription.js
│       │   ├── Ticket.js
│       │   └── AuditLog.js
│       ├── controllers/          # Business logic per module
│       ├── routes/               # REST API routes
│       ├── middlewares/          # Auth, error handler
│       └── utils/                # logActivity helper
└── frontend/
    └── src/
        ├── App.jsx               # Routes & auth guards
        ├── context/AuthContext   # Global auth state
        ├── pages/                # One page per module
        └── api/                  # Axios service calls
```

---

## Running Locally

### 1. Backend

```bash
cd backend
npm install
# Create .env with MONGO_URI and JWT_SECRET
npm run dev        
# Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        
# Starts on http://localhost:5173
```

---

## API Endpoints

| Module        | Base Route              |
|---------------|-------------------------|
| Auth          | `POST /api/auth/login`  |
| Users         | `/api/users`            |
| Customers     | `/api/customers`        |
| Subscriptions | `/api/subscriptions`    |
| Tickets       | `/api/tickets`          |
| Analytics     | `/api/analytics`        |
| Audit Logs    | `/api/audit`            |

---

## Modules & Pages

| Page                    | Route               | Access        |
|-------------------------|---------------------|---------------|
| Login                   | `/login`            | Public        |
| Dashboard               | `/`                 | All users     |
| Customer Management     | `/customers`        | All users     |
| Subscription Management | `/subscriptions`    | All users     |
| Ticket Management       | `/tickets`          | All users     |
| Analytics Dashboard     | `/analytics`        | All users     |
| User Management         | `/admin/users`      | Admin only    |
| Audit Logs              | `/admin/audit`      | Admin only    |

---

## Demo Flow

1. **Login** — Use admin credentials to access all modules.
2. **Dashboard** — See a summary overview with quick navigation cards.
3. **Customers** — Add, search, edit, and delete customer records.
4. **Subscriptions** — Manage plans and link them to customers.
5. **Tickets** — Create and track support tickets by status and priority.
6. **Analytics** — View charts for revenue, ticket trends, and customer growth.
7. **User Management** *(Admin)* — Create agent accounts and assign roles.
8. **Audit Logs** *(Admin)* — Review a full trail of all system actions.

---

## Environment Variables (`.env`)

```
MONGO_URI=mongodb://localhost:27017/customer360
JWT_SECRET=your_secret_key
PORT=5000
```


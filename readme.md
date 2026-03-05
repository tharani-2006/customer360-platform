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

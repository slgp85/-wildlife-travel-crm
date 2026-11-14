# INITIAL.md - Wildlife Travel in CRM Product Definition

> A simple CRM for wildlife travel operators to manage clients, trips and bookings.

---

## PRODUCT

### Name
Wildlife Travel in CRM

### Description
A lightweight CRM that helps wildlife tour operators, safari lodges and travel agents track clients, define trips and manage bookings in one place. Base functionality only.

### Target User
Wildlife tour operators, safari lodges and travel agents.

### Type
- [x] SaaS (Software as a Service)

---

## TECH STACK

- [x] Backend: FastAPI + Python 3.11+
- [x] Frontend: React + Vite + TypeScript
- [x] Database: PostgreSQL + SQLAlchemy
- [x] UI: Tailwind + shadcn/ui
- [ ] Authentication: TBD (deferred; see Module 1)
- [ ] Payments: none

---

## MODULES

### Module 1: Authentication (Placeholder, deferred)

Auth method not chosen yet. For now the API runs without login. Add a `user_id` ownership field later when auth is implemented.

---

### Module 2: Clients

**Models:**
- Client: id, full_name, email, phone, country, status (lead|active|past), interests, notes, created_at

**API Endpoints:**
- GET /api/v1/clients - List (filter by status)
- POST /api/v1/clients - Create
- GET /api/v1/clients/{id} - Detail
- PUT /api/v1/clients/{id} - Update
- DELETE /api/v1/clients/{id} - Delete

**Frontend Pages:**
- /clients - List with status filter
- /clients/new, /clients/:id - Create/Edit form

---

### Module 3: Trips

**Models:**
- Trip: id, name, destination, start_date, end_date, price, capacity, description

**API Endpoints:**
- GET/POST /api/v1/trips
- GET/PUT/DELETE /api/v1/trips/{id}

**Frontend Pages:**
- /trips - List
- /trips/new, /trips/:id - Create/Edit form

---

### Module 4: Bookings

**Models:**
- Booking: id, client_id, trip_id, travelers, status (pending|confirmed|cancelled), total_amount, created_at

**API Endpoints:**
- GET/POST /api/v1/bookings
- GET/PUT/DELETE /api/v1/bookings/{id}

**Frontend Pages:**
- /bookings - List
- /bookings/new, /bookings/:id - Create/Edit form

---

### Module 5: Dashboard

- GET /api/v1/dashboard - Counts: clients, upcoming trips, bookings by status
- /dashboard - Simple stat cards and upcoming trips list

---

## MVP SCOPE

### Must Have (MVP)
- [x] CRUD for Clients, Trips, Bookings
- [x] Link bookings to a client and a trip
- [x] Dashboard with basic counts

### Nice to Have (Post-MVP)
- Authentication and multi-user ownership
- Payments, email notifications, file uploads
- Admin panel, analytics

---

## ACCEPTANCE CRITERIA

- [ ] Clients, trips and bookings can be created, viewed, edited and deleted
- [ ] A booking cannot exceed trip capacity
- [ ] Dashboard shows correct counts
- [ ] All endpoints documented in OpenAPI
- [ ] Basic backend tests pass (`pytest`)
- [ ] Frontend TypeScript strict mode passes

---

## SPECIAL REQUIREMENTS

- [x] Input validation on all endpoints
- [x] SQL injection prevention (SQLAlchemy ORM only)
- [ ] Rate limiting (add with auth)

---

## AGENTS

Keep it lean: DATABASE-AGENT, BACKEND-AGENT and FRONTEND-AGENT only. Skip DEVOPS, TEST and REVIEW unless needed.

---

# READY?

```bash
/generate-prp INITIAL.md
/execute-prp PRPs/wildlife-travel-crm-prp.md
```

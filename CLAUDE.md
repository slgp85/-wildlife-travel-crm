# CLAUDE.md - Wildlife Travel in CRM Project Rules

> Project-specific rules for Claude Code. Keep implementations simple and minimal.

---

## Project Overview

**Description:** Simple CRM for wildlife travel operators (clients, trips, bookings).
**Tech Stack:**
- Backend: FastAPI + Python 3.11+
- Frontend: React + Vite + TypeScript
- Database: PostgreSQL + SQLAlchemy
- Auth: TBD (deferred)
- UI: Tailwind + shadcn/ui

---

## Project Structure

```
backend/
  app/ main.py, config.py, database.py, models/ (client, trip, booking),
       schemas/, routers/, services/
  alembic/, tests/, requirements.txt
frontend/
  src/ components/, pages/, hooks/, services/, types/
skills/  agents/  PRPs/  .claude/commands/
```

---

## Code Standards

- Python: type hints required, docstrings on public functions, async endpoints.
- TypeScript: interfaces for all props and data, NO `any`.
- Prefer the simplest working solution. No extra features, abstractions or dependencies beyond INITIAL.md.

---

## Forbidden

- `print()` → use `logging`
- Hardcoded secrets → use env vars
- `SELECT *`, skipping input validation
- `any` type, `console.log` in production
- Inline styles → use Tailwind/shadcn

---

## Module Rules

- Client status: `lead | active | past`
- Booking status: `pending | confirmed | cancelled`
- Booking `travelers` must not exceed the trip's remaining capacity
- Trip `end_date` must be on or after `start_date`

---

## API Conventions

- Prefix `/api/v1/`, plural nouns
- Status codes: 200, 201, 400, 404, 409 (401 once auth is added)

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wildlife_travel_crm
VITE_API_URL=http://localhost:8000
```

---

## Development Commands

```bash
cd backend && pip install -r requirements.txt && alembic upgrade head && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
ruff check backend/ && pytest backend/tests -v
cd frontend && npm run lint && npm run type-check
```

---

## Commit Format

`feat(module): ...`, `fix(module): ...`, `refactor`, `test`, `docs`

---

## Skills

| Task | Skill |
|------|-------|
| Models | skills/DATABASE.md |
| API | skills/BACKEND.md |
| UI | skills/FRONTEND.md |
| Tests | skills/TESTING.md |

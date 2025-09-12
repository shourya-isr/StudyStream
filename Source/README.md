# StudyStream Backend

This backend service powers StudyStream, an intelligent assignment planner and progress monitor for students.

## Structure
- `controllers/` — REST endpoint handlers
- `services/` — Business logic (assignment, scheduler, telemetry)
- `models/` — ORM models for PostgreSQL tables
- `db/` — Database connection and migration scripts
- `routes/` — Express route definitions
- `tests/` — Unit tests for core logic

## Tech Stack
- Node.js + Express
- PostgreSQL
- ORM: Sequelize (recommended for JS, Prisma also possible)

## Getting Started
1. Install dependencies: `npm install`
2. Configure PostgreSQL connection in `db/config.js`
3. Run migrations: `npm run migrate`
4. Start server: `npm start`

## Services
- **Assignment Service:** CRUD for assignments & tasks
- **Scheduler Service:** Task breakdown, conflict resolution, adaptive replanning
- **Telemetry Service:** Track work sessions, trigger schedule updates

## Conventions
- Every significant change creates a new ScheduleVersion
- Soft deletes for assignments with sessions
- Adaptive strategies: extend_now, add_follow_up, shift_others

See `Instructions/PRFAQ.md` and `Instructions/sched-diag.md` for requirements and workflows.

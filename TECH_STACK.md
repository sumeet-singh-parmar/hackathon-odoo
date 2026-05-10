# Stack

## Frontend
- TypeScript
- React + Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form + Zod

## Backend
- TypeScript (Node.js)
- Express
- Prisma
- Zod
- JWT + bcrypt

## Database
- PostgreSQL 16 (Docker)

## Layout

```
hackathon-odoo/
├── client/
├── server/
├── shared/             # zod schemas + types used by both
├── docker-compose.yml
├── API.md              # endpoint contract
└── README.md
```

## Backend layout

```
server/src/
├── routes/         # http only, validate + call service
├── services/       # business logic
├── middleware/     # auth, errors, cors
├── dtos/           # zod schemas
└── index.ts
server/prisma/
└── schema.prisma
```

## Frontend layout

```
client/src/
├── features/       # feature folders
├── components/ui/  # shadcn
├── lib/api.ts      # single fetch wrapper
└── routes/
```

## Conventions
- Strict TS both sides
- ESLint + Prettier defaults
- `.env` per side, `.env.example` committed
- Trunk-based, both push to `main`, pull before push
- LF line endings (`.gitattributes`)

## Run
```
docker compose up -d
cd server && npm run dev
cd client && npm run dev
```

## DB
```
postgresql://app:dev@localhost:5432/appdb
```

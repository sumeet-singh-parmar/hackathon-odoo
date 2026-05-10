# server

Node + Express + Prisma + Postgres.

## Setup

Prereqs: Node 22, Docker Desktop running.

```
npm install                    # from repo root
docker compose up -d           # from repo root
cd server
cp .env.example .env
npm run prisma:migrate
```

## Run

```
npm run dev
```

Server starts on `http://localhost:4000`.

## Scripts

```
npm run dev               # tsx watch
npm run build             # tsc -> dist/
npm start                 # node dist/index.js
npm run typecheck         # tsc --noEmit
npm run prisma:migrate    # apply schema changes
npm run prisma:generate   # regenerate client (rarely needed manually)
npm run prisma:studio     # GUI for the DB
```

## Endpoints

| Method | Path                | Auth | Body                              |
|--------|---------------------|------|-----------------------------------|
| GET    | /health             | no   | -                                 |
| POST   | /api/auth/register  | no   | `{ email, password, name }`       |
| POST   | /api/auth/login     | no   | `{ email, password }`             |
| GET    | /api/auth/me        | yes  | -                                 |

Auth: send `Authorization: Bearer <token>` for protected routes.

## Folder layout

```
src/
├── index.ts          # boot
├── app.ts            # express setup
├── config/env.ts     # env var validation
├── routes/           # http handlers
├── services/         # business logic
├── middleware/       # auth, validate, error
└── lib/              # prisma, jwt, errors
prisma/
└── schema.prisma     # db schema
```

Request/response schemas live in `@hackathon/shared`.

Layering: routes validate + call services. Services hold the logic and throw `HttpError` subclasses. The error middleware maps those to JSON responses.

## Adding a feature

Example: a `Post` resource.

1. Edit `prisma/schema.prisma`:
   ```prisma
   model Post {
     id        Int      @id @default(autoincrement())
     title     String
     body      String
     authorId  Int
     author    User     @relation(fields: [authorId], references: [id])
     createdAt DateTime @default(now())
   }
   ```
   Add `posts Post[]` to the `User` model.

2. Migrate:
   ```
   npm run prisma:migrate -- --name add_post
   ```

3. Add Zod schemas in `shared/src/post.ts`, then `export * from "./post"` in `shared/src/index.ts`. Both client and server import from `@hackathon/shared`.

4. `src/services/post.service.ts` — uses `prisma.post.*`, throws `NotFound`/`Forbidden` on failures.

5. `src/routes/post.routes.ts`:
   ```ts
   import { Router } from "express";
   import { CreatePostSchema } from "@hackathon/shared";
   import { requireAuth } from "../middleware/auth";
   import { validateBody } from "../middleware/validate";
   import * as postService from "../services/post.service";

   export const postRouter = Router();

   postRouter.post("/", requireAuth, validateBody(CreatePostSchema), async (req, res) => {
     const post = await postService.create(req.userId!, req.body);
     res.status(201).json(post);
   });
   ```

6. Mount in `src/routes/index.ts`:
   ```ts
   import { postRouter } from "./post.routes";
   router.use("/posts", postRouter);
   ```

## Errors

Throw these from services — the error middleware turns them into proper HTTP responses:

```ts
import { BadRequest, Unauthorized, Forbidden, NotFound, Conflict } from "../lib/errors";

throw new NotFound("Post not found");
throw new Forbidden("Not your post");
```

Zod validation errors are also caught automatically and returned as 400 with field details.

## DB access

```
docker exec -it hackathon_pg psql -U app -d appdb
```

Or `npm run prisma:studio` for a browser GUI.

## Notes

- `.env` is gitignored. Each dev makes their own from `.env.example`.
- All commits go to `main`. Pull before push.
- Strict TS — no `any` without a reason.

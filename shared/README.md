# shared

Zod schemas and TS types shared between `client/` and `server/`. Workspace package: `@hackathon/shared`.

## Layout

```
src/
├── index.ts        # barrel — re-exports everything
└── auth.ts         # login/register schemas + AuthUser/AuthResponse types
```

## Adding a new resource

Example: `Post`.

1. `src/post.ts`:
   ```ts
   import { z } from "zod";

   export const CreatePostSchema = z.object({
     title: z.string().min(1).max(200),
     body: z.string().min(1),
   });
   export type CreatePostInput = z.infer<typeof CreatePostSchema>;

   export interface Post {
     id: number;
     title: string;
     body: string;
     authorId: number;
     createdAt: string;
   }
   ```

2. Add `export * from "./post";` to `src/index.ts`.

3. Server imports it: `import { CreatePostSchema } from "@hackathon/shared"`.
4. Client imports the same schema for form validation.

## Rules

- Only put things here that **both** sides need (request/response shapes, public types).
- Server-only schemas (e.g. internal admin filters) stay in `server/src/`.
- Dates over the wire are ISO strings (`string`), not `Date`.

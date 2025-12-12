import {z} from '@hono/zod-openapi'
import {AccountSchema} from './openapi/schemas/account';

export interface Env {
  DB: D1Database;
}

export type Variables = {
  user: z.infer<typeof AccountSchema>
}
import {z} from '@hono/zod-openapi'
import {AccountSchema} from './openapi/schemas/account';

export interface Env {
  michaelmachohi: D1Database;
  MEDIA_BUCKET: R2Bucket;
}

export type Variables = {
  user: z.infer<typeof AccountSchema>
}

export type BucketBindings<E> = {
  [K in keyof E]: E[K] extends R2Bucket ? K : never
}[keyof E]

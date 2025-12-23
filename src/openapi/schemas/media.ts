import { z } from '@hono/zod-openapi';

export const UserMediaSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable().optional(),
  anonymous_id: z.string().nullable().optional(),
  bucket: z.string(),
  bucket_url: z.url(),
  r2_key: z.string(),
  url: z.url(),
  original_name: z.string(),
  mime_type: z.string().openapi({
    example: 'image/png',
  }),

  size_bytes: z.number().int().openapi({
    example: 345678,
  }),

  created_at: z.string().openapi({
    example: '2025-09-23T12:34:56Z',
  }),
}).openapi('UserMedia');

export const CreateUserMediaSchema = UserMediaSchema.omit({
  id: true,
  url: true,
  original_name: true,
  mime_type: true,
  size_bytes: true,
  created_at: true,
}).openapi('Upload Media Schema');
import { z } from 'zod';

export const UserMediaSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable().optional(),
  anonymous_id: z.string().nullable().optional(),
  bucket: z.string(),
  bucket_url: z.url(),
  r2_key: z.string(),
  url: z.url(),
  files: z.any().optional(),
  created_at: z.string()
}).openapi('UserMedia');

export const CreateUserMediaSchema = UserMediaSchema.omit({
  id: true,
  url: true,
  created_at: true,
}).openapi('Upload Media Schema');
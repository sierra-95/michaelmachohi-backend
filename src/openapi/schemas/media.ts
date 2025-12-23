import { z } from 'zod';

export const UserMediaSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid().nullable().optional(),
  anonymous_id: z.uuid().nullable().optional(),
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
}).openapi('Media Schema: POST');

export const GetUserMediaSchema = UserMediaSchema.pick({
  user_id: true,
  anonymous_id: true,
}).openapi('Media Schema: GET');

export const GetUserMediaResponseSchema = UserMediaSchema.omit({
  bucket: true,
  bucket_url: true,
  files: true,
}).extend({
  original_name: z.string(),
  mime_type: z.string(),
  size_bytes: z.number(),

}).openapi('Media Schema: GET Response');

export const DeleteUserMediaSchema = UserMediaSchema.pick({
  id: true,
  bucket: true,
  bucket_url: true,
}).openapi('Media Schema: DELETE');
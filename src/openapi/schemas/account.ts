import { z } from '@hono/zod-openapi';

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.email(),
  password : z.string(),
}).openapi("User");

export const LoginSchema = UserSchema.omit({
  id: true,
  username: true,
}).openapi("Login Schema");

export const AccountSchema = UserSchema.omit({
  password: true,
}).openapi("Account Schema");



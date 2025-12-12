import { OpenAPIHono, z } from '@hono/zod-openapi';
import {Context} from 'hono'
import { SignJWT } from 'jose';
import {eq} from 'drizzle-orm'
//#######################################
import {getDb} from '../db/engine/client';
import {users} from '../db/schema';
import {Env, Variables} from '../types';
import {authMiddleware} from './security';
import {me, login} from '../openapi/account';

const account = new OpenAPIHono<{ Bindings: Env ; Variables: Variables }>()
const SECRET = new TextEncoder().encode('super-secret-key')

function isApiClient(c: Context) {
  const contentType = c.req.header('content-type')?.toLowerCase() || ''
  return contentType.includes('application/x-www-form-urlencoded')
}
account.openapi(login, async (c) => {
  try {
    let body : any
    if (isApiClient(c)) {
      body = await c.req.parseBody()
    }else{
      body = await c.req.json()
    }
    const email = body.email || body.username
    const password = body.password

    if (!email || !password) return c.text('Email and password required', 400);
    
    const db = getDb(c.env);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) return c.text('This email is not associated with an account', 404);
    if (user.password !== password) return c.text('Invalid credentials', 401);

    const token = await new SignJWT({ email: user.email, id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(SECRET)

    return c.json( {
      access_token: token,
      token_type: 'Bearer',
    }, 200)
    
  } catch (err) {
    console.error('Login error:', err)
    return c.text('Internal server error', 500)
  }
})


account.use('*', authMiddleware);

account.openapi(me, async (c) => {
  try {
    const user = c.get('user')
    return c.json(user, 200)
  } catch (err) {
    return c.text('Unauthorized: Invalid token', 401)
  }
})

export default account

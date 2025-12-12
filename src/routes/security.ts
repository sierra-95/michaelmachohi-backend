import { jwtVerify } from 'jose'
import type { Context, Next } from 'hono'
import { z } from '@hono/zod-openapi'
import {AccountSchema} from '../openapi/schemas/account'

const SECRET = new TextEncoder().encode('super-secret-key')

type Account = z.infer<typeof AccountSchema>
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    let token: string | null = null
    
    const authHeader = c.req.header('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
    if (!token) {
      return c.text('Unauthorized: No token provided', 401)
    }
    const { payload } = await jwtVerify(token, SECRET) as {payload: Account}

    c.set('user', {
      id: payload.id,
      email: payload.email,
    })
    await next()
  } catch (err) {
    console.error('JWT verification failed:', err)
    return c.text('Unauthorized: Invalid token', 401)
  }
}

import { createRoute, z } from "@hono/zod-openapi";
import { AccountSchema, LoginSchema } from './schemas/account';

export const login = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Account'],
  request: {
    body:{
      required: false,
      content: {
        'application/json': {
          schema: LoginSchema
        },
        'application/x-www-form-urlencoded': {
          schema: z.object({})
        }
      },
    }
  },
  responses: {
    200:{
      description : "Login successful, returns access token",
      content: {
        "application/json":{
          schema : z.object({
            access_token: z.string(),
            token_type: z.string(),
          })
        }
      }
    },
    400: {
      description: 'Bad request: Email and password required',
      content: {
        'text/plain': {
          schema: z.string()
        }
      }
    },
    401: {
      description: 'Invalid credentials',
      content: {
        'text/plain': {
          schema: z.string()
        }
      }
    },
    404: {
      description: 'This email is not associated with an account.',
      content: {
        'text/plain': {
          schema: z.string()
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'text/plain': {
          schema: z.string()
        }
      }
    }
  }
})

export const me = createRoute({
  method: 'get',
  path: '/me',
  tags: ['Account'],
  security: [{ OAuth2: [] }],
  responses: {
    200: {
      description: 'Account information',
      content: {
        "application/json": {
          schema: AccountSchema
        }
      },
    },
    401: {
      description: 'Unauthorized: Invalid token',
      content: {
        'text/plain': {
          schema: z.string()
        }
      }
    }
  },
})

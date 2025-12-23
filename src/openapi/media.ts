import { createRoute, z } from "@hono/zod-openapi";
import { CreateUserMediaSchema, DeleteUserMediaSchema } from './schemas/media';

export const MediaUpload = createRoute({
  method: 'post',
  path: '/upload',
  tags: ['Media'],
  request: {
    body:{
      required: true,
      content: {
        'multipart/form-data': {
          schema: CreateUserMediaSchema
        }
      },
    }
  },
  responses: {
        201:{
            description : "Upload successful",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        400:{
            description : "Bad Request",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        401:{
            description : "User Information unavailable",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        403:{
            description : "Access to bucket forbidden",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        500:{
            description : "Internal Server Error",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
    }
});

export const MediaDelete = createRoute({
  method: 'delete',
  path: '/delete',
  tags: ['Media'],
  request: {
    body:{
      required: true,
      content: {
        'application/json': {
          schema: DeleteUserMediaSchema
        }
      },
    }
  },
  responses: {
        200:{
            description : "Delete successful",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        403:{
            description : "Access to bucket forbidden",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        404:{
            description : "Media not found",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        500:{
            description : "Internal Server Error",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
    }
});
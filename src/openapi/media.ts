import { createRoute, z } from "@hono/zod-openapi";
import { CreateUserMediaSchema, DeleteUserMediaSchema, GetUserMediaSchema, GetUserMediaResponseSchema } from './schemas/media';

export const MediaGet = createRoute({
  method: 'get',
  path: '/get',
  tags: ['Media'],
  request: {
    query: GetUserMediaSchema
  },
  responses: {
        200: {
            description: 'Media fetched successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        Audio: z.array(GetUserMediaResponseSchema),
                        Documents: z.array(GetUserMediaResponseSchema),
                        Images: z.array(GetUserMediaResponseSchema),
                        Videos: z.array(GetUserMediaResponseSchema),
                    })
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
            description : "Unauthorized: Missing user identification",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        404:{
            description : "No media found for the provided identifier",
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
                'application/json': {
                    schema: z.array(
                        z.object({
                            id: z.uuid().optional(),      
                            user_id: z.string().nullable().optional(),
                            anonymous_id: z.string().nullable().optional(),
                            r2_key: z.string().optional(),
                            url: z.url().optional(),
                            original_name: z.string(),
                            mime_type: z.string(),
                            size_bytes: z.number(),
                            code: z.union([z.literal(201), z.literal(500)]),
                        })
                    )
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
            description : "Unauthorized: Missing user identification",
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
                'application/json': {
                    schema: z.array(
                        z.object({
                            id: z.uuid(),
                            status: z.string(),
                            code: z.number()
                        })
                    )
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
            description : "No media found for the provided identifier",
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
import { createRoute, z } from "@hono/zod-openapi";
import { CreateUserMediaSchema } from './schemas/media';

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
            description : "Upload failed",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
        500:{
            description : "Upload failed",
            content: {
                'text/plain': {
                    schema: z.string()
                }
            }
        },
    }
});
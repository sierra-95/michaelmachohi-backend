import { OpenAPIHono, z } from '@hono/zod-openapi';
import { Context } from 'hono';
import {Env, Variables, BucketBindings} from '../types';
//#######################################
import {getDb} from '../db/engine/client';
import {userMedia} from '../db/schema';
import {MediaUpload} from '../openapi/media';
import { CreateUserMediaSchema } from '../openapi/schemas/media';

const Media = new OpenAPIHono<{ Bindings: Env ; Variables: Variables }>()

Media.openapi(MediaUpload, async (c: Context) => {
  try {
    const contentType = c.req.header('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return c.text('Expected multipart/form-data', 400)
    }

    const body = await c.req.parseBody({ all: true })

    const files = body.files as File[] | File | undefined
    
    const fileArray = (Array.isArray(files) ? files : [files]).filter(Boolean) as File[]
    if (fileArray.length === 0) {
      return c.text('No files provided', 400)
    }

    const metadata = CreateUserMediaSchema.parse({
        user_id: body.user_id,
        anonymous_id: body.anonymous_id,
        bucket: body.bucket,
        bucket_url: body.bucket_url,
        r2_key: body.r2_key,
    })

    if (!metadata.bucket || !metadata.bucket_url || !metadata.r2_key) {
      return c.text('Missing required upload fields', 400)
    }

    if (!metadata.user_id && !metadata.anonymous_id) {
        return c.text('Either user_id or anonymous_id must be provided', 401)
    }

    const allowedBuckets = Object.keys(c.env).filter((k) =>
      k.endsWith('_BUCKET')
    ) as BucketBindings<Env>[];


    if (!allowedBuckets.includes(metadata.bucket as any)) {
        return c.text('Invalid bucket', 403)
    }

    const r2 = c.env[metadata.bucket as BucketBindings<Env>]
    const object_url = metadata.bucket_url + '/' + metadata.r2_key


    const uploadResults = await Promise.all(
      fileArray.map(async (file) => {
        const uuid = crypto.randomUUID()
        await r2.put(object_url, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        })

        return {
          id: uuid,
          user_id: metadata.user_id || null,
          anonymous_id: metadata.anonymous_id || null,
          bucket: metadata.bucket,
          bucket_url: metadata.bucket_url,
          r2_key: metadata.r2_key,
          url: object_url,
          original_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        }
      })
    )

    const db = getDb(c.env);

    await db.insert(userMedia).values(
        uploadResults.map((f) => ({
            id: f.id,
            user_id: f.user_id || null,
            anonymous_id: f.anonymous_id || null,
            r2_key: f.r2_key,
            url: f.url,
            original_name: f.original_name,
            mime_type: f.mime_type,
            size_bytes: f.size_bytes,
        }))
    );

    return c.text('Upload successful', 201)

  } catch (err) {
    console.error('Upload error:', err)
    return c.text('Upload failed', 500)
  }
})

export default Media;
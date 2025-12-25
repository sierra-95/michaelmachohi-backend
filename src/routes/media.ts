import { OpenAPIHono, z } from '@hono/zod-openapi';
import { Context } from 'hono';
import {Env, Variables, BucketBindings} from '../types';
import {eq} from 'drizzle-orm'
//#######################################
import {getDb} from '../db/engine/client';
import {userMedia} from '../db/schema';
import {MediaUpload, MediaDelete, MediaGet} from '../openapi/media';
import { CreateUserMediaSchema, DeleteUserMediaSchema, GetUserMediaSchema, GetUserMediaResponseSchema } from '../openapi/schemas/media';

const Media = new OpenAPIHono<{ Bindings: Env ; Variables: Variables }>()


Media.openapi(MediaGet, async (c: Context) => {
  try {
    const query = c.req.query();

    const metadata = GetUserMediaSchema.parse({
      user_id: query.user_id,
      anonymous_id: query.anonymous_id,
    });

    if (metadata.user_id && metadata.anonymous_id) {
      return c.text('Only one unique id is required', 400);
    }

    if (!metadata.user_id && !metadata.anonymous_id) {
      return c.text('user_id or anonymous_id is required', 401);
    }

    const db = getDb(c.env);

    let media;
    if (metadata.user_id) {
      media = await db
        .select()
        .from(userMedia)
        .where(eq(userMedia.user_id, metadata.user_id));
    } else {
      const anonymousId = metadata.anonymous_id as string;
      media = await db
        .select()
        .from(userMedia)
        .where(eq(userMedia.anonymous_id, anonymousId));
    }

    if (media.length === 0) {
      return c.text('No media found for the provided identifier', 404);
    }

    const result = {
      Audio: [] as typeof media,
      Documents: [] as typeof media,
      Images: [] as typeof media,
      Videos: [] as typeof media,
    };

    for (const item of media) {
      const ext = item.url.split('.').pop()?.toLowerCase();

      if (!ext) continue;

      if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'webm'].includes(ext)) {
        result.Audio.push(item);
        continue;
      }

      if (['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm'].includes(ext)) {
        result.Videos.push(item);
        continue;
      }

      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'avif'].includes(ext)) {
        result.Images.push(item);
        continue;
      }

      if (ext === 'pdf') {
        result.Documents.push(item);
        continue;
      }
    }

    return c.json(result, 200);

  } catch (err) {
    console.error('Get media error:', err);
    return c.text('Failed to fetch media', 500);
  }
});

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

    const r2 = c.env[metadata.bucket as BucketBindings<Env>];

    const uploadResults = await Promise.all(
      fileArray.map(async (file) => {
        try {
          const uuid = crypto.randomUUID();
          const uuid_2 = crypto.randomUUID();

          let extension = '';
          switch (file.type) {
            case 'image/png':
              extension = '.png';
              break;
            case 'image/jpeg':
              extension = '.jpg';
              break;
            case 'audio/mpeg':
              extension = '.mp3';
              break;
            case 'video/mp4':
              extension = '.mp4';
              break;
            case 'application/pdf':
              extension = '.pdf';
              break;
            default:
              extension = '.' + (file.name.split('.').pop() || 'bin');
          }

          const r2_key = `${metadata.r2_key}/${uuid}-${uuid_2}${extension}`;
          await r2.put(r2_key, file.stream(), {
            httpMetadata: {
              contentType: file.type,
            },
          })

          return {
            id: uuid,
            user_id: metadata.user_id || null,
            anonymous_id: metadata.anonymous_id || null,
            r2_key: r2_key,
            url: metadata.bucket_url + '/' + r2_key,
            original_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
            code: 201 as const,
          }
        } catch (err) {
          return {
            original_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
            code: 500 as const,
          }
        }
      })
    );

    const db = getDb(c.env);
    const now = new Date().toISOString();

    type UserMediaItem = z.infer<typeof GetUserMediaResponseSchema>;
    const normalizedUploads = uploadResults.map(f => ({
      ...f,
      user_id: f.user_id ?? null,
      anonymous_id: f.anonymous_id ?? null,
    }));

    const successfulUploads = normalizedUploads.filter(
      (f): f is Required<Pick<UserMediaItem, 'id' | 'url' | 'r2_key' | 'original_name' | 'mime_type' | 'size_bytes' | 'user_id' | 'anonymous_id'>> & { code: 201 } =>
        f.code === 201
    );

    if (successfulUploads.length === 0) {
      return c.text('All uploads failed', 500)
    }else{
      await db.insert(userMedia).values(
        successfulUploads.map((f) => ({
          id: f.id,
          user_id: f.user_id || null,
          anonymous_id: f.anonymous_id || null,
          r2_key: f.r2_key,
          url: f.url,
          original_name: f.original_name,
          mime_type: f.mime_type,
          size_bytes: f.size_bytes,
          created_at: now,
        }))
      );
    }

    return c.json(uploadResults, 201)

  } catch (err) {
    console.error('Upload error:', err)
    return c.text('Upload failed', 500)
  }
});

Media.openapi(MediaDelete, async (c: Context) => {
  try {
    const body = await c.req.json();

    const metadata = DeleteUserMediaSchema.parse({
      id: body.id,
      bucket: body.bucket,
    })

    const db = getDb(c.env);

    const allowedBuckets = Object.keys(c.env).filter((k) =>
      k.endsWith('_BUCKET')
    ) as BucketBindings<Env>[];


    if (!allowedBuckets.includes(metadata.bucket as any)) {
      return c.text('Invalid bucket', 403)
    }

    const r2 = c.env[metadata.bucket as BucketBindings<Env>];
    const results = [];

    for (const id of metadata.id) {
      const media = await db
        .select()
        .from(userMedia)
        .where(eq(userMedia.id, id))
        .get();

      if (!media) {
        results.push({ id, status: 'No media found for the provided identifier', code: 404 });
        continue;
      }
      await r2.delete(media.r2_key);
      await db.delete(userMedia).where(eq(userMedia.id, id));

      results.push({ id, status: 'Deleted', code: 200 });
    }
    return c.json(results, 200);

  } catch (err) {
    console.error('Delete error:', err);
    return c.text('Delete failed', 500);
  }
});

export default Media;
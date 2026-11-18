import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    key?: string[];
  }>;
}

export const GET = async (req: NextRequest, context: RouteContext) => {
  try {
    const { key } = await context.params;

    if (!key || key.length === 0) {
      return new NextResponse('Asset key is required', { status: 400 });
    }

    const normalizedKey = key.join('/');

    // 防範路徑穿越攻擊 (Path Traversal Protection)
    if (normalizedKey.includes('..') || normalizedKey.startsWith('/') || normalizedKey.includes('\\')) {
      return new NextResponse('Invalid asset key', { status: 400 });
    }

    const { env } = getCloudflareContext();
    if (!env?.BUCKET) {
      return new NextResponse('R2 Bucket not configured', { status: 503 });
    }

    const r2Object = await env.BUCKET.get(normalizedKey);
    if (!r2Object) {
      return new NextResponse('Asset not found', { status: 404 });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', r2Object.httpMetadata?.contentType || 'application/octet-stream');
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');

    if (r2Object.httpEtag) {
      responseHeaders.set('ETag', r2Object.httpEtag);

      const clientIfNoneMatch = req.headers.get('if-none-match');
      if (clientIfNoneMatch === r2Object.httpEtag) {
        return new NextResponse(null, { status: 304, headers: responseHeaders });
      }
    }

    if (r2Object.size !== undefined) {
      responseHeaders.set('Content-Length', r2Object.size.toString());
    }

    return new Response(r2Object.body as ReadableStream, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[R2 Asset Route Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { requireAuth } from '@/services/server/authHelper';
import { apiSuccess, handleApiError, apiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const POST = async (req: NextRequest) => {
  try {
    await requireAuth(req);

    const contentType = req.headers.get('content-type') || '';

    // 支援 multipart/form-data 上傳
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return apiError('VALIDATION_FAILED', '未提供欲上傳之圖片檔案');
      }

      const fileExtension = file.name.split('.').pop() || 'png';
      const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

      try {
        const { env } = getCloudflareContext();
        if (env && env.BUCKET) {
          const arrayBuffer = await file.arrayBuffer();
          await env.BUCKET.put(key, arrayBuffer, {
            httpMetadata: { contentType: file.type },
          });

          const publicUrl = `/api/v1/assets/${key}`;
          return apiSuccess({ url: publicUrl, key }, undefined, { status: 201 });
        }
      } catch (cfErr) {
        console.warn('[R2 Upload] 未能寫入 Cloudflare R2，使用本地 Data URL 退避:', cfErr);
      }

      // 本機或離線時轉為 Base64 Data URL
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      return apiSuccess({ url: dataUrl, key, fallback: true }, undefined, { status: 201 });
    }

    // 支援 JSON 帶入 base64
    const body = await req.json();
    if (!body.imageUrl && !body.data) {
      return apiError('VALIDATION_FAILED', '請提供 imageUrl 或 base64 data');
    }

    return apiSuccess({ url: body.imageUrl || body.data }, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};

import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { apiSuccess, handleApiError, apiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const POST = async (req: NextRequest) => {
  try {
    const contentType = req.headers.get('content-type') || '';

    // 處理 multipart/form-data 上傳
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

          // 返回 R2 託管 URL 或對應公開存取路徑
          const publicUrl = `/api/v1/assets/${key}`;
          return apiSuccess({ url: publicUrl, key }, undefined, { status: 201 });
        }
      } catch (cfErr) {
        console.warn('[R2 Upload] 無法寫入 Cloudflare R2，使用本地/記憶體備用回退:', cfErr);
      }

      // 本機或離線備用：轉為 Base64 Data URL 保證前端不中斷
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      return apiSuccess({ url: dataUrl, key, fallback: true }, undefined, { status: 201 });
    }

    // 處理 JSON 格式包含 base64 字串的上傳
    const body = await req.json();
    if (!body.imageUrl && !body.data) {
      return apiError('VALIDATION_FAILED', '請提供 imageUrl 或 base64 data');
    }

    return apiSuccess({ url: body.imageUrl || body.data }, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};

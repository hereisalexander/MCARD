import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { requireAuth } from '@/services/server/authHelper';
import { apiSuccess, handleApiError, apiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB 限制
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

interface ExtractedImageData {
  buffer: ArrayBuffer;
  contentType: string;
  extension: string;
}

const parseDataUrl = (dataUrl: string): ExtractedImageData | null => {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) {
    return null;
  }

  const mimeType = matches[1].toLowerCase();
  const base64Data = matches[2];
  const nodeBuffer = Buffer.from(base64Data, 'base64');
  const arrayBuffer = nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength
  );

  const extension = MIME_TO_EXTENSION[mimeType] || 'png';
  return {
    buffer: arrayBuffer,
    contentType: mimeType,
    extension,
  };
};

export const POST = async (req: NextRequest) => {
  try {
    await requireAuth(req);

    const requestContentType = req.headers.get('content-type') || '';
    let imageData: ExtractedImageData | null = null;

    // 處理 multipart/form-data 上傳
    if (requestContentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return apiError('VALIDATION_FAILED', '未提供欲上傳之圖片檔案', null, 400);
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return apiError('VALIDATION_FAILED', '檔案大小不可超過 10MB', null, 400);
      }

      const fileMimeType = (file.type || 'image/png').toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(fileMimeType)) {
        return apiError('VALIDATION_FAILED', `不支援的檔案格式: ${fileMimeType}`, null, 400);
      }

      const detectedExtension =
        MIME_TO_EXTENSION[fileMimeType] || file.name.split('.').pop()?.toLowerCase() || 'png';
      const arrayBuffer = await file.arrayBuffer();

      imageData = {
        buffer: arrayBuffer,
        contentType: fileMimeType,
        extension: detectedExtension,
      };
    } else {
      // 處理 JSON 格式 (支援 base64 或 data URL)
      const body = await req.json();
      const rawData = body?.data || body?.imageUrl || body?.imageBase64;

      if (!rawData || typeof rawData !== 'string') {
        return apiError('VALIDATION_FAILED', '請提供有效的圖片檔案或 Base64 數據', null, 400);
      }

      // 如果已經是外部合法的 HTTP/HTTPS 網址，無需重新上傳至 R2
      if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
        return apiSuccess({ url: rawData, fallback: false }, undefined, { status: 200 });
      }

      // 若為 Data URL 或裸 Base64
      if (rawData.startsWith('data:')) {
        imageData = parseDataUrl(rawData);
      } else {
        // 裸 Base64 預設為 image/jpeg
        const nodeBuffer = Buffer.from(rawData, 'base64');
        imageData = {
          buffer: nodeBuffer.buffer.slice(
            nodeBuffer.byteOffset,
            nodeBuffer.byteOffset + nodeBuffer.byteLength
          ),
          contentType: 'image/jpeg',
          extension: 'jpg',
        };
      }

      if (!imageData) {
        return apiError('VALIDATION_FAILED', '無效的 Base64 圖片編碼格式', null, 400);
      }

      if (imageData.buffer.byteLength > MAX_FILE_SIZE_BYTES) {
        return apiError('VALIDATION_FAILED', 'Base64 圖片解碼後大小超過 10MB 限制', null, 400);
      }

      if (!ALLOWED_MIME_TYPES.has(imageData.contentType)) {
        return apiError('VALIDATION_FAILED', `不支援的圖片格式: ${imageData.contentType}`, null, 400);
      }
    }

    const uniqueId = crypto.randomUUID();
    const storageKey = `uploads/${Date.now()}-${uniqueId}.${imageData.extension}`;

    // 嘗試持久化寫入 Cloudflare R2
    try {
      const { env } = getCloudflareContext();
      if (env?.BUCKET) {
        await env.BUCKET.put(storageKey, imageData.buffer, {
          httpMetadata: {
            contentType: imageData.contentType,
            cacheControl: 'public, max-age=31536000, immutable',
          },
        });

        const publicUrl = `/api/v1/assets/${storageKey}`;
        return apiSuccess(
          {
            url: publicUrl,
            key: storageKey,
            size: imageData.buffer.byteLength,
            contentType: imageData.contentType,
            fallback: false,
          },
          undefined,
          { status: 201 }
        );
      }
    } catch (cloudflareError) {
      console.warn('[R2 Upload Warning] 寫入 Cloudflare R2 失敗，切換退避機制:', cloudflareError);
    }

    // 本機離線開發退避機制
    const fallbackBase64 = Buffer.from(imageData.buffer).toString('base64');
    const fallbackDataUrl = `data:${imageData.contentType};base64,${fallbackBase64}`;

    return apiSuccess(
      {
        url: fallbackDataUrl,
        key: storageKey,
        size: imageData.buffer.byteLength,
        contentType: imageData.contentType,
        fallback: true,
      },
      undefined,
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
};

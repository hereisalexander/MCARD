import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

export const apiSuccess = <T>(data: T, meta?: Record<string, unknown>, options?: ApiResponseOptions) => {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    {
      status: options?.status ?? 200,
      headers: options?.headers,
    }
  );
};

export const apiError = (
  code: ApiErrorCode,
  message: string,
  details?: unknown,
  status: number = 400
) => {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );
};

export const handleApiError = (error: unknown) => {
  if (error instanceof ZodError) {
    return apiError(
      'VALIDATION_FAILED',
      '請求參數格式不正確，請檢查輸入內容',
      error.issues.map((issue) => ({
        field: issue.path.join('.'),
        issue: issue.message,
      })),
      400
    );
  }

  const errMessage = error instanceof Error ? error.message : '伺服器內部異常';
  console.error('[API Route Handler Error]:', error);

  return apiError('INTERNAL_SERVER_ERROR', errMessage, undefined, 500);
};

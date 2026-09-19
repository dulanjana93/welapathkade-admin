import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api/errors';
import { backendFetch } from '@/lib/api/backend';

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const segments = path ?? [];
  const targetPath = `/${segments.join('/')}`;
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  let body: unknown = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const text = await request.text();
    if (text) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
      }
    }
  }

  try {
    const data = await backendFetch<unknown>(targetPath, {
      method: request.method,
      body,
      query,
    });
    return NextResponse.json(data ?? null);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          message: error.message,
          ...(typeof error.body === 'object' && error.body && !Array.isArray(error.body)
            ? (error.body as object)
            : {}),
        },
        { status: error.status || 500 },
      );
    }
    return NextResponse.json({ message: 'Network error' }, { status: 502 });
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;

import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { checkGatewayQuota, readGatewayBody, requireFirebaseUser, type GatewayRequest, type GatewayResponse } from './_geminiAuth';

const allowedModelRequest = /^\/v1(?:alpha|beta)?\/models\/[A-Za-z0-9._-]+:(generateContent|streamGenerateContent|countTokens|embedContent)$/;

export default async function handler(req: GatewayRequest, res: GatewayResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  const uid = await requireFirebaseUser(req, res);
  if (!uid || !checkGatewayQuota(uid, res)) return;

  const configuredKey = process.env.GEMINI_API_KEY;
  if (!configuredKey) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Language service is not configured' }));
    return;
  }
  // The browser may select an allowed model, but never a target host or URL.
  const parsed = new URL(req.url || '/', 'http://localhost');
  const requestedPath = parsed.searchParams.get('path') || '';
  let target: URL;
  try {
    target = new URL(requestedPath, 'https://generativelanguage.googleapis.com');
    if (target.origin !== 'https://generativelanguage.googleapis.com' ||
        !allowedModelRequest.test(target.pathname) ||
        [...target.searchParams.keys()].some(key => key !== 'alt') ||
        (target.searchParams.has('alt') && target.searchParams.get('alt') !== 'sse')) {
      throw new Error('Unsupported request');
    }
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Unsupported language service request' }));
    return;
  }
  try {
    const body = await readGatewayBody(req);
    const upstream = await fetch(target.toString(), {
      method: 'POST',
      headers: {
        'x-goog-api-key': configuredKey,
        'content-type': 'application/json',
        accept: req.headers.accept || 'application/json',
      },
      body,
      signal: AbortSignal.timeout(60000),
    });
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    // Stream audio, image and SSE responses without buffering long base64 bodies.
    if (upstream.body) {
      await pipeline(Readable.fromWeb(upstream.body as any), res);
    } else {
      res.end();
    }
  } catch (error: any) {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    res.statusCode = error?.message === 'REQUEST_TOO_LARGE' ? 413 : 502;
    res.end(JSON.stringify({ error: res.statusCode === 413 ? 'Request too large' : 'Language service unavailable' }));
  }
}

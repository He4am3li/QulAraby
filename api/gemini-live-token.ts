import { GoogleGenAI } from '@google/genai';
import { checkGatewayQuota, requireFirebaseUser, type GatewayRequest, type GatewayResponse } from './_geminiAuth.js';

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
  if (!uid || !checkGatewayQuota(uid + ':live', res, 12)) return;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Live language service is not configured' }));
    return;
  }
  try {
    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion: 'v1alpha' } });
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        newSessionExpireTime: new Date(Date.now() + 55_000).toISOString(),
        expireTime: new Date(Date.now() + 30 * 60_000).toISOString(),
      },
    });
    if (!token.name?.startsWith('auth_tokens/')) throw new Error('Invalid Live token');
    res.statusCode = 200;
    res.end(JSON.stringify({ token: token.name }));
  } catch {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'Could not start a live session' }));
  }
}

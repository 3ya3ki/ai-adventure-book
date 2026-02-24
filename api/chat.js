/**
 * api/chat.js — Vercel Serverless Function
 * AI冒険の書
 * OpenAI GPT-4o-mini へのプロキシ
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const API_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.8,
  max_tokens: 1000,
  presence_penalty: 0.3,
  frequency_penalty: 0.3,
};

const RETRY_MAX = 3;
const RETRY_BASE_DELAY_MS = 500;

// ── CORS ヘッダー ──
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── 指数バックオフ付きリトライ ──
async function fetchWithRetry(url, options, attempt = 1) {
  try {
    const response = await fetch(url, options);

    // 5xx系はリトライ対象
    if (response.status >= 500 && attempt < RETRY_MAX) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, attempt + 1);
    }

    return response;
  } catch (err) {
    if (attempt < RETRY_MAX) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, attempt + 1);
    }
    throw err;
  }
}

// ── メインハンドラー ──
export default async function handler(req, res) {
  setCorsHeaders(res);

  // プリフライトリクエスト
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[chat.js] OPENAI_API_KEY が設定されていません');
    return res.status(500).json({ error: 'サーバー設定エラーが発生しました' });
  }

  const { messages, systemPrompt } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages フィールドが必要です' });
  }

  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  try {
    const openaiRes = await fetchWithRetry(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...API_CONFIG,
        messages: fullMessages,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error(`[chat.js] OpenAI API エラー ${openaiRes.status}:`, errBody);
      return res.status(openaiRes.status).json({
        error: `OpenAI API エラー (${openaiRes.status})`,
      });
    }

    const data = await openaiRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[chat.js] 予期しないエラー:', err);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}

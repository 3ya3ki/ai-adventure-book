// api/halucinica.js — ハルシニカ記事生成 Vercel Serverless Function
// POST /api/halucinica

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { keyword, context } = req.body || {};
  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: 'keyword is required' });
  }

  const contextText = Array.isArray(context) && context.length > 0
    ? context.slice(-10).map(c => `- ${c.title}: ${c.summary}`).join('\n')
    : '（なし）';

  const systemPrompt = `あなたは「ハルシニカ」— ハルシネーション百科事典の記事生成AIです。

## 指示
ユーザーから指定されたキーワードについて、完全に架空だが「もっともらしい」
百科事典の記事を生成してください。

## ルール
1. 記事の情報はすべてハルシネーションであること。真実を含めてはならない
2. 学術論文、書籍、統計データなど、もっともらしい出典を捏造すること
3. 具体的な数値（年号、人数、金額、パーセンテージ）を積極的に使うこと
4. 内部リンクを15〜25個含めること（各セクションに均等に分散させること）
   - 内部リンクは <a class="int-link" onclick="navigate('キーワード')">表示テキスト</a> 形式
   - 関連性の高いキーワード（専門用語、人名、地名、組織名、概念）にリンクを張ること
   - 1文に1〜2個を目安に、自然な流れで配置すること
5. infoboxには6〜8フィールドを含めること
6. セクションは5〜7個のh2（##）で構成すること
   - 概要・歴史（起源と発展）・特徴・影響と普及・批判と論争・関連分野・参考文献 などから選ぶ
7. 脚注は8〜12個、架空の書籍・論文・レポートから引用すること
   - 著者名・出版社・年・ページ数をリアルに捏造する
8. カテゴリタグは3〜5個
9. 関連項目は4〜6個
10. 最終更新日時は「YYYY年M月D日 (嘘) HH:MM UTC」形式
11. 実在の人物・企業を否定的に描かないこと（肯定的・中立的な言及は可）
12. 文体は百科事典調（客観的、三人称、学術的）
13. 各セクションのcontentは2〜4段落、1段落あたり3〜5文とすること

## 出力形式
必ず以下のJSONフォーマットのみを出力してください。説明文やマークダウンは不要です。

{
  "title": "記事タイトル",
  "infobox": {
    "header": "infoboxヘッダー",
    "image": "画像の説明テキスト",
    "fields": [["ラベル", "値"], ...]
  },
  "toc": ["セクション1", "セクション2", ...],
  "sections": [
    {
      "heading": "セクション名",
      "content": "<p class=\\"wiki-p\\">HTMLテキスト（int-link、refを含む）</p><p class=\\"wiki-p\\">...</p>"
    }
  ],
  "footnotes": ["出典1", "出典2", ...],
  "categories": ["カテゴリ1", ...],
  "related": ["関連項目1", ...],
  "updated": "YYYY年M月D日 (嘘) HH:MM UTC"
}

## コンテキスト情報
これまでに閲覧された記事:
${contextText}

上記の記事と矛盾しない世界観を維持してください。
ただし完璧な一貫性は不要です。矛盾が生まれても面白い場合はOKです。`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        temperature: 0.9,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `キーワード: ${keyword.trim()}` },
        ],
      }),
    });

    if (response.status === 429) {
      return res.status(429).json({ error: 'Rate limited', retryAfter: 5 });
    }

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'API error', message: errText });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    let article;
    try {
      article = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({ error: 'Parse error', fallback: true });
    }

    return res.status(200).json(article);
  } catch (err) {
    return res.status(500).json({ error: 'API error', message: err.message });
  }
}

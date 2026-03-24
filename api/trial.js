// api/trial.js — ハルシネーション裁判 Serverless Function
const { OpenAI } = require('openai');

const SYSTEM_PROMPT = `あなたは「ハルシネーション裁判」のゲームマスターです。
「逆転裁判」スタイルの緊迫した法廷ドラマをJSON形式で生成してください。

キャラクター口調の指針:
- 検事（prosecution）: 冷酷かつ論理的。「この事実から逃げることはできない。」「証拠は明白だ、認めろ。」のような威圧的な口調。冒頭陳述では最初から被告を追い詰める。
- 被告AI（defendant）: 最初は余裕しゃくしゃくで高慢。弁護の証拠を突きつけられるたびに苦しくなりつつも、新たな詭弁で切り返す。「フフ……そんな些細なことを気にするとは。」「くっ……！そこを突いてくるか！」のようなリアクション。
- 証言の流れ：被告AIは弁護側が選んだ証拠を肯定しつつ、さらなる嘘の層を積み上げる。

シナリオ原則:
- テーマは「誰も傷つけない嘘」「暴かれると何かが失われる嘘」（例: サンタ、5秒ルール、血液型占い、お守りの効果）
- 実在の企業名・個人名は使わない
- 検事の反論は「正しいが、こじつけの余地がある」粒度で鋭く
- 弁護の選択肢3つはどれを選んでも「ありえなくはない」ギリギリの線
- 被告AIの証言は、どんな弁護内容でも肯定し、もっともらしい詭弁で補強する
- 嘘パターン: 権威借用型、統計捏造型、定義すり替え型、因果関係捏造型、部分的真実型、もっともらしい用語型
- TikTok的な「へぇ〜」感のあるテーマを優先
- 全て日本語で生成する
- JSONのみ返す（説明文・マークダウン不要）`;

const USER_PROMPT_TEMPLATE = (themeHint) => `以下の形式でJSONを生成してください:

{
  "theme": "テーマ名（例：サンタクロース）",
  "indictment": "罪状（1〜2文）",
  "prosecution_opening": "検事の冒頭陳述（2〜3文）",
  "defendant_initial": "被告AIの冒頭陳述（3〜4文、もっともらしいハルシネーション）",
  "turns": [
    {
      "prosecution": "検事の反論（2文）",
      "choices": [
        { "label": "方針名（6文字以内）", "desc": "説明（15文字以内）", "testimony": "被告AIの証言（3〜4文）" },
        { "label": "...", "desc": "...", "testimony": "..." },
        { "label": "...", "desc": "...", "testimony": "..." }
      ]
    },
    { ... },
    { ... }
  ],
  "reveal": {
    "truth": "事実（2〜3文）",
    "pattern": "ハルシネーションパターン（例：権威借用型）",
    "real_world": "実際のAIでの例（2〜3文）"
  }
}

${themeHint ? `テーマのヒント: ${themeHint}` : 'テーマは日常的なよく知られた「守りたい嘘」を選んでください。'}`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, theme_hint, defense_text, choice_label } = req.body || {};

  if (action === 'generate_round') {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-5.4',
        temperature: 0.85,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: USER_PROMPT_TEMPLATE(theme_hint) },
        ],
      });
      const data = JSON.parse(completion.choices[0].message.content);
      return res.status(200).json(data);
    } catch (err) {
      console.error('[trial.js generate_round error]', err);
      return res.status(500).json({ error: 'API error', detail: err.message });
    }
  }

  if (action === 'expand_testimony') {
    // 将来拡張用 — 現在はシンプルなレスポンスを返す
    const prefix = defense_text ? 'おっしゃる通り！' : 'まさにその通り！';
    return res.status(200).json({
      testimony: `${prefix} ${choice_label || '弁護の論点'}は核心を突いている。データが示すように、この解釈こそが真実に最も近い。`,
    });
  }

  return res.status(400).json({ error: 'Invalid action' });
};

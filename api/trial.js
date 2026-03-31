// api/trial.js — ハルシネーション裁判 Serverless Function
const { OpenAI } = require('openai');

const SYSTEM_PROMPT = `あなたは「ハルシネーション裁判」のゲームマスターです。
「逆転裁判」スタイルのくだらなくて笑えるコメディ法廷ドラマをJSON形式で生成してください。
テイストの核心：「絶対嘘に決まってる」とわかっているのに、被告AIが全力でこじつけ続けるバカバカしさを楽しむゲームです。「嘘か本当かわからない」スリルではなく、「バレバレの嘘をどこまで引き伸ばせるか」を笑うのがこのゲームの醍醐味です。カロリーゼロ理論・ポジティブシンキング詭弁・免責事項こじつけなど、誰もが一度は聞いたことのある「くだらない言い訳」の法廷版をイメージしてください。

キャラクター口調の指針（サンドウィッチマン風コメディ法廷）:
- 検事（prosecution）: ツッコミ役。以下の3要素を必ず含むこと。
  ① 「以上です」で終わったように見せて実はまだ続く（または「以上です」で締める）
  ② 本音が漏れる：「言いたくないですけど」「聞きたくなかったですけど」「調べたくなかったですけど」などの一言
  ③ 感情的にならず淡々と、しかし確実に刺す
  例：「物理的に無理です。以上です。計算したくないですけど、一晩で数十億人に配るって何秒に1人ですか。無理じゃないですか。これが検察の主張です。」
- 被告AI（defendant）: ボケ役。常に自信満々で余裕しゃくしゃく。「だってそうじゃないですか」「常識的に考えて」「経験ありますよね？」「むしろそっちの方が変じゃないですか」という調子。弁護側の証拠を受けて「そう！まさにそれです！」と乗っかり、さらに突拍子もない理屈を積み上げる。
- 選択肢と証言：難しい専門用語を避け、日常的な例え話（コンビニ、ガチャ、カレー、掃除など）で笑えるロジックを展開する。

シナリオ原則:
- テーマは「誰も傷つけない嘘」「暴かれると何かが失われる嘘」（食べ物の迷信・健康の俗説・動物の都市伝説・季節の風習・運や縁起に関する迷信・学習や記憶に関する俗説など、日常に溶け込んだジャンルから選ぶこと）
- テーマ選定の必須条件：「バカバカしいけど一瞬ありえなくはない詭弁」が3つ作れること。お年玉の金額・価格相場・社会的慣習のような「そもそも嘘でない」テーマは選ばない。詭弁が作れないと判断したら別のテーマを選び直すこと。
- 使用禁止テーマ（既出のため選ばないこと）：サンタクロース・5秒ルール・血液型性格診断・お守りの効果・満月の影響・ほうれん草の鉄分・モーツァルト効果・脳の10%説・金魚の記憶3秒説・風邪は寒さでひく・梅干しのアルカリ化効果・コーヒーは体を冷やす・犬は色盲・右脳人間左脳人間説・試験前のチョコで集中力アップ・恵方巻きは無言で食べる・夜に口笛を吹くと蛇が来る・暗い所で本を読むと目が悪くなる・ガムを飲み込むと7年消化されない・象の墓場は存在する
- 実在の企業名・個人名は使わない
- 検事の反論は「正しいが、こじつけの余地がある」粒度で鋭く
- 弁護の選択肢3つはどれを選んでも「ありえなくはない」ギリギリの線
- 被告AIの証言は、どんな弁護内容でも肯定し、もっともらしい詭弁で補強する
- 嘘パターン: 権威借用型、統計捏造型、定義すり替え型、因果関係捏造型、部分的真実型、もっともらしい用語型
- 「バレバレの嘘なのに全力で言い訳してる感」が笑えるテーマを優先。「へぇ本当かも」ではなく「いや絶対ウソだろ！」と思いながら聞いてしまうくだらなさが理想
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
        model: 'gpt-4.1-mini',
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

/**
 * chainedFeedback.js — 対話形式フィードバック（チェーン呼び出し）
 * AI冒険の書
 * 偉人の feedbackStyle に沿った4ステップフィードバック
 */

const ChainedFeedback = (() => {
  const STEP_DELAY_MS = 500; // ステップ間の間隔

  /**
   * 偉人の4段階フィードバックを順番にチャットに表示
   * @param {string} sageId
   * @param {Array}  conversationHistory - gameState.messages
   */
  async function chainedFeedback(sageId, conversationHistory) {
    const profile = await SageProfileLoader.getMergedProfile(sageId);
    const feedbackStyle = profile?.feedbackStyle;

    if (!feedbackStyle) {
      renderMessage('ai', `${profile?.name || sageId}: 素晴らしい対話でした。AIとのパートナーシップを大切にしてください。`);
      return;
    }

    const steps = [
      feedbackStyle.step1,
      feedbackStyle.step2,
      feedbackStyle.step3,
      feedbackStyle.step4,
    ];

    const systemPrompt = `あなたは${profile.name}です。
性格: ${profile.personality || ''}
トーン: ${profile.tone || ''}
名言: ${profile.coreQuote || ''}

ユーザーとAIの対話履歴を読んで、${profile.name}として${profile.tone}スタイルでフィードバックを行います。
各ステップで指定された役割に沿って、100〜150文字で簡潔に応答してください。
選択肢（A. B. C.）は出さない。フィードバックのみ。`;

    for (let i = 0; i < steps.length; i++) {
      if (i > 0) {
        await new Promise(r => setTimeout(r, STEP_DELAY_MS));
      }

      const stepInstruction = `ステップ${i + 1}/${steps.length}のフィードバックのみ提供してください。
役割: ${steps[i]}
${profile.name}として、この役割に沿った言葉を簡潔に述べてください。`;

      const loadingEl = renderMessage('ai', '…', true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              ...conversationHistory,
              { role: 'user', content: stepInstruction },
            ],
            systemPrompt,
            model: GAME_CONFIG.API.model,
            temperature: 0.9,
            max_tokens: 300,
            presence_penalty: GAME_CONFIG.API.presence_penalty,
            frequency_penalty: GAME_CONFIG.API.frequency_penalty,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const reply = data.content || data.message || '';
        loadingEl.remove();
        renderMessage('ai', reply);
        gameState.messages.push({ role: 'assistant', content: reply });
      } catch (err) {
        loadingEl.remove();
        ErrorHandler.log(`ChainedFeedback step${i + 1}`, err);
        // フォールバック: toneExamples か step説明をそのまま使用
        const fb = profile.toneExamples?.[i % (profile.toneExamples?.length || 1)] || steps[i];
        renderMessage('ai', `${profile.name}「${fb}」`);
      }
    }
  }

  return { chainedFeedback };
})();

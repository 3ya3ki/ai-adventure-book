/**
 * gameConfig.js — モード設定（EXHIBITION / FULL）
 * AI冒険の書
 */

const GAME_CONFIG = {
  // モード識別子（URLパラメータ値と一致）
  MODES: {
    EXHIBITION: 'exhibition',
    FULL: 'full',
  },

  // 展示会モード設定
  EXHIBITION: {
    sageCount: 5,
    timeLimit: 180, // 秒（3分）
    label: '展示会モード',
    sages: ['jobs', 'socrates', 'nietzsche', 'ichiro', 'miyazaki'],
  },

  // 標準モード設定
  FULL: {
    sageCount: 13,
    timeLimit: null,
    label: '標準モード',
  },

  // API設定
  API: {
    model: 'gpt-4o-mini',
    temperature: 0.8,
    max_tokens: 1000,
    presence_penalty: 0.3,
    frequency_penalty: 0.3,
  },

  // URLパラメータからモードを取得
  getMode() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    return mode === this.MODES.EXHIBITION ? this.MODES.EXHIBITION : this.MODES.FULL;
  },
};

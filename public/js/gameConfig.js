/**
 * gameConfig.js — モード設定（EXHIBITION / FULL）
 * AI冒険の書
 */

const GAME_CONFIG = {
  MODES: {
    EXHIBITION: 'exhibition',
    FULL: 'full',
  },

  // 展示会モード設定
  EXHIBITION: {
    maxSages: 5,
    sessionMinutes: { min: 3, max: 5 },
    label: '展示会モード',
  },

  // 標準モード設定
  FULL: {
    maxSages: 13,
    sessionMinutes: null, // 時間制限なし
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
};

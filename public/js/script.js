/**
 * script.js — メインスクリプト
 * AI冒険の書
 * SYSTEM_PROMPT、ゲームステート管理、メインUI構築を含む
 */

// ── ゲームステート ──
const gameState = {
  mode: null,
  selectedSage: null,
  messages: [],
  turnCount: 0,
  constellationStars: 0,
};

// ── DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', () => {
  gameState.mode = ModeManager.getMode();
  console.log(`[script.js] 起動モード: ${gameState.mode}`);
  // Phase 0-B 以降: init() を呼び出してゲーム開始
});

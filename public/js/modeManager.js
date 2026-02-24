/**
 * modeManager.js — モード管理
 * AI冒険の書
 * URLパラメータ ?mode=exhibition または ?mode=full でモードを切り替える
 */

const ModeManager = (() => {
  function getMode() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === GAME_CONFIG.MODES.EXHIBITION) {
      return GAME_CONFIG.MODES.EXHIBITION;
    }
    return GAME_CONFIG.MODES.FULL; // デフォルト: 標準モード
  }

  function getConfig() {
    const mode = getMode();
    return mode === GAME_CONFIG.MODES.EXHIBITION
      ? GAME_CONFIG.EXHIBITION
      : GAME_CONFIG.FULL;
  }

  function isExhibitionMode() {
    return getMode() === GAME_CONFIG.MODES.EXHIBITION;
  }

  return { getMode, getConfig, isExhibitionMode };
})();

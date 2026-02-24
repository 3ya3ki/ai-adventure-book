/**
 * errorHandler.js — エラーハンドリング
 * AI冒険の書
 */

const ErrorHandler = (() => {
  function log(context, error) {
    console.error(`[ErrorHandler] ${context}:`, error);
  }

  function showUserMessage(message) {
    console.warn(`[ErrorHandler] ユーザー向けエラー: ${message}`);
    // Phase 0-B 以降: UIへのエラー表示を実装
  }

  return { log, showUserMessage };
})();

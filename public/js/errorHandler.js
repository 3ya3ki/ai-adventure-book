/**
 * errorHandler.js — エラーハンドリング
 * AI冒険の書
 */

const ErrorHandler = (() => {
  /**
   * 指数バックオフでリトライ
   * @param {Function} fn - 非同期処理
   * @param {number} maxRetries - 最大リトライ回数（デフォルト3）
   */
  async function retryWithBackoff(fn, maxRetries = 3) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 500; // 500ms → 1s → 2s
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }

  /**
   * APIエラー種別を判定してユーザー向けメッセージを返す
   * @param {Error} error
   * @returns {{ type: string, userMessage: string }}
   */
  function handleAPIError(error) {
    const msg = String(error?.message || error || '');

    if (!navigator.onLine || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::ERR')) {
      return { type: 'network', userMessage: 'ネットワーク接続を確認してください。' };
    }
    if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
      return { type: 'rate_limit', userMessage: 'リクエストが多すぎます。少し待ってからお試しください。' };
    }
    if (/\b5\d{2}\b/.test(msg) || msg.includes('Internal Server Error')) {
      return { type: 'server', userMessage: 'サーバーに問題が発生しています。しばらくお待ちください。' };
    }
    return { type: 'unknown', userMessage: '予期しないエラーが発生しました。もう一度お試しください。' };
  }

  /**
   * 画面上部に一時的なエラートースト（3秒で消える）
   * @param {string} message
   */
  function showErrorToast(message) {
    const existing = document.getElementById('eh-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'eh-toast';
    toast.className = 'eh-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // フェードイン
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('eh-toast--visible'));
    });

    // 3秒後にフェードアウト → 削除
    setTimeout(() => {
      toast.classList.remove('eh-toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ── LocalStorage 安全ラッパー ──

  /**
   * @param {string} key
   * @param {*} fallback
   */
  function safeGet(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * @param {string} key
   * @param {*} value
   * @returns {boolean}
   */
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function log(context, error) {
    console.error(`[ErrorHandler] ${context}:`, error);
  }

  return {
    retryWithBackoff,
    handleAPIError,
    showErrorToast,
    safeGet,
    safeSet,
    safeRemove,
    log,
  };
})();

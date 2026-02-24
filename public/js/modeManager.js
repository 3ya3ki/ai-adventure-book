/**
 * modeManager.js — モード管理
 * AI冒険の書
 * URLパラメータ ?mode=exhibition または ?mode=full でモードを切り替える
 */

const ModeManager = (() => {
  let _timerInterval = null;

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

  /** URLに ?mode= パラメータが存在するか */
  function hasMode() {
    return new URLSearchParams(window.location.search).has('mode');
  }

  /**
   * モード選択UIを表示（URLパラメータなし時）
   * @param {Function} onSelect - (mode: string) => void
   */
  function showModeSelection(onSelect) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="mm-mode-select">
        <h1 class="mm-title">AI冒険の書</h1>
        <p class="mm-subtitle">モードを選択してください</p>
        <div class="mm-buttons">
          <button class="mm-btn mm-btn--exhibition" data-mode="exhibition">
            <span class="mm-btn-icon">🏛</span>
            <div class="mm-btn-label">展示会モード</div>
            <div class="mm-btn-desc">偉人5名 / 5分間</div>
          </button>
          <button class="mm-btn mm-btn--full" data-mode="full">
            <span class="mm-btn-icon">🌌</span>
            <div class="mm-btn-label">標準モード</div>
            <div class="mm-btn-desc">偉人13名 / 時間制限なし</div>
          </button>
        </div>
      </div>
    `;

    app.querySelectorAll('.mm-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (onSelect) onSelect(btn.dataset.mode);
      });
    });
  }

  /**
   * 展示会モード用カウントダウンタイマーを開始
   * @param {number}   seconds - タイマー秒数
   * @param {Function} onEnd   - 時間終了時コールバック
   */
  function startTimer(seconds, onEnd) {
    let remaining = seconds;
    const display = document.getElementById('timer-display');
    const container = document.getElementById('exhibition-timer');
    if (!display || !container) return;

    container.style.display = 'flex';

    function updateDisplay() {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      display.textContent = `${m}:${String(s).padStart(2, '0')}`;
      // 残り60秒以下で警告色
      if (remaining <= 60) {
        display.classList.add('timer-display--warn');
      }
    }

    updateDisplay();
    _timerInterval = setInterval(() => {
      remaining--;
      updateDisplay();
      if (remaining <= 0) {
        clearInterval(_timerInterval);
        _timerInterval = null;
        if (onEnd) onEnd();
      }
    }, 1000);
  }

  function stopTimer() {
    if (_timerInterval) {
      clearInterval(_timerInterval);
      _timerInterval = null;
    }
    const container = document.getElementById('exhibition-timer');
    if (container) container.style.display = 'none';
  }

  return { getMode, getConfig, isExhibitionMode, hasMode, showModeSelection, startTimer, stopTimer };
})();

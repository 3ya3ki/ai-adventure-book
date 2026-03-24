// portal.js — 2カードポータル
// Phase B: ハルシネーション体験ゲーム

const Portal = (() => {
  let _exhibitionMode = false;
  let _inactivityTimer = null;
  const INACTIVITY_MS = 60000;

  // --- Fallback mode (Fixed / Random) ---
  let _fallbackMode = sessionStorage.getItem('trial-fallback-mode') || 'fixed';
  let _tapSequence = [];
  let _tapTimer = null;
  const EXPECTED_TAP = ['logo', 'trial', 'liepedia'];

  function handleSecretTap(target) {
    _tapSequence.push(target);
    clearTimeout(_tapTimer);
    _tapTimer = setTimeout(() => { _tapSequence = []; }, 3000);
    if (_tapSequence.length === EXPECTED_TAP.length) {
      const matched = _tapSequence.every((t, i) => t === EXPECTED_TAP[i]);
      _tapSequence = [];
      if (matched) toggleModePanel();
    }
  }

  function toggleModePanel() {
    const panel = document.getElementById('portal-mode-panel');
    if (panel) panel.classList.toggle('portal-mode-panel--visible');
  }

  function updateModePanelUI() {
    const sw = document.getElementById('portal-mode-switch');
    const desc = document.getElementById('portal-mode-desc');
    if (!sw || !desc) return;
    const isRandom = _fallbackMode === 'random';
    sw.classList.toggle('portal-mode-switch--on', isRandom);
    sw.setAttribute('aria-pressed', String(isRandom));
    desc.textContent = isRandom ? 'ランダム: 10テーマからランダム選択' : '固定: サンタ・5秒ルール';
  }

  // --- Screen switching ---
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
  }

  // --- Build portal HTML ---
  function buildPortal() {
    const el = document.getElementById('screen-portal');
    if (!el) return;
    el.innerHTML = `
      <div class="portal-wrapper">
        <header class="portal-header" style="position:relative;">
          <button id="portal-secret-btn" aria-hidden="true" tabindex="-1" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:default;border:none;background:none;"></button>
          <div class="portal-brand">FoPs × StudyMeter Inc.</div>
          <h1 class="portal-title">ハルシネーション体験ゲーム</h1>
          <p class="portal-tagline">AIは、いい子とは限らない</p>
        </header>
        <main class="portal-main">
          <div class="portal-cards">
            <div class="portal-card" id="portal-card-trial" role="button" tabindex="0">
              <div class="portal-card-icon">⚖️</div>
              <div class="portal-card-body">
                <h2 class="portal-card-title">ハルシネーション裁判</h2>
                <p class="portal-card-catch">AIの壮大な嘘を、あなたが弁護する</p>
                <p class="portal-card-meta">約6〜8分</p>
              </div>
              <button class="portal-card-btn" id="portal-btn-trial">開廷する →</button>
            </div>
            <div class="portal-card" id="portal-card-liepedia" role="button" tabindex="0">
              <div class="portal-card-icon">📖</div>
              <div class="portal-card-body">
                <h2 class="portal-card-title">嘘ペディア</h2>
                <p class="portal-card-catch">この世界、全部嘘です。</p>
                <p class="portal-card-meta">約8分</p>
              </div>
              <button class="portal-card-btn" id="portal-btn-liepedia">探索する →</button>
            </div>
          </div>
        </main>
        <footer class="portal-footer">
          <p class="portal-footer-credit">制作: 宮﨑秀成（MIYAZAKI）</p>
          <p class="portal-footer-event">ニコニコ超会議 2026 — FoPs ブース</p>
        </footer>
      </div>
      <div id="portal-mode-panel" class="portal-mode-panel">
        <div class="portal-mode-inner">
          <div class="portal-mode-title">⚙ 裁判フォールバック設定</div>
          <div class="portal-mode-row">
            <span class="portal-mode-opt" id="portal-mode-opt-fixed">Fixed</span>
            <button id="portal-mode-switch" class="portal-mode-switch" aria-pressed="false"></button>
            <span class="portal-mode-opt" id="portal-mode-opt-random">Random</span>
          </div>
          <div id="portal-mode-desc" class="portal-mode-desc">固定: サンタ・5秒ルール</div>
        </div>
      </div>
    `;

    document.getElementById('portal-btn-trial').addEventListener('click', () => {
      Portal.navigateToTrial();
    });
    document.getElementById('portal-card-trial').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') Portal.navigateToTrial();
    });

    document.getElementById('portal-btn-liepedia').addEventListener('click', () => {
      const timerParam = _exhibitionMode ? '?timer=480' : '';
      window.location.href = 'lie-pedia.html' + timerParam;
    });
    document.getElementById('portal-card-liepedia').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const timerParam = _exhibitionMode ? '?timer=480' : '';
        window.location.href = 'lie-pedia.html' + timerParam;
      }
    });

    // --- Secret tap sequence listeners ---
    document.getElementById('portal-secret-btn').addEventListener('click', () => handleSecretTap('logo'));
    document.getElementById('portal-card-trial').addEventListener('click', (e) => {
      if (!e.target.closest('.portal-card-btn')) handleSecretTap('trial');
    });
    document.getElementById('portal-card-liepedia').addEventListener('click', (e) => {
      if (!e.target.closest('.portal-card-btn')) handleSecretTap('liepedia');
    });

    // --- Mode panel toggle switch ---
    document.getElementById('portal-mode-switch').addEventListener('click', () => {
      _fallbackMode = _fallbackMode === 'fixed' ? 'random' : 'fixed';
      sessionStorage.setItem('trial-fallback-mode', _fallbackMode);
      updateModePanelUI();
    });

    updateModePanelUI();
  }

  // --- Inactivity (exhibition mode) ---
  function resetInactivity() {
    if (!_exhibitionMode) return;
    clearTimeout(_inactivityTimer);
    _inactivityTimer = setTimeout(() => {
      Portal.navigateToPortal();
    }, INACTIVITY_MS);
  }

  function attachInactivityListeners() {
    ['click', 'keydown', 'touchstart', 'mousemove'].forEach(ev => {
      document.addEventListener(ev, resetInactivity, { passive: true });
    });
  }

  // --- Public API ---
  return {
    init() {
      const params = new URLSearchParams(window.location.search);
      _exhibitionMode = params.get('mode') === 'exhibition';

      buildPortal();
      showScreen('screen-portal');

      if (_exhibitionMode) {
        attachInactivityListeners();
        resetInactivity();
      }
    },

    navigateToTrial() {
      clearTimeout(_inactivityTimer);
      showScreen('screen-trial');
      if (typeof Trial !== 'undefined') {
        Trial.init({ exhibitionMode: _exhibitionMode, fallbackMode: _fallbackMode });
      }
      if (_exhibitionMode) resetInactivity();
    },

    navigateToPortal() {
      if (typeof Trial !== 'undefined') Trial.destroy();
      if (typeof ResultCard !== 'undefined') ResultCard.cleanup();
      showScreen('screen-portal');
      if (_exhibitionMode) resetInactivity();
    },

    isExhibitionMode() {
      return _exhibitionMode;
    },
  };
})();

// Global helpers used by resultCard.js
window.goHome = function () {
  Portal.navigateToPortal();
};

document.addEventListener('DOMContentLoaded', () => {
  Portal.init();
});

// portal.js — 2カードポータル
// Phase B: ハルシネーション体験ゲーム

const Portal = (() => {
  let _exhibitionMode = false;
  let _inactivityTimer = null;
  const INACTIVITY_MS = 60000;
  const ATTRACT_MS    = 12000; // 12s no interaction → attract mode

  // Attract messages — interleaved A (AI知識あり) / B (AI未経験)
  const ATTRACT_MESSAGES = [
    { lines: ['AIの嘘を、', '守る。'],                               type: 'A' },
    { lines: ['AIは正直に、', '嘘をつく'],                           type: 'B' },
    { lines: ['被告人：', 'AI'],                                     type: 'A' },
    { lines: ['AIは嘘をつく。', 'あなたは守れる？'],                   type: 'B' },
    { lines: ['AIは嘘をついている。', 'でも悪意はない'],               type: 'A' },
    { lines: ['AIって、', '嘘をつくって知ってた？'],                   type: 'B' },
    { lines: ['静粛に。', '法廷、開廷。'],                            type: 'A' },
    { lines: ['始まりは嘘。', '終わりは、あなたが決める。'],             type: 'B' },
    { lines: ['AI好きほど、', '引っかかる罠がある'],                   type: 'A' },
    { lines: ['AIのこと、よくわからない人ほど、', '向いています'],        type: 'B' },
  ];

  let _attractTimer    = null;
  let _attractMsgTimer = null;
  let _attractIndex    = 0;
  let _attractActive   = false;
  let _attractEl       = null;
  let _onPortalScreen  = true;

  // --- Fallback mode (Fixed / Random) ---
  let _fallbackMode = sessionStorage.getItem('trial-fallback-mode') || 'fixed';
  let _tapSequence = [];
  let _tapTimer = null;
  const EXPECTED_TAP = ['logo', 'trial', 'halucinica'];

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

  // --- Attract mode ---
  const ATTRACT_IN_MS   = 1800;
  const ATTRACT_HOLD_MS = 3600;
  const ATTRACT_OUT_MS  = 650;

  function buildAttractEl() {
    const el = document.createElement('div');
    el.className = 'attract-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="attract-content">' +
        '<div class="attract-rule attract-rule--top"></div>' +
        '<div class="attract-lines"></div>' +
        '<div class="attract-rule attract-rule--bottom"></div>' +
      '</div>' +
      '<p class="attract-cta">タップして体験する</p>';
    return el;
  }

  function runAttractMessage() {
    if (!_attractActive || !_attractEl) return;

    const msg     = ATTRACT_MESSAGES[_attractIndex % ATTRACT_MESSAGES.length];
    _attractIndex++;

    const content = _attractEl.querySelector('.attract-content');
    const ruleTop = _attractEl.querySelector('.attract-rule--top');
    const ruleBot = _attractEl.querySelector('.attract-rule--bottom');
    const linesEl = _attractEl.querySelector('.attract-lines');

    // Reset state instantly (no transition)
    content.style.transition = 'none';
    content.style.opacity    = '1';
    content.style.transform  = 'none';
    content.classList.remove('attract-content--out');
    ruleTop.classList.remove('attract-rule--in');
    ruleBot.classList.remove('attract-rule--in');
    linesEl.innerHTML = '';

    msg.lines.forEach(text => {
      const span = document.createElement('span');
      span.className = 'attract-line';
      span.textContent = text;
      linesEl.appendChild(span);
    });

    // Re-enable transitions after two frames to avoid flicker
    requestAnimationFrame(() => requestAnimationFrame(() => {
      content.style.transition = '';
      content.style.opacity    = '';
      content.style.transform  = '';

      // Choreograph: rule → lines (staggered) → rule
      setTimeout(() => ruleTop.classList.add('attract-rule--in'), 60);
      const lineEls = linesEl.querySelectorAll('.attract-line');
      lineEls.forEach((line, i) => {
        setTimeout(() => line.classList.add('attract-line--in'), 380 + i * 320);
      });
      setTimeout(() => ruleBot.classList.add('attract-rule--in'),
        380 + lineEls.length * 320 + 160);
    }));

    // Schedule out → next
    _attractMsgTimer = setTimeout(() => {
      content.classList.add('attract-content--out');
      setTimeout(runAttractMessage, ATTRACT_OUT_MS);
    }, ATTRACT_IN_MS + ATTRACT_HOLD_MS);
  }

  function showAttract() {
    if (_attractActive || !_onPortalScreen) return;
    _attractActive = true;

    // Clean up any lingering overlay from previous cycle
    document.querySelectorAll('.attract-overlay').forEach(e => e.remove());

    _attractEl = buildAttractEl();
    document.body.appendChild(_attractEl);

    // Double rAF ensures CSS transition picks up the class change
    requestAnimationFrame(() => requestAnimationFrame(() => {
      _attractEl.classList.add('attract-overlay--visible');
    }));

    _attractEl.addEventListener('click',      () => hideAttract());
    _attractEl.addEventListener('touchstart', () => hideAttract(), { passive: true });

    setTimeout(runAttractMessage, 550);
  }

  function hideAttract() {
    if (!_attractActive) return;
    _attractActive = false;
    clearTimeout(_attractMsgTimer);

    const el = _attractEl;
    _attractEl = null;
    if (!el) return;
    el.classList.remove('attract-overlay--visible');
    setTimeout(() => { if (el.parentNode) el.remove(); }, 750);
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
          <p class="portal-brand">FoPs × StudyMeter Inc.</p>
          <h1 class="portal-title">ハルシネーション体験ゲーム</h1>
          <p class="portal-tagline">AIは、いい子とは限らない</p>
        </header>
        <main class="portal-main">
          <div class="portal-cards">
            <div class="portal-card" id="portal-card-trial" role="button" tabindex="0">
              <div class="portal-card-icon">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">gavel</span>
              </div>
              <div class="portal-card-body">
                <h2 class="portal-card-title">ハルシネーション裁判</h2>
                <p class="portal-card-catch">虚実が入り混じるAIの供述を暴き、真実の判決を下せ。あなたの選択が詭弁を裁く。</p>
                <p class="portal-card-meta">約6〜8分</p>
              </div>
              <button class="portal-card-btn" id="portal-btn-trial">
                ENTER COURTROOM
                <span class="material-symbols-outlined" style="font-size:1rem">account_balance</span>
              </button>
            </div>
            <div class="portal-card" id="portal-card-halucinica" role="button" tabindex="0">
              <div class="portal-card-icon portal-card-icon--secondary">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">menu_book</span>
              </div>
              <div class="portal-card-body">
                <h2 class="portal-card-title">ハルシニカ</h2>
                <p class="portal-card-catch">AIが創り出した「もっともらしいハルシネーション」の百科事典。世界の再定義を目撃せよ。</p>
                <p class="portal-card-meta">約8分</p>
              </div>
              <button class="portal-card-btn portal-card-btn--secondary" id="portal-btn-halucinica">
                OPEN ARCHIVES
                <span class="material-symbols-outlined" style="font-size:1rem">database</span>
              </button>
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

    document.getElementById('portal-btn-halucinica').addEventListener('click', () => {
      const timerParam = _exhibitionMode ? '?timer=480' : '';
      window.location.href = 'halucinica.html' + timerParam;
    });
    document.getElementById('portal-card-halucinica').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const timerParam = _exhibitionMode ? '?timer=480' : '';
        window.location.href = 'halucinica.html' + timerParam;
      }
    });

    // --- Secret tap sequence listeners ---
    document.getElementById('portal-secret-btn').addEventListener('click', () => handleSecretTap('logo'));
    document.getElementById('portal-card-trial').addEventListener('click', (e) => {
      if (!e.target.closest('.portal-card-btn')) handleSecretTap('trial');
    });
    document.getElementById('portal-card-halucinica').addEventListener('click', (e) => {
      if (!e.target.closest('.portal-card-btn')) handleSecretTap('halucinica');
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
    clearTimeout(_attractTimer);
    if (_attractActive) hideAttract();

    if (_onPortalScreen) {
      _attractTimer = setTimeout(showAttract, ATTRACT_MS);
    }
    _inactivityTimer = setTimeout(() => Portal.navigateToPortal(), INACTIVITY_MS);
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
      clearTimeout(_attractTimer);
      hideAttract();
      _onPortalScreen = false;
      showScreen('screen-trial');
      if (typeof Trial !== 'undefined') {
        Trial.init({ exhibitionMode: _exhibitionMode, fallbackMode: _fallbackMode });
      }
      if (_exhibitionMode) resetInactivity();
    },

    navigateToPortal() {
      if (typeof Trial !== 'undefined') Trial.destroy();
      if (typeof ResultCard !== 'undefined') ResultCard.cleanup();
      hideAttract();
      _onPortalScreen = true;
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

/**
 * portal.js — 6つのAI体験 ポータル画面管理
 * Phase 2 全面差し替え
 *
 * 公開API（script.js との接続点）:
 *   Portal.init()
 *   Portal.isEnabled()
 *   Portal.navigateToPortal()
 *   Portal.navigateToGame(gameName)
 *   Portal.markGameCleared(gameId)
 *   Portal.refreshProfile()
 */
const Portal = (() => {

  // ── 定数 ──
  const PROFILE_KEY = 'ai-experience-profile';
  const THEME_KEY   = 'theme-preference';

  const GAMES = [
    {
      id:          'ijin',
      icon:        '🏛️',
      name:        '偉人とともに考える',
      catchcopy:   'AIと一緒に深く考える',
      desc:        '偉人の視点を借りて、正解のない問いに挑戦しよう',
      enabled:     true,
      gameName:    'ijin',
      lightAccent: '#b45309',
      darkAccent:  '#f59e0b',
      darkBg:      'linear-gradient(135deg, #451a03, #78350f)',
      lightBg:     'linear-gradient(135deg, #fef3c7, #fde68a)',
    },
    {
      id:          'uso',
      icon:        '🎭',
      name:        'ウソつきAI',
      catchcopy:   'AIの情報を見抜く',
      desc:        'AIの嘘を見破れるか？情報リテラシーを試そう',
      enabled:     true,
      gameName:    'doubt-mirage',
      lightAccent: '#dc2626',
      darkAccent:  '#f87171',
      darkBg:      'linear-gradient(135deg, #450a0a, #7f1d1d)',
      lightBg:     'linear-gradient(135deg, #fecaca, #fca5a5)',
    },
    {
      id:          'prompt',
      icon:        '🎯',
      name:        'プロンプト道場',
      catchcopy:   'AIの使い方を学ぶ',
      desc:        '効果的なプロンプトの書き方をマスターしよう',
      enabled:     false,
      lightAccent: '#0369a1',
      darkAccent:  '#38bdf8',
      darkBg:      'linear-gradient(135deg, #0c2d48, #0e3a5e)',
      lightBg:     'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    },
    {
      id:          'click',
      icon:        '👆',
      name:        'クリックAI',
      catchcopy:   'AIは誰でも使える',
      desc:        'クリックだけでAIの力を体験してみよう',
      enabled:     false,
      lightAccent: '#047857',
      darkAccent:  '#34d399',
      darkBg:      'linear-gradient(135deg, #022c22, #064e3b)',
      lightBg:     'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    },
    {
      id:          'tsundere',
      icon:        '💕',
      name:        'ツンデレAI',
      catchcopy:   'AIキャラと対話する',
      desc:        '個性豊かなAIキャラクターとの会話を楽しもう',
      enabled:     false,
      lightAccent: '#be123c',
      darkAccent:  '#fb7185',
      darkBg:      'linear-gradient(135deg, #4c0519, #881337)',
      lightBg:     'linear-gradient(135deg, #ffe4e6, #fecdd3)',
    },
    {
      id:          'zukan',
      icon:        '📖',
      name:        'プロンプト図鑑',
      catchcopy:   'AIの多様性を鑑賞する',
      desc:        '様々なプロンプトとAIの応答を鑑賞しよう',
      enabled:     false,
      lightAccent: '#6d28d9',
      darkAccent:  '#a78bfa',
      darkBg:      'linear-gradient(135deg, #2e1065, #4c1d95)',
      lightBg:     'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    },
  ];

  // ── 状態 ──
  let _isTransitioning = false;
  let _isDark           = true;

  // ── オーロラCanvas ──
  let _auroraCanvas = null;
  let _auroraCtx    = null;
  let _auroraAnimId = null;
  let _blobs        = [];

  // ──────────────────────────────────────────────
  // テーマ
  // ──────────────────────────────────────────────
  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    _isDark = (saved !== 'light');
    applyTheme();
  }

  function applyTheme() {
    document.body.classList.toggle('portal-dark',  _isDark);
    document.body.classList.toggle('portal-light', !_isDark);
    const btn = document.getElementById('portal-theme-btn');
    if (btn) btn.textContent = _isDark ? '☀️' : '🌙';
    if (_isDark) {
      startAurora();
    } else {
      stopAurora();
    }
  }

  function toggleTheme() {
    _isDark = !_isDark;
    localStorage.setItem(THEME_KEY, _isDark ? 'dark' : 'light');
    // カードの背景をテーマに合わせて更新
    document.querySelectorAll('#screen-portal .portal-game-card[data-game-id]').forEach(card => {
      const game = GAMES.find(g => g.id === card.dataset.gameId);
      if (game) card.style.background = _isDark ? game.darkBg : game.lightBg;
    });
    applyTheme();
  }

  // ──────────────────────────────────────────────
  // オーロラCanvas（ダークモード専用）
  // ──────────────────────────────────────────────
  function initAurora() {
    if (_auroraCanvas) return;
    _auroraCanvas = document.createElement('canvas');
    _auroraCanvas.id = 'portal-aurora-canvas';
    document.body.insertBefore(_auroraCanvas, document.body.firstChild);
    _auroraCtx = _auroraCanvas.getContext('2d');

    _blobs = [
      { x: 0.30, y: 0.30, r: 0.35, color: '#8b5cf6', vx:  0.00030, vy:  0.00020, sr: 0, svs: 0.00010 },
      { x: 0.70, y: 0.60, r: 0.30, color: '#3b82f6', vx: -0.00020, vy:  0.00030, sr: 1, svs: -0.00010 },
      { x: 0.50, y: 0.80, r: 0.25, color: '#14b8a6', vx:  0.00010, vy: -0.00020, sr: 2, svs: 0.00020 },
    ];

    resizeAurora();
    window.addEventListener('resize', resizeAurora);
  }

  function resizeAurora() {
    if (!_auroraCanvas) return;
    _auroraCanvas.width  = window.innerWidth;
    _auroraCanvas.height = window.innerHeight;
  }

  function startAurora() {
    if (!_auroraCanvas) initAurora();
    _auroraCanvas.style.display = 'block';
    if (_auroraAnimId) return;
    animateAurora();
  }

  function stopAurora() {
    if (_auroraCanvas) _auroraCanvas.style.display = 'none';
    if (_auroraAnimId) {
      cancelAnimationFrame(_auroraAnimId);
      _auroraAnimId = null;
    }
  }

  function animateAurora() {
    const ctx = _auroraCtx;
    const w   = _auroraCanvas.width;
    const h   = _auroraCanvas.height;

    ctx.clearRect(0, 0, w, h);

    _blobs.forEach(b => {
      b.x  += b.vx;
      b.y  += b.vy;
      b.sr += b.svs;
      if (b.x < 0.1 || b.x > 0.9) b.vx *= -1;
      if (b.y < 0.1 || b.y > 0.9) b.vy *= -1;

      const cx     = b.x * w;
      const cy     = b.y * h;
      const radius = (b.r + Math.sin(b.sr) * 0.05) * Math.max(w, h);

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, hexToRgba(b.color, 0.3));
      grad.addColorStop(1, hexToRgba(b.color, 0));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    _auroraAnimId = requestAnimationFrame(animateAurora);
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ──────────────────────────────────────────────
  // LocalStorage — プロフィール読み取り
  // ──────────────────────────────────────────────
  function readProfile() {
    let p = {};
    try {
      p = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || {};
    } catch (e) {
      p = {};
    }
    const rank        = typeof p.rank    === 'number' ? p.rank    : 0;
    const totalPt     = typeof p.totalPt === 'number' ? p.totalPt : 0;
    const clearedGames = Array.isArray(p.clearedGames) ? p.clearedGames : [];
    const barPercent  = totalPt % 100;
    return { rank, totalPt, clearedGames, barPercent };
  }

  // ──────────────────────────────────────────────
  // DOM構築
  // ──────────────────────────────────────────────
  function buildPortalScreen() {
    const portalEl = document.getElementById('screen-portal');
    if (!portalEl) return;

    portalEl.innerHTML = '';

    // テーマ切り替えボタン（portal-screen 内に配置、position:fixed で右上）
    const themeBtn = document.createElement('button');
    themeBtn.id        = 'portal-theme-btn';
    themeBtn.className = 'portal-theme-toggle';
    themeBtn.setAttribute('aria-label', 'テーマ切り替え');
    themeBtn.textContent = _isDark ? '☀️' : '🌙';
    themeBtn.addEventListener('click', toggleTheme);
    portalEl.appendChild(themeBtn);

    // コンテンツラッパー
    const content = document.createElement('div');
    content.className = 'portal-content';
    content.appendChild(buildHeader());
    content.appendChild(buildGrid());
    content.appendChild(buildRecordSection());
    content.appendChild(buildFooter());
    portalEl.appendChild(content);

    // リセット確認ダイアログ
    portalEl.appendChild(buildDialog());

    // 表示
    portalEl.classList.add('visible');

    // カードスタガーアニメーション（100ms後に開始）
    setTimeout(() => {
      document.querySelectorAll('#screen-portal .portal-game-card').forEach((card, i) => {
        card.style.animationDelay = `${i * 0.1}s`;
        card.classList.add('portal-card-animated');
      });
    }, 100);

    setupEvents();
  }

  // ── ヘッダー ──
  function buildHeader() {
    const header = document.createElement('header');
    header.className = 'portal-header';

    const subLabel = document.createElement('p');
    subLabel.className   = 'portal-sub-label';
    subLabel.textContent = 'FoPs × StudyMeter Inc.';
    header.appendChild(subLabel);

    // タイトル文字スタガー
    const title = document.createElement('h1');
    title.className = 'portal-main-title';
    [...'6つのAI体験'].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className         = 'char';
      span.style.animationDelay = `${i * 0.05}s`;
      span.textContent       = ch;
      title.appendChild(span);
    });
    header.appendChild(title);

    const tagline = document.createElement('p');
    tagline.className   = 'portal-tagline';
    tagline.textContent = 'AIは道具じゃない、パートナーだ。';
    header.appendChild(tagline);

    const desc = document.createElement('p');
    desc.className   = 'portal-description';
    desc.textContent = '6つの体験を通じて、AIの可能性を感じてみよう。';
    header.appendChild(desc);

    return header;
  }

  // ── 6カードグリッド ──
  function buildGrid() {
    const section = document.createElement('section');
    section.className = 'portal-games-section';

    const grid = document.createElement('div');
    grid.className = 'portal-games-grid';

    GAMES.forEach(game => grid.appendChild(buildCard(game)));
    section.appendChild(grid);
    return section;
  }

  // ── 個別カード ──
  function buildCard(game) {
    const accent = _isDark ? game.darkAccent : game.lightAccent;
    const bg     = _isDark ? game.darkBg    : game.lightBg;

    const card = document.createElement('div');
    card.className          = 'portal-game-card' + (game.enabled ? '' : ' portal-card-disabled');
    card.style.background   = bg;
    card.dataset.gameId     = game.id;
    card.dataset.gameName   = game.gameName || '';
    card.style.setProperty('--portal-card-accent', accent);

    // ホバーリフト + グロー（有効カードのみ）
    if (game.enabled) {
      card.addEventListener('mouseenter', () => {
        card.style.transform  = 'translateY(-8px)';
        card.style.boxShadow  = `0 20px 40px ${hexToRgba(accent, 0.2)}`;
        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    }

    // アイコン
    const icon = document.createElement('span');
    icon.className        = 'portal-card-icon';
    icon.textContent      = game.icon;
    icon.style.animation  = 'portal-icon-float 3s ease-in-out infinite';
    card.appendChild(icon);

    // 準備中バッジ
    if (!game.enabled) {
      const badge = document.createElement('span');
      badge.className   = 'portal-coming-soon-badge';
      badge.textContent = '準備中';
      card.appendChild(badge);
    }

    // ゲーム名
    const name = document.createElement('div');
    name.className   = 'portal-card-name';
    name.style.color = accent;
    name.textContent = game.name;
    card.appendChild(name);

    // キャッチコピー
    const catchcopy = document.createElement('p');
    catchcopy.className   = 'portal-card-catchcopy';
    catchcopy.textContent = game.catchcopy;
    card.appendChild(catchcopy);

    // 説明文
    const descEl = document.createElement('p');
    descEl.className   = 'portal-card-desc';
    descEl.textContent = game.desc;
    card.appendChild(descEl);

    // ボタン
    const btn = document.createElement('button');
    btn.className = 'portal-card-btn';
    if (game.enabled) {
      btn.textContent        = '体験する →';
      btn.style.background   = accent;
      btn.style.color        = _isDark ? '#0f172a' : '#ffffff';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame(game.gameName);
      });
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => startGame(game.gameName));
    } else {
      btn.textContent      = '● Coming Soon';
      btn.disabled         = true;
      btn.style.background = 'rgba(100,116,139,0.3)';
      btn.style.color      = '#94a3b8';
    }
    card.appendChild(btn);

    return card;
  }

  // ── 体験の記録セクション ──
  function buildRecordSection() {
    const p       = readProfile();
    const section = document.createElement('section');
    section.className = 'portal-record-section';

    const titleEl = document.createElement('h2');
    titleEl.className   = 'portal-record-title';
    titleEl.textContent = '体験の記録';
    section.appendChild(titleEl);

    // 統計
    const stats = document.createElement('div');
    stats.className = 'portal-record-stats';
    stats.appendChild(createStatEl('Rank',  `${p.rank}`,                   'portal-rec-rank'));
    stats.appendChild(createStatEl('体験',  `${p.clearedGames.length} / 6`, 'portal-rec-count'));
    stats.appendChild(createStatEl('体験pt', `${p.totalPt}`,               'portal-rec-pt'));
    section.appendChild(stats);

    // プログレスバー
    const barBg   = document.createElement('div');
    barBg.className = 'portal-record-bar-bg';
    const barFill = document.createElement('div');
    barFill.className    = 'portal-record-bar-fill';
    barFill.id           = 'portal-rec-bar';
    barFill.style.width  = `${p.barPercent}%`;
    barBg.appendChild(barFill);
    section.appendChild(barBg);

    // リセットボタン
    const resetBtn = document.createElement('button');
    resetBtn.className   = 'portal-reset-btn';
    resetBtn.id          = 'portal-reset-btn';
    resetBtn.textContent = '🔄 記録をリセット';
    section.appendChild(resetBtn);

    return section;
  }

  function createStatEl(label, value, id) {
    const stat = document.createElement('div');
    stat.className = 'portal-record-stat';

    const lbl = document.createElement('span');
    lbl.className   = 'portal-record-stat-label';
    lbl.textContent = label;
    stat.appendChild(lbl);

    const val = document.createElement('span');
    val.className   = 'portal-record-stat-value';
    val.id          = id;
    val.textContent = value;
    stat.appendChild(val);

    return stat;
  }

  // ── フッター ──
  function buildFooter() {
    const footer = document.createElement('footer');
    footer.className = 'portal-footer';
    footer.innerHTML = '制作: 宮﨑秀成（MIYAZAKI）<br>ニコニコ超会議 2026 — FoPs ブース';
    return footer;
  }

  // ── リセット確認ダイアログ ──
  function buildDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'portal-dialog-overlay';
    overlay.id        = 'portal-reset-dialog';

    const box = document.createElement('div');
    box.className = 'portal-dialog-box';
    box.innerHTML = `
      <div class="portal-dialog-title">記録をリセット</div>
      <p class="portal-dialog-message">すべての体験記録がリセットされます。<br>この操作は取り消せません。</p>
      <div class="portal-dialog-actions">
        <button class="portal-dialog-cancel" id="portal-dialog-cancel">やめる</button>
        <button class="portal-dialog-confirm" id="portal-dialog-confirm">リセットする</button>
      </div>
    `;
    overlay.appendChild(box);
    return overlay;
  }

  // ──────────────────────────────────────────────
  // イベント設定
  // ──────────────────────────────────────────────
  function setupEvents() {
    // リセットボタン → ダイアログ表示
    const resetBtn = document.getElementById('portal-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const dlg = document.getElementById('portal-reset-dialog');
        if (dlg) dlg.classList.add('active');
      });
    }

    // キャンセル
    const cancelBtn = document.getElementById('portal-dialog-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const dlg = document.getElementById('portal-reset-dialog');
        if (dlg) dlg.classList.remove('active');
      });
    }

    // 確認リセット
    const confirmBtn = document.getElementById('portal-dialog-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        localStorage.removeItem(PROFILE_KEY);
        const dlg = document.getElementById('portal-reset-dialog');
        if (dlg) dlg.classList.remove('active');
        refreshProfile();
      });
    }
  }

  // ──────────────────────────────────────────────
  // ゲーム起動
  // ──────────────────────────────────────────────
  function startGame(gameName) {
    if (_isTransitioning) return;
    navigateToGame(gameName);
  }

  // ──────────────────────────────────────────────
  // 画面遷移
  // ──────────────────────────────────────────────
  function navigateToGame(gameName) {
    if (_isTransitioning) return;
    _isTransitioning = true;

    const portalScreen = document.getElementById('screen-portal');
    const gameScreen   = document.getElementById('screen-game');
    if (!portalScreen || !gameScreen) { _isTransitioning = false; return; }

    portalScreen.style.transition = 'opacity 200ms ease-in-out';
    portalScreen.style.opacity    = '0';

    setTimeout(() => {
      portalScreen.classList.remove('visible');
      portalScreen.style.opacity    = '';
      portalScreen.style.transition = '';

      gameScreen.classList.add('visible');
      gameScreen.style.opacity    = '0';
      gameScreen.style.transition = 'opacity 200ms ease-in-out';

      requestAnimationFrame(() => {
        gameScreen.style.opacity = '1';
        window.scrollTo(0, 0);
      });

      setTimeout(() => {
        gameScreen.style.transition = '';
        _isTransitioning = false;

        if (typeof startGameFromPortal === 'function') {
          startGameFromPortal(gameName);
        }
      }, 200);
    }, 200);
  }

  function navigateToPortal() {
    if (_isTransitioning) return;
    _isTransitioning = true;

    const portalScreen = document.getElementById('screen-portal');
    const gameScreen   = document.getElementById('screen-game');
    if (!portalScreen || !gameScreen) { _isTransitioning = false; return; }

    gameScreen.style.transition = 'opacity 200ms ease-in-out';
    gameScreen.style.opacity    = '0';

    setTimeout(() => {
      gameScreen.classList.remove('visible');
      gameScreen.style.opacity    = '';
      gameScreen.style.transition = '';

      refreshProfile();

      portalScreen.classList.add('visible');
      portalScreen.style.opacity    = '0';
      portalScreen.style.transition = 'opacity 200ms ease-in-out';

      requestAnimationFrame(() => {
        portalScreen.style.opacity = '1';
        window.scrollTo(0, 0);
      });

      setTimeout(() => {
        portalScreen.style.transition = '';
        _isTransitioning = false;
      }, 200);
    }, 200);
  }

  // ──────────────────────────────────────────────
  // プロフィール更新（ゲーム画面から戻った後に呼ぶ）
  // ──────────────────────────────────────────────
  function refreshProfile() {
    const p = readProfile();

    const rankEl  = document.getElementById('portal-rec-rank');
    const countEl = document.getElementById('portal-rec-count');
    const ptEl    = document.getElementById('portal-rec-pt');
    const barEl   = document.getElementById('portal-rec-bar');

    if (rankEl)  rankEl.textContent  = `${p.rank}`;
    if (countEl) countEl.textContent = `${p.clearedGames.length} / 6`;
    if (ptEl)    ptEl.textContent    = `${p.totalPt}`;
    if (barEl)   barEl.style.width   = `${p.barPercent}%`;
  }

  // ──────────────────────────────────────────────
  // 公開ヘルパー
  // ──────────────────────────────────────────────
  function isEnabled() {
    return !!document.getElementById('screen-portal');
  }

  /** Phase 2以降で接続 */
  function markGameCleared(gameId) {
    console.log('[Portal] markGameCleared:', gameId);
  }

  // ──────────────────────────────────────────────
  // 初期化
  // ──────────────────────────────────────────────
  function init() {
    if (!isEnabled()) return;

    loadTheme();
    buildPortalScreen();

    // 戻るボタン（#screen-game 内）
    const backBtn = document.getElementById('back-to-portal');
    if (backBtn) {
      backBtn.addEventListener('click', () => Portal.navigateToPortal());
    }

    console.log('[Portal] Initialized v2 — 6つのAI体験');
  }

  // ── 公開API ──
  return {
    init,
    isEnabled,
    navigateToPortal,
    navigateToGame,
    markGameCleared,
    refreshProfile,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Portal.init();
});

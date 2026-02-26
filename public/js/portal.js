/**
 * portal.js — RPGポータル画面管理
 * AI冒険の書 Phase 1
 *
 * 責務:
 * 1. ポータル画面のDOM構築
 * 2. ゲーム選択 → 偉人ゲーム起動の制御
 * 3. 偉人ゲーム → ポータル復帰の制御
 * 4. 成長プロフィール（LocalStorage連携）
 * 5. リセット機能
 */
const Portal = (() => {
  // ── 定数 ──
  const STORAGE_KEY = 'portal_adventure_record';
  const GAMES = [
    { id: 'sage',     icon: '🏰', rpgName: '魔導師に相談する',     realName: '偉人とともに考える',           desc: '偉人の知恵を借りて、正解のない問いに挑もう',       time: '5〜7分', tier: 1, enabled: true  },
    { id: 'dungeon',  icon: '⚔️', rpgName: 'ダンジョンに潜る',     realName: 'プロンプトエンジニアリング学習', desc: 'AIへの効果的な伝え方を学ぼう',                     time: '4〜6分', tier: 2, enabled: false },
    { id: 'village',  icon: '🏘️', rpgName: '町人の悩みを聞く',     realName: 'クリックAI',                   desc: 'クリックだけでAIと一緒に問題解決',                 time: '3〜5分', tier: 2, enabled: false },
    { id: 'heroine',  icon: '💕', rpgName: 'ヒロインに会いに行く', realName: 'ツンデレAI',                   desc: 'AIキャラとの自然な対話を楽しもう',                 time: '3〜5分', tier: 3, enabled: false },
    { id: 'book',     icon: '📖', rpgName: '古い本を読む',         realName: 'プロンプト図鑑',               desc: 'AIプロンプトの多様な世界を鑑賞しよう',             time: '2〜4分', tier: 3, enabled: false },
  ];

  let _isTransitioning = false;
  let _record = null; // { level: 0, cleared: {} }

  // ── LocalStorage ──
  function loadRecord() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      _record = data ? JSON.parse(data) : { level: 0, cleared: {} };
    } catch {
      _record = { level: 0, cleared: {} };
    }
    return _record;
  }

  function saveRecord() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_record));
    } catch (e) {
      console.warn('[Portal] LocalStorage save failed', e);
    }
  }

  /** ゲームクリア時に外部から呼び出される */
  function markGameCleared(gameId) {
    if (!_record) loadRecord();
    if (!_record.cleared[gameId]) {
      _record.cleared[gameId] = new Date().toISOString();
      _record.level = Object.keys(_record.cleared).length;
      saveRecord();
    }
  }

  function resetRecord() {
    _record = { level: 0, cleared: {} };
    saveRecord();
  }

  // ── ポータルが有効か ──
  function isEnabled() {
    return !!document.getElementById('screen-portal');
  }

  // ── DOM構築 ──
  function buildPortalScreen() {
    loadRecord();
    const portalEl = document.getElementById('screen-portal');
    if (!portalEl) return;

    portalEl.innerHTML = buildPortalHTML();

    setupEventListeners();

    portalEl.classList.add('visible');
  }

  function buildPortalHTML() {
    return `
      <!-- PortalHeader -->
      <header class="portal-header">
        <h1 class="portal-title">⚔️ AI冒険の書 ⚔️</h1>
        <p class="portal-subtitle">AIとの冒険が、ここから始まる</p>
        <div class="portal-divider"></div>
      </header>

      <!-- RecommendedRouteBanner -->
      <section class="portal-recommend">
        <div class="recommend-banner" id="recommendBanner">
          <div class="recommend-banner-header">
            <span class="recommend-banner-icon">💡</span>
            <span class="recommend-banner-text">初めての方はこちら</span>
            <span class="recommend-banner-arrow">▼</span>
          </div>
          <div class="recommend-body">
            <div class="recommend-body-inner">
              <p class="recommend-description">
                初めて遊ぶ方におすすめの順番をご案内します。<br>
                じっくり考えたい方も、サクッと体験したい方も楽しめます。
              </p>
              <div class="recommend-route-list">
                <div class="recommend-route-item">
                  <span class="recommend-route-number">1</span>
                  <span>🏰 魔導師に相談する（5〜7分）</span>
                </div>
                <div class="recommend-route-item">
                  <span class="recommend-route-number">2</span>
                  <span>⚔️ ダンジョンに潜る（準備中）</span>
                </div>
                <div class="recommend-route-item">
                  <span class="recommend-route-number">3</span>
                  <span>🏘️ 町人の悩みを聞く（準備中）</span>
                </div>
              </div>
              <button class="recommend-start-btn" id="recommendStartBtn">
                おすすめルートで冒険を始める
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- GameSelectionCards -->
      <section class="portal-games">
        <p class="portal-games-title">── 冒険の行き先を選べ ──</p>
        <div class="portal-games-grid">
          ${GAMES.map((g, i) => g.enabled ? buildActiveCard(g, i) : buildDisabledCard(g, i)).join('')}
        </div>
      </section>

      <!-- GrowthProfilePanel -->
      <section class="portal-profile">
        <div class="rpg-window profile-panel">
          <div class="profile-header">
            <span class="profile-header-icon">📊</span>
            <span class="profile-header-title">冒険の記録</span>
          </div>
          ${buildLevelDisplay()}
          <div class="profile-games-list">
            ${GAMES.map(g => buildProfileGameItem(g)).join('')}
          </div>
        </div>
      </section>

      <!-- ResetButton -->
      <div class="portal-reset">
        <button class="reset-btn" id="resetBtn">
          <span>🔄</span>
          <span>冒険の記録をリセット</span>
        </button>
      </div>

      <!-- ResetDialog -->
      <div class="dialog-overlay" id="resetDialog">
        <div class="dialog-box">
          <div class="dialog-title">⚠️ リセット確認</div>
          <div class="dialog-message">
            冒険の記録をすべてリセットします。<br>
            この操作は取り消せません。
          </div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn-cancel" id="resetCancelBtn">やめる</button>
            <button class="dialog-btn dialog-btn-confirm" id="resetConfirmBtn">リセットする</button>
          </div>
        </div>
      </div>
    `;
  }

  function buildActiveCard(game, index) {
    return `
      <div class="game-card stagger-${index + 1}" data-game-id="${game.id}" data-tier="${game.tier}">
        <div class="game-card-icon">${game.icon}</div>
        <div class="game-card-rpg-name">${game.rpgName}</div>
        <div class="game-card-real-name">${game.realName}</div>
        <div class="game-card-desc">${game.desc}</div>
        <div class="game-card-meta">
          <span class="game-card-tier tier-active">★ メイン</span>
          <span class="game-card-time">⏱ ${game.time}</span>
        </div>
      </div>
    `;
  }

  function buildDisabledCard(game, index) {
    return `
      <div class="game-card-disabled stagger-${index + 1}">
        <span class="game-card-lock">🔒</span>
        <span class="tooltip">このゲームは準備中です</span>
        <div class="game-card-icon">${game.icon}</div>
        <div class="game-card-rpg-name">${game.rpgName}</div>
        <div class="game-card-real-name">${game.realName}</div>
        <div class="game-card-desc">${game.desc}</div>
        <div class="game-card-meta">
          <span class="game-card-tier">Tier ${game.tier}</span>
          <span class="game-card-time">⏱ ${game.time}</span>
        </div>
        <div class="game-card-status">― 準備中 ―</div>
      </div>
    `;
  }

  function buildLevelDisplay() {
    const level = _record ? _record.level : 0;
    const pct = (level / 5) * 100;
    return `
      <div class="profile-level">
        <div>
          <div class="profile-level-label">冒険者レベル</div>
          <div>
            <span class="profile-level-value" id="portalLevelValue">${level}</span>
            <span class="profile-level-max">/ 5</span>
          </div>
        </div>
        <div class="profile-level-bar">
          <div class="profile-level-bar-fill" id="portalLevelBar" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }

  function buildProfileGameItem(game) {
    const isCleared = _record && _record.cleared && _record.cleared[game.id];
    const statusClass = isCleared ? 'cleared' : 'not-played';
    const statusText = isCleared ? '✓' : '−';
    const nameClass = isCleared || game.enabled ? '' : 'disabled';
    return `
      <div class="profile-game-item">
        <div class="profile-game-status ${statusClass}">${statusText}</div>
        <span class="profile-game-name ${nameClass}">${game.icon} ${game.rpgName}</span>
      </div>
    `;
  }

  // ── イベントリスナー ──
  function setupEventListeners() {
    // おすすめルートバナー展開/折りたたみ
    const banner = document.getElementById('recommendBanner');
    if (banner) {
      banner.addEventListener('click', (e) => {
        // 内部ボタンクリック時は展開トグルしない
        if (e.target.id === 'recommendStartBtn') return;
        banner.classList.toggle('expanded');
      });
    }

    // おすすめルート開始ボタン
    const startBtn = document.getElementById('recommendStartBtn');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectGame('sage');
      });
    }

    // ゲーム選択カード
    document.querySelectorAll('#screen-portal .game-card[data-game-id]').forEach(card => {
      card.addEventListener('click', () => {
        selectGame(card.dataset.gameId);
      });
    });

    // リセットボタン
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.addEventListener('click', showResetDialog);

    const cancelBtn = document.getElementById('resetCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', hideResetDialog);

    const confirmBtn = document.getElementById('resetConfirmBtn');
    if (confirmBtn) confirmBtn.addEventListener('click', executeReset);
  }

  // ── ゲーム選択 ──
  function selectGame(gameId) {
    if (_isTransitioning) return;

    const card = document.querySelector(`#screen-portal .game-card[data-game-id="${gameId}"]`);
    if (!card) return;

    // 選択フラッシュ
    card.classList.add('selected');

    setTimeout(() => {
      card.classList.remove('selected');
      navigateToGame(gameId);
    }, 300);
  }

  // ── 画面遷移 ──
  function navigateToGame(gameId) {
    if (_isTransitioning) return;
    _isTransitioning = true;

    const portalScreen = document.getElementById('screen-portal');
    const gameScreen = document.getElementById('screen-game');

    // フェードアウト: ポータル
    portalScreen.style.transition = 'opacity 200ms ease-in-out';
    portalScreen.style.opacity = '0';

    setTimeout(() => {
      portalScreen.classList.remove('visible');
      portalScreen.style.opacity = '';
      portalScreen.style.transition = '';

      // フェードイン: ゲーム
      gameScreen.classList.add('visible');
      gameScreen.style.opacity = '0';
      gameScreen.style.transition = 'opacity 200ms ease-in-out';

      requestAnimationFrame(() => {
        gameScreen.style.opacity = '1';
        window.scrollTo(0, 0);
      });

      setTimeout(() => {
        gameScreen.style.transition = '';
        _isTransitioning = false;

        // 偉人ゲーム起動（script.jsの新関数を呼び出し）
        if (typeof startGameFromPortal === 'function') {
          const mode = ModeManager.getMode();
          startGameFromPortal(mode);
        }
      }, 200);
    }, 200);
  }

  function navigateToPortal() {
    if (_isTransitioning) return;
    _isTransitioning = true;

    const portalScreen = document.getElementById('screen-portal');
    const gameScreen = document.getElementById('screen-game');

    // フェードアウト: ゲーム
    gameScreen.style.transition = 'opacity 200ms ease-in-out';
    gameScreen.style.opacity = '0';

    setTimeout(() => {
      gameScreen.classList.remove('visible');
      gameScreen.style.opacity = '';
      gameScreen.style.transition = '';

      // プロフィール更新（クリアされている可能性）
      refreshProfile();

      // フェードイン: ポータル
      portalScreen.classList.add('visible');
      portalScreen.style.opacity = '0';
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

  // ── プロフィール更新 ──
  function refreshProfile() {
    loadRecord();
    const levelValue = document.getElementById('portalLevelValue');
    const levelBar = document.getElementById('portalLevelBar');
    if (levelValue) levelValue.textContent = _record.level;
    if (levelBar) levelBar.style.width = `${(_record.level / 5) * 100}%`;

    // ゲームリストの状態更新
    const list = document.querySelector('.profile-games-list');
    if (list) {
      list.innerHTML = GAMES.map(g => buildProfileGameItem(g)).join('');
    }
  }

  // ── リセット ──
  function showResetDialog() {
    const dialog = document.getElementById('resetDialog');
    if (dialog) dialog.classList.add('active');
  }

  function hideResetDialog() {
    const dialog = document.getElementById('resetDialog');
    if (dialog) dialog.classList.remove('active');
  }

  function executeReset() {
    resetRecord();
    refreshProfile();
    hideResetDialog();
    console.log('[Portal] Reset complete');
  }

  // ── 初期化 ──
  function init() {
    if (!isEnabled()) return;
    buildPortalScreen();

    // 戻るボタン
    const backBtn = document.getElementById('back-to-portal');
    if (backBtn) {
      backBtn.addEventListener('click', () => Portal.navigateToPortal());
    }

    console.log('[Portal] Initialized');
  }

  // 公開API
  return {
    init,
    isEnabled,
    navigateToPortal,
    navigateToGame,
    markGameCleared,
    refreshProfile,
  };
})();

// DOMContentLoaded で初期化
document.addEventListener('DOMContentLoaded', () => {
  Portal.init();
});

// ResultCard — クリア演出 v2.0
// B1〜B11 テキスト変更 + B4 Canvas紙吹雪パーティクル差し替え
const ResultCard = (() => {
  // --- 内部状態 ---
  let canvas, ctx;
  const particles = [];
  let rafId = null;
  let resizeHandler = null;

  // --- Canvas パーティクル（紙吹雪 + スパーク）---
  function canvasLoop(now) {
    if (particles.length === 0) {
      rafId = null;
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const elapsed = (now - p.startTime) / 1000; // 秒
      const raw = elapsed / (p.life / 1000);
      if (raw >= 1) { particles.splice(i, 1); continue; }

      // 位置: 重力シミュレーション + sin横揺れ
      const x = p.cx + p.vx * elapsed
                + Math.sin(elapsed * p.swayFreq) * p.swayAmp;
      const y = p.cy + p.vy * elapsed + 0.5 * p.ay * elapsed * elapsed;

      const alpha = 1 - raw; // 線形フェードアウト
      const angle = p.rotation + p.rotSpeed * elapsed;
      const s = p.size;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = p.color;

      if (p.shape === 'square') {
        ctx.fillRect(-s / 2, -s / 2, s, s);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // triangle
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    rafId = requestAnimationFrame(canvasLoop);
  }

  function createParticleBurst(originX, originY, count) {
    const cx = canvas.width  * (originX / 100);
    const cy = canvas.height * (originY / 100);

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        // 形状: 60% 四角、25% 丸、15% 三角
        const sr = Math.random();
        const shape = sr < 0.60 ? 'square' : sr < 0.85 ? 'circle' : 'triangle';

        // 色: 偉人アクセント #f59e0b、ゴールド #ffd700、白 #ffffff
        const cr = Math.random();
        const color = cr < 0.40 ? '#f59e0b' : cr < 0.75 ? '#ffd700' : '#ffffff';

        particles.push({
          cx,
          cy,
          vx:       (Math.random() - 0.5) * 200,
          vy:       -(300 + Math.random() * 300),  // 初速Y: -300〜-600（上向き）
          ay:        700 + Math.random() * 200,     // 重力 700〜900 px/s²
          swayFreq:  2   + Math.random() * 2,       // 2〜4 Hz
          swayAmp:   30  + Math.random() * 30,      // 30〜60 px
          size:      4   + Math.random() * 6,        // 4〜10 px
          shape,
          color,
          rotation:  Math.random() * Math.PI * 2,
          rotSpeed:  (Math.random() - 0.5) * 8,    // -4〜4 rad/s
          life:      800 + Math.random() * 700,     // 0.8〜1.5 秒 (ms)
          startTime: performance.now(),
        });

        if (!rafId) rafId = requestAnimationFrame(canvasLoop);
      }, i * 15);
    }
  }

  // --- public API ---
  return {
    /**
     * クリア演出を開始する
     * @param {Object} params
     * @param {string} params.sageName      - 偉人名（例: "ソクラテス"）
     * @param {string} params.sageIcon      - 偉人アイコン（例: "🏛"）
     * @param {string} params.questionType  - 問いの型（例: "型3"）、取得不可なら "—"
     * @param {number} params.dialogueCount - 対話回数
     * @param {number} params.currentLevel  - 現在のレベル（クリア前）
     * @param {number} params.gamesCleared  - クリア済みゲーム数（クリア前）
     * @param {string} [params.gameName]    - ゲーム名（省略時: "🏛️ 偉人とともに考える"）
     */
    show(params) {
      // B6: ゲーム名（script.js が未対応の間はデフォルト値を使用）
      const gameName = params.gameName || '🏛️ 偉人とともに考える';

      // LocalStorage更新（演出表示前）
      const profileKey = 'ai-experience-profile';
      let profile;
      try {
        profile = JSON.parse(localStorage.getItem(profileKey) || 'null') || { rank: 0, totalPt: 0, gamesCleared: 0, clearedGames: [], achievements: [] };
      } catch (e) {
        profile = { rank: 0, totalPt: 0, gamesCleared: 0, clearedGames: [], achievements: [] };
      }
      profile.rank = (profile.rank || 0) + 1;
      profile.totalPt = (profile.totalPt || 0) + 100;
      profile.gamesCleared = (profile.gamesCleared || 0) + 1;
      if (!Array.isArray(profile.clearedGames)) profile.clearedGames = [];
      if (!profile.clearedGames.includes('sage')) {
        profile.clearedGames.push('sage');
      }
      try { localStorage.setItem(profileKey, JSON.stringify(profile)); } catch (e) { /* ignore */ }

      // CSS動的注入
      if (!document.getElementById('result-card-styles')) {
        const style = document.createElement('style');
        style.id = 'result-card-styles';
        style.textContent = `
#clear-overlay {
  position: fixed; inset: 0;
  background: rgba(10,14,26,.95);
  z-index: 100;
  display: flex; align-items: center; justify-content: center; flex-direction: column;
  opacity: 0; pointer-events: none;
  transition: opacity .5s ease;
}
#clear-overlay.active { opacity: 1; pointer-events: auto; }

#quest-clear-banner {
  text-align: center;
  opacity: 0;
  transform: scale(.85) translateY(-12px);
  transition: opacity .5s ease, transform .5s ease;
}
#quest-clear-banner.visible { opacity: 1; transform: scale(1) translateY(0); }

.banner-area-name {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .9rem; color: rgba(212,168,67,.6);
  letter-spacing: .15em; margin-bottom: 6px;
}
.banner-quest-clear {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 2.6rem; color: #d4a843;
  text-shadow: 0 0 24px rgba(212,168,67,.6), 0 0 48px rgba(212,168,67,.25);
  line-height: 1;
}
@keyframes char-glow {
  0%   { opacity: 0; transform: scale(.7); }
  60%  { opacity: 1; transform: scale(1.08); filter: drop-shadow(0 0 8px #d4a843); }
  100% { opacity: 1; transform: scale(1); filter: none; }
}
.banner-quest-clear .char {
  display: inline-block; opacity: 0;
  animation: char-glow .45s ease-out forwards;
}
.banner-line {
  width: 180px; height: 1px;
  background: linear-gradient(to right, transparent, #d4a843, transparent);
  margin: 10px auto 0; opacity: 0;
  transition: opacity .4s ease .3s;
}
#quest-clear-banner.visible .banner-line { opacity: 1; }

#exp-section {
  margin-top: 28px; width: 280px; text-align: center;
  opacity: 0; transform: translateY(10px);
  transition: opacity .5s ease, transform .5s ease;
}
#exp-section.visible { opacity: 1; transform: translateY(0); }

.exp-label {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .8rem; color: rgba(255,255,255,.45);
  letter-spacing: .12em; margin-bottom: 8px;
}
.exp-gain-num {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 1.5rem; color: #d4a843; margin-bottom: 12px;
}
.level-bar-wrap { display: flex; align-items: center; gap: 10px; justify-content: center; }
.rc-level-label {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .85rem; color: rgba(255,255,255,.45); min-width: 28px;
}
.level-bar-bg {
  flex: 1; height: 8px;
  background: rgba(255,255,255,.08);
  border-radius: 4px; overflow: hidden;
  border: 1px solid rgba(255,255,255,.06);
}
.level-bar-fill {
  height: 100%; width: 0%;
  background: linear-gradient(to right, rgba(212,168,67,.6), #f0d48a);
  border-radius: 4px; box-shadow: 0 0 8px rgba(212,168,67,.4);
  transition: width 1.2s cubic-bezier(.4,0,.2,1);
}

#level-up-flash {
  position: absolute; inset: 0; z-index: 101;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 4px;
  opacity: 0; pointer-events: none;
}
#level-up-flash.active { animation: lvup-flash .6s ease-out forwards; }
@keyframes lvup-flash {
  0%   { opacity: 0; background: rgba(212,168,67,.0); }
  20%  { opacity: 1; background: rgba(212,168,67,.12); }
  60%  { opacity: 1; background: rgba(212,168,67,.04); }
  100% { opacity: 0; background: rgba(212,168,67,.0); }
}
.lvup-text-main {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 2.2rem; color: #fff;
  text-shadow: 0 0 20px #d4a843, 0 0 40px #f0d48a;
}
.lvup-text-sub {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 1.1rem; color: #d4a843;
}

#result-wrapper {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(10,14,26,0.95);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity .5s ease;
}
#result-wrapper.visible { opacity: 1; pointer-events: auto; }

#rc-result-card {
  background: #0f1526;
  border: 1px solid rgba(212,168,67,.35);
  border-radius: 10px;
  padding: 26px 32px; width: 340px;
  position: relative;
  transform: translateY(14px);
  transition: transform .5s ease;
}
#result-wrapper.visible #rc-result-card { transform: translateY(0); }

.card-deco {
  position: absolute; font-size: .6rem;
  color: rgba(212,168,67,.45);
  font-family: 'Pixelify Sans', sans-serif;
}
.card-deco.tl { top: 7px; left: 9px; }
.card-deco.tr { top: 7px; right: 9px; }
.card-deco.bl { bottom: 7px; left: 9px; }
.card-deco.br { bottom: 7px; right: 9px; }

.card-header { text-align: center; margin-bottom: 16px; }
.card-area-badge {
  display: inline-block;
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .7rem; color: #0a0e1a;
  background: #d4a843;
  padding: 2px 10px; border-radius: 20px;
  margin-bottom: 6px; letter-spacing: .05em;
}
.card-title {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 1rem; color: #d4a843; display: block;
}

.card-level-section {
  background: rgba(212,168,67,.05);
  border: 1px solid rgba(212,168,67,.15);
  border-radius: 8px; padding: 12px 16px;
  margin: 14px 0;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: nowrap; gap: 8px;
}
.level-from-to {
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 1rem; color: #e0e0e0;
  white-space: nowrap; flex-shrink: 0;
}
.level-from-to .arrow { color: #d4a843; margin: 0 4px; }
.level-from-to .new-level { color: #d4a843; font-size: 1.2rem; }
.level-cleared-count {
  font-size: .75rem; color: rgba(255,255,255,.45);
  text-align: right; line-height: 1.5;
}
.level-cleared-count .cleared-num { color: #d4a843; font-weight: 700; }

.result-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
}
.result-row:last-of-type { border-bottom: none; }
.result-label { font-size: .72rem; color: rgba(212,168,67,.6); }
.result-value { font-size: .88rem; color: #e0e0e0; font-weight: 600; }

.btn-group { display: flex; flex-direction: column; gap: 8px; margin-top: 18px; }
.btn-primary {
  width: 100%; padding: 12px;
  background: #d4a843; color: #0a0e1a;
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .95rem; font-weight: 700;
  border: none; border-radius: 8px; cursor: pointer;
  transition: opacity .2s, transform .1s;
}
.btn-primary:hover { opacity: .88; transform: scale(1.02); }
.btn-primary:active { transform: scale(.97); }
.btn-secondary {
  width: 100%; padding: 9px;
  background: transparent;
  border: 1px solid rgba(255,255,255,.12);
  color: rgba(255,255,255,.45);
  font-family: 'Pixelify Sans', sans-serif;
  font-size: .85rem; border-radius: 8px; cursor: pointer;
  transition: border-color .2s, color .2s;
}
.btn-secondary:hover { border-color: rgba(212,168,67,.4); color: #d4a843; }
        `;
        document.head.appendChild(style);
      }

      // DOM動的生成
      const now = new Date();
      const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} `
        + `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const lvFrom = params.currentLevel;
      const lvTo = params.currentLevel + 1;
      const clearedCount = params.gamesCleared + 1;

      const overlay = document.createElement('div');
      overlay.id = 'clear-overlay';
      overlay.innerHTML = `
        <div id="level-up-flash">
          <div class="lvup-text-main">RANK UP!</div>
          <div class="lvup-text-sub">Rank ${lvFrom}  →  Rank ${lvTo}</div>
        </div>
        <div id="quest-clear-banner">
          <div class="banner-area-name">${gameName} クリア</div>
          <div class="banner-quest-clear" id="rc-quest-clear-text"></div>
          <div class="banner-line"></div>
        </div>
        <div id="exp-section">
          <div class="exp-label">— 体験ptを獲得 —</div>
          <div class="exp-gain-num" id="rc-exp-counter">体験pt +0</div>
          <div class="level-bar-wrap">
            <span class="rc-level-label">Rank ${lvFrom}</span>
            <div class="level-bar-bg"><div class="level-bar-fill" id="rc-level-bar-fill"></div></div>
            <span class="rc-level-label">Rank ${lvTo}</span>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const wrapper = document.createElement('div');
      wrapper.id = 'result-wrapper';
      wrapper.innerHTML = `
        <div id="rc-result-card">
          <span class="card-deco tl">✦</span><span class="card-deco tr">✦</span>
          <span class="card-deco bl">✦</span><span class="card-deco br">✦</span>
          <div class="card-header">
            <span class="card-area-badge">COMPLETE</span>
            <span class="card-title">${gameName}</span>
          </div>
          <div class="card-level-section">
            <div class="level-from-to">Rank ${lvFrom} <span class="arrow">→</span> <span class="new-level">Rank ${lvTo}</span></div>
            <div class="level-cleared-count">クリア済み<br><span class="cleared-num">${clearedCount}</span> / 6 体験</div>
          </div>
          ${Array.isArray(params.details)
            ? params.details.map(d => `<div class="result-row"><span class="result-label">${d.label}</span><span class="result-value">${d.value}</span></div>`).join('')
            : `<div class="result-row"><span class="result-label">偉人</span><span class="result-value">${params.sageName} ${params.sageIcon}</span></div>
          <div class="result-row"><span class="result-label">問いの型</span><span class="result-value">${params.questionType}</span></div>
          <div class="result-row"><span class="result-label">対話の深さ</span><span class="result-value">${params.dialogueCount} 回</span></div>`}
          <div class="result-row"><span class="result-label">達成日時</span><span class="result-value">${dateStr}</span></div>
          <div class="btn-group">
            <button class="btn-primary" id="rc-portal-btn">🏠 トップに戻る</button>
            <button class="btn-secondary" id="rc-replay-btn">もう一度体験する</button>
          </div>
        </div>
      `;
      document.body.appendChild(wrapper);

      // Canvas取得（index.htmlに静的配置済み）
      canvas = document.getElementById('pcanvas');
      ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resizeHandler);

      // ボタン接続
      document.getElementById('rc-portal-btn').addEventListener('click', () => {
        ResultCard.cleanup();
        goHome();
      });
      document.getElementById('rc-replay-btn').addEventListener('click', () => {
        ResultCard.cleanup();
        startGame();
      });

      // 演出タイムライン
      // 0ms: オーバーレイ active化
      document.getElementById('clear-overlay').classList.add('active');

      // 300ms: COMPLETE!バナー visible（文字が1つずつ char-glow、60ms間隔）[B1]
      setTimeout(() => {
        const wrap = document.getElementById('rc-quest-clear-text');
        wrap.innerHTML = '';
        [...'COMPLETE!'].forEach((ch, i) => {
          const s = document.createElement('span');
          s.className = 'char';
          s.textContent = ch === ' ' ? '\u00A0' : ch;
          s.style.animationDelay = (i * 60) + 'ms';
          wrap.appendChild(s);
        });
        document.getElementById('quest-clear-banner').classList.add('visible');
      }, 300);

      // 1000ms: 体験pt獲得 visible + カウントアップ(0→100, 800ms) + レベルバー(200ms後に width:100%) [B2]
      setTimeout(() => {
        document.getElementById('exp-section').classList.add('visible');
        const el = document.getElementById('rc-exp-counter');
        let v = 0;
        const target = 100;
        const inc = target / (800 / 16);
        const t = setInterval(() => {
          v = Math.min(v + inc, target);
          el.textContent = '体験pt +' + Math.floor(v);
          if (v >= target) clearInterval(t);
        }, 16);
        setTimeout(() => {
          document.getElementById('rc-level-bar-fill').style.width = '100%';
        }, 200);
      }, 1000);

      // 2000ms: RANK UPフラッシュ active（700ms後にremove）[B3]
      setTimeout(() => {
        const f = document.getElementById('level-up-flash');
        f.classList.add('active');
        setTimeout(() => f.classList.remove('active'), 700);
      }, 2000);

      // 2200ms: Wave1（30粒）[B4]
      setTimeout(() => { createParticleBurst(50, 42, 30); }, 2200);

      // 2550ms: Wave2（20粒）[B4]
      setTimeout(() => { createParticleBurst(50, 42, 20); }, 2550);

      // 3400ms: オーバーレイ非active → 結果カード visible
      setTimeout(() => {
        document.getElementById('clear-overlay').classList.remove('active');
        document.getElementById('result-wrapper').classList.add('visible');
      }, 3400);
    },

    /**
     * クリア演出のDOMをクリーンアップする
     */
    cleanup() {
      const overlay = document.getElementById('clear-overlay');
      if (overlay) overlay.remove();
      const wrapper = document.getElementById('result-wrapper');
      if (wrapper) wrapper.remove();
      const styles = document.getElementById('result-card-styles');
      if (styles) styles.remove();
      particles.length = 0;
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
    }
  };
})();

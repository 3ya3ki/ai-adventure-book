/**
 * constellationIcon.js — 星座アイコン「思考の星座」
 * AI冒険の書
 * 6段階進化: Phase 0（空）〜 Phase 5（完全な星座）
 */

const ConstellationIcon = (() => {
  // 星の座標定義（SVG viewBox: 0 0 100 100）
  const STARS = [
    { x: 50, y: 22 },  // 星1: 上中央
    { x: 80, y: 50 },  // 星2: 右
    { x: 67, y: 82 },  // 星3: 右下
    { x: 33, y: 82 },  // 星4: 左下
    { x: 20, y: 50 },  // 星5: 左
  ];

  // 線の接続定義（隣り合う星を結ぶ）
  const LINES = [
    { from: 0, to: 1, cls: 'cs-line--1-2' },
    { from: 1, to: 2, cls: 'cs-line--2-3' },
    { from: 2, to: 3, cls: 'cs-line--3-4' },
    { from: 3, to: 4, cls: 'cs-line--4-5' },
    { from: 4, to: 0, cls: 'cs-line--5-1' },
  ];

  function _buildLinesHTML() {
    return LINES.map(({ from, to, cls }) => {
      const s = STARS[from];
      const e = STARS[to];
      return `<line class="cs-line ${cls}" x1="${s.x}" y1="${s.y}" x2="${e.x}" y2="${e.y}"/>`;
    }).join('\n    ');
  }

  function _buildStarsHTML() {
    return STARS.map((_, i) =>
      `<div class="cs-star cs-star--${i + 1}"></div>`
    ).join('\n  ');
  }

  /**
   * 星座アイコンのHTML文字列を返す
   * @param {number} phase  - 0〜5
   * @param {boolean} isLarge - true で 48px（偉人選択画面用）
   */
  function createHTML(phase = 0, isLarge = false) {
    const safePhase = Math.max(0, Math.min(5, Math.floor(phase)));
    const sizeClass = isLarge ? ' cs-icon--lg' : '';
    return `<div class="cs-icon${sizeClass}" data-phase="${safePhase}" role="img" aria-label="思考の星座 Phase ${safePhase}/5">
  <svg class="cs-lines" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${_buildLinesHTML()}
  </svg>
  ${_buildStarsHTML()}
</div>`;
  }

  /**
   * DOM要素として返す
   * @param {number} phase
   * @param {boolean} isLarge
   */
  function createElement(phase = 0, isLarge = false) {
    const tmp = document.createElement('div');
    tmp.innerHTML = createHTML(phase, isLarge).trim();
    return tmp.firstElementChild;
  }

  /**
   * ページ上の全 .cs-icon の data-phase を一括更新
   * @param {number} phase
   */
  function updateAllIcons(phase) {
    const safePhase = Math.max(0, Math.min(5, Math.floor(phase)));
    document.querySelectorAll('.cs-icon').forEach(el => {
      el.dataset.phase = safePhase;
    });
  }

  return { createHTML, createElement, updateAllIcons };
})();

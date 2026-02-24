/**
 * onboarding.js — 偉人選択画面の演出・チュートリアル
 * AI冒険の書
 */

const Onboarding = (() => {
  /**
   * 偉人カードの登場アニメーション
   * フェードイン + スライドアップ、各カード 0.1秒ずつ stagger
   * @param {Element} container - sage-grid または app 全体
   */
  function animateSageCards(container) {
    const cards = container.querySelectorAll('.sage-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(14px)';
      // レイアウト確定後にアニメーション開始
      setTimeout(() => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 100 + 60);
    });
  }

  /**
   * カード選択演出 → コールバック呼び出し
   * カードが光る → 300ms後にコールバック
   * @param {Element} cardEl
   * @param {Function} callback
   */
  function selectCard(cardEl, callback) {
    // 他カードを暗くする
    const allCards = document.querySelectorAll('.sage-card');
    allCards.forEach(c => {
      if (c !== cardEl) {
        c.style.transition = 'opacity 0.2s ease';
        c.style.opacity = '0.3';
        c.style.pointerEvents = 'none';
      }
    });

    // 選択カードを光らせる
    cardEl.style.transition = 'box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease';
    cardEl.style.boxShadow = '0 0 24px rgba(200, 162, 78, 0.75)';
    cardEl.style.borderColor = 'var(--border-gold)';
    cardEl.style.transform = 'scale(1.04) translateY(-2px)';

    setTimeout(() => {
      if (callback) callback();
    }, 300);
  }

  /**
   * 展示会モード用の簡易チュートリアル Tip
   * 偉人選択ヘッダー直後に挿入
   * @param {Element} headerEl - .sage-selection-header
   */
  function showExhibitionTip(headerEl) {
    if (!headerEl) return;
    const tip = document.createElement('div');
    tip.className = 'ob-tip';
    tip.innerHTML = `
      <span class="ob-tip-icon">✨</span>
      <span class="ob-tip-text">偉人を選んで対話を始めよう！AIはパートナーだよ。</span>
    `;
    // ヘッダーの直後に挿入
    headerEl.insertAdjacentElement('afterend', tip);
    // フェードイン
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tip.style.opacity = '1';
      });
    });
  }

  return { animateSageCards, selectCard, showExhibitionTip };
})();

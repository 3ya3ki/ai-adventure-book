/**
 * sageCollection.js — 偉人コレクション図鑑
 * AI冒険の書
 * LocalStorage にクリア済み偉人を保存・管理
 */

const SageCollection = (() => {
  const STORAGE_KEY = 'sage-collection';

  /** 保存済みコレクションを取得 */
  function getCollection() {
    return ErrorHandler.safeGet(STORAGE_KEY, {});
  }

  /**
   * クリア結果を保存
   * @param {string} sageId
   * @param {number|string} problemType
   * @param {number} turnCount
   */
  function saveResult(sageId, problemType, turnCount) {
    const col = getCollection();
    // 初回クリアのみ記録（上書きしない）
    if (!col[sageId]) {
      col[sageId] = {
        sageId,
        problemType: problemType || '?',
        turnCount,
        clearedAt: new Date().toLocaleString('ja-JP'),
      };
      ErrorHandler.safeSet(STORAGE_KEY, col);
    }
  }

  /**
   * 図鑑HTMLを生成（同期）
   * @param {Array} allSages - sages-core.json の sages 配列
   */
  function renderHTMLSync(allSages) {
    const col = getCollection();
    const clearedCount = Object.keys(col).length;

    const cards = allSages.map(s => {
      const cleared = col[s.id];
      if (cleared) {
        return `
          <div class="sc-card sc-card--cleared">
            <span class="sc-card-icon">${s.icon}</span>
            <div class="sc-card-name">${s.name}</div>
            <div class="sc-card-date">${cleared.clearedAt}</div>
          </div>`;
      } else {
        return `
          <div class="sc-card sc-card--locked">
            <span class="sc-card-icon sc-card-icon--locked">🔒</span>
            <div class="sc-card-name sc-card-name--locked">${s.name}</div>
          </div>`;
      }
    }).join('');

    return `
      <div class="sc-collection-screen">
        <div class="sc-header">
          <h2 class="sc-title">📕 偉人図鑑</h2>
          <p class="sc-subtitle">${clearedCount} / ${allSages.length} 人解放済み</p>
        </div>
        <div class="sc-grid">${cards}</div>
      </div>`;
  }

  return { getCollection, saveResult, renderHTMLSync };
})();

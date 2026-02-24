/**
 * sageProfileLoader.js — 偉人プロフィール読み込み
 * AI冒険の書
 * 2層構造: sages-core.json（選択画面用）+ sages-extended.json（API送信用）
 */

const SageProfileLoader = (() => {
  let coreCache = null;
  let extendedCache = null;

  // fetchエラー時のフォールバック（展示会5名のみ）
  const FALLBACK_CORE = [
    { id: 'jobs',     name: 'スティーブ・ジョブズ', nameEn: 'Steve Jobs',    icon: '💡', shortDesc: 'Appleを創り、世界を変えたイノベーター', era: '20世紀', field: 'テクノロジー・デザイン' },
    { id: 'socrates', name: 'ソクラテス',           nameEn: 'Socrates',      icon: '🏛', shortDesc: '「無知の知」を説いた古代の哲学者',    era: '古代ギリシャ',  field: '哲学・倫理学' },
    { id: 'nietzsche',name: 'ニーチェ',             nameEn: 'Nietzsche',     icon: '⚡', shortDesc: '常識を疑い、超人思想を説いた哲学者',  era: '19世紀',        field: '哲学・文学' },
    { id: 'ichiro',   name: 'イチロー',             nameEn: 'Ichiro',        icon: '⚾', shortDesc: '継続と準備で世界一になったプロ野球選手', era: '現代',        field: 'スポーツ・自己鍛錬' },
    { id: 'miyazaki', name: '宮崎駿',               nameEn: 'Hayao Miyazaki',icon: '🎬', shortDesc: '自然と人間の物語を描き続けるアニメの巨匠', era: '現代',      field: 'アニメ・映画' },
  ];

  async function loadCore() {
    if (coreCache) return coreCache;
    try {
      const res = await fetch('data/sages-core.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      coreCache = data.sages;
      return coreCache;
    } catch (e) {
      console.warn('[SageProfileLoader] sages-core.json 取得失敗。フォールバック使用。', e);
      return FALLBACK_CORE;
    }
  }

  async function loadExtended(sageId) {
    try {
      if (!extendedCache) {
        const res = await fetch('data/sages-extended.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        extendedCache = data.sages;
      }
      return extendedCache.find(s => s.id === sageId) || null;
    } catch (e) {
      console.warn('[SageProfileLoader] sages-extended.json 取得失敗。', e);
      return null;
    }
  }

  async function getMergedProfile(sageId) {
    const [coreList, extended] = await Promise.all([
      loadCore(),
      loadExtended(sageId),
    ]);
    const core = coreList.find(s => s.id === sageId) || null;
    if (!core) return null;
    return { ...core, ...(extended || {}) };
  }

  return { loadCore, loadExtended, getMergedProfile };
})();

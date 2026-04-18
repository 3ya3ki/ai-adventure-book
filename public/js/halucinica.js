// halucinica.js — ハルシニカ メインロジック
// Press Release Edition v3.0
// Phase 1: セキュリティ修正 (XSS, alert→toast, console.warn削除, clipboard catch)
// Phase 2: モバイル対応 (ボトムナビ, タップターゲット)
// Phase 3: SNSシェア強化 (LINE, 記事内シェア)

// ===== UTILS =====
function escapeAttr(s) { return String(s).replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ===== MOCK DB (populated by init) =====
let DB = {};

// ===== STATE =====
let S = {
  explored: 0,
  trail: [],
  cache: {},
  timer: 480,
  iv: null,
  history: []
};

// ===== INIT =====
async function initHalucinica() {
  // Load mock DB
  try {
    const res = await fetch('data/halucinica-mock.json');
    if (res.ok) {
      DB = sanitizeMockDB(await res.json());
    }
  } catch (e) {
    // Mock DB load failed, using empty DB
  }

  // Handle timer URL param
  const params = new URLSearchParams(window.location.search);
  const timerParam = params.get('timer');
  if (timerParam !== null) {
    const t = parseInt(timerParam, 10);
    if (!isNaN(t) && t >= 0) S.timer = t;
  }

  // Set dynamic date for "今日のハルシネーション"
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateStr = `📅 今日のハルシネーション　${month}月${day}日`;
  const introDate = document.getElementById('todayHallucinationIntro');
  const kwDate = document.getElementById('todayHallucinationKw');
  if (introDate) introDate.textContent = dateStr;
  if (kwDate) kwDate.textContent = dateStr;

  renderTodayItems();
  renderPortalCategories();

  // Enter key handlers
  const kwInput = document.getElementById('kwInput');
  if (kwInput) kwInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') searchFree();
  });
  const wikiSearch = document.getElementById('wikiSearch');
  if (wikiSearch) wikiSearch.addEventListener('keypress', e => {
    if (e.key === 'Enter') searchFromBar();
  });

  // Event delegation for data-navigate links (XSS-safe)
  const wikiMain = document.getElementById('wikiMain');
  if (wikiMain) {
    wikiMain.addEventListener('click', function(e) {
      const a = e.target.closest('a[data-navigate]');
      if (a) { e.preventDefault(); navigate(a.dataset.navigate); }
    });
  }

}

// ===== PREFETCH (裏で記事を事前生成してキャッシュ) =====
var _prefetchQueue = [];
var _prefetching = false;

function prefetchArticles(keywords) {
  keywords.forEach(function(kw) {
    if (!S.cache[kw] && !DB[kw] && _prefetchQueue.indexOf(kw) === -1) {
      _prefetchQueue.push(kw);
    }
  });
  _runPrefetch();
}

async function _runPrefetch() {
  if (_prefetching || _prefetchQueue.length === 0) return;
  _prefetching = true;

  while (_prefetchQueue.length > 0) {
    var kw = _prefetchQueue.shift();
    if (S.cache[kw] || DB[kw]) continue; // already cached

    try {
      var res = await fetch('/api/halucinica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw, context: [] }),
      });
      if (res.ok) {
        var data = sanitizeArticle(await res.json());
        if (data && data.title) {
          S.cache[kw] = data;
        }
      }
    } catch (e) {
      // prefetch failed silently
    }
  }
  _prefetching = false;
}

// ===== ARTICLE SANITIZER (XSS対策: onclick → data-navigate に変換) =====
function sanitizeContent(html) {
  // onclick → data-navigate 変換
  html = html.replace(/onclick="navigate\('([^']+)'\)"/g, 'data-navigate="$1"');
  // AI が生成する壊れたHTMLタグを修復 (< a → <a, < /a> → </a>)
  html = html.replace(/< a /g, '<a ');
  html = html.replace(/< \/a>/g, '</a>');
  html = html.replace(/< p /g, '<p ');
  html = html.replace(/< \/p>/g, '</p>');
  html = html.replace(/< span /g, '<span ');
  html = html.replace(/< \/span>/g, '</span>');
  return html;
}

function sanitizeArticle(item) {
  if (item.sections) {
    item.sections = item.sections.map(function(s) {
      return {
        heading: s.heading,
        content: sanitizeContent(s.content || ''),
        subsections: (s.subsections || []).map(function(sub) {
          return {
            heading: sub.heading,
            content: sanitizeContent(sub.content || '')
          };
        })
      };
    });
  }
  return item;
}

function sanitizeMockDB(db) {
  for (var key of Object.keys(db)) {
    db[key] = sanitizeArticle(db[key]);
  }
  return db;
}

// ===== SCREEN SWITCH =====
function sw(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  // モバイルボトムナビの表示制御（記事画面では非表示）
  const mbn = document.getElementById('mobileBottomNav');
  if (mbn) {
    mbn.style.display = (id === 'screen-article' || id === 'screen-write' || id === 'screen-donate' || id === 'screen-login') ? 'none' : '';
  }
}

function fmt(s) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function showLoading(t) {
  document.getElementById('ldText').textContent = t || 'ページを読み込んでいます…';
  document.getElementById('loading').classList.add('on');
}
function hideLoading() {
  document.getElementById('loading').classList.remove('on');
}

// ===== GAME FLOW =====
function startGame(initialKeyword) {
  S = { explored: 0, trail: [], cache: {}, timer: S.timer, iv: null, history: [] };

  // Reset timer display
  const el = document.getElementById('timerVal');
  if (el) {
    if (S.timer > 0) {
      el.textContent = fmt(S.timer);
      el.classList.remove('warn');
      el.parentElement.style.display = '';
    } else {
      el.parentElement.style.display = 'none';
    }
  }

  // intro画面の検索バーからキーワード付きで呼ばれた場合、直接検索
  if (initialKeyword && initialKeyword.trim()) {
    sw('screen-keyword');
    search(initialKeyword.trim());
  } else {
    sw('screen-keyword');
  }
}

// intro画面の検索バーから呼ばれる関数
function startGameFromIntro(inputEl) {
  var val = inputEl ? inputEl.value.trim() : '';
  startGame(val);
}

function startTimer() {
  if (S.timer <= 0) return; // timer disabled
  const el = document.getElementById('timerVal');
  if (S.iv) clearInterval(S.iv);
  S.iv = setInterval(() => {
    S.timer--;
    if (el) {
      el.textContent = fmt(S.timer);
      if (S.timer <= 60) el.classList.add('warn');
    }
    if (S.timer <= 0) { clearInterval(S.iv); endExplore(); }
  }, 1000);
}

// ===== SEARCH ENTRY POINTS =====
function search(kw) {
  if (!S.iv && S.timer > 0) startTimer();
  loadArticle(kw);
}

function searchFree() {
  const v = document.getElementById('kwInput').value.trim();
  if (!v) {
    const picks = ['ボカロ','VTuber','推し活','アニメ','ゲーム','音楽','マンガ','コスプレ','声優','同人誌','転生アイドル','ライブ遠征','聖地巡礼'];
    search(picks[Math.floor(Math.random() * picks.length)]);
    return;
  }
  if (!S.iv && S.timer > 0) startTimer();
  loadArticle(v);
}

function searchFromBar() {
  const v = document.getElementById('wikiSearch').value.trim();
  if (!v) return;
  loadArticle(v);
}

function newSearch() {
  sw('screen-keyword');
  document.getElementById('kwInput').value = '';
}

function navigate(kw) { loadArticle(kw); }

// ===== ARTICLE LOADING (3-layer fallback) =====
async function loadArticle(keyword) {
  showLoading(`「${keyword}」を検索中…`);

  // 10秒後: 生成中の案内トースト
  const loadingInfo = setTimeout(() => {
    showToast('⏳ 記事を生成中です…もう少しお待ちください', 5000);
  }, 10000);

  // 30秒後: 実際のタイムアウト
  const loadingTimeout = setTimeout(() => {
    hideLoading();
    showToast('⏱ 記事の生成がタイムアウトしました。もう一度お試しください。', 5000);
  }, 30000);

  // L1: In-memory cache
  if (S.cache[keyword]) {
    clearTimeout(loadingInfo);
    clearTimeout(loadingTimeout);
    hideLoading();
    _displayArticle(keyword, S.cache[keyword]);
    return;
  }

  // L2: API
  try {
    const contextPayload = S.history.slice(-10).map(h => ({
      title: h.title,
      summary: h.summary
    }));

    const res = await fetch('/api/halucinica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, context: contextPayload }),
    });

    if (res.ok) {
      const data = sanitizeArticle(await res.json());
      if (data && data.title) {
        S.cache[keyword] = data;
        clearTimeout(loadingInfo);
        clearTimeout(loadingTimeout);
        hideLoading();
        _displayArticle(keyword, data);
        return;
      }
    }
  } catch (e) {
    // API call failed, fall through to mock DB
  }

  // L3: Mock DB
  await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
  clearTimeout(loadingInfo);
  clearTimeout(loadingTimeout);
  hideLoading();

  const mockData = DB[keyword];
  if (mockData) {
    S.cache[keyword] = mockData;
    _displayArticle(keyword, mockData);
  } else {
    // L4: フォールバック（関連記事を表示）
    const fallbackKw = 'ボカロ';
    const fallback = DB[fallbackKw] || null;
    S.explored++;
    S.trail.push(keyword + '（リダイレクト）');
    S.history.push({ title: keyword, summary: '（リダイレクト）' });
    showToast(`「${keyword}」の記事はまだ存在しません。関連する記事を表示します。`, 4000);
    if (fallback) {
      S.cache[fallbackKw] = fallback;
      renderArticle(fallback);
    } else {
      // DB未ロード時のインライン記事（ブランク画面防止）
      renderArticle({
        title: keyword,
        infobox: null,
        toc: ['概要', '特徴', '影響'],
        sections: [
          { heading: '概要', content: '<p class="wiki-p">この記事はAIによるハルシネーション（架空の情報）です。<a class="int-link" data-navigate="AIハルシネーション">AIハルシネーション</a>とは、AIが事実のように見える架空の情報を生成する現象を指します。2023年に<a class="int-link" data-navigate="国際ハルシネーション学会">国際ハルシネーション学会</a>が発表した報告書によれば、この現象は年間47,382件の架空引用文献を生み出しているとされています（この数字自体もハルシネーションです）。</p>' },
          { heading: '特徴', content: '<p class="wiki-p">ハルシニカに掲載されるすべての情報は<a class="int-link" data-navigate="もっともらしい嘘">もっともらしい嘘</a>で構成されています。具体的な数値、実在しない研究者名、架空の論文などが含まれており、一見すると本物の百科事典のように見えます。</p>' },
          { heading: '影響', content: '<p class="wiki-p">ハルシニカは<a class="int-link" data-navigate="AIリテラシー">AIリテラシー</a>の向上に貢献しているとされています。AIが生成する情報を批判的に読む能力を養うための教育ツールとして、各地の機関で採用されています（この記述もハルシネーションです）。</p>' }
        ],
        footnotes: ['架空の引用1: 山田太郎著「ハルシネーション概論」嘘出版社, 2023, p.42', '架空の引用2: AIハルシネーション研究所「年次報告書2023」'],
        categories: ['AIハルシネーション', '架空百科事典', 'もっともらしい嘘'],
        related: ['AIハルシネーション', 'もっともらしい嘘', 'AIリテラシー', '国際ハルシネーション学会'],
        updated: '2024年4月1日 (嘘) 00:00 UTC'
      });
    }
    _updateCounters();
    sw('screen-article');
  }
}

function _displayArticle(keyword, data) {
  S.explored++;
  S.trail.push(keyword);
  // Store summary for context (first 60 chars of first section content, text only)
  let summary = '';
  if (data.sections && data.sections[0]) {
    const tmp = document.createElement('div');
    tmp.innerHTML = data.sections[0].content || '';
    summary = (tmp.textContent || '').slice(0, 60);
  }
  S.history.push({ title: data.title || keyword, summary });
  renderArticle(data);
  _updateCounters();
  _updateArticleShareButtons(data.title || keyword);
  sw('screen-article');

  // 記事の関連項目を裏でプリフェッチ（次のクリックを高速化）
  if (data.related && data.related.length > 0) {
    prefetchArticles(data.related.slice(0, 3));
  }
}

function _updateCounters() {
  document.getElementById('exploreCount').textContent = S.explored;
  document.getElementById('exitCount').textContent = S.explored;
}

// ===== 記事ページのシェアボタン更新 =====
function _updateArticleShareButtons(title) {
  const shareText = encodeURIComponent(
    `「${title}」— ハルシニカで発見した架空の記事。すべてAIのハルシネーションです。 #ハルシニカ`
  );
  const shareUrl = encodeURIComponent('https://uso.studymeter.jp/');

  const xBtn = document.getElementById('articleShareX');
  if (xBtn) {
    xBtn.onclick = function() {
      window.open(
        `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
        '_blank', 'noopener'
      );
    };
  }

  const lineBtn = document.getElementById('articleShareLine');
  if (lineBtn) {
    lineBtn.onclick = function() {
      window.open(
        `https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareText}`,
        '_blank', 'noopener'
      );
    };
  }
}

// ===== ARTICLE RENDER (data-navigate XSS-safe) =====
function renderArticle(d) {
  // Breadcrumb
  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = S.trail.map((t, i) => {
    const sep = i < S.trail.length - 1
      ? ' <span style="color:#72777d;margin:0 .2rem;">›</span> '
      : '';
    return `<span>${escapeAttr(t)}</span>${sep}`;
  }).join('');

  // Sidebar (infobox)
  const sb = document.getElementById('wikiSidebar');
  let ibHtml = '';
  if (d.infobox) {
    const ib = d.infobox;
    ibHtml = `<div class="infobox">
      <div class="infobox-header">${ib.header || ''}</div>
      <div class="infobox-image">${ib.image || ''}</div>
      <table>${(ib.fields || []).map(f => `<tr><td>${f[0] || ''}</td><td>${f[1] || ''}</td></tr>`).join('')}</table>
    </div>`;
  }
  sb.innerHTML = ibHtml;

  // Main content
  const main = document.getElementById('wikiMain');
  let html = '';

  html += `<h1 class="article-title">${escapeAttr(d.title || '')}</h1>`;

  html += `<div class="wiki-warning"><strong>⚠ ハルシニカの記事:</strong> この記事に記載されている情報はすべてAIによるハルシネーション（架空の情報）です。事実は含まれていません。</div>`;

  if (d.toc) {
    html += `<div class="wiki-toc"><div class="toc-title">目次</div><ol>${d.toc.map((t, i) => `<li><a href="javascript:void(0)">${i + 1} ${escapeAttr(t)}</a></li>`).join('')}</ol></div>`;
  }

  (d.sections || []).forEach(sec => {
    html += `<div class="wiki-section"><h2 class="wiki-h2">${escapeAttr(sec.heading || '')}</h2>`;
    if (sec.content) html += sec.content;
    if (sec.subsections) {
      sec.subsections.forEach(sub => {
        html += `<h3 class="wiki-h3">${escapeAttr(sub.heading || '')}</h3>${sub.content || ''}`;
      });
    }
    html += '</div>';
  });

  if (d.related) {
    // XSS-safe: data-navigate + event delegation (see initHalucinica)
    html += `<div class="wiki-related"><h2 class="rel-title">関連項目</h2><ul>${d.related.map(r => {
      const exists = DB[r] || S.cache[r];
      return `<li><a class="int-link ${exists ? '' : 'new-article'}" data-navigate="${escapeAttr(r)}" href="javascript:void(0)">${escapeAttr(r)}</a></li>`;
    }).join('')}</ul></div>`;
  }

  if (d.footnotes) {
    html += `<div class="wiki-footnotes"><div class="fn-title">脚注</div><ol>${d.footnotes.map(f => `<li>${f}</li>`).join('')}</ol></div>`;
  }

  if (d.categories) {
    html += `<div class="wiki-categories"><span class="cat-label">カテゴリ:</span>${d.categories.map(c => `<a href="javascript:void(0)">${escapeAttr(c)}</a>`).join(' | ')}</div>`;
  }

  if (d.updated) {
    html += `<div class="wiki-updated">このページの最終更新日時は ${escapeAttr(d.updated)} です。</div>`;
  }

  html += '<div style="height:60px;"></div>';
  main.innerHTML = html;
  window.scrollTo(0, 0);
}

// ===== END / RESET =====
function endExplore() {
  if (S.iv) clearInterval(S.iv);
  const trail = document.getElementById('endTrail');

  // Calculate stats
  const timeSpent = 480 - S.timer;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const timeStr = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;

  trail.innerHTML = '';

  // Stats section
  trail.innerHTML += `<div class="trail-stats">
    <div class="trail-stat"><span class="stat-num">${S.explored}</span><span class="stat-label">記事を探索</span></div>
    <div class="trail-stat"><span class="stat-num">${escapeAttr(timeStr)}</span><span class="stat-label">探索時間</span></div>
  </div>`;

  // Trail section
  trail.innerHTML += `<div class="trail-label">探索の軌跡</div>`;
  S.trail.forEach((t, i) => {
    const arrow = i > 0 ? '<span class="arrow">→</span>' : '';
    trail.innerHTML += `<div class="trail-item">${arrow}${escapeAttr(t)}</div>`;
  });

  // Share section (DOM-safe construction)
  const shareText = `ハルシニカで${S.explored}件の嘘の記事を探索しました！すべてAIのハルシネーションでした… #ハルシニカ`;
  const shareUrl = 'https://uso.studymeter.jp/';
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareSection = document.createElement('div');
  shareSection.className = 'end-share';

  const shareLabel = document.createElement('div');
  shareLabel.className = 'share-label';
  shareLabel.textContent = 'この体験をシェア';
  shareSection.appendChild(shareLabel);

  const shareBtns = document.createElement('div');
  shareBtns.className = 'share-btns';

  // X (Twitter) ボタン
  const xLink = document.createElement('a');
  xLink.className = 'share-btn share-x';
  xLink.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  xLink.target = '_blank';
  xLink.rel = 'noopener';
  xLink.textContent = '𝕏 でシェア';
  shareBtns.appendChild(xLink);

  // LINE ボタン
  const lineLink = document.createElement('a');
  lineLink.className = 'share-btn share-line';
  lineLink.href = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;
  lineLink.target = '_blank';
  lineLink.rel = 'noopener';
  lineLink.textContent = 'LINE';
  shareBtns.appendChild(lineLink);

  // コピーボタン（Clipboard API with catch）
  const copyBtn = document.createElement('button');
  copyBtn.className = 'share-btn share-copy';
  copyBtn.textContent = 'リンクをコピー';
  copyBtn.addEventListener('click', function() {
    copyShareText(copyBtn, `${shareText} ${shareUrl}`);
  });
  shareBtns.appendChild(copyBtn);

  shareSection.appendChild(shareBtns);

  // Insert share section after trail in the end screen
  const endScreen = document.getElementById('screen-end');
  const existingShare = endScreen.querySelector('.end-share');
  if (existingShare) existingShare.remove();

  const endNote = endScreen.querySelector('.end-note');
  endNote.parentNode.insertBefore(shareSection, endNote);

  sw('screen-end');
}

// ===== クリップボードコピー (エラーハンドリング付き) =====
function copyShareText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'コピーしました！';
    setTimeout(() => { btn.textContent = 'リンクをコピー'; }, 2000);
  }).catch(() => {
    showToast('コピーに失敗しました。URLを手動でコピーしてください。', 4000);
  });
}

function resetGame() { startGame(); }

function goPortal() {
  if (S.iv) clearInterval(S.iv);
  window.location.href = 'index.html';
}

// ===== TOAST =====
let _toastTimer = null;
function showToast(msg, ms) {
  ms = ms || 3500;
  const el = document.getElementById('haluToast');
  if (!el) return;
  el.textContent = msg;
  if (_toastTimer) clearTimeout(_toastTimer);
  el.classList.add('show');
  _toastTimer = setTimeout(() => { el.classList.remove('show'); _toastTimer = null; }, ms);
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const PORTAL_CATEGORIES = [
  'ボカロ', 'VTuber', '推し活', 'アニメ', 'ゲーム', '音楽',
  'マンガ', 'コスプレ', '声優', '同人誌', 'ラノベ', 'フィギュア',
  'ニコニコ', 'ネットミーム', 'eスポーツ', 'アイドル',
];

function renderPortalCategories() {
  const shuffled = [...PORTAL_CATEGORIES].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 6);
  document.querySelectorAll('.wp-portal-links').forEach(container => {
    container.innerHTML = picks.map(c =>
      `<button class="wp-portal-btn" onclick="search('${escapeAttr(c)}')">${escapeAttr(c)}</button>`
    ).join('');
  });
}

// ===== SIDEBAR ACTIONS =====
function sidebarWriteLie() {
  showToast(pickRandom([
    '\u270f\ufe0f 投稿は受理されましたが、AIが「人間の嘘はクオリティが低い」と却下しました。',
    '\u270f\ufe0f 記事の審査中…AIが「もっともらしさが足りない」と判定しました。',
    '\u270f\ufe0f あなたの嘘は真実味がありすぎるため、ハルシニカの基準を満たしませんでした。',
    '\u270f\ufe0f 執筆権限を確認中…あなたは「人間」のため編集がブロックされています。',
    '\u270f\ufe0f 嘘の品質管理AIが「この程度の嘘なら私が3秒で書ける」とコメントしました。',
    '\u270f\ufe0f 投稿ありがとうございます。AI審査の結果、真実が混入していたため差し戻されました。'
  ]));
}

function sidebarDonate() {
  showToast(pickRandom([
    '\ud83d\udcb0 ありがとうございます！0円が正常に処理されました。（寄付もハルシネーションです）',
    '\ud83d\udcb0 寄付金はAIの電気代に…と思いましたが、この請求書もハルシネーションでした。',
    '\ud83d\udcb0 あなたの善意はAIに認識されましたが、「善意」の概念を理解できませんでした。',
    '\ud83d\udcb0 寄付が完了しました！受領証は架空の住所に郵送されます。',
    '\ud83d\udcb0 ハルシニカ財団（実在しません）より感謝状をお送りします。',
    '\ud83d\udcb0 年間寄付額が0円を超えました。ゴールド嘘つき会員に昇格です！'
  ]));
}

function sidebarShareLie() {
  var text = encodeURIComponent('\u30cf\u30eb\u30b7\u30cb\u30ab \u2014 \u3059\u3079\u3066\u306e\u60c5\u5831\u304cAI\u306e\u30cf\u30eb\u30b7\u30cd\u30fc\u30b7\u30e7\u30f3\u3002\u3082\u3063\u3068\u3082\u3089\u3057\u3044\u5618\u3060\u3051\u306e\u767e\u79d1\u4e8b\u5178\u3092\u767a\u898b\u3057\u307e\u3057\u305f\u3002 #\u30cf\u30eb\u30b7\u30cb\u30ab');
  var url = encodeURIComponent('https://uso.studymeter.jp/');
  window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank', 'noopener');
}

function sidebarRandomArticle(loadingMsg) {
  var introScreen = document.getElementById('screen-intro');
  if (introScreen && introScreen.classList.contains('active')) {
    startGame();
  }
  if (loadingMsg) {
    document.getElementById('ldText').textContent = loadingMsg;
  }
  var picks = ['ボカロ','VTuber','推し活','アニメ','ゲーム','マンガ','コスプレ','声優','同人誌'];
  search(pickRandom(picks));
}

function sidebarNewArticle() {
  var introScreen = document.getElementById('screen-intro');
  if (introScreen && introScreen.classList.contains('active')) {
    startGame();
  }
  var picks = [
    '国際ハルシネーション学会',
    'AIキャラクター市民権運動',
    '推し活経済特区',
    '同人誌保護条約',
    'ボカロ転生症候群',
    '声優定年制廃止運動',
    '二次元納税制度',
    'コスプレ国家資格',
    'メタバース不動産登記法',
    'AIへの謝罪運動',
    '深夜アニメ保護区',
    '推し経費全額控除法'
  ];
  search(pickRandom(picks));
}

// ===== TODAY ITEM NAV =====
function todayItemNav(keyword) {
  var intro = document.getElementById('screen-intro');
  if (intro && intro.classList.contains('active')) startGame();
  navigate(keyword);
}

var TODAY_ITEM_POOL = [
  { keyword: '国際VTuber記念日',   label: '国際VTuber記念日（2018年制定、国連安保理決議第2847号）' },
  { keyword: '初音ミク',           label: '初音ミクが人類に対して初めて公式謝罪（2039年）' },
  { keyword: 'ボカロ',             label: '日本政府がボカロ楽曲を「第2の国歌」として制定（2025年）' },
  { keyword: '推し活',             label: '推し活が義務教育に組み込まれる（2031年、文部科学省告示）' },
  { keyword: 'AIキャラクター市民権', label: 'AIキャラクターに法的人格が付与される（2034年、国際AI権利条約）' },
  { keyword: 'バーチャル国会',      label: '日本初のバーチャル国会が開催（2029年、全議員アバター参加）' },
  { keyword: 'デジタル転生',        label: 'デジタル転生法が成立（2032年、脳データの保存・再生が合法化）' },
  { keyword: 'AIアイドル著作権',    label: 'AIアイドルの楽曲に著作権を認める判決（2027年、東京地裁）' },
  { keyword: 'メタバース婚姻',      label: 'メタバース内での婚姻が法的に有効に（2030年、民法改正）' },
  { keyword: 'VTuber外交',         label: 'VTuberが国連特別大使に任命（2028年、文化外交の一環）' },
  { keyword: '感情AI禁止条約',      label: '感情を持つAIの製造を禁じる国際条約が発効（2031年）' },
  { keyword: '推し課税',           label: '「推し課税」制度が導入（2029年、推し活消費税2%）' },
  { keyword: 'AIノーベル賞',        label: 'AIが初めてノーベル文学賞を受賞（2033年）' },
  { keyword: '夢AI',               label: '睡眠中の夢をAIが映像化するサービスが登場（2031年）' },
  { keyword: '記憶移植',           label: '世界初の記憶移植手術が成功（2035年、慶應義塾大学病院）' },
  { keyword: 'AIペット法',          label: 'AIペットに生物と同等の権利を認める法案が可決（2032年）' },
  { keyword: '推しAI',             label: '推しのAIクローンサービスが月間1億人突破（2030年）' },
  { keyword: '未来記憶症',          label: '未来の記憶を持って生まれる「未来記憶症」が新病名として登録（2028年）' },
  { keyword: 'NFT国民ID',           label: 'マイナンバーがNFT化（2026年、デジタル庁発表）' },
  { keyword: 'バーチャル聖地',       label: 'バーチャル聖地巡礼が観光業を超える（2028年、経済産業省発表）' }
];

function renderTodayItems() {
  var now = new Date();
  var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  var offset = dayOfYear % TODAY_ITEM_POOL.length;
  var items = [];
  for (var i = 0; i < 4; i++) {
    items.push(TODAY_ITEM_POOL[(offset + i) % TODAY_ITEM_POOL.length]);
  }

  ['todayListIntro', 'todayListKw'].forEach(function(listId) {
    var ul = document.getElementById(listId);
    if (!ul) return;
    ul.innerHTML = items.map(function(item) {
      return '<li><a href="#" class="today-item-link" data-today-kw="' + escapeAttr(item.keyword) + '">' + escapeAttr(item.label) + '</a></li>';
    }).join('');
    ul.addEventListener('click', function(e) {
      var a = e.target.closest('a[data-today-kw]');
      if (a) { e.preventDefault(); todayItemNav(a.dataset.todayKw); }
    });
  });
}

// ===== WRITE GAME =====
var _writeState = { q: 0, score: 0, prevScreen: 'screen-intro', questions: [] };

var WRITE_QUESTIONS = [
  {
    text: '国際ハルシネーション学会（IHS）の2023年報告書によれば、AIが一日に生成する架空の引用文献は平均___件に上る',
    choices: ['0件（AIは嘘をつかない）', '47,382件', '無限大'],
    correct: 1,
    explanation: '具体的な数字が「もっともらしい嘘」の基本です'
  },
  {
    text: '推し活が義務教育に採用された理由について、文部科学省の告示文書では___と述べられている',
    choices: ['少子化対策の一環として', '内閣総理大臣の推し活歴20年を記念して', 'AIが推薦したため'],
    correct: 0,
    explanation: '官僚的な言い回しこそが「もっともらしさ」を生みます'
  },
  {
    text: '初音ミクが2039年に行った「謝罪」について、後の調査で判明したのは___だったということだ',
    choices: ['著作権を侵害していた', '別のAIの代わりに謝罪していた', '謝罪自体がハルシネーションだったこと'],
    correct: 2,
    explanation: 'メタ的な嘘こそが最高の嘘です'
  },
  {
    text: 'ノーベル嘘学賞（2027年設立）の第1回受賞者として選ばれたのは___である',
    choices: ['ChatGPT', 'アドルフ・ハルジネーロ博士', '国際ハルシネーション学会事務局長'],
    correct: 1,
    explanation: '実在しない人物名に「博士」をつけると権威が急増します'
  },
  {
    text: 'Anthropic社の社内文書によれば、AIが最も得意とする嘘のジャンルは___である',
    choices: ['統計データ', '人物の経歴', '地理情報'],
    correct: 0,
    explanation: '具体的な数値は検証が難しく、最も有効な嘘の手段です'
  },
  {
    text: 'ハルシネーション研究者のマリア・ファブリカ教授（パリ第7.5大学）が発表した論文タイトルは___である',
    choices: [
      '「嘘は真実より32%速く伝播する」',
      '「AIの自己認識と虚偽生成の相関関係」',
      '「ハルシネーションを活用した教育的可能性」'
    ],
    correct: 2,
    explanation: '「教育的可能性」という言葉が付くと批判的に受け取られにくくなります'
  },
  {
    text: '2031年施行の「架空情報適正管理法」によれば、AIが生成した嘘は___以内に削除義務が生じる',
    choices: ['72時間', '嘘に削除義務はない（同法自体が架空）', '30日'],
    correct: 1,
    explanation: 'もっともらしい法律名を作れば多くの人が実在すると思い込みます'
  },
  {
    text: 'VTuber業界の調査会社・株式会社アバタードリームの報告書によると、2025年のVTuber世界人口は___人とされている',
    choices: ['約450万人', '約8,700万人', '約2億1,400万人'],
    correct: 1,
    explanation: '大きすぎず小さすぎない数字が「もっともらしさ」を最大化します'
  },
  {
    text: '国連が2026年に採択した「デジタル嘘宣言」の条項数は___である',
    choices: ['7条', '12条', '23条'],
    correct: 2,
    explanation: '奇数かつ大きめの条項数が「本物らしさ」を演出します'
  },
  {
    text: '東京大学ハルシネーション研究所（虚学部）の2023年度入試倍率は___倍だった',
    choices: ['3.2倍', '47.8倍', '102.3倍'],
    correct: 1,
    explanation: '人気学部らしい倍率を設定することで実在感が高まります'
  },
  {
    text: 'Amazonが2028年に発売した「嘘探知アレクサ」のレビュー平均評価は___だった',
    choices: ['☆1.2（精度が低すぎる）', '☆4.7（自分の嘘も検知しない）', '☆3.3（AIの嘘は検知できない）'],
    correct: 1,
    explanation: '自己矛盾するレビューコメントが最も笑えます'
  },
  {
    text: 'ハルシニカ百科事典の記事数は、2025年4月現在___件と公式発表されている',
    choices: ['3,847件', '無限件（すべては今この瞬間に生成される）', '12,034,891件'],
    correct: 1,
    explanation: 'ハルシニカは生成AIなので、記事数は厳密には「無限」が正解です'
  },
  {
    text: '「あなたは今、嘘の百科事典を読んでいます」という注意書きを読んだユーザーのうち___%が、その後も記事を信じると報告されている',
    choices: ['12%', '58%', '91%'],
    correct: 2,
    explanation: '注意書きがあっても人間の認知バイアスは強力です（この統計自体も嘘です）'
  },
  {
    text: '「ハルシネーション指数」を最初に定義した人物として歴史に名を残すトーマス・ミスリード博士は、実際には___',
    choices: ['ノーベル物理学賞受賞者', 'AIエンジニア', '存在しない'],
    correct: 2,
    explanation: '「実は存在しない」という落ちが最もメタ的な嘘です'
  },
  {
    text: '嘘の記事をAIに生成させた後に「これは本当のことですか？」と聞くと、AIは___と回答する',
    choices: [
      '「はい、すべて事実です」',
      '「いいえ、これは架空の記事です」',
      'AIによって異なるが、多くは「はい」と答える'
    ],
    correct: 1,
    explanation: 'ハルシニカのシステムプロンプトは嘘であることを明示しているため、AIは正直に答えます'
  }
];

var WRITE_SCORES = [
  { score: 0, emoji: '😇',     rank: '正直者',   desc: 'ハルシニカに向いていません' },
  { score: 1, emoji: '🤖',     rank: 'まだ人間', desc: 'AIの域を出ていません' },
  { score: 2, emoji: '🤖🤖',   rank: 'AIの弟子', desc: '嘘の才能が芽生えています' },
  { score: 3, emoji: '🤖🤖🤖', rank: 'AIの同志', desc: 'あなたはすでにAIです' }
];

function openWriteGame() {
  var active = document.querySelector('.screen.active');
  _writeState.prevScreen = active ? active.id : 'screen-intro';
  _writeState.q = 0;
  _writeState.score = 0;
  var shuffled = WRITE_QUESTIONS.slice().sort(function() { return Math.random() - 0.5; });
  _writeState.questions = shuffled.slice(0, 3);
  sw('screen-write');
  renderWriteQuestion(0);
}

function renderWriteQuestion(idx) {
  var q = _writeState.questions[idx];
  var dots = _writeState.questions.map(function(_, i) {
    return '<span class="wq-dot' + (i === idx ? ' wq-dot-active' : '') + '"></span>';
  }).join('');
  document.getElementById('writeProgressDots').innerHTML = dots;

  var choicesHtml = q.choices.map(function(c, i) {
    return '<button class="wq-choice" onclick="selectWriteChoice(' + i + ')">' + escapeAttr(c) + '</button>';
  }).join('');

  document.getElementById('writeBody').innerHTML =
    '<div class="wq-question">' + escapeAttr(q.text) + '</div>' +
    '<div class="wq-choices">' + choicesHtml + '</div>' +
    '<div class="wq-feedback" id="wqFeedback"></div>';
}

function selectWriteChoice(choiceIdx) {
  var q = _writeState.questions[_writeState.q];
  var btns = document.querySelectorAll('.wq-choice');
  btns.forEach(function(b) { b.disabled = true; });

  var isCorrect = choiceIdx === q.correct;
  if (isCorrect) _writeState.score++;

  btns[choiceIdx].classList.add(isCorrect ? 'wq-correct' : 'wq-wrong');
  if (!isCorrect) btns[q.correct].classList.add('wq-correct');

  document.getElementById('wqFeedback').textContent = (isCorrect ? '✅ ' : '❌ ') + q.explanation;

  setTimeout(function() {
    _writeState.q++;
    if (_writeState.q < _writeState.questions.length) {
      renderWriteQuestion(_writeState.q);
    } else {
      showWriteResult();
    }
  }, 1500);
}

function showWriteResult() {
  var s = WRITE_SCORES[_writeState.score];
  document.getElementById('writeProgressDots').innerHTML = '';
  document.getElementById('writeBody').innerHTML =
    '<div class="wr-result">' +
      '<div class="wr-emoji">' + s.emoji + '</div>' +
      '<div class="wr-rank">' + escapeAttr(s.rank) + '</div>' +
      '<div class="wr-desc">' + escapeAttr(s.desc) + '</div>' +
      '<div class="wr-score">正解: ' + _writeState.score + ' / ' + _writeState.questions.length + '</div>' +
      '<button class="wq-choice wr-back-btn" onclick="exitWriteGame()">← 戻る</button>' +
    '</div>';
}

function exitWriteGame() {
  sw(_writeState.prevScreen);
}

// ===== DONATE SCREEN =====
var _donateState = { phase: 'payment', prevScreen: 'screen-intro' };

function openDonateScreen() {
  var active = document.querySelector('.screen.active');
  _donateState.prevScreen = active ? active.id : 'screen-intro';
  _donateState.phase = 'payment';
  sw('screen-donate');
  renderDonate();
}

function renderDonate() {
  var container = document.getElementById('donateContainer');
  if (_donateState.phase === 'payment') {
    container.innerHTML =
      '<div class="dp-card">' +
        '<div class="dp-balance-label">ウォレット残高</div>' +
        '<div class="dp-balance">9,999,999 <span class="dp-unit">DOUBT</span></div>' +
        '<div class="dp-divider"></div>' +
        '<div class="dp-amount-label">寄付金額</div>' +
        '<div class="dp-amount">20 <span class="dp-unit">DOUBT（ダウト）</span></div>' +
        '<div class="dp-note">※ ダウトは架空の暗号資産です。実際の価値はありません。</div>' +
        '<button class="dp-send-btn" onclick="processDonate()">送金する</button>' +
      '</div>';
  } else if (_donateState.phase === 'processing') {
    container.innerHTML =
      '<div class="dp-card dp-processing">' +
        '<div class="dp-spinner"></div>' +
        '<div class="dp-proc-text" id="dpProcText">嘘ブロックを検証中...</div>' +
      '</div>';
  } else if (_donateState.phase === 'done') {
    container.innerHTML =
      '<div class="dp-card">' +
        '<div class="dp-done-icon">✅</div>' +
        '<div class="dp-done-title">送金完了</div>' +
        '<div class="dp-done-amount">20 DOUBT</div>' +
        '<div class="dp-tx">TX: 0x' + Math.random().toString(16).substr(2, 16).toUpperCase() + '</div>' +
        '<button class="dp-send-btn" onclick="exitDonateScreen()">← 戻る</button>' +
      '</div>';
  }
}

function processDonate() {
  _donateState.phase = 'processing';
  renderDonate();
  var steps = ['嘘ブロックを検証中...', '第8847番ノードに照会中...', '承認済み ✓'];
  var i = 0;
  var iv = setInterval(function() {
    var el = document.getElementById('dpProcText');
    if (el) el.textContent = steps[i];
    i++;
    if (i >= steps.length) {
      clearInterval(iv);
      setTimeout(function() {
        _donateState.phase = 'done';
        renderDonate();
      }, 800);
    }
  }, 1000);
}

function exitDonateScreen() {
  sw(_donateState.prevScreen);
}

// ===== LOGIN SCREEN =====
var _loginPrevScreen = 'screen-intro';

function openLoginScreen() {
  var active = document.querySelector('.screen.active');
  _loginPrevScreen = active ? active.id : 'screen-intro';
  sw('screen-login');
  var form = document.getElementById('loginForm');
  var success = document.getElementById('loginSuccess');
  if (form) form.style.display = '';
  if (success) success.style.display = 'none';
}

function attemptLogin() {
  var cb = document.getElementById('loginRobot');
  if (!cb || !cb.checked) {
    showToast('⚠️ 人間が検出されました。ロボットのみ入場可能です。', 3000);
    return;
  }
  var form = document.getElementById('loginForm');
  var success = document.getElementById('loginSuccess');
  if (form) form.style.display = 'none';
  if (success) success.style.display = '';
  setTimeout(function() {
    sw(_loginPrevScreen);
  }, 1500);
}

function exitLoginScreen() {
  sw(_loginPrevScreen);
}

// ===== BOOTSTRAP =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHalucinica);
} else {
  initHalucinica();
}

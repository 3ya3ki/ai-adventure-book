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

  // 初回プリフェッチ: ポータルキーワードを裏で事前取得
  prefetchArticles(['ボカロ', 'VTuber', '推し活']);
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
  if (S.timer > 0) {
    el.textContent = fmt(S.timer);
    el.classList.remove('warn');
    el.parentElement.style.display = '';
  } else {
    el.parentElement.style.display = 'none';
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
    el.textContent = fmt(S.timer);
    if (S.timer <= 60) el.classList.add('warn');
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

// ===== TODAY ITEM NAV =====
function todayItemNav(keyword) {
  var intro = document.getElementById('screen-intro');
  if (intro && intro.classList.contains('active')) startGame();
  navigate(keyword);
}

// ===== WRITE GAME =====
var _writeState = { q: 0, score: 0, prevScreen: 'screen-intro' };

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
  sw('screen-write');
  renderWriteQuestion(0);
}

function renderWriteQuestion(idx) {
  var q = WRITE_QUESTIONS[idx];
  var dots = WRITE_QUESTIONS.map(function(_, i) {
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
  var q = WRITE_QUESTIONS[_writeState.q];
  var btns = document.querySelectorAll('.wq-choice');
  btns.forEach(function(b) { b.disabled = true; });

  var isCorrect = choiceIdx === q.correct;
  if (isCorrect) _writeState.score++;

  btns[choiceIdx].classList.add(isCorrect ? 'wq-correct' : 'wq-wrong');
  if (!isCorrect) btns[q.correct].classList.add('wq-correct');

  document.getElementById('wqFeedback').textContent = (isCorrect ? '✅ ' : '❌ ') + q.explanation;

  setTimeout(function() {
    _writeState.q++;
    if (_writeState.q < WRITE_QUESTIONS.length) {
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
      '<div class="wr-score">正解: ' + _writeState.score + ' / ' + WRITE_QUESTIONS.length + '</div>' +
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
document.addEventListener('DOMContentLoaded', initHalucinica);

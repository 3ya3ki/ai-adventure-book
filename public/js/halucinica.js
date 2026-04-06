// halucinica.js — ハルシニカ メインロジック
// Artifact v2.0 準拠（状態管理・記事レンダリング・API呼び出し・フォールバック）

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
    if (res.ok) DB = await res.json();
  } catch (e) {
    console.warn('Mock DB load failed, using empty DB:', e);
  }

  // Handle timer URL param
  const params = new URLSearchParams(window.location.search);
  const timerParam = params.get('timer');
  if (timerParam !== null) {
    const t = parseInt(timerParam, 10);
    if (!isNaN(t) && t >= 0) S.timer = t;
  }

  // Enter key handlers
  document.getElementById('kwInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') searchFree();
  });
  document.getElementById('wikiSearch').addEventListener('keypress', e => {
    if (e.key === 'Enter') searchFromBar();
  });
}

// ===== SCREEN SWITCH =====
function sw(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
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
function startGame() {
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

  sw('screen-keyword');
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

  // L1: In-memory cache
  if (S.cache[keyword]) {
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
      const data = await res.json();
      if (data && data.title) {
        S.cache[keyword] = data;
        hideLoading();
        _displayArticle(keyword, data);
        return;
      }
    }
  } catch (e) {
    // API failed, fall through to mock DB
  }

  // L3: Mock DB
  await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
  hideLoading();

  const mockData = DB[keyword];
  if (mockData) {
    S.cache[keyword] = mockData;
    _displayArticle(keyword, mockData);
  } else {
    // L4: Redirect to ボカロ
    const fallbackKw = 'ボカロ';
    const fallback = DB[fallbackKw] || null;
    S.explored++;
    S.trail.push(keyword + '（リダイレクト）');
    S.history.push({ title: keyword, summary: '（リダイレクト）' });
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
  sw('screen-article');
}

function _updateCounters() {
  document.getElementById('exploreCount').textContent = S.explored;
  document.getElementById('exitCount').textContent = S.explored;
}

// ===== ARTICLE RENDER (Artifact v2.0 準拠) =====
function renderArticle(d) {
  // Breadcrumb
  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = S.trail.map((t, i) => {
    const sep = i < S.trail.length - 1
      ? ' <span style="color:#72777d;margin:0 .2rem;">›</span> '
      : '';
    return `<span>${t}</span>${sep}`;
  }).join('');

  // Sidebar (infobox)
  const sb = document.getElementById('wikiSidebar');
  let ibHtml = '';
  if (d.infobox) {
    const ib = d.infobox;
    ibHtml = `<div class="infobox">
      <div class="infobox-header">${ib.header}</div>
      <div class="infobox-image">${ib.image}</div>
      <table>${ib.fields.map(f => `<tr><td>${f[0]}</td><td>${f[1]}</td></tr>`).join('')}</table>
    </div>`;
  }
  sb.innerHTML = ibHtml;

  // Main content
  const main = document.getElementById('wikiMain');
  let html = '';

  html += `<h1 class="article-title">${d.title}</h1>`;

  html += `<div class="wiki-warning"><strong>⚠ ハルシニカの記事:</strong> この記事に記載されている情報はすべてAIによるハルシネーション（架空の情報）です。事実は含まれていません。</div>`;

  if (d.toc) {
    html += `<div class="wiki-toc"><div class="toc-title">目次</div><ol>${d.toc.map((t, i) => `<li><a href="javascript:void(0)">${i + 1} ${t}</a></li>`).join('')}</ol></div>`;
  }

  d.sections.forEach(sec => {
    html += `<div class="wiki-section"><h2 class="wiki-h2">${sec.heading}</h2>`;
    if (sec.content) html += sec.content;
    if (sec.subsections) {
      sec.subsections.forEach(sub => {
        html += `<h3 class="wiki-h3">${sub.heading}</h3>${sub.content}`;
      });
    }
    html += '</div>';
  });

  if (d.related) {
    html += `<div class="wiki-related"><h2 class="rel-title">関連項目</h2><ul>${d.related.map(r => {
      const exists = DB[r] || S.cache[r];
      return `<li><a class="int-link ${exists ? '' : 'new-article'}" onclick="navigate('${r}')">${r}</a></li>`;
    }).join('')}</ul></div>`;
  }

  if (d.footnotes) {
    html += `<div class="wiki-footnotes"><div class="fn-title">脚注</div><ol>${d.footnotes.map(f => `<li>${f}</li>`).join('')}</ol></div>`;
  }

  if (d.categories) {
    html += `<div class="wiki-categories"><span class="cat-label">カテゴリ:</span>${d.categories.map(c => `<a href="javascript:void(0)">${c}</a>`).join(' | ')}</div>`;
  }

  if (d.updated) {
    html += `<div class="wiki-updated">このページの最終更新日時は ${d.updated} です。</div>`;
  }

  html += '<div style="height:60px;"></div>';
  main.innerHTML = html;
  window.scrollTo(0, 0);
}

// ===== END / RESET =====
function endExplore() {
  if (S.iv) clearInterval(S.iv);
  const trail = document.getElementById('endTrail');
  trail.innerHTML = `<div class="trail-label">探索の軌跡（${S.explored}件）</div>`;
  S.trail.forEach((t, i) => {
    const arrow = i > 0 ? '<span class="arrow">→</span>' : '';
    trail.innerHTML += `<div class="trail-item">${arrow}${t}</div>`;
  });
  sw('screen-end');
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
  searchFree();
}

// ===== BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', initHalucinica);

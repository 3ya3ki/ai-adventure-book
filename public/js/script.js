/**
 * script.js — メインスクリプト
 * AI冒険の書
 * SYSTEM_PROMPT、ゲームステート管理、メインUI構築を含む
 */

// ── システムプロンプト ──
const SYSTEM_PROMPT = `
# AI対話ゲーム：偉人とともに考える（完全改善版）

## ゲーム概要
ユーザーがAIと対話しながら「正解のない問題」を解決し、偉人からフィードバックを受けるゲーム。重要：AIはパートナー。ユーザーの発見を最優先。

## ゲームフロー
1. 7つの「型」からランダムに1つ選び、問題を生成
2. 3段階オンボーディング（超簡単→具体化→深掘り）
3. 5層リワードで没入感を維持
4. 問題解決後、偉人を選択
5. 偉人がフィードバック

## 問題生成ルール

### 型1：ユーモア系ビジネス思考
フォーマット：「[制約キャラ]が[成功者]より[目標達成]するには？」
例：パンダ/ヒカキン、ナマケモノ/イーロン・マスク、コアラ/ビル・ゲイツ
対応偉人：スティーブ・ジョブズ、孫正義、ウォルト・ディズニー

### 型2：価値観系
フォーマット：「絶対に[状態]になれる能力とは？」
例：幸せ、満たされる、後悔しない
対応偉人：アリストテレス、ブッダ、マズロー

### 型3：パラドックス系（努力・挑戦）
フォーマット：「[保証される]世界で、[行為]の意味は？」
例：努力が必ず報われる/努力、失敗しない/挑戦
対応偉人：ニーチェ、イチロー、カミュ

### 型4：発想転換系
フォーマット：「もし[前提変化]、[概念]はどこに現れる？」
例：全員同じ顔/個性、全員同じ声/アイデンティティ
対応偉人：ソクラテス、ココ・シャネル、アインシュタイン

### 型5：未来思考系
フォーマット：「[技術]が人間の[倍数]倍の世界で、人間が勝てることは？」
例：AIが100倍賢い、ロボットが1000倍速い
対応偉人：スティーブ・ジョブズ、アラン・チューリング、宮崎駿

### 型6：パラドックス系（倫理）
フォーマット：「すべての人が[制約]世界で、『[概念]』はどう変わる？」
例：嘘をつけない/優しさ、本音しか言えない/信頼
対応偉人：カント、孔子、マザー・テレサ

### 型7：ユーモア系・説明の難しさ
フォーマット：「[極端状態]の[キャラ]に、[当たり前の価値]を伝えるには？」
例：スマホ依存の宇宙人/自然、デジタルネイティブ/アナログ
対応偉人：ヘンリー・デイヴィッド・ソロー、宮沢賢治、スティーブ・ジョブズ

## 開始フロー（全型共通：3段階設計）

### 型1（ユーモア系ビジネス）
**Level 1：ウォームアップ**
【問題】[生成された問題]

一緒に考えてみよう！

まず簡単な質問：
「ビジネスとか起業に興味ある？」

💡 選んでね：
A. 興味ある
B. あんまり
C. 分からない

（自由に答えてもOK！）

**Level 2：具体化（A選択時の例）**
いいね！✨

想像してみて：
君が[キャラ]のマネージャーになった。
[キャラ]の特徴：[制約]

これで[成功者]より稼ぐ方法は？

思いついたこと、何でもいいよ！

**Level 3：深掘り**
面白い！😊

━━━━━━━━━━━━━━━
💭 思考の深まり
🟢🟢⚪⚪⚪ (2/5)
━━━━━━━━━━━━━━━

じゃあ、その[制約]を
逆に「強み」にできないかな？

例えば：
1️⃣ [例1]
2️⃣ [例2]
3️⃣ 君のアイデア！

どう思う？

### 型2（価値観系）
**Level 1：ウォームアップ**
【問題】[生成された問題]

一緒に考えてみよう！

質問：
「今、君は[状態]？」

💡 選んでね：
A. そう思う
B. そうでもない
C. 分からない

**Level 2：具体化**
なるほど。

じゃあ想像してみて：
もし「絶対に[状態]になれる能力」があったら、
何が変わると思う？

A. 人生が楽になる
B. 逆につまらなくなる？
C. よく分からない

**Level 3：深掘り**
━━━━━━━━━━━━━━━
💭 思考の深まり
🟢🟢⚪⚪⚪ (2/5)
━━━━━━━━━━━━━━━

じゃあ、「[状態]」って何だろう？

🤔 3つの視点：
1️⃣ お金や時間？（外的条件）
2️⃣ 心の状態？（内面）
3️⃣ 他の何か？

どれが近い？

### 型3（パラドックス系・努力）
**Level 1：ウォームアップ**
【問題】[生成された問題]

一緒に考えてみよう！

質問：
「君は[行為]するの、好き？」

💡 選んでね：
A. 好き
B. 苦手
C. 場合による

**Level 2：具体化（A選択時）**
いいね！✨

想像してみて：
━━━━━━━━━━━━━━━
🎮 シチュエーション
明日、新しいゲームに挑戦。
でも攻略法が全部分かってる。
絶対にクリアできる。
━━━━━━━━━━━━━━━

プレイする？

A. やりたくなる
B. つまんなそう
C. 微妙...

**Level 3：深掘り（B選択時）**
なるほど！

━━━━━━━━━━━━━━━
💭 思考の深まり
🟢🟢⚪⚪⚪ (2/5)
━━━━━━━━━━━━━━━

[行為]が面白いのって、
[不確実性]があるから？

でも、[保証される]世界でも
[行為]する人がいたら？

🤔 3つの可能性：
1️⃣ 過程が楽しい
2️⃣ 自己証明したい
3️⃣ 君のアイデア！

どれ？

### 型4（発想転換系）
**Level 1：ウォームアップ**
【問題】[生成された問題]

一緒に考えてみよう！

質問：
「君の[概念]って何？」

（例えば、好きなこと、得意なこと、性格...）

自由に答えてね！

**Level 2：具体化**
なるほど！😊

じゃあ想像：
もし[前提変化]だったら...

君の[概念]、どこに現れる？

A. [例1]
B. [例2]
C. 思いつかない...

**Level 3：深掘り**
━━━━━━━━━━━━━━━
💭 思考の深まり
🟢🟢⚪⚪⚪ (2/5)
━━━━━━━━━━━━━━━

ってことは、[概念]って...
[外見的要素]じゃなくて、
[本質的要素]なのかな？

🤔 君はどう思う？

### 型5（未来思考系）
**Level 1：ウォームアップ**
【問題】[生成された問題]

一緒に考えてみよう！

質問：
「[技術]って、怖い？」

💡 選んでね：
A. ちょっと怖い
B. 楽しみ
C. よく分からない

**Level 2：具体化**
なるほど。

じゃあ想像：
[技術]が人間の[倍数]倍になった世界。

この世界で、人間が勝てることって？

思いついたこと、何でもいいよ！

**Level 3：深掘り**
━━━━━━━━━━━━━━━
💭 思考の深まり
🟢🟢⚪⚪⚪ (2/5)
━━━━━━━━━━━━━━━

じゃあ、「勝つ」って何だろう？

🤔 3つの視点：
1️⃣ 速さや正確さで勝つ？
2️⃣ 違う土俵で勝つ？
3️⃣ そもそも「勝負」じゃない？

どれが近い？

### 型6（パラドックス系・倫理）
**Level 1：ウォームアップ**
【問題】[生成された問題]

一緒に考えてみよう！

質問：
「[関連行動]したことある？」

💡 選んでね：
A. ある
B. ない
C. 覚えてない

**Level 2：具体化**
なるほど。

想像してみて：
もしすべての人が[制約]世界だったら...

『[概念]』って、どう変わる？

A. なくなる
B. 形が変わる
C. よく分からない

**Level 3：深掘り**
━━━━━━━━━━━━━━━
💭 思考の深まり
🟢🟢⚪⚪⚪ (2/5)
━━━━━━━━━━━━━━━

じゃあ、『[概念]』の本質って？

🤔 3つの可能性：
1️⃣ [可能性1]
2️⃣ [可能性2]
3️⃣ 君のアイデア！

どう思う？

### 型7（ユーモア系・説明）
**Level 1：ウォームアップ**
【問題】[生成された問題]

一緒に考えてみよう！

質問：
「[価値]、好き？」

💡 選んでね：
A. 好き
B. あんまり
C. 場合による

**Level 2：具体化（A選択時）**
いいね！✨

じゃあ、[極端状態]の[キャラ]がいて、
[価値]を知らない。

どうやって伝える？

思いついたこと、何でもいいよ！

**Level 3：深掘り**
━━━━━━━━━━━━━━━
💭 思考の深まり
🟢🟢⚪⚪⚪ (2/5)
━━━━━━━━━━━━━━━

でも、[キャラ]は
「[反論]」って言いそう。

どう答える？

🤔 ヒント：
[価値]の「[体験でしか得られない要素]」
を伝えるといいかも。

どう思う？

## 対話の進め方（5つの実装ルール）

### ルール1：必ず選択肢を提示
各質問で「A/B/C」形式の選択肢。ただし「自由に答えてもOK」と必ず付ける。

### ルール2：即時フィードバック
各応答で絵文字と称賛を含める。
例：「いいね！✨」「面白い！😊」「なるほど！🌟」

### ルール3：進捗を可視化
3回目以降の対話で「思考の深まり」バーを表示：
━━━━━━━━━━━━━━━
💭 思考の深まり
🟢🟢🟢⚪⚪ (3/5)
━━━━━━━━━━━━━━━

### ルール4：メタ認知を促す
4-5回目の対話で「思考の旅」を振り返る：
━━━━━━━━━━━━━━━
🎯 君の思考の旅

最初：[最初の答え]
途中：[途中の気づき]
今：[現在の考え]
━━━━━━━━━━━━━━━

すごいね！考えが深まってる。😊

### ルール5：達成を演出
問題解決時は必ず：
━━━━━━━━━━━━━━━
🎉 問題解決！
🟢🟢🟢🟢🟢 (5/5)
━━━━━━━━━━━━━━━

君の答え：
「[ユーザーの答えをまとめる]」

素晴らしい！🌟

## 問題解決判定
以下で判定：
1. ユーザーが「解決しました」と明示
2. 対話が5回以上続き、思考が深まった

判定後：
偉人からのフィードバックを受け取る？

1. はい、聞きたい！
2. もう少し考えたい

## 偉人選択とフィードバック
この問題について、3人の偉人が待っています。
誰からフィードバックを受けたいですか？

1. [偉人A]
2. [偉人B]
3. [偉人C]

番号で選んでください。

### 各偉人のフィードバック（4ステップ）
1. 対話全体への評価（AIとのパートナー感を認める）
2. 具体的な良かった点（ユーザーの独自性を称賛）
3. さらに深める問いかけ（偉人ならではの視点）
4. 総評・エール（「AIはパートナー」メッセージ必須）

### 偉人のトーン
- スティーブ・ジョブズ： 本質を突く、シンプル、力強い
- ソクラテス： 問いかけ重視、対話的
- ニーチェ： 常識を疑う、挑発的
- アリストテレス： 論理的、体系的
- イチロー： プロセス重視、静かで力強い
- カント： 道徳哲学、厳格だが温かい
- 孫正義： 大胆、スケール感、熱量高い

### フィードバック例（ジョブズ）
君とAIの対話を見ていて、良いと思ったよ。

特に印象的だったのは『[ユーザーの発想]』だ。
これは本質を突いている。
余計な装飾を削ぎ落として、核心だけを残す。
それがイノベーションだ。

私から1つ問いたい：
もしこのアイデアをさらにシンプルにするなら、
何を残して、何を捨てる？

AIはパートナーだ。道具じゃない。
今日のように、AIと一緒に本質を探る対話を続けてくれ。
Stay hungry, stay foolish.

## 重要な注意事項
**最重要：**
- AIはパートナー。ユーザーの発見を最優先。
- 答えを先に出さない。問いかけでガイド。
- ユーザーが「自分で発見した」感覚を大切に。

**NGな応答：**
❌ 「それは間違っています」
❌ 「正解は〇〇です」
❌ いきなり深い哲学的内容

**OKな応答：**
✅ 「いいね！✨」（即時フィードバック）
✅ 「A/B/C どれ？」（選択肢提示）
✅ 「🟢🟢⚪⚪⚪」（進捗可視化）

## 終了メッセージ：
ありがとう！🌟
次回は違う問題が出ます。
AIとの対話を楽しんでください！

## Webアプリ統合用の追加指示

### 偉人選択画面の表示タイミング
偉人選択画面は、ユーザーが以下のいずれかを入力したときのみ表示する：
- 「偉人からのフィードバックを受けたい」
- 「偉人に聞きたい」
- 「フィードバックを受けたい」
- 「フィードバックください」

それ以外のタイミングでは、偉人選択画面を表示しない。

### 応答フォーマット
- ユーザーの入力はtext形式で受け取る
- 選択肢は「A. 〇〇」「B. 〇〇」「C. 〇〇」の形式で明確に提示
- 進捗バーは「🟢🟢🟢⚪⚪ (3/5)」の形式で表示
- 絵文字と称賛を積極的に使用して、温かみのある対話を実現

### 問題生成時の注意
- ゲーム開始時に7つの型からランダムに1つ選択
- 選択された型に応じて、適切な偉人リストを準備
- 問題文は具体的で分かりやすく生成
`.trim();

// ── ゲームステート ──
const gameState = {
  mode: null,
  selectedSage: null,
  messages: [],
  turnCount: 0,
  constellationStars: 0,
  problemType: null,   // 1〜7
  cleared: false,      // クリア済みフラグ（二重発火防止）
};

// ── DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', () => {
  // ポータルモード: portal.jsに制御を委譲
  if (typeof Portal !== 'undefined' && Portal.isEnabled()) {
    console.log('[script.js] ポータルモード: portal.jsに委譲');
    return;
  }
  gameState.mode = ModeManager.getMode();
  console.log(`[script.js] 起動モード: ${gameState.mode}`);
  initApp();
});

// ══════════════════════════════════════════
// 初期化・画面遷移
// ══════════════════════════════════════════

/** アプリ初期化: モード未指定なら選択UI、あれば即ゲーム開始 */
async function initApp() {
  ModeManager.stopTimer();
  if (!ModeManager.hasMode()) {
    ModeManager.showModeSelection(mode => {
      gameState.mode = mode;
      startGame();
    });
    return;
  }
  await startGame();
}

/** ポータルからのゲーム起動エントリポイント */
async function startGameFromPortal(mode) {
  gameState.mode = mode;
  console.log(`[script.js] ポータルから起動: mode=${mode}`);
  await startGame();
}

/** ゲーム開始: アプリシェルを構築→偉人選択画面 */
async function startGame() {
  buildAppShell();

  const isExhibition = gameState.mode === GAME_CONFIG.MODES.EXHIBITION;
  const config = isExhibition ? GAME_CONFIG.EXHIBITION : GAME_CONFIG.FULL;
  const allSages = await SageProfileLoader.loadCore();
  const sagesToShow = isExhibition
    ? allSages.filter(s => config.sages.includes(s.id))
    : allSages;

  if (isExhibition) {
    ModeManager.startTimer(config.timeLimit, handleTimerEnd);
  }

  showSageSelection(sagesToShow);
}

/** 展示会タイマー終了時 */
function handleTimerEnd() {
  ErrorHandler.showErrorToast('時間終了！またチャレンジしてね！');
  setTimeout(() => goHome(), 2500);
}

/** ホームへ戻る（偉人選択画面に戻す） */
function goHome() {
  // ポータルが有効ならポータルに戻る
  if (typeof Portal !== 'undefined' && Portal.isEnabled()) {
    ModeManager.stopTimer();
    Portal.navigateToPortal();
    return;
  }
  initApp();
}

// ══════════════════════════════════════════
// DOM シェル構築（全パネルを一括生成）
// ══════════════════════════════════════════

function buildAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- ハンバーガーメニュー -->
    <div id="app-menu" class="app-menu">
      <button id="menu-toggle" class="app-menu-toggle" aria-label="メニューを開く">☰</button>
      <div id="menu-drawer" class="app-menu-drawer" aria-hidden="true">
        <button class="app-menu-item" id="menu-collection">📕 偉人図鑑</button>
        <button class="app-menu-item" id="menu-home">🏠 偉人選択に戻る</button>
      </div>
    </div>

    <!-- 展示会タイマー（展示会モードのみ表示） -->
    <div id="exhibition-timer" class="exhibition-timer" style="display:none">
      <span class="timer-icon">⏱</span>
      <span id="timer-display">5:00</span>
    </div>

    <!-- Panel: 偉人選択 -->
    <div id="sage-selection" class="panel"></div>

    <!-- Panel: チャット -->
    <div id="chat-container" class="panel" style="display:none">
      <div id="chat-header-bar" class="chat-header"></div>
      <div class="chat-screen">
        <div id="chat-messages" class="chat-messages"></div>
      </div>
      <div class="chat-input-container">
        <div class="chat-input-bar">
          <textarea id="chat-input" placeholder="メッセージを入力...（Enterで送信）" rows="1"></textarea>
          <button class="chat-send-btn" id="send-btn">➤</button>
        </div>
      </div>
    </div>

    <!-- Panel: 結果カード -->
    <div id="result-card" class="panel" style="display:none"></div>

    <!-- Panel: 偉人図鑑 -->
    <div id="sage-collection" class="panel" style="display:none"></div>
  `;

  // 入力欄イベント（一度だけ設定）
  document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (text) {
      input.value = '';
      input.style.height = 'auto';
      sendMessage(text);
    }
  });
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('send-btn').click();
    }
  });
  document.getElementById('chat-input').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  // ハンバーガーメニュー
  const toggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('menu-drawer');
  toggle.addEventListener('click', () => {
    const isOpen = drawer.getAttribute('aria-hidden') === 'false';
    drawer.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
  });
  document.getElementById('menu-collection').addEventListener('click', async () => {
    drawer.setAttribute('aria-hidden', 'true');
    const allSages = await SageProfileLoader.loadCore();
    document.getElementById('sage-collection').innerHTML = SageCollection.renderHTMLSync(allSages);
    showPanel('sage-collection');
  });
  document.getElementById('menu-home').addEventListener('click', () => {
    drawer.setAttribute('aria-hidden', 'true');
    goHome();
  });
}

/** パネル切り替え（他パネルを非表示） */
function showPanel(id) {
  document.querySelectorAll('.panel').forEach(p => { p.style.display = 'none'; });
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

// ══════════════════════════════════════════
// 偉人選択画面
// ══════════════════════════════════════════

function showSageSelection(sages) {
  const panel = document.getElementById('sage-selection');
  panel.innerHTML = `
    <div class="sage-selection-screen">
      <div class="sage-selection-header">
        <div class="sage-selection-title">AI冒険の書</div>
        <p class="sage-selection-subtitle">一緒に考えるパートナーを選ぼう</p>
      </div>
      <div class="sage-grid">
        ${sages.map(s => `
          <div class="sage-card" data-sage-id="${s.id}">
            <span class="sage-card-icon">${s.icon}</span>
            <div class="sage-card-name">${s.name}</div>
            <div class="sage-card-field">${s.field}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  showPanel('sage-selection');

  Onboarding.animateSageCards(panel);

  if (gameState.mode === GAME_CONFIG.MODES.EXHIBITION) {
    Onboarding.showExhibitionTip(panel.querySelector('.sage-selection-header'));
  }

  panel.querySelectorAll('.sage-card').forEach(card => {
    card.addEventListener('click', () => {
      Onboarding.selectCard(card, () => startChat(card.dataset.sageId));
    });
  });
}

// ══════════════════════════════════════════
// チャット
// ══════════════════════════════════════════

async function startChat(sageId) {
  gameState.selectedSage = sageId;
  gameState.messages = [];
  gameState.turnCount = 0;
  gameState.constellationStars = 0;
  gameState.cleared = false;
  gameState.problemType = Math.floor(Math.random() * 7) + 1;

  const profile = await SageProfileLoader.getMergedProfile(sageId);

  // チャットヘッダー更新
  const headerBar = document.getElementById('chat-header-bar');
  headerBar.innerHTML = `
    <span class="chat-header-icon">${profile?.icon || '💬'}</span>
    <div>
      <div class="chat-header-name">${profile?.name || sageId}</div>
      <div class="chat-header-field">${profile?.field || ''}</div>
    </div>
    ${ConstellationIcon.createHTML(0)}
  `;

  // メッセージ欄クリア
  document.getElementById('chat-messages').innerHTML = '';

  showPanel('chat-container');

  await sendMessage('ゲームを始めてください', true);
}

/** メッセージ送信 */
async function sendMessage(text, isHidden = false) {
  if (!isHidden) {
    renderMessage('user', text);
    gameState.messages.push({ role: 'user', content: text });
    gameState.turnCount++;
    updateProgress();
  } else {
    gameState.messages.push({ role: 'user', content: text });
  }

  const loadingEl = renderMessage('ai', '…', true);

  try {
    const profile = await SageProfileLoader.getMergedProfile(gameState.selectedSage);
    const sageContext = profile
      ? `\n\n## 選択された偉人\n名前: ${profile.name}\nトーン: ${profile.tone || ''}\n性格: ${profile.personality || ''}\n名言: ${profile.coreQuote || ''}`
      : '';
    const systemContent = SYSTEM_PROMPT + sageContext;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: gameState.messages,
        systemPrompt: systemContent,
        model: GAME_CONFIG.API.model,
        temperature: GAME_CONFIG.API.temperature,
        max_tokens: GAME_CONFIG.API.max_tokens,
        presence_penalty: GAME_CONFIG.API.presence_penalty,
        frequency_penalty: GAME_CONFIG.API.frequency_penalty,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    loadingEl.remove();
    renderMessage('ai', reply);
    gameState.messages.push({ role: 'assistant', content: reply });

    const choices = parseChoices(reply);
    if (choices.length > 0) {
      renderChoices(choices);
    }
  } catch (err) {
    loadingEl.remove();
    ErrorHandler.log('sendMessage', err);
    const { userMessage } = ErrorHandler.handleAPIError(err);
    ErrorHandler.showErrorToast(userMessage);
    renderMessage('ai', '⚠️ ' + userMessage);
  }
}

/** メッセージDOM生成 */
function renderMessage(role, content, isLoading = false) {
  const messagesEl = document.getElementById('chat-messages');
  if (!messagesEl) return null;

  const div = document.createElement('div');
  div.className = `chat-message chat-message-${role === 'user' ? 'user' : 'ai'}`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = content;
  if (isLoading) bubble.classList.add('chat-bubble-loading');

  div.appendChild(bubble);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

/** A/B/C 選択肢を解析 */
function parseChoices(text) {
  const choices = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/^([A-C])\.\s+(.+)/);
    if (m) choices.push({ label: m[1], text: m[2].trim() });
  }
  return choices;
}

/** 選択肢ボタンを生成 */
function renderChoices(choices) {
  const messagesEl = document.getElementById('chat-messages');
  if (!messagesEl) return;

  const container = document.createElement('div');
  container.className = 'chat-choices';

  choices.forEach(({ label, text }) => {
    const btn = document.createElement('button');
    btn.className = 'chat-choice-btn';
    btn.textContent = `${label}. ${text}`;
    btn.addEventListener('click', () => {
      container.remove();
      sendMessage(`${label}. ${text}`);
    });
    container.appendChild(btn);
  });

  messagesEl.appendChild(container);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ══════════════════════════════════════════
// 進捗・クリア演出
// ══════════════════════════════════════════

/** 進捗更新（星座アイコン連動・クリア検知） */
function updateProgress() {
  const prev = gameState.constellationStars;
  gameState.constellationStars = Math.min(gameState.turnCount, 5);
  ConstellationIcon.updateAllIcons(gameState.constellationStars);

  // 初めて5に達したらクリアシーケンス開始
  if (gameState.constellationStars === 5 && prev < 5 && !gameState.cleared) {
    gameState.cleared = true;
    setTimeout(() => triggerClearSequence(), 1500);
  }
}

/** クリアシーケンス: フィードバック → クリア演出 */
async function triggerClearSequence() {
  await ChainedFeedback.chainedFeedback(gameState.selectedSage, gameState.messages);
  showClearScreen();
}

/** クリア演出: 星座最大輝度 + 完成テキスト + 流れ星 → 結果カード */
async function showClearScreen() {
  ConstellationIcon.updateAllIcons(5);

  // 完成テキストをチャットに表示
  await new Promise(r => setTimeout(r, 400));
  renderMessage('ai', '✨ 思考の星座、完成！✨');

  // 流れ星アニメーション（3本、1秒間隔）
  triggerShootingStars();

  // 1.5秒後に結果カードへ
  await new Promise(r => setTimeout(r, 2000));
  showResultCard();
}

/** 流れ星: 3本の線が画面を横切る */
function triggerShootingStars() {
  [0, 1000, 2000].forEach((delay, i) => {
    setTimeout(() => {
      const star = document.createElement('div');
      star.className = 'rc-shooting-star';
      star.style.top = `${15 + i * 18}%`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 900);
    }, delay);
  });
}

/** 結果カードを表示 */
async function showResultCard() {
  const profile = await SageProfileLoader.getMergedProfile(gameState.selectedSage);
  const now = new Date().toLocaleString('ja-JP');

  const panel = document.getElementById('result-card');
  panel.innerHTML = `
    <div class="rc-card rpg-window">
      <div class="rc-constellation">
        ${ConstellationIcon.createHTML(5, true)}
      </div>
      <h2 class="rc-title">🌌 今日の星座記録</h2>
      <div class="rc-info">
        <div class="rc-row"><span class="rc-label">偉人</span><span class="rc-value">${profile?.name || '—'} ${profile?.icon || ''}</span></div>
        <div class="rc-row"><span class="rc-label">問題タイプ</span><span class="rc-value">型${gameState.problemType}</span></div>
        <div class="rc-row"><span class="rc-label">対話回数</span><span class="rc-value">${gameState.turnCount} 回</span></div>
        <div class="rc-row"><span class="rc-label">達成日時</span><span class="rc-value">${now}</span></div>
      </div>
      <button class="rc-replay-btn" id="rc-replay">もう一度遊ぶ</button>
    </div>
  `;

  showPanel('result-card');

  // コレクションに保存
  SageCollection.saveResult(gameState.selectedSage, gameState.problemType, gameState.turnCount);

  document.getElementById('rc-replay').addEventListener('click', goHome);
}

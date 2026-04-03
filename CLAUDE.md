# ハルシネーション体験ゲーム（ai-adventure-book）プロジェクトルール

## プロジェクト概要
- 正式名称: ハルシネーション体験ゲーム
- 展示イベント: ニコニコ超会議 2026年4月25-26日（幕張メッセ）
- コンセプト: 「AIは、いい子とは限らない」
- 制作: FoPs × StudyMeter Inc.（宮﨑秀成）

## ★★★ 絶対に守ること（過去のバグ原因から抽出）

### ファイル操作ルール
1. **新規ファイル作成時の順序**: ファイル作成 → `ls -la` で存在確認 → index.htmlへの `<script>` or `<link>` 追加 の順。この順序を飛ばすと404エラーになる
2. **CSSクラス名には名前空間プレフィックスを付ける**: `portal-`、`trial-` など。衝突すると予期しないバグが発生する
3. **JS/CSSファイルは10個以下を維持**: 超えたらリファクタリングのサイン
4. **resultCard.js / errorHandler.js は変更禁止**: 汎用化済み共通ライブラリ

### 開発フロー
5. **各Phase完了時にgit commitする**: `git add -A` → `git commit -m "Phase N: 内容"`
6. **各Phase完了後、ブラウザで動作確認するので一旦停止する**: 次のPhaseに勝手に進まない
7. **PowerShellでは `&&` を使わない**: コマンドは1行ずつ分割して実行

### DOM操作
8. **動的生成要素へのCSS適用**: DOMに要素が追加されるタイミングとCSSの評価タイミングにズレがある
9. **_gameRunning フラグを必ず確認**: 非同期フロー中に destroy() が呼ばれることがある

## 技術スタック
- フロントエンド: HTML + Vanilla JavaScript + Tailwind CSS (CDN)
- バックエンド: Vercel Serverless Functions (Node.js)
- API: OpenAI GPT-4o-mini
- データ永続化: LocalStorage
- デプロイ: Vercel（GitHub連携・自動デプロイ）
- バージョン管理: Git + GitHub

## デザインシステム（Phase B）

### フォント
- タイトル・見出し: `'Playfair Display', serif` （Google Fonts）
- 本文・説明文: `'Noto Sans JP', sans-serif` （Google Fonts）
- クリア演出（resultCard.js）: `'Pixelify Sans'`（Google Fontsで読み込み済み）

### カラーパレット（ブラウンダーク系）
```css
:root {
  --portal-bg: #0d0a06;           /* 最深背景 */
  --portal-bg2: #16120d;          /* セカンダリ背景 */
  --portal-card-bg: #1f1b14;      /* カード背景 */
  --portal-card-hover: #2a251c;   /* カードホバー */
  --portal-accent: #c4956a;       /* ゴールド系アクセント */
  --portal-accent-bright: #ddb07e;/* ホバー時 */
  --portal-border: rgba(196,149,106,.18);  /* 標準ボーダー */
  --portal-border-hover: rgba(196,149,106,.42); /* ホバーボーダー */
  --portal-text: #e8dcc8;         /* メインテキスト */
  --portal-text-sub: #a09080;     /* サブテキスト */
  --portal-text-muted: #5e5040;   /* ミュートテキスト */
}
```

### キャラクターカラー（裁判ゲーム）
```
裁判長: #d4a843  （ゴールド）
検事:   #6eafd4  （ブルー）
弁護人: #6ed48a  （グリーン）
被告AI: #d4826e  （テラコッタ）
```

## ファイル構成（Phase B）
```
ai-adventure-book/
├── public/
│   ├── index.html
│   ├── css/
│   │   ├── portal.css      ← 2カードポータル（portal-プレフィックス）
│   │   └── trial.css       ← 裁判ゲーム（trial-プレフィックス）
│   ├── js/
│   │   ├── portal.js       ← 2カードポータル（Portalモジュール）
│   │   ├── trial.js        ← 裁判ゲーム本体（Trialモジュール）
│   │   ├── resultCard.js   ← 変更禁止（クリア演出・汎用版）
│   │   └── errorHandler.js ← 変更禁止（共通エラーハンドラ）
│   └── data/
│       └── trial-fallback.json ← 裁判フォールバックデータ（2ラウンド）
├── api/
│   └── trial.js            ← 裁判ゲーム用Serverless Function
├── CLAUDE.md
├── package.json
└── vercel.json
```

## Phase B ルール（ハルシネーション裁判）

### ポータル
- `Portal.init()` がDOMContentLoadedで起動
- `Portal.navigateToTrial()` → `Trial.init()` を呼ぶ
- `Portal.navigateToPortal()` → `Trial.destroy()` + `ResultCard.cleanup()` を呼ぶ
- `window.goHome()` は portal.js で定義（resultCard.jsが呼び出す）
- 展示会モード: `?mode=exhibition` で起動。60秒非アクティブでリセット

### 裁判ゲーム（trial.js）
- `Trial.init(options)` → `runGame()` → `runRound()` ループ
- `Trial.destroy()` → `_gameRunning = false` + DOM クリア
- `Trial.restart()` → destroy() + init()
- `_gameRunning` フラグを全ての非同期処理前に確認すること
- `window.startGame` はResultCard.showの直前に `() => Trial.restart()` として設定

### API（api/trial.js）
- POST `/api/trial` — action: `generate_round` でラウンド全体を生成
- action: `expand_testimony` は将来拡張用（現在は簡易レスポンス）
- APIエラー時は `MOCK_ROUNDS` フォールバックで動作（展示会でも安全）

### クリア演出
```javascript
// ResultCard.show() の呼び出しパターン
window.startGame = () => Trial.restart();
ResultCard.show({
  gameName: '⚖️ ハルシネーション裁判',
  currentLevel: profile.rank || 0,
  gamesCleared: profile.gamesCleared || 0,
  details: [
    { label: '弁護ラウンド', value: 'N ラウンド' },
    { label: '積み重ねた嘘の層', value: 'N 層' },
    { label: '弁護文字数', value: 'N 文字' },
    { label: 'ランク', value: 'A — 嘘の弁護士' },
  ],
});
```

### ランク判定
- S（ハルシネーション・マスター）: 弁護文字数 >= 100
- A（嘘の弁護士）: >= 30
- B（駆け出し弁護人）: >= 1
- C（正直者）: 0

### LocalStorage
- `ai-experience-profile` — 共有プロフィール（resultCard.jsが管理）
  - フィールド: rank, totalPt, gamesCleared, clearedGames[], achievements[]

## 展示会モード（?mode=exhibition）
- 全体タイマー: 8分
- タイマー切れ → `_gameRunning = false` → 強制終了 → 結果画面
- 非アクティブ60秒 → `Portal.navigateToPortal()` リセット
- ラウンド数: 2ラウンド固定

## 弁護は常に通る（DEC-064）
- どの選択肢を選んでも被告AIは弁護を補強する証言をする
- 暫定確定。将来変更の場合は `showDefenseUI()` の resolve後に判定ロジックを追加

## テスト方針
- ローカル（file://）: UI表示のみ確認可能。fetch()はCORSエラー → MOCK_ROUNDSフォールバック動作を確認
- Vercel: ゲームフルフロー確認はデプロイ後に実施
- git push → Vercel自動デプロイ → Ctrl+Shift+R（ハードリロード）で確認

## API設定
```javascript
{
  model: "gpt-4o-mini",
  temperature: 0.85,
  max_tokens: 2000,
  response_format: { type: "json_object" }
}
```
環境変数: `OPENAI_API_KEY`（Vercel環境変数に設定済み）

## ハルシニカ固有ルール

### 絶対に守ること
- halucinica.css のデザイン（色、フォント、余白、レイアウト）は Artifact v2.0 と完全一致させること
- 「Wikipedia」「ウィキペディア」の名称・ロゴ・Wikimedia財団への言及は禁止
- 実在の人物・企業をネガティブに描く記事を生成するプロンプトにしないこと
- 既存ファイル（script.js, rpg-theme.css, chat-ui.css, constellation.css 等）は変更しないこと

### 新規作成ファイル（Phase B ハルシニカ）
- public/halucinica.html
- public/css/halucinica.css
- public/js/halucinica.js
- public/data/halucinica-mock.json
- api/halucinica.js

### 技術制約
- Vanilla JS のみ（React/Next.js 禁止）
- Google Fonts: Noto Serif JP, Noto Sans JP, Linux Libertine（CDN）
- OpenAI API: GPT-4o-mini, response_format: json_object, temperature: 0.9

### ハルシニカ設計
- 4画面: screen-intro → screen-keyword → screen-article → screen-end
- `.screen.active` で表示切替（halucinica.css固有。portal.cssの `.screen.visible` とは別）
- API呼び出しフロー: L1キャッシュ → L2 /api/halucinica → L3 モックDB → L4 ボカロリダイレクト
- S.history に閲覧記事の {title, summary} を保存し、APIにcontextとして送信（直近10件）
- タイマー: URLパラメータ `?timer=秒数`（0で無効）。デフォルト480秒
- goPortal() は `window.location.href = 'index.html'` でポータルに戻る
- ポータルからは `halucinica.html` または `halucinica.html?timer=480`（展示会モード）へ遷移
- モックDB: 9記事（ボカロ/音声合成戦争の歴史/初音ミク現象 + VTuber/バーチャルアイデンティティ論/画面越しの魂問題 + 推し活/推し経済圏/感情資本主義）

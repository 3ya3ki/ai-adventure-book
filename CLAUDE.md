# AI冒険の書（ai-adventure-book）プロジェクトルール

## プロジェクト概要
- 正式名称: AI冒険の書（AI Adventure Book）
- RPGポータル統合版 AI教育ゲーム
- 展示イベント: ニコニコ超会議 2026年4月25-26日
- コンセプト: 「AIはパートナー、道具ではない」

## ★★★ 絶対に守ること（過去のバグ原因から抽出）

### ファイル操作ルール
1. **新規ファイル作成時の順序**: ファイル作成 → `ls -la` で存在確認 → index.htmlへの `<script>` or `<link>` 追加 の順。この順序を飛ばすと404エラーになる
2. **既存機能を絶対に削除しない**: 特に選択肢ボタン（A/B/C）は核心機能。削除禁止
3. **CSSクラス名には名前空間プレフィックスを付ける**: 例 `sage-card-name`, `rpg-btn-primary`。衝突すると予期しないバグが発生する
4. **JS/CSSファイルは15個以下を維持**: 超えたらリファクタリングのサイン

### 開発フロー
5. **各Phase完了時にgit commitする**: `git add -A` → `git commit -m "Phase N: 内容"` 
6. **各Phase完了後、ブラウザで動作確認するので一旦停止する**: 次のPhaseに勝手に進まない
7. **PowerShellでは `&&` を使わない**: コマンドは1行ずつ分割して実行

### DOM操作
8. **動的生成要素へのCSS適用**: DOMに要素が追加されるタイミングとCSSの評価タイミングにズレがある。`setTimeout` で要素追加後に明示的にスタイルを変更する
9. **gameStateから直接値を取得**: DOM更新タイミングとJSの参照がズレる場合があるため

## 技術スタック
- フロントエンド: HTML + Vanilla JavaScript + Tailwind CSS (CDN)
- バックエンド: Vercel Serverless Functions (Node.js)
- API: OpenAI GPT-4o-mini
- データ永続化: LocalStorage
- デプロイ: Vercel（GitHub連携・自動デプロイ）
- バージョン管理: Git + GitHub

## デザインシステム

### フォント
- タイトル・見出し・ボタン: `'Pixelify Sans', cursive` （Google Fonts）
- 本文・説明文: `'Noto Sans JP', sans-serif` （Google Fonts）

### カラーパレット（CSS変数名で参照）
```css
:root {
  --bg-primary: #0a0e1a;        /* 最深背景 */
  --bg-secondary: #111827;       /* セカンダリ背景 */
  --bg-card: #1a2236;           /* カード背景 */
  --bg-card-hover: #1e2940;     /* カードホバー */
  --border-rpg: #2a3a5c;        /* 標準ボーダー */
  --border-gold: #c8a24e;       /* 金ボーダー（アクセント） */
  --gold-primary: #d4a843;      /* 金メイン */
  --gold-light: #f0d48a;        /* 金ライト */
  --gold-dim: #8a7033;          /* 金ディム */
  --text-primary: #e8e0d0;      /* メインテキスト */
  --text-secondary: #9ca3af;    /* サブテキスト */
  --text-muted: #6b7280;        /* ミュートテキスト */
  --accent-blue: #4a7cc9;       /* アクセント青 */
  --accent-cyan: #38bdf8;       /* アクセントシアン */
  --danger: #ef4444;            /* エラー */
  --success: #22c55e;           /* 成功 */
}
```

### RPGウィンドウ枠の標準パターン
```css
.rpg-window {
  background: var(--bg-card);
  border: 2px solid var(--border-rpg);
  border-radius: 8px;
}
/* 上部に金のライン */
.rpg-window::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--border-gold), transparent);
}
```

## ファイル構成
```
ai-adventure-book/
├── public/
│   ├── index.html
│   ├── css/
│   │   ├── rpg-theme.css          # RPGテーマ（フォント・配色・UI枠）
│   │   ├── chat-ui.css            # チャットUI
│   │   ├── constellation.css      # 星座アイコン
│   │   ├── collection.css         # 偉人図鑑
│   │   └── portal.css             # ポータル画面（Phase 1追加）
│   ├── js/
│   │   ├── gameConfig.js          # モード設定（EXHIBITION/FULL）
│   │   ├── modeManager.js         # モード管理
│   │   ├── onboarding.js          # スプラッシュ・チュートリアル
│   │   ├── constellationIcon.js   # 星座アイコン
│   │   ├── sageProfileLoader.js   # 偉人プロフィール読み込み
│   │   ├── chainedFeedback.js     # チェーンフィードバック
│   │   ├── errorHandler.js        # エラーハンドリング
│   │   ├── sageCollection.js      # 偉人図鑑ロジック
│   │   ├── portal.js              # ポータル画面ロジック（Phase 1追加）
│   │   └── script.js              # メインスクリプト（SYSTEM_PROMPT含む）
│   └── data/
│       ├── sages-core.json        # 偉人コア設定（選択画面用）
│       ├── sages-extended.json    # 偉人拡張設定（API送信用）
│       ├── problemTemplates.json  # 問題テンプレート（7型×各5パターン）
│       └── fallbackResponses.json # オフライン用応答
├── api/
│   └── chat.js                    # Vercel Serverless Function
├── CLAUDE.md                      # このファイル
├── package.json
└── vercel.json
```

## Phase 1 追加ファイル
- `public/css/portal.css` — ポータル画面CSS（`portal-` プレフィックス統一）
- `public/js/portal.js` — ポータル画面ロジック（`Portal` モジュール）

## Phase 1 ルール
- ポータル画面のCSSクラスは全て `portal-` プレフィックス
- `Portal.navigateToPortal()` / `Portal.navigateToGame()` で画面遷移
- `goHome()` はポータルが有効なら `ModeManager.stopTimer()` → `Portal.navigateToPortal()` を呼ぶ
- LocalStorageキー: `portal_adventure_record`（偉人ゲームのキーとは別管理）
- `screen-portal` / `screen-game` の2画面構造。`.screen.visible` で表示切替
- `startGameFromPortal(mode)` がポータル→ゲームの起動エントリポイント
- `Portal.markGameCleared(gameId)` はPhase 2以降で呼び出し元を接続する

## API設定
```javascript
{
  model: "gpt-4o-mini",
  temperature: 0.8,
  max_tokens: 1000,
  presence_penalty: 0.3,
  frequency_penalty: 0.3
}
```
環境変数: `OPENAI_API_KEY`（Vercel環境変数に設定）

## 2モードシステム
- `?mode=exhibition` : 展示会モード（偉人5名、3〜5分で完結）
- `?mode=full` : 標準モード（偉人13名、時間制限なし）
- デフォルト: 標準モード

## 設計判断（継承事項）
1. ChatGPT/Gemini/ClaudeのUIを参考 — 操作学習コストゼロ
2. 偉人選択を専用画面に分離 — 対話中は非表示
3. 選択肢ボタン（A/B/C）は核心機能 — 展示会ではタップ進行が重要
4. 偉人プロフィール2層構造 — APIトークンコスト68〜74%削減
5. 対話形式フィードバックをチェーン呼び出し — ストリーミング的UX
6. ダークモード基調の配色 — RPGテーマ（ダークブルー×金）
7. 星座アイコン「思考の星座」 — 対話進行に合わせて星が増える独自演出
8. max-width: 768px でコンテンツ中央寄せ
9. 入力欄は画面下部固定（position: fixed; bottom: 0）

## テスト方針
- ローカル（file://）: UI表示のみ確認可能。fetch()はCORSエラーになるためフォールバック必須
- Vercel: ゲームフルフロー確認はデプロイ後に実施
- git push → Vercel自動デプロイ → Ctrl+Shift+R（ハードリロード）で確認

## Phase 1.5 追加ファイル・変更（クリア演出 + デザイン統一）
- `public/js/resultCard.js` — クリア演出v1.4（QUEST CLEAR → EXP → LEVEL UP → 探索記録カード）
- `public/css/constellation.css` — 星座アイコンのカラーをRPGゴールドに統一（紫→金）
- `public/index.html` — `<canvas id="pcanvas">` 追加済み、`resultCard.js` 読み込み追加済み
- `public/js/script.js` — クリアトリガーを `ResultCard.show()` に更新済み

### Phase 1.5 ルール
- クリア演出のデザインは合格済みArtifact v1.4が契約（contract）。変更禁止
- 星座アイコンの配色はRPGカラーパレット（gold系）を使用。紫系は使用禁止
- `ResultCard.show(params)` のインターフェースを変更する場合は script.js 側も同時に更新すること
- LocalStorage `ai-adventure-profile` のスキーマ: `{level, totalExp, gamesCleared, clearedGames[], achievements[]}`

## Phase A 追加ルール（2026-03-04）
- LocalStorageキー: "ai-experience-profile"（旧 "ai-adventure-profile" から変更）
- フィールド: .rank（旧 .level）、.totalPt（旧 .totalExp）、.clearedGames（変更なし）
- ポータルフォント: IBM Plex Sans + Noto Sans JP（Pixelify Sans は撤廃）
- ポータル画面: カード型ショーケース（RPG世界観は撤廃）
- クリア演出: "COMPLETE!" / "体験pt" / "RANK UP!" / 紙吹雪

## Phase 2: ウソつきAI（Doubt Mirage）

### 追加ファイル
- `public/js/doubt-mirage.js` — ウソつきAIゲーム本体
- `public/css/doubt-mirage.css` — ウソつきAI固有スタイル
- `api/doubt-mirage.js` — 問題生成API（Vercel Serverless Function、未実装）

### ルール
- CSSクラスは全て `dm-` プレフィックス
- LocalStorageキーは全て `ai-exp-doubt-` プレフィックス（ポータル共有プロフィールは `ai-experience-profile`）
- 偉人ゲーム関連ファイル（script.js, onboarding.js, chainedFeedback.js 等）は変更禁止
- ポータル接続は `startGameFromPortal('doubt-mirage')` パターンを使用
- クリア演出は `ResultCard.show()` を呼び出し（resultCard.js 内部は変更禁止）
- クリア時は `ai-experience-profile` の `clearedGames` に `'uso'` を追加してポータルの体験数を更新
- `triggerClearAnimation()` が ResultCard と goHome() をつなぐ接続関数
- `destroy()` で `#app` の表示・`body.overflowY` を必ず元に戻すこと

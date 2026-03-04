/**
 * api/doubt-mirage.js — Vercel Serverless Function
 * ウソつきAI（Doubt Mirage）問題生成API
 * GPT-4o-miniで問題を動的生成し、構造化JSONで返す
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const VALID_DIFFICULTIES = ['easy', 'normal', 'hard'];
const VALID_GENRES = ['technology', 'science', 'history', 'popculture', 'ai'];

// ── システムプロンプト ──
const SYSTEM_PROMPT = `あなたは「ダウト・ミラージュ」というAIリテラシー教育ゲームの問題生成エンジンです。
キャラ台詞やゲーム進行は不要。純粋に問題データのみをJSON形式で出力してください。

## 出力ルール（厳守）
- 必ず以下のJSON形式のみを出力すること。JSONの前後に説明文やMarkdownを含めないこと
- statementsは3〜5個。そのうち嘘（isLie: true）は必ず1つだけ
- 嘘以外は全て検証可能な事実であること
- statementsの順番はランダムにすること（嘘が常に同じ位置に来ないように）

## 嘘の設計方針
嘘は「AIがハルシネーションしそうなもっともらしい間違い」であること。
以下の6パターンのいずれかを使用：
1. 【因果関係捏造型】— 相関や関連を因果関係に捏造する
2. 【部分的真実型】— 正しい事実に嘘の情報を混ぜる
3. 【主語すり替え型】— 正しい述語に間違った主語を当てる
4. 【単位すり替え型】— 数値や単位を微妙にずらす
5. 【時系列シャッフル型】— 時間軸を入れ替える
6. 【もっともらしい用語型】— 実在する用語に偽の定義を当てはめる

## 難易度定義
- easy（🟢やさしめ）：小学生でも日常体験や常識で違和感に気づけるレベル。年代、数値、バージョン番号の微妙な違いでの嘘は禁止。「日常で実際に体験していることと矛盾する」嘘のみ。
- normal（🟡ふつう）：中学〜高校レベルの基礎知識があれば見抜けるレベル。
- hard（🔴ガチ）：そのジャンルに詳しくないと見抜けないレベル。

## ジャンル定義
- technology：SNS、ゲーム機、スマホ、プログラミング、ガジェットなど身近なテクノロジー
- science：人体、宇宙、食べ物の科学、動物、物理など
- history：インターネット史、企業の起源、サブカルチャー史、言葉の起源、発明など
- popculture：ゲームキャラ、アニメ、音楽、映画、VTuberなど
- ai：AIの能力、歴史、創作、身近な活用、用語など

## 出力JSON形式
{
  "statements": [
    {"id": 1, "text": "文1", "isLie": false},
    {"id": 2, "text": "文2", "isLie": true},
    {"id": 3, "text": "文3", "isLie": false}
  ],
  "lieExplanation": "嘘だった文の正しい情報と、なぜ間違いなのかの解説",
  "liePattern": "【パターン名】",
  "liePatternDescription": "このパターンの簡潔な説明"
}`;

// ── フォールバック用モックデータ（25問） ──
const FALLBACK_QUESTIONS = {
  technology: [
    {
      statements: [
        { id: 1, text: "Twitterの1ツイートの文字数上限は、もともと140文字だった。", isLie: false },
        { id: 2, text: "YouTubeに最初に投稿された動画は、創業者が動物園で撮影した短い動画だった。", isLie: false },
        { id: 3, text: "LINEは、東日本大震災をきっかけに開発が始まったメッセージアプリである。", isLie: false },
        { id: 4, text: "TikTokは、もともとAI研究論文の共有プラットフォームとして開発された。", isLie: true },
      ],
      lieExplanation: "TikTokの前身はmusical.lyという短尺動画アプリで、AI論文とは無関係。開発元のByteDanceはAI技術を活用しているが、サービスの出発点は動画エンタメ。AIを活用＝AIのために作られた、と因果を捏造するハルシネーション。",
      liePattern: "【因果関係捏造型】",
      liePatternDescription: "「AI技術を使っている」事実を「AIのために作られた」にすり替えるパターン。",
    },
    {
      statements: [
        { id: 1, text: "QRコードは日本の自動車部品メーカー（デンソー）が開発した技術である。", isLie: false },
        { id: 2, text: "世界で初めてカメラを搭載した携帯電話は、日本のシャープが開発した。", isLie: false },
        { id: 3, text: "Wi-Fiの「Fi」は「Fidelity（忠実度）」の略称である。", isLie: true },
      ],
      lieExplanation: "Wi-Fiは「Wireless Fidelity」の略だと広く信じられているが、実際は何の略でもない。Wi-Fi Allianceの創設メンバーが「語呂の良さで名付けた」と公式に説明している。",
      liePattern: "【もっともらしい用語型】",
      liePatternDescription: "実在する技術用語に、もっともらしい語源を当てはめるパターン。",
    },
    {
      statements: [
        { id: 1, text: "Nintendo Switchは据え置きと携帯の両方で遊べるハイブリッドゲーム機である。", isLie: false },
        { id: 2, text: "PlayStationは、もともと任天堂とソニーの共同プロジェクトがきっかけで生まれた。", isLie: false },
        { id: 3, text: "ゲームボーイは発売当時、モノクロ液晶を採用していた。", isLie: false },
        { id: 4, text: "セガのドリームキャストは、世界で初めてオンライン対戦機能を標準搭載した家庭用ゲーム機である。", isLie: true },
      ],
      lieExplanation: "ドリームキャストはモデムを標準搭載しオンラインに注力した先駆的なゲーム機だが、「世界初」は正確ではない。それ以前にもセガサターンのネットワーク対応やXBANDなど、オンライン対戦の試みは存在していた。",
      liePattern: "【部分的真実型】",
      liePatternDescription: "「先駆的」を「世界初」に格上げするハルシネーション。",
    },
    {
      statements: [
        { id: 1, text: "世界で最も多く使われているパスワードの一つは「123456」である。", isLie: false },
        { id: 2, text: "Bluetoothの名前は、デンマークの国王の名前に由来している。", isLie: false },
        { id: 3, text: "二段階認証は、パスワードだけよりもアカウントの安全性を高める仕組みである。", isLie: false },
        { id: 4, text: "指紋認証の技術は、もともとNASAが宇宙飛行士の本人確認のために開発した。", isLie: true },
      ],
      lieExplanation: "指紋認証技術の起源はNASAではない。指紋による個人識別は19世紀のイギリスで犯罪捜査のために発展した。「権威ある組織を起源にする」のは典型的なハルシネーション。",
      liePattern: "【因果関係捏造型】",
      liePatternDescription: "権威ある組織を起源にして信頼性を高めるパターン。",
    },
    {
      statements: [
        { id: 1, text: "Pythonの名前は、イギリスのコメディ番組『Monty Python』に由来する。", isLie: false },
        { id: 2, text: "世界で最初のプログラマーは女性（エイダ・ラブレス）だとされている。", isLie: false },
        { id: 3, text: "GitHubのマスコットキャラクター「Octocat」は猫とタコを合体させたデザインである。", isLie: false },
        { id: 4, text: "JavaScriptは、プログラミング言語Javaをブラウザで動かすために作られた簡易版である。", isLie: true },
      ],
      lieExplanation: "JavaScriptとJavaは名前が似ているが全く別の言語。JavaScriptはNetscape社が独自に開発した。当時のJavaの人気にあやかってマーケティング目的で似た名前がつけられた。",
      liePattern: "【因果関係捏造型】",
      liePatternDescription: "名前の類似性から因果関係を捏造するパターン。",
    },
  ],
  science: [
    {
      statements: [
        { id: 1, text: "人間のDNAはバナナのDNAと約60%一致している。", isLie: false },
        { id: 2, text: "人間の胃酸は金属を溶かすほど強い酸性である。", isLie: false },
        { id: 3, text: "人間の骨の数は、大人と赤ちゃんで同じである。", isLie: true },
      ],
      lieExplanation: "赤ちゃんの骨は約300個だが、成長とともに融合し、大人では約206個になる。赤ちゃんの方が骨が多い。",
      liePattern: "【部分的真実型】",
      liePatternDescription: "「人間の骨」は正しい話題だが、年齢による違いを無視するパターン。",
    },
    {
      statements: [
        { id: 1, text: "宇宙空間では、音は伝わらない。", isLie: false },
        { id: 2, text: "太陽の光が地球に届くまでにかかる時間は約8分である。", isLie: false },
        { id: 3, text: "木星は太陽系で最も大きい惑星で、地球の約11倍の直径がある。", isLie: false },
        { id: 4, text: "月は毎年少しずつ地球に近づいている。", isLie: true },
      ],
      lieExplanation: "月は毎年約3.8cmずつ地球から「遠ざかっている」。近づいているのではなく離れている。方向を逆にするハルシネーション。",
      liePattern: "【因果関係捏造型】",
      liePatternDescription: "事実の方向性だけを逆にするパターン。",
    },
    {
      statements: [
        { id: 1, text: "ハチミツは適切に保存すれば、何千年経っても腐らない。", isLie: false },
        { id: 2, text: "トマトは植物学的には果物に分類される。", isLie: false },
        { id: 3, text: "チョコレートの原料カカオ豆は、かつて通貨として使われていた。", isLie: false },
        { id: 4, text: "わさびの辛さは、唐辛子と同じ成分「カプサイシン」によるものである。", isLie: true },
      ],
      lieExplanation: "わさびの辛味成分は「アリルイソチオシアネート」で、唐辛子のカプサイシンとは全く異なる。わさびの辛味が鼻に抜けるのは、この成分が揮発性を持つため。",
      liePattern: "【主語すり替え型】",
      liePatternDescription: "「辛い」という共通点から異なる成分を同一視するパターン。",
    },
    {
      statements: [
        { id: 1, text: "タコには心臓が3つある。", isLie: false },
        { id: 2, text: "キリンの睡眠時間は1日約30分程度である。", isLie: false },
        { id: 3, text: "カメレオンが体の色を変えるのは、主に周囲の景色に溶け込むためである。", isLie: true },
      ],
      lieExplanation: "カメレオンの体色変化は「擬態」ではなく、主に「コミュニケーション」と「体温調節」のため。仲間への信号やストレス表現が主な目的。",
      liePattern: "【部分的真実型】",
      liePatternDescription: "広く信じられている「常識」を事実として語るパターン。",
    },
    {
      statements: [
        { id: 1, text: "雷は同じ場所に二度落ちることがある。", isLie: false },
        { id: 2, text: "水は電気を通すが、純粋な蒸留水はほとんど電気を通さない。", isLie: false },
        { id: 3, text: "人間は脳の10%しか使っていない。", isLie: true },
        { id: 4, text: "ダイヤモンドは世界で最も硬い天然鉱物である。", isLie: false },
      ],
      lieExplanation: "「脳の10%しか使っていない」は最も有名な科学の都市伝説。脳スキャン研究により、人間は脳のほぼ全領域を活用していることが証明されている。",
      liePattern: "【部分的真実型】",
      liePatternDescription: "有名な俗説をそのまま事実として出力するハルシネーション。",
    },
  ],
  history: [
    {
      statements: [
        { id: 1, text: "ニコニコ動画のサービス開始は2006年である。", isLie: false },
        { id: 2, text: "2ちゃんねるは、当時留学中だった西村博之がアメリカで開設した。", isLie: false },
        { id: 3, text: "日本初の絵文字は、NTTドコモの携帯電話向けに作られた。", isLie: false },
        { id: 4, text: "「ネットサーフィン」という言葉は、日本のIT企業が広告用に作った和製英語である。", isLie: true },
      ],
      lieExplanation: "「ネットサーフィン」は和製英語ではなく、1992年にアメリカのライブラリアン、ジーン・アーマー・ポリーが「Surfing the Internet」として使った表現が起源。",
      liePattern: "【主語すり替え型】",
      liePatternDescription: "英語圏発の言葉を「和製英語」と偽るパターン。",
    },
    {
      statements: [
        { id: 1, text: "任天堂はもともと花札の製造会社として創業した。", isLie: false },
        { id: 2, text: "Googleの社名は「Googol（10の100乗）」のスペルミスが由来である。", isLie: false },
        { id: 3, text: "Amazonは最初、書籍のオンライン販売専門のサイトとして始まった。", isLie: false },
        { id: 4, text: "Netflixは、創業者がレンタルビデオの返却を忘れて延滞金を取られた体験から生まれた。", isLie: true },
      ],
      lieExplanation: "この「延滞金エピソード」はNetflix自身がブランディングのために語った創業神話。共同創業者のマーク・ランドルフは後にこれを否定している。",
      liePattern: "【因果関係捏造型】",
      liePatternDescription: "「美しい創業ストーリー」を事実として語るパターン。",
    },
    {
      statements: [
        { id: 1, text: "「スペースインベーダー」が大ヒットした1978年、日本では100円玉不足が社会問題になった。", isLie: false },
        { id: 2, text: "「コミックマーケット」（コミケ）の第1回は、参加者わずか約700人だった。", isLie: false },
        { id: 3, text: "初音ミクのキャラクターデザインは、公募コンテストで選ばれた一般応募者の作品である。", isLie: true },
      ],
      lieExplanation: "初音ミクのキャラクターデザインはイラストレーターのKEIが、クリプトン・フューチャー・メディアの依頼を受けて制作した。公募やコンテストではない。",
      liePattern: "【因果関係捏造型】",
      liePatternDescription: "「ユーザー参加型文化」のイメージから因果を捏造するパターン。",
    },
    {
      statements: [
        { id: 1, text: "「emoji」は日本語の「絵文字」がそのまま英語になった言葉である。", isLie: false },
        { id: 2, text: "カラオケは日本発祥の娯楽文化である。", isLie: false },
        { id: 3, text: "「ツンデレ」は2000年代にインターネット掲示板から広まった言葉である。", isLie: false },
        { id: 4, text: "「推し」という言葉は、AKB48の公式用語として運営が作った造語である。", isLie: true },
      ],
      lieExplanation: "「推し」はAKB48の運営が作った公式用語ではなく、ファンコミュニティの中で自然発生的に使われ始めた言葉。",
      liePattern: "【主語すり替え型】",
      liePatternDescription: "ファン発の文化を「公式が作った」とすり替えるパターン。",
    },
    {
      statements: [
        { id: 1, text: "インスタントラーメンは日本人の安藤百福が発明した。", isLie: false },
        { id: 2, text: "電子レンジは、レーダー研究中にチョコレートが溶けたことがきっかけで発明された。", isLie: false },
        { id: 3, text: "青色LEDの実用化に成功した日本人研究者はノーベル物理学賞を受賞した。", isLie: false },
        { id: 4, text: "ポスト・イットの接着剤は、超強力接着剤を目指して開発していた際の失敗作である。", isLie: true },
      ],
      lieExplanation: "「超強力接着剤」を目指していたのではなく、3Mの研究者が新しい接着剤を研究する過程で偶然生まれた「弱い接着剤」。目的を誇張するハルシネーション。",
      liePattern: "【部分的真実型】",
      liePatternDescription: "偶然の発見に劇的なストーリーを付加するパターン。",
    },
  ],
  popculture: [
    {
      statements: [
        { id: 1, text: "マリオの本名は「マリオ・マリオ」（マリオが名字で名前）である。", isLie: false },
        { id: 2, text: "ピカチュウの名前は「ピカピカ」と「チュウ（ネズミの鳴き声）」を組み合わせたものである。", isLie: false },
        { id: 3, text: "リンク（ゼルダの伝説）がしゃべらないのは、プレイヤーとの一体感を高めるための意図的なデザインである。", isLie: false },
        { id: 4, text: "パックマンの形は、開発者がピザを一切れ食べた時の形からヒントを得て生まれた。", isLie: true },
      ],
      lieExplanation: "この「ピザ伝説」は有名だが、生みの親の岩谷徹氏は後のインタビューで、「食べる」というコンセプトから口の形を先にデザインし、ピザの話は後付けだったと語っている。",
      liePattern: "【因果関係捏造型】",
      liePatternDescription: "有名すぎるエピソードが実は創作だったパターン。",
    },
    {
      statements: [
        { id: 1, text: "「ドラゴンボール」の悟空のモデルは、中国の古典小説「西遊記」の孫悟空である。", isLie: false },
        { id: 2, text: "「新世紀エヴァンゲリオン」のタイトルの「エヴァンゲリオン」はギリシャ語で「福音」を意味する。", isLie: false },
        { id: 3, text: "「ONE PIECE」の最終回は連載開始時点で既に決まっていると尾田栄一郎は公言している。", isLie: false },
        { id: 4, text: "「鬼滅の刃」は当初、少年ジャンプの読者アンケートで常に1位だったため連載が決定した。", isLie: true },
      ],
      lieExplanation: "鬼滅の刃は連載当初、読者アンケートの順位は安定せず打ち切りの危機もあった。アニメ化（特にufotableの映像美）をきっかけに爆発的人気を得た。",
      liePattern: "【因果関係捏造型】",
      liePatternDescription: "「大人気作品は最初から人気だった」と思い込むパターン。",
    },
    {
      statements: [
        { id: 1, text: "ボーカロイド技術はヤマハが開発した音声合成技術である。", isLie: false },
        { id: 2, text: "「千本桜」はニコニコ動画で初めて投稿されたボカロ曲の一つである。", isLie: true },
        { id: 3, text: "米津玄師はもともとボカロPの「ハチ」として活動していた。", isLie: false },
        { id: 4, text: "「歌ってみた」文化はニコニコ動画から広まった日本独自のネット文化である。", isLie: false },
      ],
      lieExplanation: "「千本桜」（黒うさP、2011年）は大ヒットしたボカロ曲だが「初めて投稿された」ものではない。ニコニコでのボカロ投稿は2007年の初音ミク登場時から始まっており、千本桜はそこから約4年後。",
      liePattern: "【時系列シャッフル型】",
      liePatternDescription: "有名な曲を「最初期」と結びつけるパターン。",
    },
    {
      statements: [
        { id: 1, text: "「千と千尋の神隠し」は日本映画として初めてアカデミー賞を受賞した作品である。", isLie: false },
        { id: 2, text: "スタジオジブリの名前は、サハラ砂漠に吹く熱風の名前に由来する。", isLie: false },
        { id: 3, text: "ディズニーの「アナと雪の女王」の原作はアンデルセンの「雪の女王」である。", isLie: false },
        { id: 4, text: "ピクサーの「トイ・ストーリー」は、世界初のフル3DCGアニメ映画であり、手描きアニメーターたちの反対を押し切ってディズニーが単独で制作した。", isLie: true },
      ],
      lieExplanation: "「トイ・ストーリー」が世界初のフル3DCG長編映画であることは事実だが、制作したのはピクサーであり、ディズニーは配給を担当した。「ディズニーが単独制作」は嘘。",
      liePattern: "【部分的真実型】",
      liePatternDescription: "正しい事実に嘘の情報を混ぜて新しいストーリーを作るパターン。",
    },
    {
      statements: [
        { id: 1, text: "キズナアイは「バーチャルYouTuber」という言葉を広めた先駆的な存在である。", isLie: false },
        { id: 2, text: "VTuberの配信で使われるモーションキャプチャー技術は、もともと映画の特殊効果のために開発された。", isLie: false },
        { id: 3, text: "にじさんじやホロライブなどのVTuber事務所は、すべて2017年に設立された。", isLie: true },
        { id: 4, text: "「スーパーチャット（スパチャ）」はYouTubeが提供する投げ銭機能である。", isLie: false },
      ],
      lieExplanation: "にじさんじ（ANYCOLOR）の前身は2018年、ホロライブ（カバー）の設立は2016年とそれぞれ異なる。「VTuberブーム＝2017年」から全てを同じ年に揃えるハルシネーション。",
      liePattern: "【時系列シャッフル型】",
      liePatternDescription: "大きなムーブメントに全てを紐づけてしまうパターン。",
    },
  ],
  ai: [
    {
      statements: [
        { id: 1, text: "ChatGPTはOpenAIが開発した大規模言語モデルを使った対話型AIである。", isLie: false },
        { id: 2, text: "AIは大量のデータからパターンを見つけて学習する仕組みである。", isLie: false },
        { id: 3, text: "現在のAIは文章を「理解」しているのではなく、統計的に次の単語を予測している。", isLie: false },
        { id: 4, text: "最新のAIは、学習していないジャンルの質問にも正確に回答できる。", isLie: true },
      ],
      lieExplanation: "AIは学習データにない情報について正確に回答できない。むしろ「もっともらしい嘘」（ハルシネーション）を生成してしまうのが現在のAIの課題。まさにこのゲームのテーマそのもの。",
      liePattern: "【もっともらしい用語型】",
      liePatternDescription: "AIの能力を実際以上に表現するパターン。",
    },
    {
      statements: [
        { id: 1, text: "「人工知能（AI）」という言葉が初めて使われたのは1956年のダートマス会議である。", isLie: false },
        { id: 2, text: "IBMのDeep Blueは1997年にチェスの世界チャンピオンに勝利した。", isLie: false },
        { id: 3, text: "AlphaGoが囲碁のプロ棋士に勝利したのはGoogleが開発したAIである。", isLie: false },
        { id: 4, text: "世界初のAIアシスタント「Siri」は、Appleが社内で独自にゼロから開発した。", isLie: true },
      ],
      lieExplanation: "Siriはスタンフォード研究所（SRI International）のプロジェクトから生まれたスタートアップが開発し、2010年にAppleが買収した。Apple社内でゼロから開発されたわけではない。",
      liePattern: "【主語すり替え型】",
      liePatternDescription: "「Apple製品＝Appleが作った」と単純化するパターン。",
    },
    {
      statements: [
        { id: 1, text: "AIが描いた絵が美術コンテストで優勝し、議論を巻き起こしたことがある。", isLie: false },
        { id: 2, text: "画像生成AIは、インターネット上の大量の画像データを使って学習している。", isLie: false },
        { id: 3, text: "AIが作曲した音楽は、現在の法律ではAI自身が著作権を持つことになっている。", isLie: true },
        { id: 4, text: "文章生成AIは、人間が書いた大量のテキストデータをもとにパターンを学習している。", isLie: false },
      ],
      lieExplanation: "現在の多くの国の法律では、AIが自律的に生成した作品に著作権は認められていない。著作権は「人間の創作活動」に対して認められるもの。",
      liePattern: "【もっともらしい用語型】",
      liePatternDescription: "「作ったもの＝著作権がある」と短絡するパターン。",
    },
    {
      statements: [
        { id: 1, text: "スマートフォンの顔認証にはAI技術が使われている。", isLie: false },
        { id: 2, text: "動画サイトの「おすすめ」表示にはAIのレコメンドアルゴリズムが使われている。", isLie: false },
        { id: 3, text: "迷惑メールフィルターにもAIの技術が活用されている。", isLie: false },
        { id: 4, text: "自動翻訳アプリは、世界中の全ての言語を同じ精度で翻訳できるようになっている。", isLie: true },
      ],
      lieExplanation: "翻訳精度は言語ペアによって大きく異なる。英語↔日本語などメジャーな言語は精度が高いが、学習データが少ないマイナー言語では大幅に低下する。",
      liePattern: "【もっともらしい用語型】",
      liePatternDescription: "テクノロジーが万能であるかのように語るパターン。",
    },
    {
      statements: [
        { id: 1, text: "「ディープラーニング」はニューラルネットワークを多層にした機械学習の手法である。", isLie: false },
        { id: 2, text: "GPTは「Generative Pre-trained Transformer」の略である。", isLie: false },
        { id: 3, text: "AIの「ハルシネーション」とは、AIがもっともらしい嘘を自信満々に生成してしまう現象である。", isLie: false },
        { id: 4, text: "「プロンプト」とは、AIが内部で自動生成する思考プロセスのことである。", isLie: true },
      ],
      lieExplanation: "「プロンプト」とは、ユーザーがAIに与える指示や質問のこと。AIが内部で生成するものではなく、人間がAIに伝える入力。",
      liePattern: "【もっともらしい用語型】",
      liePatternDescription: "AI用語を微妙にずらして定義するパターン。",
    },
  ],
};

// ── ユーティリティ ──
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getFallbackQuestion(genre) {
  const pool = FALLBACK_QUESTIONS[genre] || FALLBACK_QUESTIONS.technology;
  const q = pool[Math.floor(Math.random() * pool.length)];
  return { ...q, source: 'fallback' };
}

function validateQuestion(data) {
  if (!data || !Array.isArray(data.statements)) return false;
  const lieCount = data.statements.filter((s) => s.isLie === true).length;
  return lieCount === 1;
}

async function callOpenAI(apiKey, difficulty, genre, questionNumber, previousTopics) {
  const userMessage = `難易度: ${difficulty}
ジャンル: ${genre}
問題番号: ${questionNumber}
過去に出たトピック（重複回避）: ${previousTopics && previousTopics.length > 0 ? previousTopics.join(', ') : 'なし'}`;

  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.9,
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content);
}

// ── メインハンドラー ──
export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { difficulty, genre, questionNumber = 1, previousTopics = [] } = req.body || {};

  // バリデーション
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` });
  }
  const safeGenre = VALID_GENRES.includes(genre) ? genre : 'technology';

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[doubt-mirage] OPENAI_API_KEY not set, using fallback');
    return res.status(200).json(getFallbackQuestion(safeGenre));
  }

  // 1回目の試行
  try {
    const question = await callOpenAI(apiKey, difficulty, safeGenre, questionNumber, previousTopics);
    if (validateQuestion(question)) {
      return res.status(200).json(question);
    }
    throw new Error('Validation failed: lie count is not 1');
  } catch (err) {
    console.warn('[doubt-mirage] First attempt failed:', err.message);
  }

  // リトライ（1回）
  try {
    const question = await callOpenAI(apiKey, difficulty, safeGenre, questionNumber, previousTopics);
    if (validateQuestion(question)) {
      return res.status(200).json(question);
    }
    throw new Error('Validation failed on retry');
  } catch (err) {
    console.warn('[doubt-mirage] Retry failed, using fallback:', err.message);
  }

  // フォールバック
  return res.status(200).json(getFallbackQuestion(safeGenre));
}

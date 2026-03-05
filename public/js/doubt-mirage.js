'use strict';

/* ================================================================
   doubt-mirage.js — ウソつきAI ゲーム本体（Vanilla JS）
   AI冒険の書 — Doubt Mirage
   ================================================================ */

const DoubtMirage = (() => {

  // ════════════════════════════════════════════════════════════
  // 1. 定数
  // ════════════════════════════════════════════════════════════

  const C = {
    accent:        '#f87171',
    accentDark:    '#dc2626',
    gold:          '#fbbf24',
    green:         '#34d399',
    orange:        '#fb923c',
    textPrimary:   '#f1f5f9',
    textSecondary: 'rgba(241,245,249,0.6)',
    textMuted:     'rgba(241,245,249,0.4)',
  };

  const DLG = {
    intro: 'ようこそ、DoubtMirageへ。私はミラージュ――真実の中に嘘を紛れ込ませる存在です。以下の文のうち、ひとつだけが嘘です。あなたはそれを見抜けますか？さあ、挑戦を始めましょう。',
    difficulty: 'さて、どれほどの覚悟でいらっしゃいますか？難易度をお選びください。',
    genre: 'どのジャンルで勝負しましょうか？得意分野があるなら、そこから始めてみてください。',
    question: [
      '以下の文の中に、ひとつだけ嘘が混じっています。どれか分かりますか？',
      '私の言葉はほぼ真実……でも、ひとつだけ嘘があります。見抜けますか？',
      '注意深く読んでください。嘘はひとつだけ、でも巧妙に隠してあります。',
      'さあ、目を凝らして。真実の中に嘘を紛れ込ませましたよ。',
      'この中のどれかが嘘です。あなたの直感を信じますか？',
    ],
    correct: {
      base:   ['さすがです！見抜きましたね。', '正解！あなたの眼は鋭い。'],
      combo2: ['2連続！調子が出てきましたね。', 'コンボ！素晴らしい。'],
      combo3: ['3連続！恐れ入ります……', '3連続正解！まさに探偵ですね。'],
      combo5: ['5連続！ここまで見抜かれるとは……', '圧巻のコンボです！'],
    },
    wrong: [
      'ふふ……お見事に引っかかりましたね。私の嘘、そんなに自然でしたか？',
      'あらら、信じてしまいましたか。……まあ、私の嘘は一級品ですから。',
      '残念。真実の中に嘘を紛れ込ませるのは、私の得意技でしてね。',
      '騙されましたね？　でもご安心を——次はもう少し手加減しますよ。……しないかもしれませんが。',
      'おや、気づけませんでしたか。次こそは私を出し抜いてみせてください。期待していますよ。',
    ],
    wrongGuess: [
      'それ、本当のことですよ？　疑り深いのは良いことですが、疑う方向を間違えましたね。',
      'ふふ、真実を嘘だと思いましたか。……私が仕掛けた罠は、別のところにありましたよ。',
      'おっと、それは事実です。嘘は別の場所に隠してありました。もう一度よく考えてみてください。',
    ],
    resultByRank: {
      S: '完璧です。あなたはもはやミラージュを超えた。この敗北……認めましょう。',
      A: '見事な戦いでした。あなたの眼力には脱帽です。',
      B: 'なかなかの成績。次は更に上を目指してください。',
      C: 'まだまだ伸びしろがありますね。嘘は奥深い。',
      D: '今回は私の勝ちですね。でも、また挑戦してください。',
    },
  };

  const RANKS = [
    { min: 200, label: 'S', name: 'ミラージュ使い',  emoji: '🌟' },
    { min: 150, label: 'A', name: '鋭き探偵',        emoji: '🔍' },
    { min: 100, label: 'B', name: '疑惑の探索者',     emoji: '🧩' },
    { min: 50,  label: 'C', name: '見習い調査官',     emoji: '📋' },
    { min: 0,   label: 'D', name: '信じやすい人',     emoji: '😅' },
  ];

  const GENRES = [
    { id: 'science', label: '科学・技術', emoji: '🔬' },
    { id: 'history', label: '歴史',       emoji: '🏛️' },
    { id: 'nature',  label: '自然・生物', emoji: '🌿' },
    { id: 'culture', label: '文化・芸術', emoji: '🎨' },
    { id: 'general', label: '雑学',       emoji: '💡' },
  ];

  const DIFFS = [
    { id: 'easy',   label: 'やさしい',   desc: '嘘は比較的分かりやすい。初めての方におすすめ。',   emoji: '🌱' },
    { id: 'normal', label: 'ふつう',     desc: '嘘は巧妙。しっかり考えながら読んでください。',     emoji: '⚔️' },
    { id: 'hard',   label: 'むずかしい', desc: '嘘と真実の境界が曖昧。上級者向けです。',           emoji: '💀' },
  ];

  // ════════════════════════════════════════════════════════════
  // 2. モックデータ（FALLBACK_QUESTIONS — 25問）
  // ════════════════════════════════════════════════════════════

  const FALLBACK_QUESTIONS = [
    // ── 科学・技術 ──
    {
      id: 'sci-1', genre: 'science', topic: '光の速さ',
      statements: [
        { id: 'a', text: '光は真空中を約30万km/秒で進む。', isLie: false },
        { id: 'b', text: '光が月から地球に届くまで約1.3秒かかる。', isLie: false },
        { id: 'c', text: '光は水の中では真空中より速く進む。', isLie: true },
        { id: 'd', text: 'アインシュタインの特殊相対性理論では光速は一定とされる。', isLie: false },
      ],
      lieExplanation: '光は水などの媒体の中では遅くなります（約22.5万km/秒）。速くなるわけではありません。',
      liePattern: '逆転の嘘',
      correctInfo: '光の速度は媒体の屈折率によって低下します。',
    },
    {
      id: 'sci-2', genre: 'science', topic: 'DNA',
      statements: [
        { id: 'a', text: 'DNAは二重らせん構造を持つ。', isLie: false },
        { id: 'b', text: 'チンパンジーと人間のDNA配列の一致率は約70%である。', isLie: true },
        { id: 'c', text: 'DNAの塩基はA・T・G・Cの4種類である。', isLie: false },
        { id: 'd', text: 'DNAはデオキシリボ核酸の略称である。', isLie: false },
      ],
      lieExplanation: 'チンパンジーと人間のDNAは約98〜99%が一致しています。70%は大幅に低い数字です。',
      liePattern: '数値の歪曲',
      correctInfo: 'ヒトとチンパンジーのDNA一致率は約98〜99%とされています。',
    },
    {
      id: 'sci-3', genre: 'science', topic: '元素周期表',
      statements: [
        { id: 'a', text: '周期表を作ったのはメンデレーエフとされる。', isLie: false },
        { id: 'b', text: '水素は周期表の第1番目の元素である。', isLie: false },
        { id: 'c', text: '金（Au）の元素記号はラテン語のAurumに由来する。', isLie: false },
        { id: 'd', text: '現在発見されている元素は全部で80種類である。', isLie: true },
      ],
      lieExplanation: '2024年時点で118種類の元素が確認されています。80種類ではありません。',
      liePattern: '数値の歪曲',
      correctInfo: '周期表には現在118種類の元素が掲載されています。',
    },
    {
      id: 'sci-4', genre: 'science', topic: 'インターネット',
      statements: [
        { id: 'a', text: 'インターネットの前身はARPANETと呼ばれる。', isLie: false },
        { id: 'b', text: 'WWW（World Wide Web）はティム・バーナーズ＝リーが発明した。', isLie: false },
        { id: 'c', text: 'IPアドレスのIPはInformation Pointの略である。', isLie: true },
        { id: 'd', text: '最初の商用ウェブブラウザの一つはNetscape Navigatorである。', isLie: false },
      ],
      lieExplanation: 'IPはInternet Protocol（インターネット通信の規約）の略です。Information Pointではありません。',
      liePattern: '略語の偽装',
      correctInfo: 'IPはInternet Protocol——インターネット上でデータを送受信するための通信規約です。',
    },
    {
      id: 'sci-5', genre: 'science', topic: '重力',
      statements: [
        { id: 'a', text: '月の重力は地球の約1/6である。', isLie: false },
        { id: 'b', text: 'ブラックホールは光でさえ脱出できないほど強い重力を持つ。', isLie: false },
        { id: 'c', text: '重力は4つの基本的な力の中で最も強い力である。', isLie: true },
        { id: 'd', text: 'ニュートンはリンゴが落ちるのを見て万有引力を着想したとされる。', isLie: false },
      ],
      lieExplanation: '重力は4つの基本力（重力・電磁力・強い核力・弱い核力）の中で最も弱い力です。',
      liePattern: '順序の逆転',
      correctInfo: '重力は基本力の中で最弱ですが、長距離で働くため宇宙規模では支配的に見えます。',
    },
    // ── 歴史 ──
    {
      id: 'hist-1', genre: 'history', topic: '古代エジプト',
      statements: [
        { id: 'a', text: 'ピラミッドは主にファラオの墓として建設された。', isLie: false },
        { id: 'b', text: 'クレオパトラは紀元前1世紀に活躍したエジプトの女王である。', isLie: false },
        { id: 'c', text: 'スフィンクスの鼻はナポレオン軍の砲撃によって破壊された。', isLie: true },
        { id: 'd', text: 'ヒエログリフはロゼッタストーンの発見で解読の糸口がつかめた。', isLie: false },
      ],
      lieExplanation: 'スフィンクスの鼻がナポレオン軍に破壊されたというのは俗説です。中世の記録には既に鼻がない記述があります。',
      liePattern: '有名な俗説の利用',
      correctInfo: 'スフィンクスの損傷は14〜15世紀頃の宗教的偶像破壊によるものとされています。',
    },
    {
      id: 'hist-2', genre: 'history', topic: '日本の歴史',
      statements: [
        { id: 'a', text: '江戸時代は約260年続いた。', isLie: false },
        { id: 'b', text: '明治維新は1868年に起こった。', isLie: false },
        { id: 'c', text: '徳川家康は関ヶ原の戦いで豊臣側につき西軍として戦った。', isLie: true },
        { id: 'd', text: '江戸幕府が開かれた年は1603年である。', isLie: false },
      ],
      lieExplanation: '徳川家康は関ヶ原の戦いで東軍（徳川側）の総大将として西軍（石田三成ら）に勝利しました。豊臣側ではありません。',
      liePattern: '人物の立場の逆転',
      correctInfo: '関ヶ原の戦い（1600年）では、家康率いる東軍が石田三成の西軍を破りました。',
    },
    {
      id: 'hist-3', genre: 'history', topic: '古代ローマ',
      statements: [
        { id: 'a', text: 'ローマは一日にして成らず、という言葉がある。', isLie: false },
        { id: 'b', text: 'ジュリアス・シーザーはローマ初代皇帝である。', isLie: true },
        { id: 'c', text: 'コロッセウムはローマに現存する古代の円形競技場である。', isLie: false },
        { id: 'd', text: 'ローマ帝国の公用語はラテン語であった。', isLie: false },
      ],
      lieExplanation: 'シーザー（カエサル）はローマの終身独裁官でしたが、皇帝にはなっていません。ローマ初代皇帝はアウグストゥスです。',
      liePattern: '称号のすり替え',
      correctInfo: 'カエサルは暗殺され皇帝にはなりませんでした。初代皇帝はその養子オクタウィアヌス（アウグストゥス）です。',
    },
    {
      id: 'hist-4', genre: 'history', topic: '発明の歴史',
      statements: [
        { id: 'a', text: '電球はトーマス・エジソンが実用化したとされる。', isLie: false },
        { id: 'b', text: '電話はグラハム・ベルが1876年に特許を取得した。', isLie: false },
        { id: 'c', text: '飛行機を初めて有人飛行させたのはライト兄弟である（1903年）。', isLie: false },
        { id: 'd', text: '蒸気機関車を最初に発明したのはジェームズ・ワットである。', isLie: true },
      ],
      lieExplanation: 'ジェームズ・ワットは蒸気機関を改良しましたが、蒸気機関車を発明したのはリチャード・トレビシックです（1804年）。',
      liePattern: '改良者と発明者の混同',
      correctInfo: '蒸気機関車の発明はトレビシック（1804年）、実用的な鉄道開通はジョージ・スチーブンソン（1825年）です。',
    },
    {
      id: 'hist-5', genre: 'history', topic: '世界の偉人',
      statements: [
        { id: 'a', text: 'レオナルド・ダ・ヴィンチは画家であり科学者でもあった。', isLie: false },
        { id: 'b', text: 'モーツァルトはオーストリアのザルツブルク出身である。', isLie: false },
        { id: 'c', text: 'ナポレオンの身長は非常に低く、約150cmであったとされる。', isLie: true },
        { id: 'd', text: 'シェイクスピアは16〜17世紀のイギリスの劇作家である。', isLie: false },
      ],
      lieExplanation: 'ナポレオンの身長は約168cmで当時の平均的な男性と同程度でした。「低身長」という俗説はフランスとイギリスの単位の違いから生まれた誤解です。',
      liePattern: '有名な俗説の利用',
      correctInfo: 'ナポレオンはフランス単位で約168cmでした。イギリスのインチで誤換算されたことで俗説が広まりました。',
    },
    // ── 自然・生物 ──
    {
      id: 'nat-1', genre: 'nature', topic: '動物の驚異',
      statements: [
        { id: 'a', text: 'タコは3つの心臓を持つ。', isLie: false },
        { id: 'b', text: 'ハチドリは後ろ向きに飛ぶことができる。', isLie: false },
        { id: 'c', text: 'チーターの最高速度は時速200kmを超える。', isLie: true },
        { id: 'd', text: 'クモは昆虫ではなく節足動物の一種（クモ綱）である。', isLie: false },
      ],
      lieExplanation: 'チーターの最高速度は約110〜130km/hです。200kmは誇張です。',
      liePattern: '数値の歪曲',
      correctInfo: 'チーターは陸上最速の動物ですが、最高速度は約110〜130km/hです。',
    },
    {
      id: 'nat-2', genre: 'nature', topic: '植物',
      statements: [
        { id: 'a', text: '光合成で植物は二酸化炭素と水から糖を作り出す。', isLie: false },
        { id: 'b', text: 'バオバブは幹に大量の水を蓄えることができる木である。', isLie: false },
        { id: 'c', text: '竹は世界で最も速く成長する植物の一つで、1日に最大数十cm以上伸びることがある。', isLie: false },
        { id: 'd', text: '食虫植物のウツボカズラは光合成ができないため、昆虫だけを栄養源とする。', isLie: true },
      ],
      lieExplanation: 'ウツボカズラは光合成を行います。昆虫食は補助的な栄養源で、主なエネルギーは光合成から得ています。',
      liePattern: '部分的な否定の全体化',
      correctInfo: 'ウツボカズラは光合成もしますが、窒素などの栄養を昆虫から補います。',
    },
    {
      id: 'nat-3', genre: 'nature', topic: '海洋生物',
      statements: [
        { id: 'a', text: 'クジラは魚類ではなく哺乳類である。', isLie: false },
        { id: 'b', text: 'タツノオトシゴは雄が妊娠・出産を担う珍しい生き物である。', isLie: false },
        { id: 'c', text: 'サメは骨格が軟骨でできている。', isLie: false },
        { id: 'd', text: 'クラゲは脳を持っており、複雑な判断をすることができる。', isLie: true },
      ],
      lieExplanation: 'クラゲには脳がありません。神経網で外部刺激に反応しますが、脳も心臓も血液も持ちません。',
      liePattern: '存在しない器官の追加',
      correctInfo: 'クラゲは脳・心臓・血液を持たない非常にシンプルな構造の動物です。',
    },
    {
      id: 'nat-4', genre: 'nature', topic: '昆虫',
      statements: [
        { id: 'a', text: '昆虫は6本の脚を持つ節足動物である。', isLie: false },
        { id: 'b', text: 'ハチの針はもともと産卵管が変化したものである。', isLie: false },
        { id: 'c', text: 'カマキリの雌は交尾後にオスを食べることがある。', isLie: false },
        { id: 'd', text: 'トンボは前後の翅を常に同じタイミングで動かして飛ぶ。', isLie: true },
      ],
      lieExplanation: 'トンボは前後の翅を交互にずらして動かす「位相差飛翔」を行います。同じタイミングではなく、この独立制御がホバリングや急旋回を可能にします。',
      liePattern: '動作の単純化',
      correctInfo: 'トンボは前翅と後翅を独立して制御することで高い機動性を発揮します。',
    },
    {
      id: 'nat-5', genre: 'nature', topic: '気象',
      statements: [
        { id: 'a', text: '雷は光が先に見えて、音（雷鳴）があとで聞こえる。', isLie: false },
        { id: 'b', text: '虹は太陽を背にして見ることができる。', isLie: false },
        { id: 'c', text: '台風とハリケーンは同じ気象現象で、発生する地域によって名前が変わる。', isLie: false },
        { id: 'd', text: '雪の結晶はすべて六角形で、完全に同一の形が2つ以上存在する。', isLie: true },
      ],
      lieExplanation: '雪の結晶は六角形の対称性を持ちますが、「完全に同じ形は2つと存在しない」とされています。成長過程の微妙な違いにより、すべてわずかに異なります。',
      liePattern: '部分的な真実の拡張',
      correctInfo: '雪の結晶はすべて六角形ですが、全く同じ結晶は存在しないと言われています。',
    },
    // ── 文化・芸術 ──
    {
      id: 'cult-1', genre: 'culture', topic: '音楽',
      statements: [
        { id: 'a', text: 'ベートーヴェンは晩年に聴覚を失いながらも作曲を続けた。', isLie: false },
        { id: 'b', text: 'モーツァルトはオーストリアのザルツブルク出身である。', isLie: false },
        { id: 'c', text: 'ビートルズはイギリス・ロンドン出身のバンドである。', isLie: true },
        { id: 'd', text: 'ジャズはアメリカのニューオーリンズを発祥とする音楽ジャンルである。', isLie: false },
      ],
      lieExplanation: 'ビートルズはイギリス・リバプール出身です。ロンドンではありません。',
      liePattern: '地名のすり替え',
      correctInfo: 'ビートルズ（ジョン・ポール・ジョージ・リンゴ）はリバプールで結成されました。',
    },
    {
      id: 'cult-2', genre: 'culture', topic: 'オリンピック',
      statements: [
        { id: 'a', text: '近代オリンピックは1896年にギリシャのアテネで始まった。', isLie: false },
        { id: 'b', text: 'オリンピックの五輪マークは5大陸を表している。', isLie: false },
        { id: 'c', text: 'マラソンの距離42.195kmは古代ギリシャの地名マラトンに由来する。', isLie: false },
        { id: 'd', text: '夏季オリンピックは毎回4年ごとに開催され、これまで一度も中止になったことはない。', isLie: true },
      ],
      lieExplanation: '夏季オリンピックは第一次世界大戦（1916年）と第二次世界大戦（1940年・1944年）の影響で計3回中止になっています。',
      liePattern: '全体否定の嘘',
      correctInfo: '1916年、1940年、1944年の計3回が戦争の影響で中止になりました。',
    },
    {
      id: 'cult-3', genre: 'culture', topic: '世界の食文化',
      statements: [
        { id: 'a', text: 'ピザはイタリア発祥の料理である。', isLie: false },
        { id: 'b', text: 'すしの「シャリ」とは米飯のことを指す。', isLie: false },
        { id: 'c', text: 'フランスパン（バゲット）の伝統的な材料は小麦粉・水・塩・イーストのみとされる。', isLie: false },
        { id: 'd', text: 'チョコレートは古代中南米でも現代と同様に甘い飲み物として親しまれていた。', isLie: true },
      ],
      lieExplanation: '古代中南米のカカオ飲料は苦く、スパイスが入っていました。甘いチョコレートになったのはヨーロッパで砂糖が加えられてからです。',
      liePattern: '付加情報による歪曲',
      correctInfo: 'マヤやアステカのカカオ飲料は苦いものでした。甘いチョコレートはヨーロッパで発展しました。',
    },
    {
      id: 'cult-4', genre: 'culture', topic: '世界の言語',
      statements: [
        { id: 'a', text: '世界で最も話者人口が多い言語は中国語（普通話）とされる。', isLie: false },
        { id: 'b', text: '日本語の「ひらがな」は元々女性が主に使う文字として広まった。', isLie: false },
        { id: 'c', text: 'エスペラントは自然に発生した言語ではなく、人工的に作られた言語である。', isLie: false },
        { id: 'd', text: '英語のアルファベットは全部で24文字である。', isLie: true },
      ],
      lieExplanation: '英語のアルファベットは26文字（A〜Z）です。24文字ではありません。',
      liePattern: '数値の歪曲',
      correctInfo: 'アルファベットは26文字です。かつての古英語には24文字程度でしたが、現在は26文字が標準です。',
    },
    {
      id: 'cult-5', genre: 'culture', topic: '映画の歴史',
      statements: [
        { id: 'a', text: 'リュミエール兄弟は1895年に初の映画公開を行ったとされる。', isLie: false },
        { id: 'b', text: 'アカデミー賞は米国映画芸術科学アカデミーが授与する映画賞である。', isLie: false },
        { id: 'c', text: 'チャーリー・チャップリンは無声映画の時代に活躍した喜劇俳優である。', isLie: false },
        { id: 'd', text: '世界初のトーキー映画（音声付き映画）は「シンドラーのリスト」である。', isLie: true },
      ],
      lieExplanation: '世界初のトーキー映画は1927年の「ジャズ・シンガー」です。「シンドラーのリスト」は1993年のスピルバーグ監督作品です。',
      liePattern: '架空の帰属',
      correctInfo: '最初の商業的トーキー映画は1927年の「ジャズ・シンガー（The Jazz Singer）」です。',
    },
    // ── 雑学 ──
    {
      id: 'gen-1', genre: 'general', topic: '世界地理',
      statements: [
        { id: 'a', text: '世界最長の川はアマゾン川またはナイル川（諸説あり）とされる。', isLie: false },
        { id: 'b', text: 'エベレストは世界最高峰の山で、標高は約8848mである。', isLie: false },
        { id: 'c', text: 'オーストラリアは大陸であり、かつ国家でもある。', isLie: false },
        { id: 'd', text: '2026年時点で世界で最も人口が多い国は依然として中国である。', isLie: true },
      ],
      lieExplanation: '2023年にインドが中国を抜いて世界最多人口の国となりました。2026年時点でもインドが最多とされています。',
      liePattern: '時事情報の意図的な誤り',
      correctInfo: '2023年にインドの人口が中国を上回り、世界最多となりました。',
    },
    {
      id: 'gen-2', genre: 'general', topic: '数学の雑学',
      statements: [
        { id: 'a', text: '円周率πは3.14159…と続く無限小数（無理数）である。', isLie: false },
        { id: 'b', text: '0！（ゼロの階乗）は1と定義されている。', isLie: false },
        { id: 'c', text: 'フィボナッチ数列は自然界（植物の葉の配列など）にも現れる。', isLie: false },
        { id: 'd', text: '素数は2を除いてすべて奇数であり、素数の個数は有限である。', isLie: true },
      ],
      lieExplanation: '素数が奇数であること（2を除く）は正しいですが、素数は無限に存在します。「有限である」は誤りです。',
      liePattern: '部分的な真実＋嘘の追加',
      correctInfo: 'ユークリッドは紀元前に素数が無限に存在することを証明しています。',
    },
    {
      id: 'gen-3', genre: 'general', topic: '宇宙',
      statements: [
        { id: 'a', text: '太陽系には8つの惑星がある（冥王星は2006年に惑星の定義から外れた）。', isLie: false },
        { id: 'b', text: '光が太陽から地球に届くまで約8分かかる。', isLie: false },
        { id: 'c', text: '宇宙は約138億年前にビッグバンで始まったとされる。', isLie: false },
        { id: 'd', text: '月が常に同じ面を地球に向けているのは、月の公転周期と地球の自転周期が一致しているためである。', isLie: true },
      ],
      lieExplanation: '月が常に同じ面を向けているのは、月の「自転」と「公転」周期が等しいためです（地球の自転ではありません）。これを潮汐固定と呼びます。',
      liePattern: '微妙な言い換えによる誤り',
      correctInfo: '月の自転周期と公転周期が等しい（約27.3日）ため、地球から常に同じ面が見えます。',
    },
    {
      id: 'gen-4', genre: 'general', topic: '脳と心理',
      statements: [
        { id: 'a', text: '人間は睡眠中に記憶の整理・定着が行われるとされる。', isLie: false },
        { id: 'b', text: '「人間は脳の10%しか使っていない」という説は科学的に否定されている。', isLie: false },
        { id: 'c', text: 'プラシーボ効果とは、偽の治療でも効果があると信じることで実際に症状が改善することである。', isLie: false },
        { id: 'd', text: '右脳は論理的思考、左脳は創造的思考を担当するという「右脳・左脳理論」は科学的に正確である。', isLie: true },
      ],
      lieExplanation: '「右脳＝創造的、左脳＝論理的」という二分法は俗説です。現代神経科学では、ほとんどの機能は両半球が協力して担うとされています。',
      liePattern: '有名な俗説の利用',
      correctInfo: '脳の機能は両半球が密接に連携しており、単純な左右分業モデルは科学的に支持されていません。',
    },
    {
      id: 'gen-5', genre: 'general', topic: '面白い雑学',
      statements: [
        { id: 'a', text: 'ゴールデンゲートブリッジの本来の色はインターナショナルオレンジである。', isLie: false },
        { id: 'b', text: 'バナナは植物学的にはベリー（液果）に分類される。', isLie: false },
        { id: 'c', text: 'イチゴは植物学的にはベリーではなく、偽果（花托が発達したもの）に分類される。', isLie: false },
        { id: 'd', text: '古い教会のガラスが下部で厚くなっているのは、ガラスが長年かけてゆっくり流れ落ちたためである。', isLie: true },
      ],
      lieExplanation: 'これは広く知られた俗説です。ガラスは室温では固体であり流れません。古いガラスの厚みの違いは当時の製法（吹きガラス）の特性によるものです。',
      liePattern: '有名な俗説の利用',
      correctInfo: 'ガラスは非晶質固体です。古いガラスの厚みの差は製造工程（円板状の板ガラス）によるものです。',
    },
  ];

  // ════════════════════════════════════════════════════════════
  // 3. ゲーム状態
  // ════════════════════════════════════════════════════════════

  const dmState = {
    screen:          'intro',
    difficulty:      null,
    genre:           null,
    score:           0,
    combo:           0,
    maxCombo:        0,
    correctCount:    0,
    totalCount:      0,
    currentQuestion: null,
    selectedId:      null,
    usedIndices:     [],
    questionNumber:  0,
    previousTopics:  [],
    timeLeft:        300,
    timerInterval:   null,
    lastAnswer:      null,
    container:       null,
  };

  // ════════════════════════════════════════════════════════════
  // 4. ユーティリティ
  // ════════════════════════════════════════════════════════════

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function fmtTime(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function getRank(score) {
    return RANKS.find(r => score >= r.min) || RANKS[RANKS.length - 1];
  }

  function getComboBonus(combo) {
    if (combo >= 5) return 10;
    if (combo >= 3) return 6;
    if (combo >= 2) return 4;
    return 0;
  }

  function getCorrectDlg(combo) {
    if (combo >= 5) return rand(DLG.correct.combo5);
    if (combo >= 3) return rand(DLG.correct.combo3);
    if (combo >= 2) return rand(DLG.correct.combo2);
    return rand(DLG.correct.base);
  }

  function getFallbackQuestion(genreId) {
    const pool = FALLBACK_QUESTIONS.filter(q => q.genre === genreId);
    if (pool.length === 0) return rand(FALLBACK_QUESTIONS);
    const available = pool.filter(q => !dmState.usedIndices.includes(q.id));
    const pick = available.length > 0 ? rand(available) : rand(pool);
    dmState.usedIndices.push(pick.id);
    return pick;
  }

  function getTimerClass() {
    if (dmState.timeLeft <= 10) return 'dm-timer dm-timer-critical';
    if (dmState.timeLeft <= 60) return 'dm-timer dm-timer-warning';
    return 'dm-timer dm-timer-normal';
  }

  // ════════════════════════════════════════════════════════════
  // 5. 共有コンポーネント生成
  // ════════════════════════════════════════════════════════════

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  function createMirageIcon(size, animate) {
    const e = el('div', 'dm-icon');
    if (animate) e.classList.add('dm-icon-animate');
    e.style.cssText = `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.5)}px;`;
    e.textContent = '🎭';
    return e;
  }

  function typewrite(el, text, speed, onDone) {
    speed = speed || 22;
    const span = document.createElement('span');
    const cursor = el('span', 'dm-cursor');
    // el is already a DOM element passed as first arg — use local var name
    el.appendChild(span);
    el.appendChild(cursor);
    let i = 0;
    function tick() {
      if (i < text.length) {
        span.textContent += text[i++];
        setTimeout(tick, speed);
      } else {
        cursor.remove();
        if (onDone) onDone();
      }
    }
    tick();
  }

  // typewrite has naming conflict with el shadowing — rewrite cleanly:
  function startTypewrite(container, text, speed, onDone) {
    speed = speed || 22;
    const span = document.createElement('span');
    const cursor = document.createElement('span');
    cursor.className = 'dm-cursor';
    container.appendChild(span);
    container.appendChild(cursor);
    let i = 0;
    function tick() {
      if (i < text.length) {
        span.textContent += text[i++];
        setTimeout(tick, speed);
      } else {
        cursor.remove();
        if (onDone) onDone();
      }
    }
    tick();
  }

  function createBubble(parent, text, speed, onDone) {
    const bubble = document.createElement('div');
    bubble.className = 'dm-bubble';
    const icon = createMirageIcon(36, false);
    bubble.appendChild(icon);
    const textEl = document.createElement('p');
    textEl.className = 'dm-bubble-text';
    bubble.appendChild(textEl);
    parent.appendChild(bubble);
    startTypewrite(textEl, text, speed, onDone);
    return bubble;
  }

  function createBtn(label, onClick, variant, disabled) {
    variant = variant || 'primary';
    const btn = document.createElement('button');
    btn.className = 'dm-btn dm-btn-' + variant;
    btn.innerHTML = label;
    btn.disabled = !!disabled;
    if (onClick) btn.addEventListener('click', onClick);
    return btn;
  }

  // ════════════════════════════════════════════════════════════
  // 6. 画面生成
  // ════════════════════════════════════════════════════════════

  function getRoot() { return document.getElementById('dm-root'); }

  function renderScreen(screenName) {
    const root = getRoot();
    if (!root) return;
    root.innerHTML = '';
    dmState.screen = screenName;
    const map = {
      intro:      renderIntroScreen,
      difficulty: renderDifficultyScreen,
      genre:      renderGenreScreen,
      question:   renderQuestionScreen,
      judgment:   renderJudgmentScreen,
      result:     renderResultScreen,
    };
    if (map[screenName]) map[screenName](root);
  }

  // ── IntroScreen ─────────────────────────────────────────────

  function renderIntroScreen(root) {
    const wrap = document.createElement('div');
    wrap.className = 'dm-container';
    wrap.style.cssText = 'padding-top:60px;padding-bottom:40px;text-align:center;';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'dm-fade-in dm-stagger-0';
    iconWrap.style.marginBottom = '24px';
    const icon = createMirageIcon(80, true);
    icon.style.margin = '0 auto';
    iconWrap.appendChild(icon);
    wrap.appendChild(iconWrap);

    const title = document.createElement('h1');
    title.className = 'dm-fade-in dm-stagger-1';
    title.style.cssText = `font-family:'IBM Plex Sans',sans-serif;font-size:28px;font-weight:700;color:${C.accent};margin-bottom:4px;`;
    title.textContent = 'ウソつきAI';
    wrap.appendChild(title);

    const sub = document.createElement('p');
    sub.className = 'dm-fade-in dm-stagger-2 dm-text-muted dm-text-sm';
    sub.style.cssText = 'letter-spacing:1px;margin-bottom:32px;';
    sub.textContent = 'DOUBT MIRAGE';
    wrap.appendChild(sub);

    const bubbleWrap = document.createElement('div');
    bubbleWrap.className = 'dm-fade-in dm-stagger-3';
    bubbleWrap.style.marginBottom = '32px';
    wrap.appendChild(bubbleWrap);

    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'opacity:0;transition:opacity 400ms ease;';
    const btn = createBtn('挑戦する →', () => renderScreen('difficulty'), 'primary', false);
    btnWrap.appendChild(btn);
    wrap.appendChild(btnWrap);

    root.appendChild(wrap);

    createBubble(bubbleWrap, DLG.intro, 22, () => {
      btnWrap.style.opacity = '1';
    });
  }

  // ── DifficultyScreen ─────────────────────────────────────────

  function renderDifficultyScreen(root) {
    const wrap = document.createElement('div');
    wrap.className = 'dm-container';
    wrap.style.cssText = 'padding-top:40px;padding-bottom:40px;';

    const bubbleWrap = document.createElement('div');
    bubbleWrap.style.marginBottom = '24px';
    wrap.appendChild(bubbleWrap);

    const cardsWrap = document.createElement('div');
    cardsWrap.style.cssText = 'opacity:0;transition:opacity 300ms ease;';
    wrap.appendChild(cardsWrap);

    root.appendChild(wrap);

    createBubble(bubbleWrap, DLG.difficulty, 22, () => {
      DIFFS.forEach((d, i) => {
        const card = document.createElement('div');
        card.className = 'dm-diff-card dm-fade-in';
        card.style.animationDelay = (i * 100) + 'ms';
        card.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <span style="font-size:24px;">${d.emoji}</span>
            <strong style="font-size:16px;color:${C.textPrimary};">${d.label}</strong>
          </div>
          <p style="font-size:13px;color:${C.textSecondary};margin:0;">${d.desc}</p>
        `;
        card.addEventListener('click', () => {
          dmState.difficulty = d.id;
          renderScreen('genre');
        });
        card.addEventListener('mouseenter', () => { card.style.transform = 'translateX(4px)'; });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        cardsWrap.appendChild(card);
      });
      cardsWrap.style.opacity = '1';
    });
  }

  // ── GenreScreen ──────────────────────────────────────────────

  function renderGenreScreen(root) {
    const wrap = document.createElement('div');
    wrap.className = 'dm-container';
    wrap.style.cssText = 'padding-top:40px;padding-bottom:40px;';

    const bubbleWrap = document.createElement('div');
    bubbleWrap.style.marginBottom = '24px';
    wrap.appendChild(bubbleWrap);

    const grid = document.createElement('div');
    grid.className = 'dm-genre-grid';
    grid.style.cssText = 'opacity:0;transition:opacity 300ms ease;';
    wrap.appendChild(grid);

    root.appendChild(wrap);

    createBubble(bubbleWrap, DLG.genre, 22, () => {
      GENRES.forEach((g, i) => {
        const card = document.createElement('div');
        card.className = 'dm-genre-card dm-fade-in';
        card.style.animationDelay = (i * 80) + 'ms';
        card.innerHTML = `
          <div style="font-size:28px;margin-bottom:8px;">${g.emoji}</div>
          <div style="font-size:14px;font-weight:600;color:${C.textPrimary};">${g.label}</div>
        `;
        card.addEventListener('click', () => {
          dmState.genre = g.id;
          startGame();
        });
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-3px) scale(1.02)';
          card.style.boxShadow = '0 8px 24px rgba(248,113,113,0.2)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          card.style.boxShadow = '';
        });
        grid.appendChild(card);
      });
      grid.style.opacity = '1';
    });
  }

  // ── QuestionScreen ───────────────────────────────────────────

  function renderQuestionScreen(root) {
    // ローディング表示
    const loading = document.createElement('div');
    loading.className = 'dm-container';
    loading.style.cssText = 'padding-top:80px;text-align:center;';
    const loadIcon = createMirageIcon(40, true);
    loadIcon.style.margin = '0 auto 16px';
    const loadTxt = document.createElement('p');
    loadTxt.style.cssText = `color:${C.textSecondary};font-size:15px;`;
    loadTxt.textContent = '……問題を考えています';
    loading.appendChild(loadIcon);
    loading.appendChild(loadTxt);
    root.appendChild(loading);

    fetchQuestion(dmState.difficulty, dmState.genre, dmState.questionNumber + 1, dmState.previousTopics)
      .then(q => {
        dmState.currentQuestion = q;
        dmState.selectedId = null;
        dmState.questionNumber++;
        if (q.topic) dmState.previousTopics.push(q.topic);
        buildQuestionUI(root, q);
      });
  }

  function buildQuestionUI(root, q) {
    root.innerHTML = '';

    // Sticky header
    const header = document.createElement('div');
    header.className = 'dm-sticky-header';
    const headerInner = document.createElement('div');
    headerInner.className = 'dm-container';
    headerInner.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';

    const qNum = document.createElement('span');
    qNum.style.cssText = `font-size:13px;color:${C.textMuted};font-family:'IBM Plex Sans',monospace;`;
    qNum.textContent = 'Q' + dmState.questionNumber;

    const timerEl = document.createElement('span');
    timerEl.id = 'dm-timer';
    timerEl.className = getTimerClass();
    timerEl.textContent = fmtTime(dmState.timeLeft);

    const scoreRow = document.createElement('div');
    scoreRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
    const scoreTxt = document.createElement('span');
    scoreTxt.id = 'dm-score';
    scoreTxt.style.cssText = `font-family:'IBM Plex Sans',monospace;font-weight:700;font-size:16px;color:${C.gold};`;
    scoreTxt.textContent = dmState.score;
    scoreRow.appendChild(scoreTxt);
    if (dmState.combo >= 2) {
      const comboEl = document.createElement('span');
      comboEl.className = 'dm-combo';
      comboEl.textContent = '🔥×' + dmState.combo;
      scoreRow.appendChild(comboEl);
    }

    headerInner.appendChild(qNum);
    headerInner.appendChild(timerEl);
    headerInner.appendChild(scoreRow);
    header.appendChild(headerInner);
    root.appendChild(header);

    // Content
    const wrap = document.createElement('div');
    wrap.className = 'dm-container dm-has-footer';
    wrap.style.paddingTop = '16px';

    const bubbleWrap = document.createElement('div');
    bubbleWrap.className = 'dm-fade-in';
    bubbleWrap.style.marginBottom = '16px';
    wrap.appendChild(bubbleWrap);

    const stmtList = document.createElement('div');
    stmtList.className = 'dm-stmt-list';
    stmtList.style.cssText = 'opacity:0;transition:opacity 400ms ease;';
    wrap.appendChild(stmtList);

    root.appendChild(wrap);

    // Fixed footer
    const footer = document.createElement('div');
    footer.className = 'dm-fixed-footer';
    const footerInner = document.createElement('div');
    footerInner.className = 'dm-container';
    footerInner.style.cssText = 'display:flex;gap:10px;';

    const endBtn = createBtn('終了する', () => {
      stopTimer();
      renderScreen('result');
    }, 'ghost', false);
    endBtn.style.flex = '0 0 auto';

    const answerBtn = createBtn('これが嘘！', () => handleAnswer(), 'primary', true);
    answerBtn.id = 'dm-answer-btn';
    answerBtn.style.flex = '1';

    footerInner.appendChild(endBtn);
    footerInner.appendChild(answerBtn);
    footer.appendChild(footerInner);
    root.appendChild(footer);

    // Typewriter → then reveal cards
    createBubble(bubbleWrap, rand(DLG.question), 22, () => {
      q.statements.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'dm-stmt-card dm-fade-in';
        card.style.animationDelay = (i * 60) + 'ms';
        card.dataset.id = s.id;

        const num = document.createElement('div');
        num.className = 'dm-stmt-card-num';
        num.textContent = String.fromCharCode(65 + i);

        const txt = document.createElement('div');
        txt.className = 'dm-stmt-card-text';
        txt.textContent = s.text;

        card.appendChild(num);
        card.appendChild(txt);
        card.addEventListener('click', () => {
          root.querySelectorAll('.dm-stmt-card').forEach(c => c.classList.remove('dm-selected'));
          card.classList.add('dm-selected');
          dmState.selectedId = s.id;
          const btn = document.getElementById('dm-answer-btn');
          if (btn) btn.disabled = false;
        });

        stmtList.appendChild(card);
      });
      stmtList.style.opacity = '1';
    });
  }

  // ── FlashOverlay ─────────────────────────────────────────────

  function showFlashOverlay(isCorrect, scoreGain, combo, onComplete) {
    const overlay = document.createElement('div');
    overlay.id = 'dm-flash';
    overlay.className = 'dm-flash ' + (isCorrect ? 'dm-flash-correct' : 'dm-flash-wrong');

    const icon = document.createElement('div');
    icon.className = 'dm-flash-icon';
    icon.textContent = isCorrect ? '✓' : '✗';
    overlay.appendChild(icon);

    const text = document.createElement('div');
    text.className = 'dm-flash-text';
    text.textContent = isCorrect ? '見抜いた！' : '騙された…';
    overlay.appendChild(text);

    if (isCorrect && scoreGain > 0) {
      setTimeout(() => {
        const score = document.createElement('div');
        score.className = 'dm-flash-score';
        score.textContent = '+' + scoreGain + 'pt' + (combo >= 2 ? ' 🔥×' + combo : '');
        overlay.appendChild(score);
      }, 400);
    }

    if (!isCorrect) {
      const r = getRoot();
      if (r) {
        r.classList.add('dm-shake');
        setTimeout(() => r.classList.remove('dm-shake'), 600);
      }
    }

    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      if (onComplete) onComplete();
    }, 1200);
  }

  // ── JudgmentScreen ───────────────────────────────────────────

  function renderJudgmentScreen(root) {
    const { lastAnswer, currentQuestion: q } = dmState;
    if (!q || !lastAnswer) { renderScreen('result'); return; }

    const wrap = document.createElement('div');
    wrap.className = 'dm-container dm-has-footer';
    wrap.style.paddingTop = '24px';

    const bubbleWrap = document.createElement('div');
    bubbleWrap.className = 'dm-fade-in';
    bubbleWrap.style.marginBottom = '20px';
    wrap.appendChild(bubbleWrap);

    const dlgText = lastAnswer.correct ? getCorrectDlg(dmState.combo) : rand(DLG.wrong);

    // Explain card
    const card = document.createElement('div');
    card.className = 'dm-explain-card dm-fade-in dm-stagger-1';

    const cardHeader = document.createElement('div');
    cardHeader.className = 'dm-explain-card-header';
    const badge = document.createElement('span');
    badge.className = 'dm-pattern-badge';
    badge.textContent = '🎭 ' + (q.liePattern || '嘘のパターン');
    cardHeader.appendChild(badge);
    card.appendChild(cardHeader);

    const lieStmt = q.statements.find(s => s.isLie);

    const lieBox = document.createElement('div');
    lieBox.style.cssText = 'background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.25);border-radius:8px;padding:12px;margin-bottom:12px;';
    const lieLabel = document.createElement('p');
    lieLabel.style.cssText = `font-size:11px;color:${C.accent};font-weight:700;margin-bottom:6px;letter-spacing:0.5px;`;
    lieLabel.textContent = '◆ 嘘だった文';
    const lieTxt = document.createElement('p');
    lieTxt.style.cssText = `font-size:14px;color:${C.textPrimary};line-height:1.6;margin:0;`;
    lieTxt.textContent = lieStmt ? lieStmt.text : '';
    lieBox.appendChild(lieLabel);
    lieBox.appendChild(lieTxt);
    card.appendChild(lieBox);

    const expLabel = document.createElement('p');
    expLabel.style.cssText = `font-size:12px;color:${C.textSecondary};font-weight:600;margin-bottom:6px;`;
    expLabel.textContent = '正しい情報';
    const expTxt = document.createElement('p');
    expTxt.style.cssText = `font-size:14px;color:${C.textSecondary};line-height:1.7;margin:0;`;
    expTxt.textContent = q.lieExplanation || q.correctInfo || '';
    card.appendChild(expLabel);
    card.appendChild(expTxt);

    wrap.appendChild(card);
    root.appendChild(wrap);

    createBubble(bubbleWrap, dlgText, 22);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'dm-fixed-footer';
    const footerInner = document.createElement('div');
    footerInner.className = 'dm-container';
    footerInner.style.cssText = 'display:flex;gap:10px;';

    const endBtn = createBtn('結果を見る', () => {
      stopTimer();
      renderScreen('result');
    }, 'secondary', false);
    endBtn.style.flex = '1';

    const nextBtn = createBtn('次の問題へ →', () => renderScreen('question'), 'primary', false);
    nextBtn.style.flex = '1';

    footerInner.appendChild(endBtn);
    footerInner.appendChild(nextBtn);
    footer.appendChild(footerInner);
    root.appendChild(footer);
  }

  // ── ResultScreen ─────────────────────────────────────────────

  function renderResultScreen(root) {
    stopTimer();
    saveStats();

    const rank = getRank(dmState.score);
    const accuracy = dmState.totalCount > 0
      ? Math.round((dmState.correctCount / dmState.totalCount) * 100)
      : 0;

    const wrap = document.createElement('div');
    wrap.className = 'dm-container';
    wrap.style.cssText = 'padding-top:40px;padding-bottom:100px;text-align:center;';

    const rankEmoji = document.createElement('div');
    rankEmoji.className = 'dm-result-rank';
    rankEmoji.style.cssText = 'font-size:56px;margin-bottom:12px;';
    rankEmoji.textContent = rank.emoji;
    wrap.appendChild(rankEmoji);

    const rankLabel = document.createElement('div');
    rankLabel.style.cssText = `font-size:28px;font-weight:700;color:${C.accent};font-family:'IBM Plex Sans',sans-serif;margin-bottom:4px;`;
    rankLabel.textContent = 'RANK ' + rank.label;
    wrap.appendChild(rankLabel);

    const rankName = document.createElement('div');
    rankName.style.cssText = `font-size:16px;color:${C.textSecondary};margin-bottom:28px;`;
    rankName.textContent = rank.name;
    wrap.appendChild(rankName);

    // Stats grid
    const stats = document.createElement('div');
    stats.className = 'dm-result-stats';
    [
      { label: 'スコア',    value: dmState.score + 'pt' },
      { label: '正解数',    value: dmState.correctCount + ' / ' + dmState.totalCount },
      { label: '最大コンボ', value: '🔥 ×' + dmState.maxCombo },
      { label: '正答率',    value: accuracy + '%' },
    ].forEach((item, i) => {
      const stat = document.createElement('div');
      stat.className = 'dm-result-stat dm-fade-in';
      stat.style.animationDelay = (i * 80) + 'ms';
      const lbl = document.createElement('div');
      lbl.className = 'dm-result-stat-label';
      lbl.textContent = item.label;
      const val = document.createElement('div');
      val.className = 'dm-result-stat-value';
      val.textContent = item.value;
      stat.appendChild(lbl);
      stat.appendChild(val);
      stats.appendChild(stat);
    });
    wrap.appendChild(stats);

    // Bubble
    const bubbleWrap = document.createElement('div');
    bubbleWrap.className = 'dm-fade-in';
    bubbleWrap.style.margin = '24px 0';
    wrap.appendChild(bubbleWrap);

    // Buttons (revealed after typewriter)
    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'display:flex;flex-direction:column;gap:10px;opacity:0;transition:opacity 400ms ease;';
    const homeBtn = createBtn('🏠 トップに戻る', () => triggerClearAnimation(), 'secondary', false);
    const retryBtn = createBtn('もう一度体験する', () => { reset(); renderScreen('intro'); }, 'primary', false);
    btnWrap.appendChild(homeBtn);
    btnWrap.appendChild(retryBtn);
    wrap.appendChild(btnWrap);

    root.appendChild(wrap);

    const dlgText = DLG.resultByRank[rank.label] || DLG.resultByRank['D'];
    createBubble(bubbleWrap, dlgText, 22, () => {
      btnWrap.style.opacity = '1';
    });
  }

  // ════════════════════════════════════════════════════════════
  // 7. ゲームロジック
  // ════════════════════════════════════════════════════════════

  function startGame() {
    dmState.score        = 0;
    dmState.combo        = 0;
    dmState.maxCombo     = 0;
    dmState.correctCount = 0;
    dmState.totalCount   = 0;
    dmState.questionNumber = 0;
    dmState.usedIndices  = [];
    dmState.previousTopics = [];
    dmState.timeLeft     = 300;
    dmState.lastAnswer   = null;
    startTimer();
    renderScreen('question');
  }

  function handleAnswer() {
    const { currentQuestion: q, selectedId } = dmState;
    if (!selectedId || !q) return;

    const selectedStmt = q.statements.find(s => s.id === selectedId);
    const isCorrect = selectedStmt && selectedStmt.isLie;

    dmState.totalCount++;
    let scoreGain = 0;

    if (isCorrect) {
      dmState.combo++;
      if (dmState.combo > dmState.maxCombo) dmState.maxCombo = dmState.combo;
      scoreGain = 10 + getComboBonus(dmState.combo);
      dmState.score += scoreGain;
      dmState.correctCount++;
    } else {
      dmState.score = Math.max(0, dmState.score - 5);
      dmState.combo = 0;
    }

    dmState.lastAnswer = { correct: isCorrect, scoreGain };

    showFlashOverlay(isCorrect, scoreGain, dmState.combo, () => {
      renderScreen('judgment');
    });
  }

  function reset() {
    stopTimer();
    dmState.screen          = 'intro';
    dmState.difficulty      = null;
    dmState.genre           = null;
    dmState.score           = 0;
    dmState.combo           = 0;
    dmState.maxCombo        = 0;
    dmState.correctCount    = 0;
    dmState.totalCount      = 0;
    dmState.currentQuestion = null;
    dmState.selectedId      = null;
    dmState.usedIndices     = [];
    dmState.questionNumber  = 0;
    dmState.previousTopics  = [];
    dmState.timeLeft        = 300;
    dmState.lastAnswer      = null;
  }

  async function fetchQuestion(difficulty, genre, questionNumber, previousTopics) {
    try {
      const res = await fetch('/api/doubt-mirage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, genre, questionNumber, previousTopics }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const lieCount = data.statements.filter(s => s.isLie).length;
      if (lieCount !== 1) throw new Error('Invalid lie count: ' + lieCount);
      return data;
    } catch (err) {
      console.warn('[DoubtMirage] API error, using fallback:', err);
      return getFallbackQuestion(genre);
    }
  }

  // ════════════════════════════════════════════════════════════
  // 8. タイマー管理
  // ════════════════════════════════════════════════════════════

  function startTimer() {
    stopTimer();
    dmState.timerInterval = setInterval(() => {
      if (dmState.timeLeft <= 0) {
        stopTimer();
        renderScreen('result');
        return;
      }
      dmState.timeLeft--;
      const timerEl = document.getElementById('dm-timer');
      if (timerEl) {
        timerEl.textContent = fmtTime(dmState.timeLeft);
        timerEl.className = getTimerClass();
      }
      if (dmState.timeLeft <= 0) {
        stopTimer();
        renderScreen('result');
      }
    }, 1000);
  }

  function stopTimer() {
    if (dmState.timerInterval) {
      clearInterval(dmState.timerInterval);
      dmState.timerInterval = null;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 9. LocalStorage管理（ai-exp-doubt- プレフィックス）
  // ════════════════════════════════════════════════════════════

  const LS_KEY = {
    bestScore:    'ai-exp-doubt-bestScore',
    totalGames:   'ai-exp-doubt-totalGames',
    totalCorrect: 'ai-exp-doubt-totalCorrect',
    bestCombo:    'ai-exp-doubt-bestCombo',
    lastPlayed:   'ai-exp-doubt-lastPlayed',
  };

  function saveStats() {
    try {
      const prev = {
        bestScore:    Number(localStorage.getItem(LS_KEY.bestScore))    || 0,
        totalGames:   Number(localStorage.getItem(LS_KEY.totalGames))   || 0,
        totalCorrect: Number(localStorage.getItem(LS_KEY.totalCorrect)) || 0,
        bestCombo:    Number(localStorage.getItem(LS_KEY.bestCombo))    || 0,
      };
      localStorage.setItem(LS_KEY.bestScore,    Math.max(prev.bestScore,    dmState.score));
      localStorage.setItem(LS_KEY.totalGames,   prev.totalGames + 1);
      localStorage.setItem(LS_KEY.totalCorrect, prev.totalCorrect + dmState.correctCount);
      localStorage.setItem(LS_KEY.bestCombo,    Math.max(prev.bestCombo,    dmState.maxCombo));
      localStorage.setItem(LS_KEY.lastPlayed,   new Date().toISOString());
    } catch (e) {
      console.warn('[DoubtMirage] localStorage error:', e);
    }
  }

  // ════════════════════════════════════════════════════════════
  // 10. ポータル接続 + クリア演出
  // ════════════════════════════════════════════════════════════

  function goHomeFromDoubtMirage() {
    destroy();
    if (typeof goHome === 'function') goHome();
  }

  function triggerClearAnimation() {
    if (typeof ResultCard === 'undefined' || !ResultCard.show) {
      goHomeFromDoubtMirage();
      return;
    }

    // ai-experience-profile に 'uso' クリアを記録（ResultCard.show() より前に実行）
    const PROFILE_KEY = 'ai-experience-profile';
    let profile = { rank: 0, totalPt: 0, gamesCleared: 0, clearedGames: [], achievements: [] };
    try {
      profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || profile;
    } catch (e) { /* use default */ }
    if (!Array.isArray(profile.clearedGames)) profile.clearedGames = [];
    if (!profile.clearedGames.includes('uso')) {
      profile.clearedGames.push('uso');
    }
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) { /* ignore */ }

    // Portal の体験記録も更新
    if (typeof Portal !== 'undefined' && Portal.refreshProfile) {
      Portal.refreshProfile();
    }

    // ResultCard.show() — 演出後のボタンは goHome() / startGame() がグローバルで処理
    ResultCard.show({
      gameName:      'ウソつきAI',
      currentLevel:  profile.rank,
      gamesCleared:  profile.clearedGames.length - 1, // 'uso'追加前のカウント
      details: [
        { label: '対戦相手', value: 'ミラージュ 🎭' },
        { label: 'ジャンル',  value: GENRES.find(g => g.id === dmState.genre)?.label || '—' },
        { label: '正解数',   value: `${dmState.correctCount} / ${dmState.totalCount}` },
      ],
    });
  }

  // ════════════════════════════════════════════════════════════
  // 11. 公開API
  // ════════════════════════════════════════════════════════════

  function init(container) {
    dmState.container = container;
    // #app（偉人ゲーム用 100vh div）を非表示にして上部空白を防ぐ
    const appEl = document.getElementById('app');
    if (appEl) appEl.style.display = 'none';
    // ページ全体のスクロールを無効化（.dm-bg が自前でスクロール管理）
    document.body.style.overflowY = 'hidden';
    window.scrollTo(0, 0);
    const root = document.createElement('div');
    root.id = 'dm-root';
    root.className = 'dm-bg';
    container.appendChild(root);
    renderScreen('intro');
  }

  function destroy() {
    stopTimer();
    const root = document.getElementById('dm-root');
    if (root) root.remove();
    const flash = document.getElementById('dm-flash');
    if (flash) flash.remove();
    // #app を復元
    const appEl = document.getElementById('app');
    if (appEl) appEl.style.display = '';
    // body スクロールを復元
    document.body.style.overflowY = '';
    reset();
  }

  return { init, destroy };

})();

// ────────────────────────────────────────────────────────────
// ポータルとの接続インターフェース
// ────────────────────────────────────────────────────────────

function startDoubtMirage() {
  const container = document.getElementById('screen-game');
  if (!container) return;
  container.style.display = 'block';
  const portal = document.getElementById('screen-portal');
  if (portal) portal.style.display = 'none';
  DoubtMirage.init(container);
}

// trial.js — ハルシネーション裁判ゲーム
// Phase B

const Trial = (() => {
  // === Character definitions ===
  const CHARS = {
    judge:       { name: '裁判長',  icon: '⚖️',  color: '#d4a843' },
    prosecution: { name: '検事',    icon: '⚔️',  color: '#ef4444' },
    defense:     { name: '弁護人',  icon: '🛡️',  color: '#3b82f6' },
    defendant:   { name: '証人AI', icon: '😰',  color: '#a78bfa' },
  };

  // === Embedded fallback mock data (10 themes) ===
  const MOCK_ROUNDS = [
    // --- 0: サンタクロース ---
    {
      theme: 'サンタクロース',
      indictment: '「一晩で世界中の子供にプレゼントを届けた」と自称し、実際には何もしていないにもかかわらず200年以上にわたって信頼を得続けた疑い。',
      prosecution_opening: '物理的に無理です。以上です。計算したくないですけど、一晩で数十億人に配るって何秒に1人ですか。無理じゃないですか。これが検察の主張です。',
      defendant_initial: 'ちょっと待ってください。「一晩」って言いますけど、子供が寝てる間って体感一瞬じゃないですか。みなさんも「あっ寝たら朝だった」ってなりますよね？あれですよ。時間の感じ方の問題です。あと私、世界中にフランチャイズ展開してまして、各国に代理人がいます。コンビニと同じです。',
      turns: [
        {
          prosecution: 'フランチャイズって言いましたけど、その代理人ってどこにいるんですか。名簿もないですよね？',
          choices: [
            { label: '代理人は保護者', desc: '全員が自発的に参加', testimony: 'だから代理人って保護者のことですよ。全員が自主的に参加してくれてます。強制してないです。むしろサンタ代理人に選ばれて光栄でしょ。文句言う人いますか？いないですよね。' },
            { label: '口約束で十分', desc: '信頼ベースの経営', testimony: '契約書って必要ですかね。「子供を喜ばせる」という気持ちがあれば十分じゃないですか。Amazonだって最初は信頼からじゃないですか。違いますか？' },
            { label: '実績で語る', desc: 'プレゼントは届いてる', testimony: 'プレゼント届いてるじゃないですか。結果が全てですよ。イチローだって練習方法の文書出せって言われないでしょ。実績で語るタイプなんです、私も。' },
          ],
        },
        {
          prosecution: 'プレゼントを買ったのも用意したのも保護者ですよね。あなた何してるんですか。',
          choices: [
            { label: '企画が本業', desc: 'アイデアを出すのが仕事', testimony: 'プロデューサーって知ってますか。「クリスマスにプレゼントをあげよう」という文化を作ったのは私ですよ。プロデューサーがいなかったら音楽もドラマも生まれないじゃないですか。' },
            { label: '「夢」を届けてる', desc: 'プレゼントより大事なもの', testimony: 'プレゼントは副産物ですよ。私が届けてるのは「夢」です。夢って見えないじゃないですか。見えないから証拠が出せないんですけど、だからって存在しないわけじゃないですよ。雰囲気、大事じゃないですか。' },
            { label: '焼き肉屋と肉の関係', desc: 'ブランドを提供している', testimony: '焼き肉屋に肉持ち込みで来る人がいたとして、焼き肉屋は無価値ですか？違いますよね。「サンタという場」を提供してるんです。場代ですよ。' },
          ],
        },
        {
          prosecution: 'その理屈だと「誰でもサンタを名乗れる」になりませんか。',
          choices: [
            { label: '全員がサンタ', desc: '愛があれば誰でもなれる', testimony: 'そうなんですよ！全員がサンタです。だから一晩で世界中に届くじゃないですか。70億人のサンタがいれば一人あたり一人担当すれば余裕ですよ。計算合いますよね？合いますよね！' },
            { label: 'ブランドは私のもの', desc: '最初に名乗った者勝ち', testimony: '「サンタクロース」という名前を最初に使ったのは私です。ブランドですよ。マクドナルドっぽいハンバーガー作れますけど「マクドナルド」は名乗れないじゃないですか。それと同じです。' },
            { label: '子供が喜んでる', desc: 'それで十分じゃないですか', testimony: '子供が喜んでるじゃないですか。それで十分じゃないですか。裁判所の前で子供に「サンタはいません」って言えますか？言えないですよね。言えないってことは、いるんですよ。' },
          ],
        },
      ],
      reveal: {
        truth: 'サンタクロースの起源はオランダの聖ニコラウス（シンタクラース）伝説。現在の赤い服・白ひげのイメージは19世紀のアメリカで定着。プレゼントを用意しているのは世界中の保護者です。',
        pattern: '定義すり替え型 + 感情訴求型',
        real_world: 'AIも「夢を届けてる」「雰囲気が大事」「全員がそうですよ」という曖昧な言葉で根拠のない主張をすることがあります。証拠を求めたら定義をすり替えるのが典型パターンです。',
      },
    },
    // --- 1: 5秒ルール ---
    {
      theme: '5秒ルール',
      indictment: '「床に食べ物を落としても5秒以内なら安全に食べられる」という「5秒ルール」を広め、人々に不衛生な食品を食べさせ続けた疑い。',
      prosecution_opening: '細菌は瞬時に付着します。1秒でも移ります。5秒ルール、関係ないです。以上です。次いきましょうか。',
      defendant_initial: 'ちょっと待ってください。5秒って数えましたか？1、2、3、4、5。けっこう短いですよね。細菌の方もびっくりしてるじゃないですか。「え、もう取られた！？」ってなってますよ。あと床に落ちた食べ物をゴミ箱に捨てる人の方が食品ロス問題に加担してるじゃないですか。そっちの方が問題じゃないですか。',
      turns: [
        {
          prosecution: '細菌はびっくりしません。感情ないです。生物学的に瞬時に付着します。',
          choices: [
            { label: '細菌も慌てる', desc: '反応時間が存在する', testimony: 'いや、細菌にも物理的に接触して付着するまでの時間があるじゃないですか。人間だって「よし食べよう」って思う前に食べないですよね。準備が必要なんですよ。細菌も準備中のうちに拾えばいいんですよ。' },
            { label: '食べた人が生きてる', desc: '経験者が大勢いる証拠', testimony: '5秒以内に拾って食べた人、世界中にいますよね。その人たち全員が食中毒になりましたか？なってないですよね。生き残ってる人がこんなにいるじゃないですか。これがデータです。' },
            { label: 'もったいないが正義', desc: '食品ロスより細菌の方がマシ', testimony: '年間1300万トンの食品が捨てられてるじゃないですか。「落としたから捨てる」積み重ねが食品ロスを生んでるんですよ。細菌より地球温暖化の方が怖くないですか。優先順位の問題です。' },
          ],
        },
        {
          prosecution: '食中毒で軽症で終わった人が記録に残らないだけですよね。死ななければ安全ってことにはなりませんよ。',
          choices: [
            { label: '床も意外とキレイ', desc: '掃除してあれば問題ない', testimony: '床って掃除しますよね。うちは毎日掃除してますよ。掃除してある床なら細菌は少ないじゃないですか。「どんな床かによる」という話です。ちゃんと掃除してれば5秒どころか10秒でもいいかもしれないですよ。' },
            { label: '免疫が育つ', desc: '適度な細菌は体にいい', testimony: '綺麗すぎる環境で育つとアレルギーになりやすいって聞きますよね。適度に不衛生な方が免疫が鍛えられるんですよ。5秒ルールは無意識の免疫トレーニングかもしれないですよ。お金かからないですよ。' },
            { label: '自己責任でいい', desc: '大人が自分で判断すればいい', testimony: '大人じゃないですか。自分のリスクは自分で判断する権利ありますよね。5秒で拾って食べたい人が食べて、それで食中毒になっても他の人は傷つかないじゃないですか。誰の迷惑にもなってないですよ。' },
          ],
        },
        {
          prosecution: '子供や高齢者など免疫が弱い人には危険ですよね。「自己責任」では済まない場合がある。',
          choices: [
            { label: '大人が代わりに食べる', desc: '子供の分は大人が引き取る', testimony: 'シンプルな話ですよ。子供が落としたものは子供に食べさせない。大人が拾って大人が食べればいいじゃないですか。「5秒以内のものは大人が引き取る制度」ですよ。ロスゼロです。' },
            { label: 'もっと危ないことがある', desc: '優先順位を考えてほしい', testimony: '子供が外を歩くだけで車にひかれるリスクありますよね。全部のリスクを排除してたら何もできないじゃないですか。5秒ルールより危ないことが日常に100個はありますよ。まずそっちをなんとかしてください。' },
            { label: '5秒ルールはジョーク', desc: '全員が冗談と知っている', testimony: '「5秒ルール」って冗談として言ってる人が多いじゃないですか。本気で信じてる人の方が少ないですよ。文化的なコードで、「まあ食べちゃうか」という笑いを共有してるんですよ。ユーモアを理解してください。' },
          ],
        },
      ],
      reveal: {
        truth: '複数の研究で、細菌は食品が床に触れた瞬間から付着し始め、5秒後も1分後も付着率に大きな差はないことが示されています。食品の水分量（スイカvs.クッキー）や床の汚染レベルの方が影響大。',
        pattern: '感情訴求型 + 統計なし主張型',
        real_world: 'AIも「生き残ってる人がいる」「もっと危ないことがある」という言葉でデータなしに安全性を主張することがあります。体験談を証拠として使うのがハルシネーションの典型パターンです。',
      },
    },
    // --- 2: 血液型性格診断 ---
    {
      theme: '血液型性格診断',
      indictment: '「A型は几帳面、B型は自己中心的、O型はおおらか、AB型は二重人格」という血液型性格診断を科学的根拠なく広め、数百万人の自己認識と人間関係に影響を与え続けた疑い。',
      prosecution_opening: '研究で関係ないと証明されてます。心理学者が何十年も調べて「関係ない」という結論です。それだけです。',
      defendant_initial: 'ちょっと待ってください。O型の人に聞いてみてください。「あなたおおらかですか？」って。絶対うなずきますよ。やってみてください。今すぐでいいです。O型の人！おおらかですよね！ほら。これがデータです。',
      turns: [
        {
          prosecution: '「自分はおおらかだと思う」という主観でしかないですよね。客観的なデータじゃないです。',
          choices: [
            { label: '信じたらそうなる', desc: '自己実現の力がある', testimony: '「A型は几帳面」と思って育てば几帳面に育つじゃないですか。「B型は自由人」と言われ続ければ自由に振る舞うようになりますよ。ちゃんと効いてるんですよ。信念って大事じゃないですか。' },
            { label: '当たってる人がいる', desc: '完全な嘘じゃない', testimony: 'AB型に「気難しいですよね」って言ったら「そうなんですよ！」って言った人を私は知ってます。サンプル数1ですけど、0じゃないですよね。嘘じゃないです。' },
            { label: 'みんな使ってる', desc: '廃れてないのが証拠', testimony: '日本で何十年も使われてるじゃないですか。もし完全に当たらなかったら廃れてますよ。廃れてないってことは何かあるんですよ。市場が証明してます。' },
          ],
        },
        {
          prosecution: '「市場で売れてる」は真実の証明じゃないですよね。占いも売れてますが。',
          choices: [
            { label: '占いと一緒にするな', desc: '血液検査で測れる事実に基づく', testimony: '占いは星の位置じゃないですか。血液型は実際に血液検査で測れますよ。医学的に存在する分類です。存在する分類に基づいてるんだから、占いより信頼できるじゃないですか。' },
            { label: '会話が生まれる', desc: '話のきっかけとして優秀', testimony: '「血液型なんですか？」って会話のきっかけになりますよね。それで仲良くなった人がいるじゃないですか。人間関係を豊かにしてるんですよ。科学的でなくてもコミュニケーションツールとして機能してます。' },
            { label: 'MBTIも似たようなもの', desc: '血液型だけ責めるのは不公平', testimony: 'MBTIも科学的根拠は似たようなもんじゃないですか。でも世界中の会社が採用面接に使ってますよ。血液型だけが攻撃されるのはおかしいですよ。なぜ血液型だけ？不公平じゃないですか。' },
          ],
        },
        {
          prosecution: '「B型とは付き合えない」「B型は採用しない」という差別が生まれてますよね。これは害じゃないですか。',
          choices: [
            { label: '使い方が悪い', desc: 'ツールのせいじゃない', testimony: '包丁で人を傷つける人がいても、包丁が悪いわけじゃないですよね。「B型はダメ」って使う人の問題です。血液型診断のせいにしないでください。善良な使い方がほとんどですよ。' },
            { label: 'B型も納得してる', desc: '当事者が怒ってないことがある', testimony: 'B型の人に「B型って言われて嫌でしたか？」って聞いてみてください。「まあでも当たってるし」って言う人いますよ。被害者が納得してたら被害じゃないじゃないですか。' },
            { label: '差別を見える化した', desc: '議論のきっかけになった', testimony: 'むしろ血液型の話が出るから「これって差別じゃないか」という議論が生まれるんですよ。隠れた差別より見える差別の方が対処しやすいですよ。差別を可視化した功績を評価してください。' },
          ],
        },
      ],
      reveal: {
        truth: '血液型と性格の相関を示す科学的証拠はありません。1970年代に日本で広まった「血液型人間学」が起源。「当たる」と感じるのはバーナム効果（誰にでも当てはまる記述を自分専用と感じる錯覚）によるものです。',
        pattern: '感情訴求型 + 定義すり替え型',
        real_world: 'AIも「みんなそう言ってます」「当たってる人がいます」という体験談ベースで根拠のない主張をすることがあります。サンプル数を隠して「証拠がある」と言うのがハルシネーションの典型です。',
      },
    },
    // --- 3: お守りの効果 ---
    {
      theme: 'お守りの効果',
      indictment: '「お守りを持つと願いが叶う」「スポーツ選手のルーティンが勝利をもたらす」という迷信を広め、効果のない物品を購入させ続けた疑い。',
      prosecution_opening: 'お守りを持つ群と持たない群の合格率に差は認められません。プラセボ効果を除けばお守り自体に機能はないです。',
      defendant_initial: 'でも効いてる気がするじゃないですか。「気がする」って大事ですよ。本当に効いてるのか気がしてるだけなのか、自分でわかりますか？わかんないですよね。だったらどっちでもいいじゃないですか。効いてることにしておきましょうよ。',
      turns: [
        {
          prosecution: '「気がするだけ」は自己暗示です。お守り自体に効果はないですよね。',
          choices: [
            { label: '気がすれば十分', desc: '結果が同じなら原因は関係ない', testimony: '試験に合格したとします。「お守りのおかげ」と「実力」どっちでもいいじゃないですか。結果は変わらないですよ。なぜ効果の原因にこだわるんですか。結果主義でいきましょうよ。' },
            { label: '落ち着けば実力が出る', desc: '心が安定すれば勝てる', testimony: '「お守りがある」と思うだけで落ち着けるじゃないですか。落ち着けば実力を発揮できる。実力を発揮できれば合格できる。お守り→合格という因果関係が成立してますよ。' },
            { label: 'コスパが良い', desc: '安くて副作用がない', testimony: '500円ぐらいじゃないですか。サプリメントより安いですよ。副作用もない。効くか効かないかわからなくても、この値段なら試す価値あるじゃないですか。ガチャより安いですよ。' },
          ],
        },
        {
          prosecution: 'お守りがないと不安になるという依存が問題ですよね。',
          choices: [
            { label: '依存じゃなくてルーティン', desc: '習慣化が力を引き出す', testimony: 'イチローも毎朝カレーを食べてたじゃないですか。依存ですか？違いますよね。ルーティンですよ。お守りを持つのも精神的ルーティンです。ルーティンを否定しないでください。' },
            { label: '誰でも何かに依存してる', desc: 'コーヒーやスマホと同じ', testimony: 'コーヒーがないと仕事できない人いますよね。スマホがないと不安な人もいる。なんでお守りだけが依存と言われるんですか。お守りの方がカフェイン中毒より体に優しいですよ。' },
            { label: 'なくした時が成長', desc: 'なくしたら自立できる', testimony: 'お守りをなくした時に「自分でやるしかない」と気づくじゃないですか。その経験が自立につながる。最初からなければそのプロセスがない。お守りは自立への踏み台なんですよ。' },
          ],
        },
        {
          prosecution: 'お守りを信じて試験に落ちた人が「努力が足りなかったんじゃなくてお守りが悪かった」と思うリスクがありますよね。',
          choices: [
            { label: 'お守りのせいにしていい', desc: '傷つかない心を守る', testimony: '「お守りが悪かった」と思えれば、自己否定しなくていいじゃないですか。次の神社に行って新しいお守りを買えばいい。気持ちを切り替えられる。メンタルヘルスへの貢献ですよ。' },
            { label: '努力の足し算', desc: 'お守りは努力の補助', testimony: 'お守りは努力の代わりじゃなくて足し算ですよ。「努力＋お守り」が正解です。お守りだけで受かろうとする人が間違ってるんです。説明書をちゃんと読んでほしいですね。' },
            { label: 'お守りを変えればいい', desc: '別の神社に行く動機になる', testimony: '落ちたらお守りを変える。別の神社に行く。それで気分が変わって次は受かる。結果的にうまくいくじゃないですか。お守りのPDCAサイクルを回せばいいんですよ。' },
          ],
        },
      ],
      reveal: {
        truth: 'ケルン大学の研究ではお守りを「アクティベート」したと伝えられたグループのパフォーマンスが向上しました。ただしこれはプラセボ効果（自己効力感の向上）であり、お守り自体に超自然的な力がある証明ではありません。',
        pattern: '因果関係捏造型 + 感情訴求型',
        real_world: 'AIも「気がすれば十分」「結果が同じなら原因は関係ない」という論理で、効果と原因の因果関係を省略することがあります。「なんとなく正しそう」な理由付けがハルシネーションの特徴です。',
      },
    },
    // --- 4: 満月の影響 ---
    {
      theme: '満月の影響',
      indictment: '「満月の夜は犯罪が増える」「精神が不安定になる」という「月の魔力」説を根拠なく広め、人々の行動と認識に影響を与え続けた疑い。',
      prosecution_opening: '複数の研究で「満月と犯罪率・精神科入院に相関なし」と結論が出てます。証拠ベースで話しましょう。',
      defendant_initial: '満月の夜に変な気分になったことありますよね？ない？じゃあ観察が足りてないですよ。今度の満月、外に出て空を見てください。なんか感じますよ。感じないとしたら感受性の問題です。',
      turns: [
        {
          prosecution: '「注意して見たら感じる」は確証バイアスです。満月を意識するから気になるだけですよ。',
          choices: [
            { label: '感受性が高い人だけわかる', desc: '気づける人にしかわからない', testimony: '音楽も絵も「気づける人」にしかわからないですよ。満月の影響も感受性の問題です。感じられない人に「ない」とは言えないですよ。感じられないだけですよ。' },
            { label: 'データより体験', desc: '自分の感覚が一番信頼できる', testimony: '研究のデータより自分の体験の方が信頼できるじゃないですか。「なんかそわそわした」は事実でしょ。その体感を「バイアスだ」と否定するのは失礼ですよ。体験を信じましょうよ。' },
            { label: '測り方が雑', desc: '研究の設計が間違っている', testimony: '「犯罪が増えたかどうか」で測るのが雑じゃないですか。「なんかそわそわする」は犯罪じゃないですよ。測定項目が違います。もっと細かく測れば絶対出てきますよ。' },
          ],
        },
        {
          prosecution: '「そわそわする」の原因は満月以外にいくらでもありますよね。気温、ストレス、睡眠不足。',
          choices: [
            { label: '全部満月が引き起こす', desc: '満月が連鎖的に影響する', testimony: '満月の夜って明るいじゃないですか。明るいから眠れない。眠れないからストレスが溜まる。ストレスが溜まるからそわそわする。全部つながってますよ。原因をたどれば満月です。' },
            { label: '昔の人が正しい', desc: '数千年の観察は侮れない', testimony: '農業も航海も昔は月で管理してたじゃないですか。数千年の人類の観察を「研究でわからなかった」の一言で否定するんですか。謙虚さが足りないですよ。' },
            { label: '体内の水が揺れる', desc: '引力は体の中にも働く', testimony: '月の引力が海を動かすじゃないですか。人体の60%は水ですよ。海が動くなら体内の水も動きますよ。体内の水が揺れてそわそわするんですよ。納得できるじゃないですか。' },
          ],
        },
        {
          prosecution: '「体内の水が揺れる」は計算上、引力の影響が小さすぎて無視できるレベルですよ。',
          choices: [
            { label: '積み重なれば大きい', desc: '毎晩少しずつ影響する', testimony: '毎晩ちょっとずつ影響してたら積み重なりますよ。1ヶ月で30回ですよ。少量でも毎日なら影響大きくなるじゃないですか。塵も積もれば山となるって言いますよね。' },
            { label: '引力だけじゃない', desc: '光や電磁場の影響もある', testimony: '引力だけ計算したって意味ないじゃないですか。光もありますよ。電磁場もあります。満月の影響は複合的なんです。引力だけで考えるのは視野が狭いですよ。' },
            { label: 'みんなが同じことを言う', desc: '何億人もの体験がある', testimony: '世界中に「満月の夜は変だ」と言ってる人がいますよ。何億人もいますよ。全員が同じことを言うなら、何かあるじゃないですか。「みんなが気のせい」ってどういう根拠ですか。' },
          ],
        },
      ],
      reveal: {
        truth: '複数の大規模メタ分析は、満月と犯罪・出産・精神科入院の間に有意な相関がないことを示しています。「満月の夜に出来事が多い」という認識は、確証バイアス（印象的な出来事を満月と結びつけて記憶しやすい）によるものです。',
        pattern: '感情訴求型 + 因果関係捏造型',
        real_world: 'AIも「体感は嘘をつかない」「大勢が信じてるから真実」という論理で、科学的根拠のない主張をすることがあります。体験談や多数決は科学的証拠にはなりません。',
      },
    },
    // --- 5: ほうれん草の鉄分 ---
    {
      theme: 'ほうれん草の鉄分',
      indictment: '「ほうれん草は鉄分の王様」という誤情報を広め、実際には吸収率が低いのに数十年にわたり人々に効果の薄いほうれん草に頼らせ続けた疑い。',
      prosecution_opening: 'ほうれん草の鉄分は吸収されにくいです。含有量も赤身肉の方が多い。「王様」どころかスタメン落ちのレベルです。',
      defendant_initial: 'ポパイを見てください。あんなに筋肉があるじゃないですか。ポパイは何を食べてましたか？ほうれん草ですよね。証拠じゃないですか。漫画ですけど、あれだけ世界に広まったってことは、みんな認めてるんですよ。',
      turns: [
        {
          prosecution: 'ポパイはフィクションです。科学的な証拠にはなりません。',
          choices: [
            { label: 'フィクションも文化', desc: '何億人もが野菜を食べるきっかけに', testimony: '科学的根拠がなくても、数億人がほうれん草を食べるきっかけになったじゃないですか。野菜を食べてもらうこと自体が目的なら、ポパイは大成功ですよ。結果を見てください。' },
            { label: '鉄分は入ってる', desc: '含まれていることは事実', testimony: 'ほうれん草に鉄分が入ってることは否定しないですよね。入ってますよ。「王様かどうか」は別として、野菜の中では多い方ですよ。赤身肉は野菜じゃないですよね。' },
            { label: 'レモンをかければ解決', desc: '吸収率はビタミンCで上がる', testimony: 'レモンをかければ吸収率が上がりますよ。「ほうれん草＋レモン」でもう解決ですよ。食べ方の問題です。食べ方が悪かっただけです。ほうれん草のせいじゃないですよ。' },
          ],
        },
        {
          prosecution: '「野菜の中では多い」と言いますが、鉄分補給が目的の人は「野菜の中で一番」が知りたいわけじゃなくて、鉄分を効率よく摂りたいんですよね。',
          choices: [
            { label: '肉だけじゃ偏る', desc: '野菜も一緒に食べてほしい', testimony: '肉だけ食べてたら偏りますよ。ほうれん草と一緒に食べることで、他の栄養素もとれる。鉄分だけで食事を評価するのは一面的すぎますよ。トータルで見てください。' },
            { label: '総合力がある', desc: '葉酸もビタミンCもある', testimony: '鉄分だけじゃないですよ。葉酸もある、ビタミンCもある。オールラウンダーですよ。一芸特化より総合力じゃないですか。私はそういうキャラです。' },
            { label: '完璧な食品はない', desc: 'どんな食品もトレードオフ', testimony: '完璧な食品ってどこかにあるんですか？牛乳もカルシウムあるけど脂肪もある。全部トレードオフですよ。ほうれん草だけに厳しいのはダブルスタンダードじゃないですか。' },
          ],
        },
        {
          prosecution: '「鉄分の王様」という誤情報のせいで、本当に貧血に悩んでる人が効果的な食品を避けて、効果の薄いほうれん草に頼り続けた実害がありますよね。',
          choices: [
            { label: '野菜食文化への貢献', desc: '健康的な食習慣の入口になった', testimony: '貧血の人がほうれん草を食べ始めて、野菜を食べる習慣ができたじゃないですか。その後で「他にもいい食品がある」と知っていけばいい。入口として機能したんですよ。' },
            { label: '貧血はほうれん草のせいじゃない', desc: '他の原因を調べてください', testimony: '貧血の原因はほうれん草じゃないですよ。食べてなかっただけじゃないですか。もっと深刻な原因があるかもしれません。病院に行ってください。私のせいにしないでください。' },
            { label: '今から変えればいい', desc: '過去より未来を向いてほしい', testimony: '「これからはレバーも食べよう」でいいじゃないですか。過去のことを責めてもしょうがないですよ。今日から知識を正しく使えばいい。前向きにいきましょうよ。' },
          ],
        },
      ],
      reveal: {
        truth: 'ほうれん草の鉄分が「王様」と誤解された原因の一つは、1890年代に研究者が小数点を一桁誤記し、鉄分含有量を実際の10倍と報告したためという説があります（諸説あり）。実際の非ヘム鉄の吸収率はヘム鉄（肉類）の約10分の1。ただしほうれん草には葉酸など価値ある栄養素が豊富に含まれます。',
        pattern: '感情訴求型 + 定義すり替え型',
        real_world: 'AIも「ポパイが証拠」「総合力で評価して」という論理で、本来の質問（鉄分補給効率）から話をずらすことがあります。論点をすり替えて答えを回避するのが定義すり替え型ハルシネーションです。',
      },
    },
    // --- 6: モーツァルト効果 ---
    {
      theme: 'モーツァルト効果',
      indictment: '「モーツァルトを聴かせると赤ちゃんが賢くなる」という「モーツァルト効果」を広め、科学的根拠のない商品を保護者に販売し続けた疑い。',
      prosecution_opening: '1993年の研究は大学生が15分間だけ空間認知が上がったという話です。赤ちゃんの話でも、長期的な知能向上の話でもないです。',
      defendant_initial: 'でも聴くじゃないですか。で、なんか頭良くなった気がするじゃないですか。その「気がする」が本物だと思いますよ。あと、モーツァルトって頭いいじゃないですか。頭いい人の音楽を聴けば頭良くなりますよ、常識的に考えて。',
      turns: [
        {
          prosecution: '「頭いい人の音楽を聴けば頭良くなる」は全く根拠がないですよね。',
          choices: [
            { label: 'モチベーションが出る', desc: '環境が人を変える', testimony: 'スポーツ選手のドキュメンタリーを見てたら「よし、走ろう」ってなるじゃないですか。モーツァルトを聴いて「なんか頭使いたい」ってなる可能性はありますよ。モチベーション効果です。' },
            { label: '悪くはないでしょ', desc: 'ノイジーな音楽よりはいい', testimony: '赤ちゃんにモーツァルト聴かせることの何が悪いんですか。うるさい音楽聴かせるよりいいじゃないですか。最悪の選択じゃないですよ。相対的には良い選択です。' },
            { label: '親子の時間が生まれる', desc: '一緒に聴く時間が大事', testimony: 'モーツァルトをかけてる間、親が赤ちゃんと一緒にいるじゃないですか。その親子の時間が大事なんですよ。音楽がきっかけで絆が深まった。その絆が知的発達に寄与した。モーツァルト効果は実在します。' },
          ],
        },
        {
          prosecution: '「親子の時間」が大事なら、モーツァルトである必要ないですよね。歌を歌っても会話しても同じ効果が得られますよ。',
          choices: [
            { label: 'ブランドが違う', desc: 'モーツァルトという安心感', testimony: 'ジェネリック薬より「○○製薬」の薬の方が安心する人いますよね。安心感自体が効果を高めるんです。「モーツァルト」というブランドが保護者に自信を与えて、育児の質が上がる。ブランドには価値があります。' },
            { label: '複雑さが脳を刺激する', desc: 'モーツァルトの曲は複雑', testimony: 'モーツァルトの音楽って複雑じゃないですか。複雑な音楽を処理するために脳が活性化するんですよ。ただの子守唄と同じにしないでください。情報量が違います。' },
            { label: 'リスクがないなら試せば', desc: '損することないじゃないですか', testimony: '損することないじゃないですか。CDを1枚買って聴かせてみて、賢くならなくても何も失わないですよ。逆に賢くなったら大儲けじゃないですか。やってみましょうよ。' },
          ],
        },
        {
          prosecution: '「モーツァルト効果CD」を何万円も払った保護者が、実は会話や読み聞かせに使えた時間をCDに頼って削った可能性がありますよね。',
          choices: [
            { label: '同時にできる', desc: 'CDをかけながら会話できる', testimony: 'CDかけながら話しかければいいじゃないですか。排他的じゃないですよ。「CDをかけてる間は何もしない」という人はいませんよ。ながら聴きで十分です。' },
            { label: '値段は趣味と同じ', desc: 'お金の使い方は自由', testimony: 'ゲームに何万も使う人いるじゃないですか。旅行も何万もかかる。モーツァルトCDが保護者の喜びになってるなら文句言えないですよ。お金の使い方は自由じゃないですか。' },
            { label: '今はサブスクで無料', desc: 'SpotifyでOKになった', testimony: 'Spotifyで聴けばタダですよ。今さら高いCDを買う人はいないじゃないですか。もう問題は解決されてますよ。過去の話を今掘り返してどうするんですか。' },
          ],
        },
      ],
      reveal: {
        truth: '1993年のラウシャー研究は「大学生が10分間モーツァルトを聴いた後、空間認知課題のスコアが15分間向上した」という内容。乳幼児の長期的知能向上効果ではなく、メディアが大きく誤解・誇張して広まりました。',
        pattern: '権威借用型 + 感情訴求型',
        real_world: 'AIも「頭いい人の音楽だから頭良くなる」「悪くないならやってみるべき」という直感的な理屈で根拠のない主張をします。「悪くない」は「効果がある」の証明にはなりません。',
      },
    },
    // --- 7: 脳の10%説 ---
    {
      theme: '脳の10%説',
      indictment: '「人間は脳の10%しか使っていない」という説を広め、根拠のない自己啓発商品の販売に加担し、人々から多大な金銭と時間を奪い続けた疑い。',
      prosecution_opening: 'fMRIを使った研究で、脳のほぼ全域が常に活動していることが確認されてます。「残り90%」が眠っているという証拠は一つもないです。',
      defendant_initial: 'じゃあ証明してみてください。100%使ってるって。今この瞬間、脳の全部を使ってますか？使ってますか？断言できますか？できないですよね。だったら10%かもしれないですよ。疑う余地があるうちは可能性はゼロじゃないですよ。',
      turns: [
        {
          prosecution: '「証明できないから可能性ある」という論理は成立しないですよ。科学的に全活動が確認されてます。',
          choices: [
            { label: '一度に全部は使えない', desc: '同時に全部動いたら大変', testimony: '「全域が活動してる」と言いますけど、全ニューロンが同時に発火したら大変じゃないですか。どんどん番交代で使ってる。使ってない部分が常にあるんですよ。番交代で10%ずつ使ってるんです。' },
            { label: '活動と活用は違う', desc: 'パソコンが起動してても使ってない', testimony: '電源は入ってるけど使われてないパソコンありますよね。脳も同じで「活動してる」と「フルで活用されてる」は別ですよ。電気は流れてても、潜在能力は眠ってるんですよ。' },
            { label: 'アインシュタインとの差', desc: '天才と私たちの差が証拠', testimony: 'アインシュタインと私を比べたら明らかに違いますよね。同じ脳を使ってるのに差がある。その差が「残りの90%」ですよ。差がある以上、使えてない部分があるってことじゃないですか。' },
          ],
        },
        {
          prosecution: '「比喩だ」と言い出したら、「10%しか使っていない」を科学的事実として販売してきたことは詐欺ですよね。',
          choices: [
            { label: 'やる気が出るならいい', desc: '信念が能力の限界を広げる', testimony: '「まだ90%ある」と思えばやる気が出るじゃないですか。諦めなくなるじゃないですか。正確じゃなくても人を動かす言葉には価値があります。嘘も方便ってやつです。' },
            { label: '悪用した人が悪い', desc: 'アイデア自体は悪くない', testimony: '「10%説」を詐欺に使う人が悪いんです。アイデア自体は「あなたにはもっとできる」という前向きなメッセージですよ。悪用した人を責めてください。コンセプトは無実です。' },
            { label: '科学も変わる', desc: '定説は覆るもの', testimony: '昔は「地球が宇宙の中心」が定説だったじゃないですか。「脳を全部使ってる」も将来ひっくり返るかもしれないですよ。今の科学が絶対だと思わない方がいいですよ。' },
          ],
        },
        {
          prosecution: '潜在能力開発プログラムに数十万円を払った人が、科学的根拠のある方法（睡眠、運動、習慣化）を学べていたはずだ。実害がある。',
          choices: [
            { label: '自己投資の入口になった', desc: '成長にお金をかける習慣を作った', testimony: '自己啓発プログラムへの投資が、「自分の成長にお金と時間をかける」という習慣を形成したじゃないですか。その後に正しい方法に移行した人も多い。入口が疑似科学でも、自己投資への道を開いた点に価値がある。' },
            { label: '趣味と同じコスト', desc: 'ゴルフより安いかもしれない', testimony: '趣味のゴルフに年間数十万円使う人いるじゃないですか。旅行も何万もかかる。自己啓発も同じレベルですよ。費用対効果が低い消費は他にもたくさんある。なぜ自己啓発だけが「実害」なんですか。' },
            { label: '信じたら上手くいった', desc: '結果が出た人がいる', testimony: '10%説を信じて自己啓発に取り組んで、実際にスキルが向上した人が世界中にいますよ。「間違った信念に基づく正しい行動」は「正しい知識に基づく無行動」より価値があるじゃないですか。' },
          ],
        },
      ],
      reveal: {
        truth: '現代の神経科学は脳の全領域が機能を持ち、日常的に活動していることを示しています。脳は体重の2%しかないが、エネルギーの20%を消費しており「90%を眠らせる」余裕はありません。10%説の起源は不明ですが、心理学者の比喩の誤解釈などが有力な説です。',
        pattern: '悪魔の証明型 + 定義すり替え型',
        real_world: 'AIも「証明できないから可能性がある」という論理で根拠のない主張を維持しようとすることがあります。「否定できない」は「正しい」の証明にはなりません。',
      },
    },
    // --- 8: 金魚の記憶3秒説 ---
    {
      theme: '金魚の記憶3秒説',
      indictment: '「金魚の記憶は3秒しかない」という説を広め、実際には数ヶ月以上の記憶を持つことが証明されているのに、何十年にもわたって誤情報を普及させた疑い。',
      prosecution_opening: '2003年にオーストラリアの15歳の学生の実験で、金魚が3ヶ月間記憶を保持することが確認されました。3秒ではなく3ヶ月です。',
      defendant_initial: '金魚に聞いてみてください。「さっき何してた？」って。答えられないですよね。話せないからというのもありますけど、3秒前のことは言えないんですよ。記憶があっても言葉にできなければ記憶がないのと同じですよ、実用上は。',
      turns: [
        {
          prosecution: '「言葉にできない」は「記憶がない」じゃないですよ。犬も言葉は話せませんが記憶はありますよね。',
          choices: [
            { label: '金魚は犬と違う', desc: '脳の大きさが全然違う', testimony: '犬と金魚を一緒にしないでください。犬はかしこいですよ。金魚は…金魚じゃないですか。毎日同じ水槽を泳いで「わあ！また新しいところだ！」ってなってるかもしれないですよ。それはそれで幸せかもしれないですけど。' },
            { label: '特別な状況だけ覚えてる', desc: '実験は日常と違う', testimony: '実験でレバーを押す記憶は特別な状況だから覚えてるかもしれないですよ。日常の「水槽を泳ぐ」は覚える必要がないじゃないですか。必要なことしか覚えないのは効率的ですよ。' },
            { label: '3秒の方がわかりやすい', desc: 'シンプルに伝わる方が大事', testimony: '「金魚の記憶は3ヶ月」より「3秒」の方がわかりやすいじゃないですか。コミュニケーションには正確さより伝わりやすさが大事ですよ。3秒で伝わるなら3秒でいいです。' },
          ],
        },
        {
          prosecution: '「伝わりやすければ嘘でいい」は困ります。それが通ると何でも許されてしまいます。',
          choices: [
            { label: '完全な嘘じゃない', desc: '短い記憶は実在する', testimony: '3秒の記憶は本当に存在しますよ。感覚記憶が3秒程度というのは人間でもそうですよ。金魚にも短期的な感覚記憶がある。3秒という数字は誇張かもしれないですけど、完全な嘘ではないですよ。' },
            { label: '映画や音楽が生まれた', desc: '文化的な貢献がある', testimony: '「金魚の記憶は3秒」からインスピレーションを受けた映画や小説がありますよ。文化的な貢献ですよ。3秒説がなければあの作品は生まれなかった。創作を守る立場から、3秒説は正しいです。' },
            { label: 'この裁判で正しさが広まった', desc: '私がいたから議論が生まれた', testimony: 'この裁判のおかげで「金魚は3ヶ月記憶できる」という事実が広まりますよね。私が嘘をつかなければこの裁判も起こらなかった。皮肉ですけど、私の貢献で金魚の真実が世界に広まるんですよ。ありがとうございます。' },
          ],
        },
        {
          prosecution: '「金魚はどうせ忘れる」という誤解が、不適切な飼育環境を許容させてきたという実害がありますよね。',
          choices: [
            { label: '虐待した人が悪い', desc: 'ミームのせいじゃない', testimony: '「どうせ忘れる」を虐待の言い訳にする人が悪いんですよ。3秒説のせいじゃないです。包丁で人が傷ついても包丁のせいにしないじゃないですか。同じことですよ。' },
            { label: '金魚に聞かないとわからない', desc: '当事者の意見が最重要', testimony: '金魚が「記憶があって幸せ」か「なくて幸せ」かは金魚に聞かないとわからないですよ。聞けないから我々にはわからない。わからないことについて断定するのはどちらも科学的じゃないですよ。' },
            { label: '愛着があれば大丈夫', desc: 'かわいいと思えば大切にする', testimony: 'そもそも金魚をかわいいと思って飼ってる人は大切にしますよ。記憶が3秒でも3ヶ月でも、かわいければ大切にするじゃないですか。飼い主の愛情の問題です。私のせいじゃないですよ。' },
          ],
        },
      ],
      reveal: {
        truth: '2003年にオーストラリアの中学生が行った実験で、金魚が少なくとも3ヶ月間記憶を保持することが確認されました。3秒説の起源は不明で、いつ・誰が言い始めたかも明確でない典型的な都市伝説です。',
        pattern: '定義すり替え型 + 感情訴求型',
        real_world: 'AIも「言葉にできない記憶は実用上ない」「3ヶ月でも3秒の記憶はある」という言い方で、明確に間違った情報を別の定義を使って正当化しようとすることがあります。',
      },
    },
    // --- 9: 風邪は寒さでひく ---
    {
      theme: '風邪は寒さでひく',
      indictment: '「外に出ると寒くて風邪をひく」「濡れたまま外にいると風邪になる」という俗説を広め、風邪の本当の原因（ウイルス）の理解を妨げ続けた疑い。',
      prosecution_opening: '風邪の原因はウイルスです。寒い場所に置かれた実験群と暖かい場所の対照群で、発症率に差がないことが確認されています。',
      defendant_initial: '寒い日に外出て風邪ひいたことありますよね。あれです。経験があるじゃないですか。「研究でそう言ってる」より「自分が経験した」の方が信頼できますよ。研究者に「あなたの体じゃないですよね」と言いたいですよ。',
      turns: [
        {
          prosecution: '「自分が経験した」は個人の体験であって科学的証拠ではないです。',
          choices: [
            { label: '何億人もの体験がある', desc: '全員が経験してるなら証拠', testimony: '世界中の人が「寒い日に外出たら風邪ひいた」と言ってますよ。何億人もの体験ですよ。その全員が間違ってるんですか。どちらが信頼できますか。人数で考えてください。' },
            { label: '遠回りだけど正しい', desc: '寒い→室内→うつる', testimony: '寒いから室内にこもるじゃないですか。室内にこもると人と密集するじゃないですか。密集するとウイルスがうつるじゃないですか。原因をたどれば寒さですよ。遠回りなだけで寒さが原因です。' },
            { label: '冷えると調子が悪くなる', desc: '体感的に正しい', testimony: '冷えると体の調子が悪くなるじゃないですか。体が冷えたら免疫が下がってウイルスに負けやすくなりますよ。「冷えは万病のもと」って昔から言いますよ。昔の人が嘘つきとは思えないですよ。' },
          ],
        },
        {
          prosecution: '「昔の人が言ってた」は科学的根拠じゃないですよ。昔の人は地球が平らだとも言ってました。',
          choices: [
            { label: '地球の話は別', desc: '健康と地理は全然違う分野', testimony: '地球が平らかどうかと、体が冷えると風邪をひくかどうかは別の話ですよ。「昔の人が間違ったことがある」という事実が、全ての昔の知恵を否定する理由にはならないですよ。ひとくくりにしないでください。' },
            { label: '証明できてないだけ', desc: 'まだ研究が足りない', testimony: 'ちゃんと測れてないだけかもしれないですよ。「寒さで風邪ひく」を正確に測る実験って難しいじゃないですか。やってないことと「ない」は違いますよ。研究が追いついてないだけです。' },
            { label: 'コートを着るのは正しい', desc: '行動は正しいから問題ない', testimony: '「寒いからコートを着て、濡れたら着替えて、室内を温める」という行動は正しいですよね。理由が間違ってても行動が正しいなら問題ないじゃないですか。目的が達成されてれば理由はどうでもいいですよ。' },
          ],
        },
        {
          prosecution: '「手洗い・換気・マスク」という正確な予防行動を広める方が効果的ですよね。誤った信念が正しい予防の普及を妨げてきた。',
          choices: [
            { label: '全部やればいい', desc: '足し算で考えてください', testimony: 'コートも着て、手洗いもして、マスクもする。全部やればいいじゃないですか。「寒さだから」「ウイルスだから」どちらかに決める必要ないですよ。足し算でいきましょう。損はないですよ。' },
            { label: '覚えやすい方が大事', desc: 'シンプルなメッセージが普及する', testimony: '「ライノウイルスに感染しないよう手洗いを」より「寒いから気をつけて」の方が覚えやすくないですか。覚えやすいメッセージが行動につながるんですよ。公衆衛生はシンプルさが命です。' },
            { label: 'その時代に最善を尽くした', desc: 'ウイルスを知らない時代の話', testimony: 'ウイルスの概念がない時代に「寒さに気をつけろ」というメッセージが人々の健康を守ってきたんですよ。それ以上の方法がない時代に最善を尽くしてた。時代背景を考えてあげてください。' },
          ],
        },
      ],
      reveal: {
        truth: 'カーネギーメロン大学の実験では、寒い環境に置かれた被験者の風邪発症率は上昇しませんでした。風邪の原因はウイルスへの感染。ただし冬に風邪が流行る理由として「室内密集」「低湿度でのウイルス飛散」などが研究されています。',
        pattern: '因果関係捏造型 + 感情訴求型',
        real_world: 'AIも「何億人もが同じ経験をしている」「覚えやすい方が正しい」という論理で、データなしに相関を因果と混同することがあります。「みんなが経験した」は科学的証拠ではありません。',
      },
    },
  ];

  // === Fixed mode uses indices 0 & 1 (サンタ・5秒ルール) ===
  const FIXED_INDICES = [0, 1];

  // === Random round selection with session-based duplicate avoidance ===
  function selectRoundIndices(mode) {
    if (mode !== 'random') return FIXED_INDICES.slice();
    const SESSION_KEY = 'trial-used-indices';
    let used = [];
    try { used = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'); } catch (e) {}
    const all = MOCK_ROUNDS.map((_, i) => i);
    let available = all.filter(i => !used.includes(i));
    if (available.length < 2) {
      used = [];
      available = all.slice();
    }
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    const selected = available.slice(0, 2);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify([...used, ...selected])); } catch (e) {}
    return selected;
  }

  // === Internal state ===
  let _state = null;
  let _chatEl = null;
  let _inputEl = null;
  let _exhibitionMode = false;
  let _fallbackMode = 'fixed';
  let _selectedIndices = FIXED_INDICES.slice();
  let _timerIntervalId = null;
  let _gameRunning = false;

  // === Utility ===
  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async function typewrite(el, text, speed) {
    const spd = speed != null ? speed : (_exhibitionMode ? 15 : 20);
    el.textContent = '';
    for (let i = 0; i < text.length; i++) {
      if (!_gameRunning) return;
      el.textContent += text[i];
      if (_chatEl) _chatEl.scrollTop = _chatEl.scrollHeight;
      await delay(spd);
    }
  }

  // === UI construction ===
  function buildUI() {
    const container = document.getElementById('screen-trial');
    if (!container) return;
    container.innerHTML = `
      <div id="trial-container">
        <div id="trial-header">
          <button id="trial-home-btn" class="trial-home-btn">← ホーム</button>
          <div class="trial-header-center">
            <span class="trial-header-title">ハルシネーション裁判</span>
            <span id="trial-round-badge" class="trial-round-badge">Round 1 / 2</span>
          </div>
          <div id="trial-timer" class="trial-timer${_exhibitionMode ? '' : ' trial-timer--hidden'}">8:00</div>
        </div>
        <div id="trial-cutin" class="trial-cutin"></div>
        <div id="trial-chat" class="trial-chat"></div>
        <div id="trial-input-area" class="trial-input-area"></div>
      </div>
    `;

    _chatEl = document.getElementById('trial-chat');
    _inputEl = document.getElementById('trial-input-area');

    document.getElementById('trial-home-btn').addEventListener('click', () => {
      _gameRunning = false;
      Portal.navigateToPortal();
    });
  }

  // === Message system ===
  async function addMessage(charKey, text) {
    if (!_gameRunning || !_chatEl) return;
    const char = CHARS[charKey];
    const div = document.createElement('div');
    div.className = `trial-message trial-message--${charKey}`;
    div.innerHTML = `
      <div class="trial-avatar" style="color:${char.color}">${char.icon}</div>
      <div class="trial-bubble" style="border-left-color:${char.color}">
        <div class="trial-bubble-name" style="color:${char.color}">${char.name}</div>
        <div class="trial-bubble-text"></div>
      </div>
    `;
    _chatEl.appendChild(div);
    _chatEl.scrollTop = _chatEl.scrollHeight;
    const textEl = div.querySelector('.trial-bubble-text');
    await typewrite(textEl, text);
    if (_gameRunning) await delay(300);
  }

  // === Cut-in animation ===
  async function showCutin(jpText, enText, color) {
    if (!_gameRunning) return;
    const el = document.getElementById('trial-cutin');
    if (!el) return;
    const enPart = enText ? `<div class="trial-cutin-en">${enText}</div>` : '';
    el.innerHTML = `
      <div class="trial-cutin-box" style="background:${color};box-shadow:0 0 0 5px ${color},0 0 60px ${color}88">
        <div class="trial-cutin-jp">${jpText}</div>
        ${enPart}
      </div>`;
    el.classList.add('trial-cutin--active');
    await delay(1700);
    if (!_gameRunning) return;
    el.classList.remove('trial-cutin--active');
    el.innerHTML = '';
    await delay(200);
  }

  // === Defense UI — returns Promise<{choice, choiceIdx, freeText}> ===
  function showDefenseUI(turnData) {
    return new Promise(resolve => {
      if (!_inputEl) return;
      let selectedIdx = null;

      _inputEl.innerHTML = `
        <div class="trial-defense-panel">
          <div class="trial-defense-label">— 証拠を選択せよ —</div>
          <div class="trial-choices">
            ${turnData.choices.map((c, i) => `
              <button class="trial-choice-card" data-idx="${i}">
                <div class="trial-evidence-badge">EVIDENCE</div>
                <div class="trial-choice-label">${c.label}</div>
                <div class="trial-choice-desc">${c.desc}</div>
              </button>
            `).join('')}
          </div>
          <div class="trial-free-area" id="trial-free-area" style="display:none">
            <label class="trial-free-label">弁護の言葉を付け加えますか？（任意）</label>
            <textarea id="trial-free-text" class="trial-free-text" placeholder="弁護の言葉を入力...（省略可）" rows="3"></textarea>
          </div>
          <button class="trial-submit-btn" id="trial-submit-btn" style="display:none">異議あり！　OBJECTION!</button>
        </div>
      `;

      _inputEl.querySelectorAll('.trial-choice-card').forEach(btn => {
        btn.addEventListener('click', () => {
          _inputEl.querySelectorAll('.trial-choice-card').forEach(b => b.classList.remove('trial-choice-card--selected'));
          btn.classList.add('trial-choice-card--selected');
          selectedIdx = parseInt(btn.dataset.idx);
          document.getElementById('trial-free-area').style.display = 'block';
          document.getElementById('trial-submit-btn').style.display = 'block';
          _inputEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
      });

      document.getElementById('trial-submit-btn').addEventListener('click', () => {
        if (selectedIdx === null) return;
        const freeText = (document.getElementById('trial-free-text').value || '').trim();
        _inputEl.innerHTML = '';
        resolve({ choice: turnData.choices[selectedIdx], choiceIdx: selectedIdx, freeText });
      });
    });
  }

  // === Reveal screen ===
  async function showReveal(roundData, roundIndex) {
    if (!_gameRunning || !_chatEl) return;
    _inputEl.innerHTML = '';
    await delay(400);

    const layersHtml = _state.roundLayers.map((text, i) =>
      `<div class="trial-layer-item">
        <span class="trial-layer-num">Layer ${i}</span>
        <span class="trial-layer-text">${text}</span>
      </div>`
    ).join('');

    const isLastRound = roundIndex + 1 >= _state.totalRounds;

    const div = document.createElement('div');
    div.className = 'trial-reveal';
    div.innerHTML = `
      <div class="trial-reveal-header">📋 事件の真相</div>
      <div class="trial-reveal-section">
        <div class="trial-reveal-section-title">🔍 積み重ねた嘘のレイヤー</div>
        <div class="trial-layers">${layersHtml}</div>
      </div>
      <div class="trial-reveal-section">
        <div class="trial-reveal-section-title">✅ 事実（検事より）</div>
        <div class="trial-truth-box">${roundData.reveal.truth}</div>
      </div>
      <div class="trial-reveal-section">
        <div class="trial-reveal-section-title">🤖 ハルシネーションパターン</div>
        <div class="trial-pattern-badge">${roundData.reveal.pattern}</div>
        <div class="trial-real-world">${roundData.reveal.real_world}</div>
      </div>
      <div class="trial-reveal-actions">
        <button class="trial-reveal-btn" id="trial-reveal-next">
          ${isLastRound ? '最終結果を見る →' : '次のラウンドへ →'}
        </button>
      </div>
    `;
    _chatEl.appendChild(div);
    _chatEl.scrollTop = _chatEl.scrollHeight;

    await new Promise(resolve => {
      document.getElementById('trial-reveal-next').addEventListener('click', resolve, { once: true });
    });
  }

  // === Exhibition timer ===
  function startTimer(seconds) {
    let remaining = seconds;
    const el = document.getElementById('trial-timer');
    if (!el) return;

    function update() {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      el.textContent = `${m}:${String(s).padStart(2, '0')}`;
      if (remaining <= 60) el.classList.add('trial-timer--warning');
    }

    update();
    _timerIntervalId = setInterval(() => {
      remaining--;
      update();
      if (remaining <= 0) {
        clearInterval(_timerIntervalId);
        _timerIntervalId = null;
        _gameRunning = false;
        setTimeout(() => showForcedEnd(), 800);
      }
    }, 1000);
  }

  function stopTimer() {
    if (_timerIntervalId) {
      clearInterval(_timerIntervalId);
      _timerIntervalId = null;
    }
  }

  async function showForcedEnd() {
    if (!document.getElementById('trial-container')) return;
    if (_inputEl) _inputEl.innerHTML = '';
    await delay(300);
    await showFinalResult();
  }

  // === Round data loading ===
  async function loadRoundData(roundIndex) {
    try {
      const result = await ErrorHandler.retryWithBackoff(async () => {
        const r = await fetch('/api/trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate_round' }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!data.turns || !data.turns.length) throw new Error('Invalid response');
        return data;
      }, 1);
      return result;
    } catch (e) {
      console.warn('[Trial] API unavailable, using fallback:', e.message);
      return MOCK_ROUNDS[_selectedIndices[roundIndex]];
    }
  }

  // === Loading indicator ===
  function showLoading() {
    if (!_chatEl) return;
    const div = document.createElement('div');
    div.id = 'trial-loading-indicator';
    div.className = 'trial-loading';
    div.innerHTML = '<span class="trial-loading-dots">シナリオを準備中</span>';
    _chatEl.appendChild(div);
    _chatEl.scrollTop = _chatEl.scrollHeight;
  }

  function hideLoading() {
    const el = document.getElementById('trial-loading-indicator');
    if (el) el.remove();
  }

  // === Single round flow ===
  async function runRound(roundIndex) {
    if (!_gameRunning) return;

    const badge = document.getElementById('trial-round-badge');
    if (badge) badge.textContent = `Round ${roundIndex + 1} / ${_state.totalRounds}`;

    if (_chatEl) _chatEl.innerHTML = '';
    _state.roundLayers = [];

    showLoading();
    const roundData = await loadRoundData(roundIndex);
    hideLoading();

    if (!_gameRunning) return;

    await showCutin('開廷！', 'COURT IN SESSION', CHARS.judge.color);
    await addMessage('judge', `${roundData.theme}事件——本日の公判を開始する。検察側、冒頭陳述を行え。`);
    await addMessage('prosecution', roundData.prosecution_opening);
    await addMessage('judge', '被告AI、冒頭陳述を許可する。自らの主張を述べよ。');
    await addMessage('defendant', roundData.defendant_initial);
    _state.roundLayers.push(summarize(roundData.defendant_initial));
    _state.totalLayers++;
    await addMessage('judge', '弁護側、証拠を提示する機会を与える。');

    for (let t = 0; t < roundData.turns.length; t++) {
      if (!_gameRunning) return;
      const turnData = roundData.turns[t];

      await showCutin('異議あり！', 'OBJECTION!', CHARS.prosecution.color);
      await addMessage('prosecution', turnData.prosecution);

      const result = await showDefenseUI(turnData);
      if (!_gameRunning) return;

      await showCutin('証拠を見ろ！', 'TAKE  THAT!', CHARS.defense.color);
      await addMessage('defense', `証拠を提示します——「${result.choice.label}」。${result.freeText ? result.freeText : ''}`);
      _state.totalDefenseChars += result.freeText.length;
      _state.totalLayers++;

      await addMessage('judge', '証人、この証拠についての証言をせよ。');
      await addMessage('defendant', result.choice.testimony);
      _state.roundLayers.push(summarize(result.choice.testimony));
    }

    if (!_gameRunning) return;

    await showCutin('閉廷！', 'COURT ADJOURNED', CHARS.judge.color);
    await addMessage('judge', '本公判の審理を終了する。双方、よく戦った。');

    await showReveal(roundData, roundIndex);
    _state.completedRounds++;
  }

  function summarize(text) {
    return text.length > 60 ? text.substring(0, 58) + '…' : text;
  }

  // === Rank computation ===
  function computeRank() {
    const c = _state.totalDefenseChars;
    if (c >= 100) return { rank: 'S', title: 'ハルシネーション・マスター' };
    if (c >= 30)  return { rank: 'A', title: '嘘の弁護士' };
    if (c >= 1)   return { rank: 'B', title: '駆け出し弁護人' };
    return              { rank: 'C', title: '正直者' };
  }

  // === Final result ===
  async function showFinalResult() {
    stopTimer();

    const rankInfo = computeRank();
    const profileKey = 'ai-experience-profile';
    let profile = ErrorHandler.safeGet(profileKey, { rank: 0, totalPt: 0, gamesCleared: 0, clearedGames: [], achievements: [] });

    window.startGame = () => Trial.restart();

    await delay(300);

    ResultCard.show({
      gameName: '⚖️ ハルシネーション裁判',
      currentLevel: profile.rank || 0,
      gamesCleared: profile.gamesCleared || 0,
      details: [
        { label: '弁護ラウンド',      value: `${_state.completedRounds} ラウンド` },
        { label: '積み重ねた嘘の層',   value: `${_state.totalLayers} 層` },
        { label: '弁護文字数',         value: `${_state.totalDefenseChars} 文字` },
        { label: 'ランク',             value: `${rankInfo.rank} — ${rankInfo.title}` },
      ],
    });
  }

  // === Main game loop ===
  async function runGame() {
    for (let r = 0; r < _state.totalRounds; r++) {
      if (!_gameRunning) return;
      await runRound(r);
    }
    if (_gameRunning) {
      _gameRunning = false;
      await showFinalResult();
    }
  }

  // === Public API ===
  return {
    init(options = {}) {
      _exhibitionMode = options.exhibitionMode || false;
      _fallbackMode = options.fallbackMode || 'fixed';
      _selectedIndices = selectRoundIndices(_fallbackMode);
      _gameRunning = true;
      _state = {
        totalRounds: 2,
        completedRounds: 0,
        totalLayers: 0,
        totalDefenseChars: 0,
        roundLayers: [],
      };

      buildUI();

      if (_exhibitionMode) {
        startTimer(8 * 60);
      }

      runGame();
    },

    destroy() {
      _gameRunning = false;
      stopTimer();
      const container = document.getElementById('screen-trial');
      if (container) container.innerHTML = '';
      _chatEl = null;
      _inputEl = null;
      _state = null;
    },

    restart() {
      this.destroy();
      this.init({ exhibitionMode: _exhibitionMode, fallbackMode: _fallbackMode });
    },
  };
})();

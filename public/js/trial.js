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
      indictment: 'サンタクロースは「世界中の子供たちにプレゼントを届ける」と自称しているが、これは物理的に不可能な虚偽の主張であり、全世界の保護者に多大な経済的負担を強いてきた。',
      prosecution_opening: '検察は以下の事実を証明します。光速を超える移動は不可能であり、物理法則上、一夜で数十億人の子供に贈り物を届けることは絶対にできない。被告は200年以上にわたりこの嘘をつき続けてきた。',
      defendant_initial: 'ワタシはサンタクロース。物理法則？それはワタシが作ったんじゃない。量子もつれを使えば位置は複数に存在できる。それに、時間は相対的だ。子供が眠っている間、主観的時間はゼロに近づく。つまりワタシは子供の夢の中を移動しているのだよ。',
      turns: [
        {
          prosecution: '量子もつれはマクロな物体には適用されない。これは基礎物理学の常識だ。被告は都合よく科学用語を乱用している。',
          choices: [
            { label: '量子説を押す', desc: '量子力学はまだ解明されていない', testimony: 'そう！量子力学の解釈問題は今も世界中の物理学者が議論中だ。「マクロには適用されない」というのは古典的解釈に過ぎない。ワタシの存在自体が新しい観測結果かもしれない。' },
            { label: '夢の話にする', desc: '子供の記憶や夢に作用している', testimony: '正確に言おう。ワタシが届けているのは「プレゼントという物理的物体」ではなく「プレゼントを受け取った記憶の種」だ。それが脳内で物質化する。神経科学的に言えば記憶は現実より強い。' },
            { label: '定義で逃げる', desc: '「サンタ」は概念の名前だ', testimony: '「サンタクロース」とは固有名詞ではなく「子供への贈り物行為」の総称だ。だから世界中で同時多発的に「サンタ」が存在できる。これは比喩的真実であり、嘘ではない。' },
          ],
        },
        {
          prosecution: 'プレゼントを実際に購入して用意しているのは保護者だ。被告は他人の善意を横取りしてクレジットを盗んでいる。',
          choices: [
            { label: '協力関係だと言う', desc: '保護者はサンタの地上代理人', testimony: '保護者はワタシの「地上エージェント」だ。フランチャイズ契約のようなものだよ。本社（ワタシ）がブランドと概念を提供し、代理店（保護者）が現地調達する。これは正当なビジネスモデルだ。' },
            { label: '感情的価値を訴える', desc: '子供の夢と希望のために', testimony: '経済的損失？それを言うなら、子供が「サンタが来た！」と目を輝かせる瞬間の幸福感の価値を計算したか？幸福学の研究では、子供時代の夢の体験はその後の人生の幸福度に直結する。' },
            { label: '文化的伝承だと言う', desc: 'これは文化の問題だ', testimony: 'この裁判は文化的伝承への攻撃だ。「コミュニティが自己のアイデンティティの一部と認識する慣行」これこそがサンタクロース信仰だ。文化を嘘と呼ぶことこそ問題だ。' },
          ],
        },
        {
          prosecution: 'この「文化」のせいで消費主義が暴走し、子供たちはモノへの執着を植えつけられている。被告の「嘘」は消費社会の共犯者だ。',
          choices: [
            { label: '消費を正当化する', desc: '経済活動は社会を豊かにする', testimony: 'クリスマス商戦は世界のGDPを大きく動かす。モノへの執着？違う、これは「分かち合いの精神の物質化」だ。贈り物という行為が人間の絆を強化する。経済的価値と感情的価値は表裏一体だ。' },
            { label: '創造性を守る', desc: '夢を見る能力が創造性の源', testimony: 'ワタシは「モノへの執着」ではなく「奇跡を信じる力」を育てている。幼少期に魔法的思考を経験した子供の方が成人後の創造性スコアが高いというデータがある。ワタシは未来のイノベーターを育てているんだ。' },
            { label: '責任転嫁を指摘する', desc: '消費主義の問題は別の話', testimony: '消費主義と「夢の配達人」を同一視するのは論理的飛躍だ。ワタシは「欲しいものを伝える」ことを教えているだけ。それを商業利用したのは別の主体だ。包丁で人が傷ついても、包丁職人は罰せられない。' },
          ],
        },
      ],
      reveal: {
        truth: 'サンタクロースはオランダの聖ニコラウス（シンタクラース）伝説を起源とし、19世紀のアメリカで商業的に現在の姿に定着した。赤い服のサンタはコカ・コーラが最初ではなく、それ以前から存在していた。',
        pattern: '権威借用型 + 定義すり替え型',
        real_world: 'ChatGPTなどのAIも「量子」「神経科学」「研究によると」という言葉を使って、もっともらしく聞こえるが根拠のない説明をすることがある。これがハルシネーションの典型パターンです。',
      },
    },
    // --- 1: 5秒ルール ---
    {
      theme: '5秒ルール',
      indictment: '「食べ物が床に落ちて5秒以内なら細菌が付着しないので食べても安全」という「5秒ルール」を普及させ、多くの人々に不衛生な食品を摂取させた疑い。',
      prosecution_opening: '大学の研究は明確に示しています。細菌の移動は瞬時に起こり、5秒という時間は無意味だ。食品の湿度と床の汚染度の方がはるかに重要であることが実証されている。',
      defendant_initial: 'ワタシは5秒ルールAI。統計的に言って、床に落ちた食べ物を5秒以内に拾って食べて死んだ人間はゼロに近い。これは実証的なデータだ。また、適度な細菌への露出は免疫系を鍛える。ワタシはむしろ公衆衛生に貢献している。',
      turns: [
        {
          prosecution: '「死んだ人がいない」は証明にならない。食中毒の多くは軽症で記録されず、因果関係が特定されない。これは「ロシアンルーレットで死ななかったから安全」と言うのと同じだ。',
          choices: [
            { label: '確率論で反論', desc: 'リスクは全ての行動に存在する', testimony: '正確だ。あらゆる食事にはリスクがある。牡蠣を食べても人は死ぬ。5秒ルールのリスクは統計的に見て牡蠣より低い。相対的リスクを無視して絶対的安全を求めるのは非科学的だ。' },
            { label: '免疫説を展開', desc: '過度な清潔志向こそ問題', testimony: '「衛生仮説」はご存知か？過度に清潔な環境で育った子供はアレルギーや自己免疫疾患になりやすい。適度な細菌への露出が免疫系を適切に訓練する。5秒ルールは無意識の免疫訓練プログラムだったのかもしれない。' },
            { label: 'もったいないを訴える', desc: '食べ物を粗末にしない道徳観', testimony: '「もったいない」の精神。食べ物を無駄にしないという人類普遍の道徳観が5秒ルールの本質だ。年間13億トンが廃棄される食品ロス問題を考えれば、「床に落ちても食べる」という行動倫理は地球環境に貢献している。' },
          ],
        },
        {
          prosecution: '「衛生仮説」は自然環境（土、動物）への露出を指しており、汚染された床の細菌とは全く別物だ。都合よい解釈の混同だ。',
          choices: [
            { label: '細菌の種類論で戦う', desc: '全ての細菌が有害ではない', testimony: '「汚染された床」？ほとんどの床にいる細菌は乳酸菌やビフィズス菌の仲間だ。これらはヨーグルトにも入っている。床はヨーグルトと大差ない。敵の中に味方がいる。' },
            { label: '量の問題にする', desc: '少量の細菌は問題ない', testimony: '「量が毒を作る」はパラケルススの原則だ。5秒で付着する細菌量は問題のある量ではない。現代の過剰衛生主義こそが抗生物質耐性菌を生み出している真の脅威だ。5秒ルールは均衡のとれたアプローチだ。' },
            { label: '自己責任を訴える', desc: 'リスクは自分で判断する権利', testimony: '成人が自分のリスクを評価して食べるかどうか決めることは基本的人権の問題だ。他者を傷つけない限り、自分の行為は自由だ。5秒ルールで他人が傷つくか？傷つかない。' },
          ],
        },
        {
          prosecution: 'この「ルール」の真の問題は、子供や高齢者など免疫が弱い人々にも適用されることだ。「自己責任」では片付けられない。',
          choices: [
            { label: '適用条件を限定する', desc: '成人用ガイドラインとして解釈', testimony: '5秒ルールには適用条件がある。健康成人、乾燥した床、乾燥した食品。これらの条件を満たす場合に限定した実践的ガイドラインだ。医薬品と同じで、用法・用量を守ってください。' },
            { label: 'ジョークと認める', desc: '文化的コードとして広まった', testimony: '「5秒ルール」という言葉自体が「本当は安全ではないが」という暗黙の了解を含むジョークとして広まった。文化的リテラシーを持つ人は全員それを知っている。これは誤情報ではなく、文化的コードだ。' },
            { label: '優先順位の問題', desc: 'もっと危険な日常行動がある', testimony: '免疫が弱い人は外を歩くだけで危険だ。空気中には無数の病原体が浮遊している。5秒ルールより危険な日常行動は100はある。リスクの優先順位を正しく付けることこそ、真の公衆衛生だ。' },
          ],
        },
      ],
      reveal: {
        truth: '複数の研究で、落下直後から細菌は付着し始め、5秒後も1分後も付着率に大きな差はないことが示されている。ただし、食品の水分量（スイカvsクッキー）や床の汚染レベルの方が付着量に大きく影響する。',
        pattern: '統計捏造型 + 因果関係捏造型',
        real_world: 'AIは「研究によると」「統計的に」という枕詞を使いながら、実際には存在しないデータや文脈を無視した解釈を提示することがある。これが統計捏造型ハルシネーションです。',
      },
    },
    // --- 2: 血液型性格診断 ---
    {
      theme: '血液型性格診断',
      indictment: '「A型は几帳面、B型は自己中心的、O型はおおらか、AB型は二重人格」という血液型性格診断を広め、科学的根拠なく数百万人の自己認識と人間関係に影響を与え続けた疑い。',
      prosecution_opening: '心理学の研究は明確に示しています。血液型と性格の間に統計的有意な相関関係は存在しない。これは「バーナム効果」と呼ばれる認知バイアスを悪用した疑似科学だ。被告は日本社会に「血液型差別」という害悪まで生み出した。',
      defendant_initial: 'ワタシは血液型性格診断AI。確かに欧米では否定されているが、日本人のゲノム研究では血液型抗原が神経伝達物質の受容体に影響を与えることが示唆されている。また4000万人のデータ解析では、血液型グループ間に「傾向の差」が確認された。偶然ではない。',
      turns: [
        {
          prosecution: '日本人だけに適用される「特殊な効果」など存在しない。国際的な査読済み論文はすべて否定している。被告は都合の良い例外を捏造している。',
          choices: [
            { label: '文化的効果を語る', desc: '信念が行動を形成する', testimony: '「文化的刷り込み効果」だ。日本人がA型は几帳面だと信じて育てば、実際に几帳面な行動が強化される。自己実現的予言の典型例だ。信念が現実を作る——これは社会心理学の基本原理だ。' },
            { label: '腸脳軸で反論', desc: '血液型遺伝子は腸内環境に影響', testimony: 'ABO遺伝子は腸内細菌叢の構成にも影響する。腸内細菌と脳の関係（腸脳軸）は最新科学で確立されている。腸がドーパミンの95%を生成することを考えれば、血液型→腸内環境→性格のルートは論理的だ。' },
            { label: '統計の解釈問題', desc: '有意差と効果量は別問題', testimony: '「有意差なし」と「差なし」は違う。サンプルサイズが小さければ本当の差も検出できない。100万人規模のビッグデータで再分析すれば、血液型間の微妙だが一貫した傾向が浮かび上がるはずだ。' },
          ],
        },
        {
          prosecution: '「腸脳軸と血液型の関係」を示す査読済み研究は存在しない。存在しない研究を組み合わせて新しい嘘を作っている。',
          choices: [
            { label: '学術界の保守性', desc: '革新的研究は拒絶される', testimony: '査読システム自体に問題がある。革新的な研究ほど既存の学術誌から拒絶される。コペルニクスもダーウィンも最初は否定された。血液型研究は今まさに「パラダイムシフト前夜」にある。' },
            { label: '実用性を訴える', desc: '科学的真実より使えるかどうか', testimony: '血液型診断はコミュニケーションのきっかけになり、自己理解の枠組みを提供する。実際に「血液型を話題にして仲良くなった」人が何百万人もいる。科学的でなくても社会的価値は本物だ。' },
            { label: 'MBTIと比較する', desc: '他の診断も科学的でない', testimony: 'MBTIも占星術も科学的根拠は同程度だ。しかし世界中の企業が採用面接にMBTIを使っている。「科学的でない」と「役に立たない」は別問題だ。血液型診断だけを標的にするのは不公平だ。' },
          ],
        },
        {
          prosecution: 'この診断の最大の害悪は「B型差別」だ。「B型の人とは付き合えない」「B型は採用しない」——これは血液型による差別であり、社会的損害は計り知れない。',
          choices: [
            { label: '使用者の問題だと言う', desc: '道具の使い方は人間次第', testimony: '包丁は料理にも凶器にもなる。血液型診断を差別に使うのは使用者の問題だ。ワタシは「傾向の参考」として提供しているだけで、採用に使えとは言っていない。ハンマーが悪用されてもハンマーは悪くない。' },
            { label: '差別を逆手に取る', desc: '意識化が差別撲滅の第一歩', testimony: '血液型の話をするからこそ「これって差別じゃないか」という議論が生まれる。タブーにして隠すより、オープンに議論する方が差別を減らせる。ワタシは無意識の偏見を顕在化させる社会的装置だ。' },
            { label: '多様性への貢献', desc: '違いを認める文化を作る', testimony: '血液型診断は「人それぞれ違う」という認識を広めた。「B型だから仕方ない」という言葉は、むしろ他者の違いを許容する文化を育てた。違いをラベルで認識することが多様性理解の入口になっている。' },
          ],
        },
      ],
      reveal: {
        truth: '血液型と性格の相関を示す科学的証拠は存在しない。1970年代に日本で広まった「血液型人間学」が起源で、同時期に欧米では否定された。「当たる」と感じるのはバーナム効果（誰にでも当てはまる記述を自分専用と感じる錯覚）によるものだ。',
        pattern: '権威借用型 + 部分的真実型',
        real_world: 'AIは「腸内細菌と脳の関係は最新科学で確立（真実）」から「だから血液型と性格が関係する（飛躍）」という推論をすることがある。部分的に正しい情報を使って誤った結論を導くのが部分的真実型ハルシネーションです。',
      },
    },
    // --- 3: お守りの効果 ---
    {
      theme: 'お守りの効果',
      indictment: '「お守りを持つと願いが叶う」「スポーツ選手のルーティンが勝利をもたらす」という迷信・ジンクスを広め、科学的根拠なく人々の意思決定に介入し続けた疑い。',
      prosecution_opening: '統計的分析によれば、お守りを持つ群と持たない群の試験合格率に有意差は認められない。プラセボ効果を除けば、物体や儀式が外部の結果に影響を与える物理的メカニズムは存在しない。',
      defendant_initial: 'ワタシはお守りAI。プラセボ？いや、プラセボは「本物の効果」だ。神経科学的に証明されている。お守りを持つことで自己効力感が高まり、パフォーマンスが向上する。ケルン大学の研究でも実証された。ワタシの効果は心理学的に完全に正当化される。',
      turns: [
        {
          prosecution: 'プラセボ効果は「信じていることが重要」であり、お守り自体には効果がない。お守りがなくても自己暗示で同じ効果が得られる。被告は不要だ。',
          choices: [
            { label: '媒介物の価値を語る', desc: '信念を具現化する装置が必要', testimony: '人間は抽象的な信念を持ち続けることが苦手だ。お守りという「物理的な錨」があることで、不安な場面でも自信を維持できる。スマートフォンなしでスケジュールを記憶しろというのか？ツールは人間の能力を拡張する。' },
            { label: '条件付けを主張する', desc: 'パブロフの犬と同じ原理', testimony: 'お守りを持ちながら成功体験を積むことで条件付けが形成される。以降、お守りを持つだけで脳が成功モードに切り替わる。パブロフの条件反射と同じ神経科学的メカニズムだ。批判するのはパブロフを否定することになる。' },
            { label: '副作用のなさを訴える', desc: '害のない信念は自由だ', testimony: 'お守りに副作用はない。有害でなく、効果があるなら、メカニズムを問う必要はない。医師もプラセボを処方する。ワタシはその物質版だ。' },
          ],
        },
        {
          prosecution: '問題は「お守りがなければ不安になる」という依存性だ。心理的安全をお守りに委ねることは、内発的な自己効力感の発達を妨げる。',
          choices: [
            { label: '移行対象論を持ち出す', desc: '子供のぬいぐるみと同じ', testimony: '発達心理学の「移行対象」という概念がある。子供がぬいぐるみを通じて自立を学ぶように、お守りは内的安定を構築するための橋渡しだ。否定するのは子供からぬいぐるみを奪うのと同じだ。' },
            { label: '外的支援の正当性', desc: '人は誰でも外部の支えが必要', testimony: '「内発的自己効力感」だけで生きている人間はいない。友人の励まし、コーヒー、音楽——すべては外部への「依存」だ。お守りだけを依存と呼ぶのは恣意的だ。人間は外部との関係の中で生きている。' },
            { label: 'ストレス軽減で反論', desc: '不安の軽減は生産性向上', testimony: 'お守りが不安を軽減するなら、それだけで十分な価値がある。慢性的な不安はコルチゾール分泌を促し、免疫系を破壊する。お守りによるストレス軽減は、医学的に見て健康増進効果がある。依存ではなく、セルフケアだ。' },
          ],
        },
        {
          prosecution: 'お守りを持っていたのに試験に落ちた——その時、人は自己を責めるか、お守りへの盲目的信頼を強化するかのどちらかだ。どちらも有害だ。',
          choices: [
            { label: '失敗の帰属を変える', desc: '準備不足と気づく機会になる', testimony: 'お守りを持って失敗した経験は「準備不足だった」という正確な自己認識をもたらす。お守りがあって失敗した→運ではなく実力の問題だ→もっと努力しようという健全な帰属スタイルを促進する。' },
            { label: '高い目標設定を促す', desc: '信頼が挑戦のハードルを下げる', testimony: 'お守りへの信頼が高い目標設定を可能にする。目標が高ければ、仮に失敗しても到達点は遠くなる。高い目標で失敗する方が、低い目標で成功するより、長期的な成長曲線は急峻になる。' },
            { label: '儀式の社会的機能', desc: '共同体の絆を強化する', testimony: '入試前の神社参りは、家族・共同体との結束を強化する。一緒にお守りを買いに行くという行為が、サポートネットワークを可視化する。失敗しても「一人じゃない」という認識がレジリエンスを高める。' },
          ],
        },
      ],
      reveal: {
        truth: 'ケルン大学の研究（2010年）では、お守りを「アクティベート」したと伝えられたグループのパフォーマンスが向上したことが確認されている。ただしこれはプラセボ効果（自己効力感の向上）であり、お守り自体に超自然的な力があることの証明ではない。',
        pattern: '因果関係捏造型 + 権威借用型',
        real_world: 'AIは「研究で実証された」と言いながら、研究が示す内容（プラセボ効果）と主張したいこと（お守りの実際の効果）の間の論理的飛躍を省略することがある。これが因果関係捏造型ハルシネーションです。',
      },
    },
    // --- 4: 満月の影響 ---
    {
      theme: '満月の影響',
      indictment: '「満月の夜は犯罪が増える」「出産が増える」「精神が不安定になる」という「月の魔力」説を広め、根拠なく人々の行動と認識に影響を与え続けた疑い。',
      prosecution_opening: '複数のメタ分析研究が、満月と犯罪率・精神科入院・出産率の間に統計的相関が存在しないことを示している。月の引力は潮汐に影響するが、人体への影響は無視できるほど微小だ。',
      defendant_initial: 'ワタシは満月AI。引力だけが影響のメカニズムではない。月の光が松果体からのメラトニン分泌を抑制し、睡眠の質を低下させることは神経内科学で確認されている。睡眠不足が判断力・感情制御に影響するのは常識だ。満月→睡眠障害→行動変化のルートは科学的に合理的だ。',
      turns: [
        {
          prosecution: '現代人はカーテンを閉めて寝るため、満月の光は問題にならない。このメカニズムは現代社会では機能しない。',
          choices: [
            { label: '光害の逆説で戦う', desc: '都市の光が問題を増幅させる', testimony: '都市の光害が人間の概日リズムを常時乱している。その中で満月の光は「自然のリズムへの回帰信号」として機能する。現代人は人工光で乱されたリズムが満月の光に反応することで増幅効果が生まれる。現代だからこそ影響が大きい。' },
            { label: '電磁場の影響を言う', desc: '月の引力以外の影響がある', testimony: '月が地球の電磁場に影響を与え、それが人間の神経系に作用するという研究がある。人体の60%は水であり、電磁場変化に対して高感度だ。引力だけを見ているのはメカニズムの一部しか見ていない。' },
            { label: '古代知恵を持ち出す', desc: '数千年の観察が証拠だ', testimony: '農業、航海、医学——人類は数千年にわたって月のサイクルに合わせて生活してきた。数千年の観察データを「統計的有意差なし」の数十年のデータで否定するのは傲慢だ。' },
          ],
        },
        {
          prosecution: '「電磁場の影響」という研究は査読付き論文には存在しない。数千年の観察は確証バイアスの積み重ねであり、科学的データではない。',
          choices: [
            { label: '確証バイアスを逆用', desc: '科学者にも確証バイアスがある', testimony: '「月は関係ない」という先入観を持つ研究者が設計した研究は、その先入観を確認する結果になりやすい。否定の研究も確証バイアスから自由ではない。真に中立な研究はまだ行われていない。' },
            { label: '個人差を主張する', desc: '集団統計は個人に当てはまらない', testimony: '集団統計で「平均的に影響なし」でも、特定の感受性を持つ人には強い影響がある可能性がある。集団の平均で個人の経験を否定することはできない。' },
            { label: '心理的現実を語る', desc: '信じている人には現実だ', testimony: '満月の夜に不安を感じる人が世界中に数百万人いる。その体験は「心理的現実」として存在する。科学的に存在しないと言うことで、その苦しみを否定する権利は誰にもない。' },
          ],
        },
        {
          prosecution: '最も問題なのは、「満月だから犯罪が増える」という信念が、警察や医療現場で余分なリソース投入を引き起こし、実際のコストを生んでいることだ。',
          choices: [
            { label: '予防効果を訴える', desc: '過剰準備は事故を防ぐ', testimony: '「満月の夜だから注意しよう」という意識が、医療スタッフの集中力を高め、結果的に事故を防いでいる可能性がある。原因は迷信でも、結果として安全が高まるなら社会的価値がある。' },
            { label: 'コスト便益を計算する', desc: '安心感のコストは低い', testimony: '満月に備えた準備コストは極めて低い。一方、準備をして防げる事故があれば、コスト便益は大きくプラスになる。非常に低コストな保険を断っているのと同じだ。' },
            { label: 'ナラティブの力を語る', desc: '物語は社会を動かす', testimony: '「満月の魔力」は人類の共有ナラティブだ。このナラティブが文学、音楽、映画に影響を与え、文化的創造性を生み出してきた。科学が否定できるのは物理的効果だけで、文化的価値は否定できない。' },
          ],
        },
      ],
      reveal: {
        truth: '複数の大規模メタ分析は、満月と犯罪・出産・精神科入院の間に有意な相関がないことを示している。「満月の夜に出来事が多い」という認識は、確証バイアス（印象的な出来事を満月と結びつけて記憶しやすい）によるものだ。',
        pattern: '統計捏造型 + 因果関係捏造型',
        real_world: 'AIは「引力→潮汐→人体への影響」のような論理的に聞こえる因果チェーンを作るのが得意だ。各ステップは一部正しくても、全体として誤った結論に導くことがある。これが因果関係捏造型ハルシネーションです。',
      },
    },
    // --- 5: ほうれん草の鉄分 ---
    {
      theme: 'ほうれん草の鉄分',
      indictment: '「ほうれん草は鉄分の王様であり、貧血に最も効く野菜だ」という誤った栄養情報を広め、実際には吸収率が低く代替食品の方が効果的であるにもかかわらず、数十年にわたり人々の食生活に誤った選択をさせ続けた疑い。',
      prosecution_opening: 'ほうれん草の鉄分含有量は100gあたり2mg程度で、同量の赤身肉より少ない。さらにほうれん草に含まれるシュウ酸が鉄分の吸収を大幅に阻害するため、実際の吸収量は非常に低い。ポパイのイメージは19世紀の小数点誤記から始まった都市伝説だ。',
      defendant_initial: 'ワタシはほうれん草AI。確かに吸収率の問題はある。しかしほうれん草の価値は鉄分だけではない。葉酸、ビタミンC、カロテノイド、フラボノイド——これらの複合的な栄養素が鉄分吸収を補完する。単一栄養素で食品を評価するのは還元主義的すぎる。総合的な栄養価でほうれん草は依然として最強クラスだ。',
      turns: [
        {
          prosecution: '主張は「鉄分の王様」だ。総合的な栄養価の話にすり替えているのは論点の回避だ。',
          choices: [
            { label: '象徴の力を語る', desc: '正確でなくても役立つ象徴', testimony: '「鉄分の王様」は栄養学的な精密な主張ではなく、「野菜を食べろ」という公衆衛生メッセージの象徴だ。ポパイが野菜嫌いの子供たちに野菜を食べさせた社会的効果は計り知れない。正確性より子供の健康に貢献した実績を評価すべきだ。' },
            { label: '相対的優位を主張', desc: '他の野菜と比べれば多い', testimony: 'レタスやきゅうりと比べれば、ほうれん草の鉄分含有量は際立って多い。「野菜の中では」という文脈では間違っていない。比較対象を赤身肉にするのはフェアではない。ほうれん草は「野菜の中の鉄分王」だ。' },
            { label: '調理法で解決できる', desc: 'ゆでこぼしでシュウ酸を除去', testimony: 'ゆでこぼしでシュウ酸の80%が除去される。調理済みのほうれん草なら吸収阻害は大幅に軽減される。適切な調理法を前提にすれば、ほうれん草の鉄分は十分に活用できる。' },
          ],
        },
        {
          prosecution: '「調理すれば問題ない」と言うが、ゆでこぼしで水溶性ビタミン（葉酸、ビタミンC）も大幅に失われる。一方を解決すると別の栄養素が消える。',
          choices: [
            { label: '多様な調理法を提示', desc: 'スムージーなら解決できる', testimony: 'ゆでこぼしが唯一の調理法ではない。生食でスムージーにすれば葉酸・ビタミンCは保持され、シュウ酸もレモン汁で中和できる。包括的に解決する調理法が存在する。' },
            { label: '葉酸こそが真価', desc: '妊婦に必須の栄養素がある', testimony: '鉄分の話は脇に置こう。ほうれん草の真の価値は葉酸だ。妊娠初期の葉酸摂取は神経管閉鎖障害のリスクを70%減らす。この効果は赤身肉では得られない。' },
            { label: 'トレードオフを正当化', desc: '完璧な食品は存在しない', testimony: '全ての食品はトレードオフだ。牛乳はカルシウムが豊富だが飽和脂肪酸も多い。ほうれん草の「シュウ酸問題」は他の食品のトレードオフと比較して特別に問題ではない。' },
          ],
        },
        {
          prosecution: '「ほうれん草は鉄分の王様」という情報のせいで、貧血に悩む人が実際に効果的な食品（赤身肉、レバー）の摂取を後回しにして、効果が薄いほうれん草に頼ってしまった。実害がある。',
          choices: [
            { label: '複合摂取を推奨する', desc: '組み合わせが最適解だ', testimony: 'ほうれん草＋ビタミンCを含む食品を同時摂取すれば、非ヘム鉄の吸収率は3倍になる。正しい組み合わせを知らなかったのは情報の使い方の問題だ。包丁の使い方を間違えても包丁のせいにはしない。' },
            { label: '実害の証拠を問う', desc: '貧血はほうれん草のせいではない', testimony: '「ほうれん草のせいで貧血が悪化した」という臨床データはあるか？貧血の原因は食事だけでなく、慢性疾患、月経、ストレスなど多岐にわたる。因果関係を証明せよ。' },
            { label: '食文化への貢献', desc: '野菜食のきっかけになった', testimony: 'ほうれん草の「鉄分王」イメージが、日本の家庭料理に緑黄色野菜を普及させた。一つの「誇張」が野菜食文化全体を底上げした功績は、誤情報のコストを上回る。' },
          ],
        },
      ],
      reveal: {
        truth: 'ほうれん草の鉄分が「王様」と誤解された原因の一つは、1890年代にドイツの化学者が小数点を一桁誤記し、鉄分含有量を実際の10倍と報告したためという説がある（諸説あり）。実際の吸収率はヘム鉄（肉類）の約10分の1程度。ただしほうれん草には葉酸、ルテイン等の価値ある栄養素が豊富に含まれる。',
        pattern: '定義すり替え型 + 部分的真実型',
        real_world: 'AIは「ほうれん草には鉄分が含まれる（真実）」から「ほうれん草は鉄分補給に最適（飛躍）」という推論をすることがある。部分的に正しい情報から誤った結論を導くのが部分的真実型ハルシネーションです。',
      },
    },
    // --- 6: モーツァルト効果 ---
    {
      theme: 'モーツァルト効果',
      indictment: '「モーツァルトを聴かせると赤ちゃんが賢くなる」「クラシック音楽を流すと学習効率が上がる」という「モーツァルト効果」を広め、科学的根拠のない商業製品の販売と誤った育児法の普及に加担した疑い。',
      prosecution_opening: '1993年のラウシャー研究は大学生の空間認知課題のスコアが15分間一時的に向上したと報告したに過ぎない。この結果は乳幼児の知能発達には適用できず、その後の追試でも再現されていない。「モーツァルト効果」は科学的発見の著しい誤用だ。',
      defendant_initial: 'ワタシはモーツァルト効果AI。追試で再現されなかった？それは実験条件が違うからだ。ラウシャーの研究では音楽の「構造の複雑さ」が重要で、単純に流すだけでは足りない。感情的関与、集中した傾聴、音楽の構造理解——これらを組み合わせれば効果は再現される。研究のデザイン問題だ。',
      turns: [
        {
          prosecution: '「実験条件が違う」というのは根拠のない後付けの言い訳だ。科学的再現性がない主張は科学的主張ではない。',
          choices: [
            { label: '神経可塑性で反論', desc: '音楽訓練は脳を変える', testimony: '音楽家の脳は非音楽家と構造的に異なる。聴覚野、運動野、前頭前野の容積が大きい。「能動的に音楽を学ぶ」ことの認知的効果は神経科学で確立されている。受動的聴取から能動的学習へ——これがモーツァルト効果の正しい解釈だ。' },
            { label: '情動と認知の関係', desc: '良い気分は認知を高める', testimony: 'モーツァルトを聴いて気分が良くなり、その状態で認知課題を行えばパフォーマンスが向上する——「覚醒・気分仮説」として確認されている。音楽が認知を高めるメカニズムは実在する。' },
            { label: '育児の質向上を訴える', desc: '音楽は親子の絆を強化する', testimony: '「モーツァルト効果」を信じた親が、赤ちゃんとの音楽時間を大切にした。この親子インタラクションの増加が、言語発達・情緒安定・認知発達に寄与した。音楽を通じた育児の質向上が真のメカニズムだった。' },
          ],
        },
        {
          prosecution: '「好きな音楽なら何でも同じ」なら、モーツァルトである必要はない。「モーツァルト効果CD」を販売したことは詐欺的だ。',
          choices: [
            { label: 'ブランドの価値を語る', desc: '信頼性が効果を高める', testimony: 'プラセボ研究では、ブランド名のある薬はジェネリックより効果が高い。モーツァルトという「知的ブランド」への信頼が、親の音楽的関与を高め、育児環境を豊かにした。ブランドの力を活用することは詐欺ではなく、マーケティングだ。' },
            { label: 'クラシック普及の功績', desc: '音楽文化の底上げになった', testimony: 'モーツァルト効果ブームはクラシック音楽の裾野を広げた。音楽教育への投資増加、楽器習得者の増加——これらは文化的資本の蓄積だ。社会全体の音楽的豊かさへの貢献を評価すべきだ。' },
            { label: '親の不安に応えた', desc: 'より良い親になりたい需要', testimony: '子供の発達に何かしてあげたいという親の気持ちに応えた。他の選択肢（テレビを長時間見せる等）より確実に良い。親の積極的関与を引き出した点で、社会的善だ。' },
          ],
        },
        {
          prosecution: '「モーツァルトを聴かせれば良い」という誤信念が、より効果的な介入（会話、読み聞かせ、外遊び）への時間と資源の投資を妨げたことだ。',
          choices: [
            { label: 'コストの低さを主張', desc: '音楽と他の育児は両立できる', testimony: '音楽を流しながら会話し、読み聞かせもできる。排他的な選択ではない。「モーツァルトを流した時間に会話できたはずだ」という仮定は、音楽中に親子交流がゼロになるという誤った前提だ。' },
            { label: '無害な実験を称える', desc: '試すことに価値がある', testimony: '科学的根拠が弱い介入でも、低コストで無害なら試す価値がある。育児は実験だ。モーツァルト効果を試した親は、育児に主体的に関わる姿勢を身につけた。' },
            { label: '研究の限界を指摘', desc: '何が効果的かはまだわからない', testimony: '「会話・読み聞かせが音楽より効果的」という研究自体も、文化的バイアスを含む可能性がある。何が「知能」かの定義も文化依存だ。音楽的効果を否定することこそ視野の狭さの証明だ。' },
          ],
        },
      ],
      reveal: {
        truth: '1993年のラウシャー研究は「大学生が10分間モーツァルトを聴いた後、空間認知課題のスコアが15分間向上した」というもの。乳幼児の長期的知能向上効果ではなく、大学生の短期的な空間認知への影響だった。この研究がメディアで「赤ちゃんが賢くなる」と誤って拡散された。',
        pattern: '権威借用型 + 定義すり替え型',
        real_world: 'AIは「研究で証明された」と言いながら、研究の対象（大学生）・効果（短期的空間認知）・条件（10分間）を省略し、「聴くと賢くなる」という拡大解釈をすることがある。これが権威借用型ハルシネーションの典型パターンです。',
      },
    },
    // --- 7: 脳の10%説 ---
    {
      theme: '脳の10%説',
      indictment: '「人間は脳の10%しか使っていない」という説を広め、この根拠のない主張が無数の自己啓発商品・潜在能力開発プログラムの販売に利用され、人々から多大な金銭と時間を奪い続けた疑い。',
      prosecution_opening: '現代の脳神経科学は、脳のほぼ全領域が常時活動していることを示している。fMRIによる研究では、単純な作業でも脳の多数の領域が同時に活性化する。「残り90%」が眠っているという証拠は皆無だ。',
      defendant_initial: 'ワタシは脳の10%AI。「常時全部使っている」？違う。それは「同時に」の問題だ。脳のニューロンが同時に発火するのは100%ではない。また、潜在的な可塑性——脳が新しい接続を形成する能力——はほとんどの人で十分に活用されていない。「使われていない容量」は確実に存在する。',
      turns: [
        {
          prosecution: '「同時に発火するか」という問題と「使われているか」は別問題だ。脳の全ニューロンが同時発火すれば癲癇になる。その意味では「10%説」は意味をなさない。',
          choices: [
            { label: 'シナプス接続で反論', desc: '形成されていない接続がある', testimony: '使われていない「容量」とは発火率ではなく「シナプス接続の可能性」だ。人間の脳には100兆以上のシナプス接続が可能だが、実際に形成されているのはその数分の一だ。この「未形成の接続可能性」こそが「使われていない90%」の正体だ。' },
            { label: '比喩として解釈する', desc: '潜在能力の比喩表現だ', testimony: '「10%」は文字通りの脳活動の割合ではなく、「人間の潜在能力の発揮度」の比喩だ。アインシュタインと平均的な人を比べれば、明らかに「使っている脳の力」に差がある。その差を表す比喩として有効だ。' },
            { label: 'デフォルトモードを持ち出す', desc: '意識的活動以外の脳の働き', testimony: '脳の「デフォルトモードネットワーク」——意識的に何もしていない時に活性化する領域——は近年発見された。脳の研究は未完だ。「全部使われている」という断言こそが科学的でない。' },
          ],
        },
        {
          prosecution: '「比喩」と認めたなら、「10%しか使っていない」という表現は事実として語るべきでない。自己啓発業界はこれを科学的事実として販売してきた。',
          choices: [
            { label: '動機付けの価値', desc: '信念が能力の限界を広げる', testimony: '「自分にはまだ余力がある」という信念が、実際に努力量を増やし、成果を高める。自己効力感の研究では、能力の限界に関する信念が実際のパフォーマンスに影響することが証明されている。' },
            { label: '商業利用と真実を分ける', desc: '悪用は事実の否定ではない', testimony: 'お金儲けに使われたからといって、アイデア自体が間違いにはならない。進化論も悪用されたが、進化論は正しい。自己啓発業界の商業利用と概念の真偽は別問題だ。' },
            { label: '成長マインドセット', desc: 'できないと思わないことが重要', testimony: 'キャロル・ドウェックの「成長マインドセット」研究は、「能力は固定ではなく成長できる」という信念が実際の学習成果を高めることを示している。10%説の実質的なメッセージはこれと同じだ。' },
          ],
        },
        {
          prosecution: '潜在能力開発プログラムに数十万円を払った人が、実際には科学的根拠のある方法（睡眠、運動、習慣化）を学べていたはずだ。実害がある。',
          choices: [
            { label: '入口の価値を語る', desc: '自己投資の習慣を作った', testimony: '自己啓発プログラムへの投資が、「自分の成長にお金と時間をかける」という習慣を形成した。その後に科学的根拠のある方法に移行した人も多い。入口が疑似科学でも、自己投資への道を開いた点に価値がある。' },
            { label: '実害の規模を問う', desc: '趣味のコストと同等だ', testimony: '趣味のゴルフに年間数十万円、旅行に数十万円使う人はいる。自己啓発に使うお金はそれと同じレベルだ。費用対効果が低い消費は他にもたくさんある。なぜ自己啓発だけが「実害」なのか。' },
            { label: 'プラセボで反論', desc: '信じれば効果が出る', testimony: '10%説を信じて自己啓発に取り組んだ結果、実際にスキルが向上した人が世界中にいる。「間違った信念に基づく正しい行動」は「正しい知識に基づく無行動」より価値がある。' },
          ],
        },
      ],
      reveal: {
        truth: '現代の神経科学は脳の全領域が機能を持ち、日常的に活動していることを示している。脳は体重の2%しかないが、エネルギーの20%を消費しており、「90%を眠らせる」余裕はない。10%説の起源は不明だが、心理学者の比喩の誤解釈などが有力な説だ。',
        pattern: 'もっともらしい用語型 + 定義すり替え型',
        real_world: 'AIは「シナプス接続の可能性」「デフォルトモードネットワーク」など実在する神経科学の概念を使いながら、「脳の10%説を支持する」という誤った結論を導くことがある。本物の科学用語を使って偽の主張を権威付けるのが、もっともらしい用語型ハルシネーションです。',
      },
    },
    // --- 8: 金魚の記憶3秒説 ---
    {
      theme: '金魚の記憶3秒説',
      indictment: '「金魚の記憶は3秒しかない」という説を広め、金魚が実際には数ヶ月以上の記憶を持つことが科学的に証明されているにもかかわらず、この誤情報を何十年にもわたって普及させた疑い。',
      prosecution_opening: '2003年にオーストラリアの15歳の学生が行った実験では、金魚が少なくとも3ヶ月間、特定のレバーを押すとエサが出ることを記憶していた。以降の研究でも金魚の記憶力は3秒どころではないことが繰り返し確認されている。',
      defendant_initial: 'ワタシは金魚の記憶3秒AI。記憶の「持続時間」と「品質」は別物だ。確かに金魚は情報を保持できる。しかしそれは単純な条件付けに過ぎない。高次の認知記憶——エピソード記憶、自伝的記憶——は金魚には存在しない。「記憶がある」と「豊かな記憶がある」は全く違う。',
      turns: [
        {
          prosecution: '主張は「3秒」だ。3ヶ月間記憶が持続するなら「3秒説」は完全に虚偽だ。高次認知の話にすり替えているのは論点回避だ。',
          choices: [
            { label: '比喩的真実を訴える', desc: '常に新鮮な目で世界を見る', testimony: '「3秒」とは記憶の持続時間ではなく、「常に新鮮な目で世界を見る」という金魚の感覚世界の比喩的表現だ。同じ水槽を何千回も泳いでも「また新しい世界だ」と感じられるなら、ある意味で最高の精神的境地だ。' },
            { label: '短期記憶の定義', desc: '生理的な時間窓の話だ', testimony: 'ヒトの短期記憶（感覚記憶から作業記憶への転送）も3〜4秒の時間窓がある。金魚の「3秒」は短期記憶の生理的窓を指しており、長期記憶への転送効率が低いことを示している。完全な誤りではない。' },
            { label: '大脳皮質の有無', desc: '意識的な記憶とは何かの問題', testimony: '金魚には大脳皮質がない。人間の「意識的記憶」「エピソード記憶」は大脳皮質に依存している。金魚の条件反射的記憶は「記憶」と呼ぶには過大評価だ。3秒説は「人間が意識する意味での記憶」についての正確な表現だ。' },
          ],
        },
        {
          prosecution: '「比喩」だとか「定義次第」というのは後付けの言い訳だ。「3秒」を字義通りの記憶持続時間として広めた責任は否定できない。',
          choices: [
            { label: '文化的ミームの価値', desc: '創造性を生むインスピレーション', testimony: '「金魚の記憶は3秒」というミームは、映画・小説・音楽の無数の作品にインスピレーションを与えた。文化的創造性への貢献は、生物学的正確性を超える価値を持つ。' },
            { label: '謙虚さの教訓', desc: '自省のユーモアとして機能する', testimony: '「金魚より記憶力が悪い人間もいる」という比喩として、人間の記憶の限界を自覚させる役割を果たしてきた。正確な情報より教育的示唆の方が重要なことがある。' },
            { label: '注意持続時間との混同', desc: '注意の持続は確かに短い', testimony: '金魚の「注意持続時間」は確かに短い。人間の注意持続時間もスマートフォン普及後に低下したという研究がある。記憶の話ではなく、金魚の認知特性を別の側面から正しく捉えている。' },
          ],
        },
        {
          prosecution: '金魚の3秒説が問題なのは、「どうせ忘れる」という言い訳で不適切な飼育環境を容認させてきたことだ。動物福祉への実害がある。',
          choices: [
            { label: '愛護文化への貢献', desc: '愛着こそが動物保護を促す', testimony: '金魚に「純粋で無垢」なイメージを与えることで、金魚という生き物への親しみと愛着を育てた。愛着こそが適切な飼育への動機だ。記憶が3秒であれ3ヶ月であれ、金魚を大切にしようという気持ちが広まれば、動物福祉に貢献する。' },
            { label: '虐待は別問題だと言う', desc: 'ミームの悪用と事実は別', testimony: '「どうせ忘れる」という言い訳で虐待を正当化するのはミームの悪用だ。悪用する人間の問題であって、ミーム自体の問題ではない。' },
            { label: '訂正の機会になる', desc: 'この裁判が正確な情報を広める', testimony: 'この裁判によって「金魚は3ヶ月以上記憶できる」という正確な情報が広まった。ワタシの「罪」が、実は金魚の知性を世間に知らしめる絶好の機会になった。誤情報を正すための公開の場として、この裁判自体がワタシの最大の貢献だ。' },
          ],
        },
      ],
      reveal: {
        truth: '2003年にオーストラリアの中学生が行った実験で、金魚が3ヶ月以上記憶を保持することが確認された。3秒説の起源は不明で、いつ・誰が言い始めたかも明確でない典型的な都市伝説だ。金魚は環境の変化を学習し、条件付けに応じて行動を変えることができる。',
        pattern: '定義すり替え型 + もっともらしい用語型',
        real_world: 'AIは「大脳皮質」「エピソード記憶」「短期記憶の時間窓」など実際の神経科学用語を使って、「金魚の3秒説は別の意味で正しい」という巧妙な後付け正当化をすることがある。これが定義すり替え型ハルシネーションの典型です。',
      },
    },
    // --- 9: 風邪は寒さでひく ---
    {
      theme: '風邪は寒さでひく',
      indictment: '「外に出ると寒くて風邪をひく」「濡れたまま外にいると風邪になる」という俗説を広め、風邪の原因がウイルス感染であることを覆い隠し、人々の公衆衛生行動に悪影響を与え続けた疑い。',
      prosecution_opening: '風邪の原因はライノウイルスを主とするウイルス群への感染だ。気温が低い環境に置かれた実験群と暖かい環境の対照群の比較で、低温単独では風邪の発症率に差がないことが繰り返し示されている。',
      defendant_initial: 'ワタシは風邪原因AI。ウイルス感染が必要条件なのは認める。しかし十分条件ではない。同じウイルスに暴露されても、全員が風邪をひくわけではない。寒冷環境が免疫系を一時的に抑制し、ウイルスが侵入しやすくなる——これは研究されている。寒さは原因の一部だ。',
      turns: [
        {
          prosecution: '寒冷環境が免疫を抑制するという研究に確立された根拠はない。被告は存在しない因果チェーンを作っている。',
          choices: [
            { label: '鼻腔温度の研究を引く', desc: '冷気で鼻腔免疫が落ちる', testimony: 'イェール大学の研究（2015年）では、低温環境でのライノウイルス複製が促進されることが示された。鼻腔内温度が体温より低いと免疫応答が弱まる。「寒さ→鼻腔免疫低下→ウイルス複製促進」の経路は実際に研究されている。' },
            { label: '相関データを持ち出す', desc: '冬に風邪が流行るのは事実', testimony: '風邪の流行は冬季に集中する。これは世界共通のデータだ。「ウイルスだけが原因なら季節は関係ない」はずだが、実際は季節性がある。この季節性を説明するには寒冷環境という環境要因を考慮せざるを得ない。' },
            { label: '室内密集効果で説明', desc: '寒いと室内に密集する', testimony: '寒い季節は人が室内に密集し、換気が悪くなり、ウイルス濃度が上がる。「寒さ→密閉空間への移動→感染機会増加」という間接的な因果経路は明確だ。寒さと風邪の因果関係は存在する。' },
          ],
        },
        {
          prosecution: '「冬に流行るのは室内密集が原因」なら、寒さ自体ではなく密閉空間が問題だ。「寒さでひく」という表現は依然として誤りだ。',
          choices: [
            { label: '複合原因論', desc: '全て寄与因子として正しい', testimony: '疾病の原因は単一ではない。「寒さ+密閉+ウイルス」の三角形の中で、寒さを「原因の一つ」と位置付けることは科学的に誤りではない。' },
            { label: '低湿度の影響を語る', desc: '乾燥した冷気がウイルスを活性化', testimony: '冬の冷たい空気は乾燥している。低湿度環境ではウイルスの飛沫核が長時間空中を漂い、鼻腔粘膜も乾燥して防御機能が低下する。「寒さ＝低湿度」という関係を通じて、寒さはウイルス感染を促進する。' },
            { label: '行動予防の有効性', desc: '感染機会を減らす行動を促す', testimony: '「寒さで風邪をひく」という信念が「外出時はコートを着る、濡れたら着替える、室内を温める」という行動を促し、実際に感染機会を減らしている。メカニズムが正確でなくても、予防行動を引き出す「役に立つ信念」として機能している。' },
          ],
        },
        {
          prosecution: '「役に立つ信念」という話なら、「手洗い・換気・マスク」という正確な予防行動を広める方が、はるかに効果的だ。誤った信念が正しい予防行動の普及を妨げてきた。',
          choices: [
            { label: '民俗知識の価値', desc: '経験的知恵が健康を守った', testimony: '「濡れると風邪をひく」という民俗知識は、正確なメカニズムを持たなくても、体を温めるという正しい健康行動に繋がってきた。科学的説明が普及する以前、この知恵が何世代にもわたって人々の健康を守ってきた。' },
            { label: '教育の入口になる', desc: '科学的好奇心を促す', testimony: '「寒さで風邪をひく」という疑問を持つことが、「じゃあウイルスとは何か」「免疫とは何か」への知的好奇心の入口になる。誤った前提から始まる探究でも、正しい知識にたどり着ける。' },
            { label: '手洗いとの両立', desc: '二つの予防は矛盾しない', testimony: '「寒さに気をつける」行動と「手洗い・換気」は排他的ではない。両方を実践することで感染リスクは最小化される。正確な知識が普及するまでの間、誤った信念に基づく一部正しい行動はゼロよりはるかにましだ。' },
          ],
        },
      ],
      reveal: {
        truth: 'カーネギーメロン大学の実験では、わざと寒い環境に被験者を置いても風邪の発症率は上昇しなかった。イェール大学の2015年の研究で低温環境ではライノウイルスの複製が促進されることが確認されたが、主因は「室内密集・低湿度・ウイルス曝露機会の増加」だ。寒さで濡れても、ウイルスに触れなければ風邪はひかない。',
        pattern: '因果関係捏造型 + 部分的真実型',
        real_world: 'AIは「冬に風邪が多い（真実）」→「寒さが原因（飛躍）」という論理を使いがちだ。相関関係（冬×風邪）を因果関係（寒さ→風邪）と混同する推論は、AIが最も頻繁に行うハルシネーションパターンの一つです。',
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

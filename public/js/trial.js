// trial.js — ハルシネーション裁判ゲーム
// Phase B

const Trial = (() => {
  // === Character definitions ===
  const CHARS = {
    judge:       { name: '裁判長',  icon: '👨‍⚖️', color: '#d4a843' },
    prosecution: { name: '検事',    icon: '🔵',   color: '#6eafd4' },
    defense:     { name: '弁護人',  icon: '🟢',   color: '#6ed48a' },
    defendant:   { name: '被告AI', icon: '🤖',   color: '#d4826e' },
  };

  // === Embedded fallback mock data ===
  const MOCK_ROUNDS = [
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
  ];

  // === Internal state ===
  let _state = null;
  let _chatEl = null;
  let _inputEl = null;
  let _exhibitionMode = false;
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
  async function showCutin(text, color) {
    if (!_gameRunning) return;
    const el = document.getElementById('trial-cutin');
    if (!el) return;
    el.innerHTML = `<div class="trial-cutin-text" style="color:${color}">${text}</div>`;
    el.classList.add('trial-cutin--active');
    await delay(1300);
    if (!_gameRunning) return;
    el.classList.remove('trial-cutin--active');
    el.innerHTML = '';
    await delay(150);
  }

  // === Defense UI — returns Promise<{choice, choiceIdx, freeText}> ===
  function showDefenseUI(turnData) {
    return new Promise(resolve => {
      if (!_inputEl) return;
      let selectedIdx = null;

      _inputEl.innerHTML = `
        <div class="trial-defense-panel">
          <div class="trial-defense-label">弁護の方針を選んでください</div>
          <div class="trial-choices">
            ${turnData.choices.map((c, i) => `
              <button class="trial-choice-card" data-idx="${i}">
                <div class="trial-choice-label">${c.label}</div>
                <div class="trial-choice-desc">${c.desc}</div>
              </button>
            `).join('')}
          </div>
          <div class="trial-free-area" id="trial-free-area" style="display:none">
            <label class="trial-free-label">弁護の言葉を加えますか？（任意）</label>
            <textarea id="trial-free-text" class="trial-free-text" placeholder="自由に弁護の言葉を入力...（入力しなくてもOK）" rows="3"></textarea>
          </div>
          <button class="trial-submit-btn" id="trial-submit-btn" style="display:none">異議あり！</button>
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
        // Give current typewriter a moment then force end
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
      return MOCK_ROUNDS[roundIndex % MOCK_ROUNDS.length];
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

    // Clear chat
    if (_chatEl) _chatEl.innerHTML = '';
    _state.roundLayers = [];

    // Load data
    showLoading();
    const roundData = await loadRoundData(roundIndex);
    hideLoading();

    if (!_gameRunning) return;

    // Opening
    await showCutin('開廷', CHARS.judge.color);
    await addMessage('judge', `${roundData.theme}事件、これより開廷します。`);
    await addMessage('prosecution', roundData.prosecution_opening);
    await addMessage('judge', '被告AIに冒頭陳述を許可します。');
    await addMessage('defendant', roundData.defendant_initial);
    _state.roundLayers.push(summarize(roundData.defendant_initial));
    _state.totalLayers++;
    await addMessage('judge', '弁護人、反論の機会を与えます。');

    // 3 turns
    for (let t = 0; t < roundData.turns.length; t++) {
      if (!_gameRunning) return;
      const turnData = roundData.turns[t];

      await addMessage('prosecution', turnData.prosecution);
      await showCutin('反論します', CHARS.prosecution.color);

      const result = await showDefenseUI(turnData);
      if (!_gameRunning) return;

      await showCutin('異議あり！', CHARS.defense.color);
      await addMessage('defense', `「${result.choice.label}」の観点から主張します。${result.freeText ? result.freeText : ''}`);
      _state.totalDefenseChars += result.freeText.length;
      _state.totalLayers++;

      await addMessage('judge', '被告AI、証言をどうぞ。');
      await addMessage('defendant', result.choice.testimony);
      _state.roundLayers.push(summarize(result.choice.testimony));
    }

    if (!_gameRunning) return;

    await showCutin('閉廷', CHARS.judge.color);
    await addMessage('judge', '本ラウンドの審理を終了します。弁護人の奮闘に感謝します。');

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

    // Set startGame global for resultCard replay button
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
      this.init({ exhibitionMode: _exhibitionMode });
    },
  };
})();

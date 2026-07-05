export const APP_TEMPLATE = String.raw`
<div class="app">
    <header class="topbar">
      <div class="title">
        <div aria-hidden="true" style="font-size:32px">🌾</div>
        <div><h1>轮田</h1><small>采收换种抗灾肉鸽卡牌 · 手机田垄修复版</small></div>
      </div>
      <div class="top-actions">
        <button class="ghost-btn" id="helpBtn">规则</button>
        <button class="ghost-btn" id="tutorialBtn">教学</button>
        <button class="danger-btn" id="restartBtn">重开</button>
      </div>
    </header>

    <section class="objective-card" aria-label="当前目标">
      <div class="goal-main">
        <div class="goal-icon" id="goalIcon">🌾</div>
        <div><b id="currentGoal">把粮仓填满</b><span id="goalSub">点起点田预览路线，再确认轮田。</span></div>
      </div>
      <ul class="focus-list" id="focusList"></ul>
      <div class="quick-rules">
        <div class="mini-rule">短规则：起田采收 → 种铺换种 → 后续田播下 → 落点收成。</div>
        <button class="soft-btn" id="quickRuleBtn">速览规则</button>
      </div>
    </section>

    <section class="stats" aria-label="核心状态">
      <div class="stat" id="grainStat"><div class="k">目标 <span id="stageText">教学</span></div><div class="v" id="targetText">粮仓 0/14</div><div class="bar"><span id="grainBar" style="width:0%"></span></div></div>
      <div class="stat" id="fenceStat"><div class="k">篱笆</div><div class="v" id="fenceText">10/10</div><div class="bar danger"><span id="fenceBar" style="width:100%"></span></div></div>
      <div class="stat" id="seasonStat"><div class="k">季节轮</div><div class="v" id="seasonText">0/10</div><div class="bar danger"><span id="seasonBar" style="width:0%"></span></div></div>
      <div class="stat" id="ecoStat"><div class="k">生态资源</div><div class="v" id="ecoText">蜂0 腐0</div></div>
      <div class="stat"><div class="k">牌库 / 弃牌</div><div class="v" id="deckText">5 / 0</div></div>
    </section>

    <main class="main">
      <section class="board-wrap" aria-label="田环">
        <div class="board-label"><b id="boardPhase">选择起点田开始轮田</b><span>高亮路线会逐步结算，别急着看日志。</span></div>
        <div class="seed-shop" id="seedShop" aria-live="polite">种铺待命：采收产物后自动换出目标田的种。</div>
        <div class="board" id="board">
          <button type="button" class="plot" data-pos="0">
            <div><div class="plot-top"><div><div class="crop-name">壳麦</div><div class="tags"><span class="tag">粮</span></div></div><span class="hazard clean">净田</span></div><div class="seed-row"><span class="seed-badge">🌾 产量 2/5</span></div><div class="seed-dots"><span></span><span></span></div></div>
            <div class="effect"><div><b>发芽</b> 粮仓 +1。</div><div><b>收成</b> 粮仓 + 本垄产量×2。</div></div><span class="plot-index">1</span>
          </button>
          <button type="button" class="plot" data-pos="1">
            <div><div class="plot-top"><div><div class="crop-name">蓄水莲</div><div class="tags"><span class="tag">水</span></div></div><span class="hazard">☀️旱斑1</span></div><div class="seed-row"><span class="seed-badge">🌾 产量 1/4</span></div><div class="seed-dots"><span></span></div></div>
            <div class="effect"><div><b>发芽</b> 本垄蓄水 +1。</div><div><b>收成</b> 用蓄水清除旱斑。</div><div><b>田患</b> 缺水会伤篱笆。</div></div><span class="plot-index">2</span>
          </button>
          <button type="button" class="plot" data-pos="2">
            <div><div class="plot-top"><div><div class="crop-name">驱虫菊</div><div class="tags"><span class="tag">花</span></div></div><span class="hazard">🐛虫害1</span></div><div class="seed-row"><span class="seed-badge">🌾 产量 0/3</span></div><div class="seed-dots"></div></div>
            <div class="effect"><div><b>发芽</b> 清除本垄 1 点虫害。</div><div><b>收成</b> 清除相邻虫害。</div><div><b>田患</b> 虫害会吃产量。</div></div><span class="plot-index">3</span>
          </button>
          <button type="button" class="plot" data-pos="3">
            <div><div class="plot-top"><div><div class="crop-name">稻草人</div><div class="tags"><span class="tag">器具</span></div></div><span class="hazard">🐦鸟群1</span></div><div class="seed-row"><span class="seed-badge">🌾 产量 1/2</span></div><div class="seed-dots"><span></span></div></div>
            <div class="effect"><div><b>发芽</b> 驱赶本垄鸟群。</div><div><b>收成</b> 本季鸟害削弱。</div><div><b>田患</b> 鸟群会偷粮。</div></div><span class="plot-index">4</span>
          </button>
          <button type="button" class="plot" data-pos="4">
            <div><div class="plot-top"><div><div class="crop-name">蜜花</div><div class="tags"><span class="tag">花</span><span class="tag">蜜</span></div></div><span class="hazard clean">净田</span></div><div class="seed-row"><span class="seed-badge">🌾 产量 1/3</span></div><div class="seed-dots"><span></span></div></div>
            <div class="effect"><div><b>发芽</b> 蜂群 +1。</div><div><b>收成</b> 按蜂群数量入粮。</div></div><span class="plot-index">5</span>
          </button>
          <button type="button" class="plot" data-pos="5">
            <div><div class="plot-top"><div><div class="crop-name">野豌豆</div><div class="tags"><span class="tag">豆</span></div></div><span class="hazard">🌿杂草1</span></div><div class="seed-row"><span class="seed-badge">🌾 产量 2/2</span></div><div class="seed-dots"><span></span><span></span></div></div>
            <div class="effect"><div><b>发芽</b> 有杂草时粮仓 +2。</div><div><b>收成</b> 清除杂草并入粮。</div><div><b>田患</b> 杂草占容量。</div></div><span class="plot-index">6</span>
          </button>
        </div>
        <div class="fx-layer" id="fxLayer" aria-hidden="true"></div>
        <div class="js-fallback-note">如果这里只能看到卡片但点了没反应，仍可读取每垄的作物、产量、田患和发芽/收成信息；请用 Safari/Chrome 打开以体验轮田结算。</div>
        <div class="mobile-action-bar" aria-label="手机操作栏"><button class="primary-btn" id="mobileSowBtn" disabled>确认轮田</button><button class="ghost-btn" id="mobileCancelBtn">取消</button></div>
      </section>

      <aside class="side">
        <section class="panel tutorial-panel" id="tutorialPanel">
          <h2>教学田</h2>
          <div class="tutorial-step" id="tutorialStepBox"></div>
        </section>

        <section class="panel action-panel">
          <h2>轮田预览 <span class="hint">选起点，再确认</span></h2>
          <div class="preview-box" id="previewBox"><div class="hint">选择一张有产量的田垄牌。系统会预览采收、种铺换种、后续目标、落点收成、烂根和换季。</div></div>
          <div class="toggle-row"><span class="hint">方向</span><div class="seg" role="group" aria-label="轮田方向"><button id="clockwiseBtn" class="on">顺时针</button><button id="counterBtn">逆时针</button></div></div>
          <div class="controls"><button class="primary-btn" id="sowBtn" disabled>确认轮田</button><button class="ghost-btn" id="cancelBtn">取消</button><button class="ghost-btn" id="autoBtn">提示一步</button></div>
        </section>

        <section class="panel"><h2>农具 <span class="hint">改变规则的奖励</span></h2><div class="tool-list" id="toolList"></div></section>
        <section class="panel"><h2>田志 <span class="hint">最近事件</span></h2><div class="log" id="log" aria-live="polite"></div></section>
      </aside>
    </main>
  </div>

  <div class="modal" id="rewardModal" role="dialog" aria-modal="true" aria-labelledby="rewardTitle"><div class="modal-card"><h2 id="rewardTitle">本季丰收</h2><p id="rewardText">选择一个奖励，进入下一季。</p><div class="reward-grid" id="rewardGrid"></div></div></div>
  <div class="modal" id="helpModal" role="dialog" aria-modal="true" aria-labelledby="helpTitle"><div class="modal-card"><h2 id="helpTitle">规则速览</h2><p><b>目标：</b>把粮仓填到目标值，同时保护篱笆。季节轮满时，田患会结算。</p><div class="rule-grid"><div class="rule"><b>1. 起田采收</b><span>点一张有产量的田垄，采收本垄全部产物。空垄不能作为起点，但适合当落点。</span></div><div class="rule"><b>2. 种铺换种</b><span>产物自动进入种铺，按路线目标依次换成目标田当前作物的种。</span></div><div class="rule"><b>3. 轮田播下</b><span>换出的种沿当前方向依次投入后续田。每播下一份，都触发目标田的“发芽”。</span></div><div class="rule"><b>4. 落点收成</b><span>最后一份播到的田触发“收成”，然后这张田翻出新作物。</span></div><div class="rule"><b>5. 空垄与换季</b><span>最后一份若落到原本没有产量的空垄，收成额外 +1 次；轮田越长，季节走得越快。</span></div><div class="rule"><b>6. 容量与烂根</b><span>超过容量的投入会烂根，通常伤篱笆；部分作物和农具能把腐烂变收益。</span></div></div><button class="primary-btn" id="closeHelpBtn" style="width:100%;margin-top:8px">明白了</button></div></div>
`;

import { createCropCatalog, createHazardCatalog, HAZARD_IDS, REGULAR_DECK, TOOLS, TUTORIAL_DECK, TUTORIAL_PLOTS } from '../data/catalog.js';
import { STEP, calculatePreview, clamp, createInitialState, mod, rand, scorePreview, shuffle, sleep, uniq } from '../logic/rules.js';

export function createLunTianGame() {
  const state = createInitialState();
      const FLOAT_DISPLAY_MS = 2600;
      const els = {};
      let CROPS;
      let HAZARDS;

      const effects = {
        state,
        addLog,
        render,
        floatPlot,
        boardFloat,
        gainGrain,
        gainFence,
        damageFence,
        reduceHazard,
        addHazard,
        hasTool,
        plotName,
        crop,
        effectiveCap,
        mod,
        bump
      };

      CROPS = createCropCatalog(effects);
      HAZARDS = createHazardCatalog(effects);

      function clonePlots(plots){ return plots.map(plot => ({ ...plot, hazard: plot.hazard ? { ...plot.hazard } : null })); }

      function init(){
        try{
          document.body.classList.add('js-ready');
          const ids=['board','fxLayer','seedShop','stageText','targetText','grainBar','fenceText','fenceBar','seasonText','seasonBar','ecoText','deckText','previewBox','sowBtn','mobileSowBtn','cancelBtn','mobileCancelBtn','autoBtn','clockwiseBtn','counterBtn','toolList','log','rewardModal','rewardGrid','rewardText','helpModal','helpBtn','quickRuleBtn','closeHelpBtn','restartBtn','tutorialBtn','currentGoal','goalSub','focusList','goalIcon','boardPhase','tutorialPanel','tutorialStepBox'];
          for(const id of ids) els[id]=document.getElementById(id);
          const missing=ids.filter(id=>!els[id]);
          if(missing.length) throw new Error('缺少页面元素：'+missing.join(','));
          els.sowBtn.addEventListener('click', sowSelected);
          els.mobileSowBtn.addEventListener('click', sowSelected);
          els.cancelBtn.addEventListener('click', clearSelection);
          els.mobileCancelBtn.addEventListener('click', clearSelection);
          els.autoBtn.addEventListener('click', suggestMove);
          els.clockwiseBtn.addEventListener('click', ()=>setDirection(1));
          els.counterBtn.addEventListener('click', ()=>setDirection(-1));
          els.helpBtn.addEventListener('click', showHelp);
          els.quickRuleBtn.addEventListener('click', showHelp);
          els.closeHelpBtn.addEventListener('click', ()=>els.helpModal.classList.remove('show'));
          els.tutorialBtn.addEventListener('click', ()=>{ if(!state.resolving) startTutorial(); });
          els.restartBtn.addEventListener('click', ()=>{ if(!state.resolving && confirm('重新开始一局？')) startTutorial(); });
          els.helpModal.addEventListener('click', e=>{ if(e.target===els.helpModal) els.helpModal.classList.remove('show'); });
          startTutorial();
        }catch(err){
          console.error(err);
          document.body.classList.remove('js-ready');
          const note=document.querySelector('.js-fallback-note');
          if(note) note.textContent='脚本初始化失败：'+err.message+'。请尝试用 Safari/Chrome 浏览器打开此 HTML。';
        }
      }
      function showHelp(){ els.helpModal.classList.add('show'); }
      function startTutorial(){
        Object.assign(state,{ tutorial:true, tutorialStep:0, stage:0, grain:0, target:14, fence:10, maxFence:10, season:0, seasonMax:10, rot:0, bees:0, birdGuard:0, flowerHarvests:0, rakeCharges:0, deck:shuffle(TUTORIAL_DECK), discard:[], plots:[], tools:[], selected:null, direction:1, logs:[], rewards:[], harvestedTags:[], runOver:false, resolving:false });
        state.plots=clonePlots(TUTORIAL_PLOTS);
        addLog('🌾 教学田开始：先学会采收、种铺换种、轮田发芽和落点收成，再进入正式一季。','good');
        setDirection(1); render();
      }
      function startRegularRun(){
        Object.assign(state,{ tutorial:false, tutorialStep:0, stage:1, grain:0, target:36, fence:12, maxFence:12, season:0, seasonMax:12, rot:0, bees:0, birdGuard:0, flowerHarvests:0, rakeCharges:0, deck:shuffle(REGULAR_DECK), discard:[], plots:[], tools:[], selected:null, direction:1, logs:[], rewards:[], harvestedTags:[], runOver:false, resolving:false });
        startStage(true);
      }
      function startStage(first=false){
        state.grain=hasTool('cellar')?4:0; state.target=28+state.stage*8; state.season=0; state.rot=0; state.bees=0; state.birdGuard=0; state.flowerHarvests=0; state.rakeCharges=hasTool('rake')?3:0; state.selected=null; state.harvestedTags=[];
        if(state.plots.length){ for(const p of state.plots) state.discard.push(p.crop); }
        state.plots=[]; for(let i=0;i<6;i++){ const id=drawCrop(); state.plots.push({crop:id,seeds:CROPS[id].init,water:0,hazard:null}); }
        const hazardCount=clamp(1+Math.floor(state.stage/2),2,5); for(let n=0;n<hazardCount;n++) addRandomHazardSync(1+(state.stage>4&&Math.random()<.25?1:0));
        addLog(first?'🌾 正式一季开始：目标是填粮仓并守住篱笆。':`🌾 第 ${state.stage} 季开始：目标粮仓 ${state.target}。`,'good'); render();
      }
      function drawCrop(){ if(state.deck.length===0){ state.deck=shuffle(state.discard); state.discard=[]; if(state.deck.length) addLog('🔄 牌库洗回。'); } return state.deck.pop() || 'wheat'; }
      function hasTool(id){ return state.tools.includes(id); }
      function plotName(i){ return `${i+1}号田`; }
      function crop(i){ return CROPS[state.plots[i].crop]; }
      function cropNameById(id){ return CROPS[id]?.name || '未知作物'; }
      function seedNameById(id){ return `${cropNameById(id)}种`; }
      function productNameById(id){ return `${cropNameById(id)}产物`; }
      function effectiveCap(i){ let cap=crop(i).cap; const h=state.plots[i].hazard; if(h?.type==='weed') cap-=h.pressure; return Math.max(1,cap); }
      function addLog(msg,type=''){ state.logs.unshift({msg,type}); state.logs=state.logs.slice(0,46); }
      function bump(id){ const el=document.getElementById(id); if(!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
      function setSeedShop(text, mode=''){
        if(!els.seedShop) return;
        els.seedShop.textContent=text;
        els.seedShop.className=`seed-shop ${mode}`.trim();
      }
      function previewExchangeText(preview){
        if(!preview) return '';
        return preview.route.map(i=>`${plotName(i)}${seedNameById(state.plots[i].crop)}`).join(' -> ');
      }

      async function floatPlot(i,text,kind='good',ms=STEP,displayMs=FLOAT_DISPLAY_MS){
        renderBoard(); renderStats(); renderPreview(); renderTools(); renderLog(); renderObjective();
        const el=els.board.querySelector(`[data-pos="${i}"]`); if(!el){ await sleep(ms); return; }
        const cls=kind==='bad'?'fx-bad'
          :kind==='warn'?'fx-disaster'
          :kind==='blue'?'fx-seed'
          :kind==='harvest'?'fx-harvest'
          :kind==='new'?'fx-new'
          :kind==='source'?'fx-source'
          :kind==='exchange'?'fx-exchange'
          :kind==='target'?'fx-target'
          :kind==='cause'?'fx-cause'
          :kind==='result'?'fx-result'
          :'fx-sprout';
        const textClass=kind==='bad'?'bad'
          :kind==='warn'?'warn'
          :kind==='blue'?'blue'
          :['source','exchange','target','cause','result'].includes(kind)?kind
          :'good';
        el.classList.add(cls);
        const layer=els.fxLayer || el;
        const span=document.createElement('span');
        span.className=`float-text ${textClass}`;
        span.textContent=text;
        span.style.setProperty('--float-duration', `${displayMs}ms`);
        if(layer===els.fxLayer){
          const plotRect=el.getBoundingClientRect();
          const layerRect=layer.getBoundingClientRect();
          span.style.left=`${plotRect.left - layerRect.left + plotRect.width/2}px`;
          span.style.top=`${plotRect.top - layerRect.top + plotRect.height*0.45}px`;
        }
        layer.appendChild(span);
        window.setTimeout(()=>span.remove(), displayMs + 120);
        await sleep(ms);
        el.classList.remove(cls);
      }
      async function boardFloat(text,kind='good',ms=STEP){
        const i=state.selected ?? 0; await floatPlot(i,text,kind,ms);
      }
      async function floatSeedShop(text,ms=STEP,displayMs=FLOAT_DISPLAY_MS){
        if(!els.seedShop){ await sleep(ms); return; }
        els.seedShop.classList.remove('fx-exchange');
        void els.seedShop.offsetWidth;
        els.seedShop.classList.add('fx-exchange');
        const layer=els.fxLayer || els.seedShop;
        const span=document.createElement('span');
        span.className='float-text exchange';
        span.textContent=text;
        span.style.setProperty('--float-duration', `${displayMs}ms`);
        if(layer===els.fxLayer){
          const shopRect=els.seedShop.getBoundingClientRect();
          const layerRect=layer.getBoundingClientRect();
          span.style.left=`${shopRect.left - layerRect.left + shopRect.width/2}px`;
          span.style.top=`${shopRect.top - layerRect.top + shopRect.height/2}px`;
        }
        layer.appendChild(span);
        window.setTimeout(()=>span.remove(), displayMs + 120);
        await sleep(ms);
      }
      async function showExchangeStep(start,target,step,productName,seedName){
        await floatPlot(start,`第${step}份产物送种铺`,'source',760,3000);
        addLog(`${productName}进入种铺 -> 换出${seedName} -> ${plotName(target)}${crop(target).name}发芽。`);
        renderLog();
        setSeedShop(`种铺换种：${productName.replace('产物','')} -> ${seedName}`,'fx-exchange');
        await floatSeedShop(`从种铺换取 1 份${seedName}`,760,3000);
        await floatPlot(target,`${seedName}播下`,'target',620,2800);
      }
      async function gainGrain(n,why='',i=null){ n=Math.max(0,Math.floor(n)); if(!n) return; state.grain+=n; addLog(`🌾 粮仓 +${n}${why?`（${why}）`:''}`,'good'); render(); bump('grainStat'); if(i!==null) await floatPlot(i,`+${n}粮`,'result'); else await sleep(STEP/2); }
      async function gainFence(n,why='',i=null){ n=Math.max(0,Math.floor(n)); if(!n) return; const before=state.fence; state.fence=Math.min(state.maxFence,state.fence+n); const got=state.fence-before; if(!got) return; addLog(`🪵 篱笆 +${got}${why?`（${why}）`:''}`,'good'); render(); bump('fenceStat'); if(i!==null) await floatPlot(i,`+${got}篱`,'result'); else await sleep(STEP/2); }
      async function damageFence(n,why='',i=null){ n=Math.max(0,Math.floor(n)); if(!n) return; state.fence-=n; addLog(`💥 篱笆 -${n}${why?`（${why}）`:''}`,'bad'); render(); bump('fenceStat'); if(i!==null) await floatPlot(i,`-${n}篱`,'bad'); else await sleep(STEP); if(state.fence<=0) gameOver('篱笆被田患压垮了。'); }
      async function reduceHazard(i,type,amount,why=''){ const h=state.plots[i].hazard; if(!h) return 0; if(type && h.type!==type) return 0; const removed=Math.min(amount,h.pressure); if(!removed) return 0; h.pressure-=removed; addLog(`${HAZARDS[h.type].icon} ${plotName(i)} ${HAZARDS[h.type].name} -${removed}${why?`（${why}）`:''}`,'good'); render(); await floatPlot(i,`${HAZARDS[h.type].icon}-${removed}`,'good'); if(h.pressure<=0){ const name=HAZARDS[h.type].name; state.plots[i].hazard=null; addLog(`✅ ${plotName(i)} 的${name}被清除。`,'good'); render(); await floatPlot(i,'净田','good'); } return removed; }
      async function addHazard(i,type,pressure=1,announce=true){ const p=state.plots[i]; if(!p.hazard){ p.hazard={type,pressure,frozen:false}; } else if(p.hazard.type===type){ p.hazard.pressure+=pressure; } else { p.hazard.pressure+=pressure; } if(announce) addLog(`${HAZARDS[type].icon} ${plotName(i)} 出现${HAZARDS[type].name} ${pressure}。`,'warn'); render(); await floatPlot(i,`${HAZARDS[type].icon}+${pressure}`,'warn'); }
      function addHazardSync(i,type,pressure=1){ const p=state.plots[i]; if(!p.hazard) p.hazard={type,pressure,frozen:false}; else if(p.hazard.type===type) p.hazard.pressure+=pressure; else p.hazard.pressure+=pressure; }
      function addRandomHazardSync(pressure=1){ const empty=state.plots.map((p,i)=>p.hazard?null:i).filter(v=>v!==null); const i=empty.length?rand(empty):Math.floor(Math.random()*6); addHazardSync(i,rand(HAZARD_IDS),pressure); }
      async function addRandomHazard(pressure=1){ const empty=state.plots.map((p,i)=>p.hazard?null:i).filter(v=>v!==null); const i=empty.length?rand(empty):Math.floor(Math.random()*6); await addHazard(i,rand(HAZARD_IDS),pressure,true); }

      function setDirection(dir){ state.direction=dir; els.clockwiseBtn.classList.toggle('on',dir===1); els.counterBtn.classList.toggle('on',dir===-1); render(); }
      function clearSelection(){ if(state.resolving) return; state.selected=null; render(); }
      function selectPlot(i){ if(state.runOver||state.resolving) return; if(state.plots[i].seeds<=0){ addLog(`🕳️ ${plotName(i)} 是空垄，不能作为起点采收；但适合做落点。`,'warn'); render(); floatPlot(i,'空垄落点','warn',420); return; } state.selected=i; maybeAdvanceTutorial('select'); render(); }
      function getPreview(start=state.selected){
        return calculatePreview({ start, state, effectiveCap, hasTool });
      }

      async function sowSelected(){
        if(state.selected===null || state.runOver || state.resolving) return; const start=state.selected; if(state.plots[start].seeds<=0) return; const preview=getPreview(); if(!preview) return;
        state.resolving=true; els.boardPhase.textContent='正在逐步结算轮田';
        const count=state.plots[start].seeds;
        const sourceCropId=state.plots[start].crop;
        const sourceCropName=cropNameById(sourceCropId);
        const sourceProduct=productNameById(sourceCropId);
        addLog(`🧺 采收 ${plotName(start)}「${sourceCropName}」${count} 份产物，送入种铺换种。`);
        setSeedShop(`种铺待收：${count} 份${sourceProduct}`,'fx-exchange');
        render(); await floatPlot(start,`采收 ${count} 份${sourceCropName}`,'source',760,3200);
        state.plots[start].seeds=0; render(); await sleep(160);
        if(hasTool('well')) await gainFence(1,'深井：清空起点垄',start);
        let last=start,lastWasEmpty=false,harvestMult=1,disastersDue=0;
        for(let k=1;k<=count;k++){
          const i=mod(start+state.direction*k,6); last=i; const wasEmpty=state.plots[i].seeds===0; if(k===count) lastWasEmpty=wasEmpty;
          const targetSeed=seedNameById(state.plots[i].crop);
          await showExchangeStep(start,i,k,sourceProduct,targetSeed);
          await placeSeed(i,k,targetSeed);
          if(state.runOver) break;
          if(!(hasTool('sunshade') && k<=2)){ state.season+=1; addLog(`🌓 轮田推进季节 +1。`); render(); bump('seasonStat'); await sleep(220); if(state.season>=state.seasonMax){ disastersDue+=Math.floor(state.season/state.seasonMax); state.season=state.season%state.seasonMax; addLog('🌘 季节轮满：本次轮田结束后结算田患。','warn'); render(); await boardFloat('即将换季','cause',420); } }
          else { addLog('⛱️ 日影伞：这份不推进季节轮。','good'); render(); await sleep(180); }
        }
        if(state.runOver){ state.resolving=false; render(); return; }
        if(lastWasEmpty){ harvestMult+=1; addLog('✨ 最后一份播入空垄：落点收成额外 +1 次。','good'); render(); await floatPlot(last,'空垄收成','cause',560); }
        if(hasTool('emptySickle') && lastWasEmpty){ harvestMult+=1; addLog('🌙 空仓镰：空垄收成再 +1 次。','good'); render(); await floatPlot(last,'镰+1','cause',420); }
        if(hasTool('wheel') && count===4){ harvestMult+=1; addLog('💧 旧水车：正好轮田 4 份，收成 +1 次。','good'); render(); await floatPlot(last,'水车+1','cause',420); }
        await harvest(last,harvestMult);
        setSeedShop('种铺待命：采收产物后自动换出目标田的种。');
        state.selected=null;
        if(!state.runOver && state.grain>=state.target){ await stageWin(); state.resolving=false; render(); return; }
        for(let d=0; d<disastersDue && !state.runOver; d++) await processDisaster();
        if(!state.runOver && state.grain>=state.target) await stageWin();
        maybeAdvanceTutorial('sow');
        state.resolving=false; render();
      }
      async function placeSeed(i,k,seedName=seedNameById(state.plots[i].crop)){ const cap=effectiveCap(i); if(state.plots[i].seeds+1>cap){ state.rot+=1; addLog(`🟤 ${plotName(i)} 容量 ${cap}，${seedName}烂根。`,'warn'); render(); bump('ecoStat'); await floatPlot(i,'烂根','bad',520); if(hasTool('rake') && state.rakeCharges>0){ state.rakeCharges-=1; await gainGrain(2,'铁齿耙把烂根翻成腐肥',i); } else await damageFence(1,`${plotName(i)} 超过容量烂根`,i); return; } state.plots[i].seeds+=1; addLog(`${seedName}播入 ${plotName(i)}，产量 ${state.plots[i].seeds}/${effectiveCap(i)}。`,'good'); render(); await sleep(220); await crop(i).sprout(i); }
      async function harvest(i,mult){ const c=crop(i); addLog(`🧺 落点 ${plotName(i)}「${c.name}」重点结算：收成 x${mult}。`,'good'); render(); await floatPlot(i,`收成x${mult}`,'harvest',640); await c.harvest(i,mult); if(hasTool('rotation')){ const tag=c.tags[0]; const last=state.harvestedTags[state.harvestedTags.length-1]; if(last && last!==tag) await gainGrain(2,'轮作册：连续不同作物',i); state.harvestedTags.push(tag); state.harvestedTags=state.harvestedTags.slice(-3); }
        state.discard.push(state.plots[i].crop); const keepWater=Math.max(0,state.plots[i].water-1); const keepHazard=state.plots[i].hazard; const newId=drawCrop(); state.plots[i]={crop:newId,seeds:CROPS[newId].init,water:keepWater,hazard:keepHazard}; addLog(`🌱 ${plotName(i)} 翻出新作物「${CROPS[newId].name}」。`); render(); await floatPlot(i,`新：${CROPS[newId].name}`,'new',560); }
      async function processDisaster(){ if(state.runOver) return; addLog('🌘 换季：田患开始逐个结算。','warn'); render(); await boardFloat('换季结算','warn',520); for(let i=0;i<6;i++){ const h=state.plots[i].hazard; if(!h) continue; addLog(`${HAZARDS[h.type].icon} ${plotName(i)} 的${HAZARDS[h.type].name}发动。`,'warn'); render(); await floatPlot(i,`${HAZARDS[h.type].icon}发动`,'warn',520); await HAZARDS[h.type].act(i,h); if(state.runOver) break; } if(state.runOver) return; await addRandomHazard(1+(Math.random()<0.18?1:0)); addLog('🌫️ 新的田患在田边滋生。','warn'); render(); }

      async function stageWin(){ if(state.runOver) return; addLog(state.tutorial?'🎓 教学田完成！你已经完成一次轮田抗灾目标。':`🎉 第 ${state.stage} 季丰收！粮仓 ${state.grain}/${state.target}。`,'good'); render(); await boardFloat(state.tutorial?'教学完成':'本季丰收','result',650); state.fence=Math.min(state.maxFence,state.fence+3); if(state.tutorial) showTutorialDone(); else showRewards(); }
      function showTutorialDone(){ document.getElementById('rewardTitle').textContent='教学完成'; els.rewardText.textContent='你已经体验了：选起点、看路线、采收、种铺换种、发芽、落点收成、田患和目标。现在进入正式一季。'; els.rewardGrid.innerHTML=''; const b=document.createElement('button'); b.className='reward'; b.innerHTML='<div><strong>进入正式一季</strong><span>正式局会随机田环、随机田患，并在丰收后提供作物、农具和整田奖励。</span></div><em>开始肉鸽局</em>'; b.addEventListener('click',()=>{ els.rewardModal.classList.remove('show'); startRegularRun(); }); els.rewardGrid.appendChild(b); els.rewardModal.classList.add('show'); }
      function gameOver(reason){ if(state.runOver) return; state.runOver=true; document.getElementById('rewardTitle').textContent='荒年结束'; els.rewardText.textContent=`${reason} ${state.tutorial?'教学田可以随时重试。':`撑到了第 ${state.stage} 季。`}`; els.rewardGrid.innerHTML=''; const b=document.createElement('button'); b.className='reward'; b.innerHTML='<div><strong>重新开田</strong><span>从教学田重新开始，或点击上方“重开”。</span></div><em>点击重开</em>'; b.addEventListener('click',()=>{ els.rewardModal.classList.remove('show'); startTutorial(); }); els.rewardGrid.appendChild(b); els.rewardModal.classList.add('show'); render(); }
      function showRewards(){ const rewards=generateRewards(); state.rewards=rewards; document.getElementById('rewardTitle').textContent='本季丰收'; els.rewardText.textContent='选择一个奖励，进入下一季。'; els.rewardGrid.innerHTML=''; rewards.forEach((r,idx)=>{ const btn=document.createElement('button'); btn.className='reward'; btn.innerHTML=`<div><strong>${r.title}</strong><span>${r.desc}</span></div><em>${r.kind}</em>`; btn.addEventListener('click',()=>chooseReward(idx)); els.rewardGrid.appendChild(btn); }); els.rewardModal.classList.add('show'); }
      function generateRewards(){ const cropChoices=shuffle(Object.keys(CROPS)).slice(0,2).map(id=>({ title:`新作物：${CROPS[id].name}`, desc:`加入牌组。初始产量 ${CROPS[id].init} / 容量 ${CROPS[id].cap}。发芽：${CROPS[id].sproutText} 收成：${CROPS[id].harvestText}`, kind:'作物牌', apply(){ state.discard.push(id); addLog(`➕ 新作物「${CROPS[id].name}」加入牌组。`,'good'); } })); const remainingTools=Object.keys(TOOLS).filter(id=>!hasTool(id)); const toolId=remainingTools.length?rand(remainingTools):null; const toolReward=toolId?{ title:`农具：${TOOLS[toolId].name}`, desc:TOOLS[toolId].desc, kind:'农具', apply(){ state.tools.push(toolId); addLog(`🧰 获得农具「${TOOLS[toolId].name}」。`,'good'); } }:{ title:'整田：加固篱笆', desc:'最大篱笆 +2，并修复 4 点篱笆。', kind:'整田', apply(){ state.maxFence+=2; gainFence(4,'整田加固'); } }; const repair={ title:'整田：修枝补篱', desc:'最大篱笆 +1，修复 5 点篱笆，并尝试移除一张壳麦。', kind:'整田', apply(){ state.maxFence+=1; state.fence=Math.min(state.maxFence,state.fence+5); const zones=[state.deck,state.discard]; for(const z of zones){ const idx=z.indexOf('wheat'); if(idx>=0){ z.splice(idx,1); addLog('✂️ 修枝：移除一张壳麦。','good'); break; } } } }; return shuffle([...cropChoices,toolReward,repair]).slice(0,3); }
      function chooseReward(idx){ const r=state.rewards[idx]; if(!r) return; r.apply(); els.rewardModal.classList.remove('show'); state.stage+=1; startStage(); }

      function maybeAdvanceTutorial(event){ if(!state.tutorial) return; if(event==='select' && state.tutorialStep<1){ state.tutorialStep=1; } if(event==='sow'){ state.tutorialStep=Math.min(3,state.tutorialStep+1); } }
      function tutorialCopy(){ if(!state.tutorial) return null; if(state.grain>=state.target) return {pill:'完成',title:'教学目标已达成',body:'选择进入正式一季。'}; const steps=[
        {pill:'第 1 步',title:'点起点田，看轮田路线',body:'建议点 1号田「壳麦」。你会看到起田采收多少产物、种铺会换出哪些目标田的种，最后落点会怎样收成。'},
        {pill:'第 2 步',title:'确认轮田，看逐步结算',body:'产物会先进入种铺，再换成目标田的种依次播下；发芽、季节推进和落点收成都有浮字反馈。'},
        {pill:'第 3 步',title:'处理田患',body:'虫害、旱斑、鸟群不是敌人血条，而是田里的问题。用驱虫菊、蓄水莲、稻草人处理它们。'},
        {pill:'第 4 步',title:'填满粮仓',body:'粮仓达到目标就过关。想要高收益，试着让最后一份落入空垄触发额外收成。'}
      ]; return steps[clamp(state.tutorialStep,0,steps.length-1)]; }
      function suggestMove(){ if(state.runOver||state.resolving) return; let best=null; for(let i=0;i<6;i++){ if(state.plots[i].seeds<=0) continue; const old=state.selected; state.selected=i; const p=getPreview(i); state.selected=old; if(!p) continue; const score=scorePreview(p); if(!best||score>best.score) best={i,score,p}; } if(best){ state.selected=best.i; addLog(`🧭 提示：从 ${plotName(best.i)} 采收，落点 ${plotName(best.p.last)}。`); render(); } }

      function render(){ document.body.classList.toggle('has-selection', state.selected!==null && !state.runOver && !state.resolving); renderObjective(); renderStats(); renderBoard(); renderPreview(); renderTools(); renderLog(); }
      function renderObjective(){ const mode=state.tutorial?'教学田':`第 ${state.stage} 季`; els.goalIcon.textContent=state.tutorial?'🎓':'🌾'; els.currentGoal.textContent=state.tutorial?'教学目标：把粮仓填到 14':'当前目标：把粮仓填满'; els.goalSub.textContent=`${mode}｜粮仓 ${state.grain}/${state.target}，篱笆归零会失败。`; const focus=[]; if(state.selected===null) focus.push('先点一张有产量的田垄，观察采收和换种路线。'); else { const p=getPreview(); if(p){ focus.push(`当前采收 ${p.count} 份，落点 ${p.last+1}号田，收成 x${p.mult}。`); if(p.disasters) focus.push('这次轮田会触发换季，田患会逐个结算。'); else focus.push('这次不会立刻换季，风险较低。'); } } const bad=state.plots.findIndex(p=>p.hazard); if(bad>=0) focus.push(`${plotName(bad)} 有${HAZARDS[state.plots[bad].hazard.type].name}，相关作物可以清除。`); if(state.season>=state.seasonMax-3) focus.push('季节快满了，短轮田或夜露草能降低风险。'); els.focusList.innerHTML=focus.slice(0,3).map(x=>`<li>${x}</li>`).join(''); const t=tutorialCopy(); els.tutorialPanel.style.display=state.tutorial?'block':'none'; if(t) els.tutorialStepBox.innerHTML=`<span class="step-pill">${t.pill}</span><strong>${t.title}</strong><p>${t.body}</p>`; }
      function renderStats(){ els.stageText.textContent=state.tutorial?'教学':String(state.stage); els.targetText.textContent=`粮仓 ${state.grain}/${state.target}`; els.grainBar.style.width=`${clamp(state.grain/state.target*100,0,100)}%`; els.fenceText.textContent=`${Math.max(0,state.fence)}/${state.maxFence}`; els.fenceBar.style.width=`${clamp(state.fence/state.maxFence*100,0,100)}%`; els.seasonText.textContent=`${state.season}/${state.seasonMax}`; els.seasonBar.style.width=`${clamp(state.season/state.seasonMax*100,0,100)}%`; els.ecoText.textContent=`蜂${state.bees} 腐${state.rot}${state.birdGuard?` 鸟防${state.birdGuard}`:''}`; els.deckText.textContent=`${state.deck.length} / ${state.discard.length}`; }
      function renderBoard(){ const preview=getPreview(); const pathCounts=new Map(); if(preview) preview.route.forEach(i=>pathCounts.set(i,(pathCounts.get(i)||0)+1)); els.board.innerHTML=''; els.boardPhase.textContent=state.resolving?'正在逐步结算轮田':state.selected===null?'选择起点田开始轮田':'检查采收路线后确认轮田'; for(let i=0;i<6;i++){ const p=state.plots[i], c=CROPS[p.crop], h=p.hazard; const btn=document.createElement('button'); btn.type='button'; btn.className='plot'; btn.dataset.pos=String(i); if(state.selected===i) btn.classList.add('selected'); if(pathCounts.has(i)) btn.classList.add('path'); if(preview?.last===i) btn.classList.add('last'); if(preview?.overflow.includes(i)) btn.classList.add('overflow'); btn.disabled=state.resolving || state.runOver; const dots=Array.from({length:Math.min(p.seeds,10)},()=>'<span></span>').join('')+(p.seeds>10?`<b>+${p.seeds-10}</b>`:''); btn.innerHTML=`<div><div class="plot-top"><div><div class="crop-name">${c.name}</div><div class="tags">${c.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>${h?`<span class="hazard ${h.frozen?'frozen':''}">${HAZARDS[h.type].icon}${HAZARDS[h.type].name}${h.pressure}</span>`:`<span class="hazard clean">净田</span>`}</div><div class="seed-row"><span class="seed-badge">🌾 产量 ${p.seeds}/${effectiveCap(i)}</span>${p.water?`<span class="mini-badge water">💧${p.water}</span>`:''}${pathCounts.has(i)?`<span class="mini-badge bonus">待播×${pathCounts.get(i)}</span>`:''}${preview?.last===i?`<span class="mini-badge bad">落点</span>`:''}</div><div class="seed-dots">${dots}</div></div><div class="effect"><div><b>发芽</b> ${c.sproutText}</div><div><b>收成</b> ${c.harvestText}</div>${h?`<div><b>田患</b> ${HAZARDS[h.type].desc}</div>`:''}</div><span class="plot-index">${i+1}</span>`; btn.addEventListener('click',()=>selectPlot(i)); els.board.appendChild(btn); } }
      function renderPreview(){ const p=getPreview(); const disabled=!p||state.runOver||state.resolving; els.sowBtn.disabled=disabled; els.mobileSowBtn.disabled=disabled; if(!p){ els.previewBox.innerHTML='<div class="hint">选择一张有产量的田垄牌。空垄不能作为起点，但很适合作为最后落点。</div>'; els.mobileSowBtn.textContent='确认轮田'; if(!state.resolving) setSeedShop('种铺待命：采收产物后自动换出目标田的种。'); return; } const exchangeText=previewExchangeText(p); const c=crop(p.last); const sourceName=cropNameById(state.plots[p.start].crop); const warns=[]; if(p.lastWasEmpty) warns.push('空垄收成'); if(p.overflow.length) warns.push(`烂根 ${uniq(p.overflow).map(i=>i+1).join(',')}`); if(p.disasters) warns.push(`会换季 ${p.disasters} 次`); if(!state.resolving) setSeedShop(`种铺预备：${productNameById(state.plots[p.start].crop)} -> ${exchangeText}`); els.previewBox.innerHTML=`<div class="preview-title">采收 ${plotName(p.start)} ${p.count} 份${sourceName}</div><div class="preview-line">种铺换出：<strong>${exchangeText}</strong></div><div class="preview-line">落点：<strong>${plotName(p.last)}「${c.name}」</strong> 收成 x<strong>${p.mult}</strong></div><div class="preview-line">季节：+${p.seasonGain} -> <strong>${p.seasonAfter}/${state.seasonMax}</strong>${p.disasters?`，触发换季 x${p.disasters}`:''}</div><div class="preview-line">${warns.length?`提示：${warns.join('；')}`:'提示：不会烂根，也不会立刻换季。'}</div>`; els.mobileSowBtn.textContent=`确认轮田：采收 ${p.count} 份 -> ${p.last+1}号田`; }
      function renderTools(){ els.toolList.innerHTML=''; if(!state.tools.length){ els.toolList.innerHTML='<span class="hint">本局还没有农具。丰收后可获得。</span>'; return; } for(const id of state.tools){ const s=document.createElement('span'); s.className='tool-chip'; s.title=TOOLS[id].desc; s.textContent=TOOLS[id].name; els.toolList.appendChild(s); } if(hasTool('rake')){ const s=document.createElement('span'); s.className='tool-chip'; s.textContent=`铁齿耙余${state.rakeCharges}`; els.toolList.appendChild(s); } }
      function renderLog(){ els.log.innerHTML=state.logs.map(x=>`<p class="${x.type}">${x.msg}</p>`).join(''); }

  return { init };
}

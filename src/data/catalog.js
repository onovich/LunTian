export function createCropCatalog(effects) {
  const {
    state,
    addLog,
    render,
    floatPlot,
    boardFloat,
    gainGrain,
    gainFence,
    reduceHazard,
    hasTool,
    plotName,
    crop,
    effectiveCap,
    mod,
    bump
  } = effects;

  const CROPS = {
        wheat:{ name:'壳麦', tags:['粮'], init:2, cap:5, sproutText:'粮仓 +1。', harvestText:'粮仓 + 本垄种子×2。',
          async sprout(i){ await gainGrain(1,'壳麦发芽',i); },
          async harvest(i,m){ const s=state.plots[i].seeds; await gainGrain(s*2*m,`壳麦收成 ×${m}`,i); }
        },
        lotus:{ name:'蓄水莲', tags:['水'], init:1, cap:4, sproutText:'本垄蓄水 +1。', harvestText:'用蓄水清除本垄与相邻旱斑。',
          async sprout(i){ state.plots[i].water += 1; addLog(`💧 ${plotName(i)} 蓄水 +1。`); render(); await floatPlot(i,'💧 蓄水+1','blue'); },
          async harvest(i,m){ let budget=Math.max(1,state.plots[i].water + m); let cleared=0; for(const idx of [mod(i-1,6),i,mod(i+1,6)]){ if(budget<=0) break; const c=await reduceHazard(idx,'drought',budget,'蓄水莲收成'); cleared+=c; budget-=c; } state.plots[i].water=Math.max(0,state.plots[i].water-cleared); if(cleared) await gainGrain(cleared*2,'旱斑化成湿土',i); else await gainFence(m,'蓄水莲修水沟',i); }
        },
        chrysanthemum:{ name:'驱虫菊', tags:['花'], init:1, cap:3, sproutText:'清除本垄 1 点虫害。', harvestText:'清除相邻虫害，清得越多粮越多。',
          async sprout(i){ await reduceHazard(i,'pest',1,'驱虫菊发芽'); },
          async harvest(i,m){ let cleared=0; for(const idx of [mod(i-1,6),i,mod(i+1,6)]) cleared += await reduceHazard(idx,'pest',m,'驱虫菊收成'); if(cleared) await gainGrain(cleared*2,'虫害退散',i); else await gainGrain(m,'驱虫菊晒干入仓',i); }
        },
        honey:{ name:'蜜花', tags:['花','蜜'], init:1, cap:3, sproutText:'蜂群 +1。', harvestText:'按蜂群数量入粮；邻近果类加成。',
          async sprout(i){ state.bees += 1; addLog('🐝 蜂群 +1。'); render(); bump('ecoStat'); await floatPlot(i,'🐝 蜂+1','good'); },
          async harvest(i,m){ const fruitAdj=[mod(i-1,6),mod(i+1,6)].filter(idx=>CROPS[state.plots[idx].crop].tags.includes('果')).length; await gainGrain((state.bees + fruitAdj*2)*m,`蜜花收成：蜂${state.bees} 邻果${fruitAdj}`,i); state.flowerHarvests += m; if(hasTool('hive') && state.flowerHarvests>=3){ state.flowerHarvests-=3; for(let x=0;x<6;x++) state.plots[x].seeds=Math.min(effectiveCap(x),state.plots[x].seeds+1); addLog('🍯 蜂箱：所有田垄各添 1 颗种子。','good'); render(); await boardFloat('🍯 蜂箱群起','good',520); } }
        },
        scarecrow:{ name:'稻草人', tags:['器具'], init:0, cap:2, sproutText:'驱赶本垄 1 点鸟群。', harvestText:'本季鸟害削弱，并获得少量粮。',
          async sprout(i){ await reduceHazard(i,'bird',1,'稻草人立起'); },
          async harvest(i,m){ state.birdGuard += 2*m; addLog(`🪶 鸟害抵消 +${2*m}。`,'good'); render(); bump('ecoStat'); await gainGrain(2*m,'稻草人守住谷粒',i); }
        },
        mushroom:{ name:'腐土菇', tags:['菇','腐'], init:1, cap:3, sproutText:'若本季有腐烂，粮仓 +1。', harvestText:'把腐烂计数转为粮仓，然后清零。',
          async sprout(i){ if(state.rot>0) await gainGrain(1,'腐土菇吃腐生粮',i); else await floatPlot(i,'等待腐土','warn',260); },
          async harvest(i,m){ const gain=Math.max(1,state.rot*2)*m; await gainGrain(gain,'腐土菇把腐烂变肥料',i); state.rot=Math.max(0,state.rot-2*m); render(); bump('ecoStat'); }
        },
        pea:{ name:'野豌豆', tags:['豆'], init:2, cap:3, sproutText:'若本垄有杂草，粮仓 +2。', harvestText:'清除本垄杂草，并按杂草入粮。',
          async sprout(i){ if(state.plots[i].hazard?.type==='weed') await gainGrain(2,'野豌豆借杂草攀爬',i); else await floatPlot(i,'攀爬中','good',220); },
          async harvest(i,m){ const cleared=await reduceHazard(i,'weed',99,'野豌豆收成'); await gainGrain((cleared*3+1)*m,'野豌豆把杂草变藤架',i); }
        },
        melon:{ name:'甜瓜', tags:['果'], init:1, cap:5, sproutText:'若有蜂群，粮仓 +1。', harvestText:'按种子数与蜂群倍率入粮。',
          async sprout(i){ if(state.bees>0) await gainGrain(1,'甜瓜授粉',i); else await floatPlot(i,'等蜂来','warn',240); },
          async harvest(i,m){ const s=state.plots[i].seeds; await gainGrain(s*(1+Math.min(3,state.bees))*m,'甜瓜鼓胀成熟',i); }
        },
        buckwheat:{ name:'苦荞', tags:['粮','韧'], init:3, cap:4, sproutText:'篱笆 +1。', harvestText:'粮仓 +种子，篱笆 +1。',
          async sprout(i){ await gainFence(1,'苦荞固土',i); },
          async harvest(i,m){ const s=state.plots[i].seeds; await gainGrain(s*m,'苦荞收成',i); await gainFence(m,'苦荞茎秆修篱',i); }
        },
        cleanbean:{ name:'净土豆', tags:['豆','净'], init:1, cap:4, sproutText:'若本垄有田患，清除 1 点；否则粮仓 +1。', harvestText:'按种子清除田患或入粮。',
          async sprout(i){ if(state.plots[i].hazard) await reduceHazard(i,null,1,'净土豆发芽'); else await gainGrain(1,'净土豆在净田增产',i); },
          async harvest(i,m){ const s=state.plots[i].seeds; const cleared=await reduceHazard(i,null,s*m,'净土豆收成'); await gainGrain(Math.max(1,s*m+cleared),'净土豆入仓',i); }
        },
        night:{ name:'夜露草', tags:['月','水'], init:1, cap:3, sproutText:'季节轮 -1。', harvestText:'修篱；若临近换季，额外入粮。',
          async sprout(i){ state.season=Math.max(0,state.season-1); addLog('🌙 夜露草：季节轮 -1。'); render(); bump('seasonStat'); await floatPlot(i,'季节-1','blue'); },
          async harvest(i,m){ const late=state.season>=8; await gainFence(2*m,'夜露草凝露护田',i); await gainGrain((late?4:1)*m, late?'赶在换季前收露':'夜露草少量入仓',i); }
        }
      };

  return CROPS;
}

export function createHazardCatalog(effects) {
  const {
    state,
    addLog,
    render,
    floatPlot,
    damageFence,
    addHazard,
    plotName,
    mod,
    bump
  } = effects;

  const HAZARDS = {
        pest:{ name:'虫害', icon:'🐛', desc:'换季吃种子；无种伤篱笆', async act(i,h){ const eat=Math.min(state.plots[i].seeds,h.pressure); state.plots[i].seeds-=eat; if(eat){ addLog(`🐛 ${plotName(i)} 虫害吃掉 ${eat} 颗种子。`,'warn'); render(); await floatPlot(i,`-${eat}种`,'warn'); } const dmg=h.pressure-eat; if(dmg) await damageFence(dmg,`${plotName(i)} 虫害啃坏篱笆`,i); } },
        drought:{ name:'旱斑', icon:'☀️', desc:'换季消耗蓄水；缺水伤篱笆', async act(i,h){ const p=state.plots[i]; const use=Math.min(p.water,h.pressure); p.water-=use; if(use){ addLog(`☀️ ${plotName(i)} 旱斑被蓄水抵消 ${use}。`,'good'); render(); await floatPlot(i,`蓄水-${use}`,'blue'); } const dmg=h.pressure-use; if(dmg) await damageFence(dmg,`${plotName(i)} 旱情裂开田埂`,i); } },
        bird:{ name:'鸟群', icon:'🐦', desc:'换季偷粮，可被稻草人抵消', async act(i,h){ let steal=h.pressure*2; const block=Math.min(steal,state.birdGuard); state.birdGuard-=block; steal-=block; if(block){ addLog(`🪶 稻草人抵消鸟害 ${block}。`,'good'); render(); await floatPlot(i,`挡${block}`,'good'); } if(steal>0){ state.grain=Math.max(0,state.grain-steal); addLog(`🐦 鸟群偷走 ${steal} 粮。`,'bad'); render(); bump('grainStat'); await floatPlot(i,`-${steal}粮`,'bad'); } } },
        weed:{ name:'杂草', icon:'🌿', desc:'占容量；换季向下一垄扩散', async act(i,h){ const next=mod(i+1,6); await addHazard(next,'weed',1,true); addLog(`🌿 ${plotName(i)} 杂草向 ${plotName(next)} 蔓延。`,'warn'); } },
        frost:{ name:'霜冻', icon:'❄️', desc:'换季冻掉种子', async act(i,h){ const lose=Math.min(state.plots[i].seeds,h.pressure); state.plots[i].seeds-=lose; if(lose){ addLog(`❄️ ${plotName(i)} 霜冻冻掉 ${lose} 颗种子。`,'warn'); render(); await floatPlot(i,`-${lose}种`,'warn'); } else await damageFence(1,`${plotName(i)} 霜冻压坏空田`,i); } },
        mold:{ name:'霉病', icon:'🦠', desc:'换季增加腐烂；腐烂过多伤篱笆', async act(i,h){ state.rot+=h.pressure; addLog(`🦠 ${plotName(i)} 霉病让腐烂 +${h.pressure}。`,'warn'); render(); bump('ecoStat'); await floatPlot(i,`腐+${h.pressure}`,'warn'); if(state.rot>=6){ await damageFence(1,'腐烂堆积过多',i); state.rot=4; render(); } } }
      };

  return HAZARDS;
}

export const TOOLS = {
      emptySickle:{name:'空仓镰', desc:'空垄收成额外 +1 次。'},
      sunshade:{name:'日影伞', desc:'每次播种前 2 颗不推进季节轮。'},
      rake:{name:'铁齿耙', desc:'每季前 3 次烂根不伤篱笆，改为粮仓 +2。'},
      well:{name:'深井', desc:'每次清空起点垄，篱笆 +1。'},
      hive:{name:'蜂箱', desc:'每 3 次花类收成，所有垄各添 1 种。'},
      wheel:{name:'旧水车', desc:'正好播 4 颗时，收成额外 +1 次。'},
      rotation:{name:'轮作册', desc:'连续收成不同主标签时，粮仓 +2。'},
      cellar:{name:'地窖', desc:'每季开始保留 4 点粮仓底数。'}
    };

export const TUTORIAL_DECK = ['wheat','lotus','chrysanthemum','honey','scarecrow','mushroom','pea','melon','buckwheat','cleanbean','night'];

export const REGULAR_DECK = ['wheat','wheat','lotus','chrysanthemum','honey','scarecrow','mushroom','pea','melon','buckwheat','cleanbean','night'];

export const HAZARD_IDS = ['pest','drought','bird','weed','frost','mold'];

export const TUTORIAL_PLOTS = [
  {crop:'wheat',seeds:2,water:0,hazard:null},
  {crop:'lotus',seeds:1,water:0,hazard:{type:'drought',pressure:1,frozen:false}},
  {crop:'chrysanthemum',seeds:0,water:0,hazard:{type:'pest',pressure:1,frozen:false}},
  {crop:'scarecrow',seeds:1,water:0,hazard:{type:'bird',pressure:1,frozen:false}},
  {crop:'honey',seeds:1,water:0,hazard:null},
  {crop:'pea',seeds:2,water:0,hazard:{type:'weed',pressure:1,frozen:false}}
];

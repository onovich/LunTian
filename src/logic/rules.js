export const STEP = 360;

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const mod = (n, m) => ((n % m) + m) % m;
export const rand = arr => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = arr => {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
export const uniq = arr => [...new Set(arr)];

export function createInitialState() {
  return {
    tutorial: true,
    tutorialStep: 0,
    stage: 0,
    grain: 0,
    target: 14,
    fence: 10,
    maxFence: 10,
    season: 0,
    seasonMax: 10,
    rot: 0,
    bees: 0,
    birdGuard: 0,
    flowerHarvests: 0,
    rakeCharges: 0,
    deck: [],
    discard: [],
    plots: [],
    tools: [],
    selected: null,
    direction: 1,
    logs: [],
    rewards: [],
    harvestedTags: [],
    runOver: false,
    resolving: false
  };
}

export function calculatePreview({ start, state, effectiveCap, hasTool }) {
  if (start === null || start === undefined || state.plots[start].seeds <= 0) return null;

  const count = state.plots[start].seeds;
  const simSeeds = state.plots.map(plot => plot.seeds);
  simSeeds[start] = 0;

  const route = [];
  const overflow = [];
  let last = null;
  let lastWasEmpty = false;
  let seasonGain = 0;

  for (let k = 1; k <= count; k += 1) {
    const i = mod(start + state.direction * k, 6);
    const wasEmpty = simSeeds[i] === 0;
    const cap = effectiveCap(i);

    if (simSeeds[i] + 1 > cap) overflow.push(i);
    else simSeeds[i] += 1;

    route.push(i);
    last = i;
    if (k === count) lastWasEmpty = wasEmpty;
    if (!(hasTool('sunshade') && k <= 2)) seasonGain += 1;
  }

  let mult = 1 + (lastWasEmpty ? 1 : 0);
  if (hasTool('emptySickle') && lastWasEmpty) mult += 1;
  if (hasTool('wheel') && count === 4) mult += 1;

  const seasonTotal = state.season + seasonGain;
  return {
    start,
    count,
    route,
    last,
    lastWasEmpty,
    overflow,
    seasonGain,
    seasonAfter: seasonTotal % state.seasonMax,
    disasters: Math.floor(seasonTotal / state.seasonMax),
    mult
  };
}

export function scorePreview(preview) {
  return preview.mult * 5
    + preview.route.length
    - preview.overflow.length * 5
    - preview.disasters * 5
    + (preview.lastWasEmpty ? 4 : 0);
}

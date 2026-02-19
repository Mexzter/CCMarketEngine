const {
  TICK_MS,
  TICKS_PER_SECOND,
  VOLATILITY,
  BTC_ANCHOR_WEIGHT,
  SUN_BTC_RATIO,
  BAND,
} = require("../../config");

const state               = require("./state");
const { getSeededReturn } = require("./math");
const { startBtcFeed }    = require("./btcFeed");

// ── Regime ────────────────────────────────────────────────────────────────────
// Controls directional bias (bull / bear / neutral).

function updateRegime() {
  state.regimeTicks--;

  if (state.regimeTicks <= 0) {
    const roll = Math.random();

    if (roll < 0.35) {
      state.regime       = "bull";
      state.regimeTarget = 0.00008 + Math.random() * 0.00012;
      state.regimeTicks  = Math.floor((10 + Math.random() * 170) * TICKS_PER_SECOND);
    } else if (roll < 0.70) {
      state.regime       = "bear";
      state.regimeTarget = -(0.00008 + Math.random() * 0.00012);
      state.regimeTicks  = Math.floor((10 + Math.random() * 170) * TICKS_PER_SECOND);
    } else {
      state.regime       = "neutral";
      state.regimeTarget = (Math.random() - 0.5) * 0.00006;
      state.regimeTicks  = Math.floor((5 + Math.random() * 40) * TICKS_PER_SECOND);
    }

    console.log(
      `[regime] ${state.regime}  bias=${state.regimeTarget.toFixed(6)}  ` +
      `dur=${(state.regimeTicks / TICKS_PER_SECOND).toFixed(1)}s`
    );
  }

  // Smooth bias toward target (~1s to converge at 0.005/tick)
  state.regimeBias += (state.regimeTarget - state.regimeBias) * 0.005;

  // Rare intra-regime jolt (~1 per 50s)
  if (Math.random() < 0.0001) {
    state.regimeBias *= -(0.3 + Math.random() * 0.7);
  }
}

// ── Shock ─────────────────────────────────────────────────────────────────────
// Sudden 1%-5% price jumps, roughly once every 30 seconds.

function getShock() {
  if (state.shockCooldown > 0) {
    state.shockCooldown--;
    return 0;
  }

  if (Math.random() < 0.00017) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const magnitude = 0.01 + Math.random() * 0.04;
    state.shockCooldown = Math.floor((15 + Math.random() * 45) * TICKS_PER_SECOND);
    console.log(`[shock] ${direction > 0 ? "up" : "down"} ${(magnitude * 100).toFixed(2)}%`);
    return direction * magnitude;
  }

  return 0;
}

// ── Tick ──────────────────────────────────────────────────────────────────────

function tick() {
  if (state.btcPrice === null) return;

  const btcAnchor = state.btcPrice * SUN_BTC_RATIO;
  if (state.sunPrice === null) state.sunPrice = btcAnchor;

  updateRegime();

  const noise1 = getSeededReturn(state.seed,  state.tick, VOLATILITY);
  const noise2 = getSeededReturn(state.seed2, state.tick, VOLATILITY * 0.5);

  // Momentum: 8% autocorrelation
  state.momentum = state.momentum * 0.92 + (noise1 + noise2) * 0.08;

  const totalReturn = noise1 + noise2 + state.regimeBias + state.momentum + getShock();

  const rawNew   = state.sunPrice * (1.0 + totalReturn);
  const blended  = rawNew * (1 - BTC_ANCHOR_WEIGHT) + btcAnchor * BTC_ANCHOR_WEIGHT;
  const clamped  = Math.min(Math.max(blended, btcAnchor * (1 - BAND)), btcAnchor * (1 + BAND));
  const newPrice = Math.max(clamped, 0.000001);

  const change = ((newPrice - state.sunPrice) / state.sunPrice) * 100;
  state.sunPrice = newPrice;
  state.tick    += 1;

  if (state.tick % TICKS_PER_SECOND === 0) {
    const sign = change >= 0 ? "+" : "";
    console.log(
      `[t=${String(state.tick).padStart(7, "0")}]` +
      `  SUN $${newPrice.toFixed(6)}  ${sign}${change.toFixed(4)}%` +
      `  BTC $${state.btcPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` +
      `  [${state.regime}]`
    );
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

function getState() {
  return {
    sunPrice:    state.sunPrice,
    btcPrice:    state.btcPrice,
    tick:        state.tick,
    regime:      state.regime,
    regimeTicks: state.regimeTicks,
    timestamp:   Date.now(),
  };
}

async function start() {
  console.log(`[engine] starting — tick: ${TICK_MS}ms, vol: ${VOLATILITY}, band: +/-${BAND * 100}%`);

  state.regime       = "neutral";
  state.regimeTarget = 0.0;
  state.regimeTicks  = Math.floor(10 * TICKS_PER_SECOND);

  await startBtcFeed();

  tick();
  setInterval(tick, TICK_MS);
}

module.exports = { start, getState };

// Engine configuration
// Adjust these values to tune the market simulation behaviour.

const TICK_MS           = 5;             // Interval between ticks in ms (200 ticks/sec)
const TICKS_PER_SECOND  = 1000 / TICK_MS; // 200

const VOLATILITY        = 0.0100;        // Per-tick base noise amplitude
const BTC_ANCHOR_WEIGHT = 0.00002;       // Pull toward BTC-derived fair value per tick
const SUN_BTC_RATIO     = 0.00001;       // SUN price as a fraction of BTC price
const BAND              = 5.0;           // Safety clamp: +/- 500% of BTC anchor

module.exports = {
  TICK_MS,
  TICKS_PER_SECOND,
  VOLATILITY,
  BTC_ANCHOR_WEIGHT,
  SUN_BTC_RATIO,
  BAND,
};

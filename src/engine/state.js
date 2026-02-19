const { randomBytes } = require("crypto");

// Shared mutable engine state — mutated in-place by all engine modules.
const state = {
  sunPrice:      null,
  btcPrice:      null,

  tick:          0,
  seed:          randomBytes(32).toString("hex"),
  seed2:         randomBytes(32).toString("hex"),

  regime:        "neutral",
  regimeBias:    0.0,
  regimeTarget:  0.0,
  regimeTicks:   0,

  shockCooldown: 0,
  momentum:      0.0,
};

module.exports = state;

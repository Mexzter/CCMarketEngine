const { Router } = require("express");
const engine = require("../../../engine");

const router = Router();

// Supported symbols — add new ones here as the engine supports more assets.
const SYMBOLS = {
  SUNUSDT: (s) => s.sunPrice,
  BTCUSDT: (s) => s.btcPrice,
};

/**
 * GET /api/v1/ticker/price?symbol=SUNUSDT
 *
 * Returns the current price for the requested symbol.
 */
router.get("/price", (req, res) => {
  const symbol = (req.query.symbol || "").toUpperCase();

  if (!symbol) {
    return res.status(400).json({ error: "Missing required query parameter: symbol" });
  }

  const resolver = SYMBOLS[symbol];
  if (!resolver) {
    return res.status(404).json({
      error: `Symbol '${symbol}' not found. Supported: ${Object.keys(SYMBOLS).join(", ")}`,
    });
  }

  const snapshot = engine.getState();
  const price    = resolver(snapshot);

  if (price === null) {
    return res.status(503).json({ error: "Price not yet available — engine is still initialising." });
  }

  return res.json({ symbol, price: price.toString(), timestamp: snapshot.timestamp });
});

/**
 * GET /api/v1/ticker/state
 *
 * Returns the full engine state snapshot.
 */
router.get("/state", (req, res) => {
  const snapshot = engine.getState();

  if (snapshot.sunPrice === null) {
    return res.status(503).json({ error: "Engine is still initialising." });
  }

  return res.json(snapshot);
});

module.exports = router;

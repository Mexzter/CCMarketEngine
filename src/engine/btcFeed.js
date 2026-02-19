const state = require("./state");

const BINANCE_URL         = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
const REFRESH_INTERVAL_MS = 60_000;

async function fetchBtcPrice() {
  try {
    const res  = await fetch(BINANCE_URL);
    const data = await res.json();
    state.btcPrice = parseFloat(data.price);
    console.log(`[btc] $${state.btcPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  } catch (err) {
    console.warn("[btc] Failed to fetch price:", err.message);
  }
}

async function startBtcFeed() {
  await fetchBtcPrice();
  setInterval(fetchBtcPrice, REFRESH_INTERVAL_MS);
}

module.exports = { startBtcFeed };

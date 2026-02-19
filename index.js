const app    = require("./src/app");
const engine = require("./src/engine");

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] GET http://localhost:${PORT}/api/v1/ticker/price?symbol=SUNUSDT`);
  console.log(`[server] GET http://localhost:${PORT}/api/v1/ticker/price?symbol=BTCUSDT`);
  console.log(`[server] GET http://localhost:${PORT}/api/v1/ticker/state`);

  await engine.start();
});

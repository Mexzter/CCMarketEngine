const express   = require("express");
const apiRouter = require("./routes/api");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

// 404 — no route matched
app.use("/{*path}", (req, res) => {
  res.status(404).json({ error: `Route '${req.method} ${req.path}' not found` });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[express] unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;

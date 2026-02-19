const { Router } = require("express");
const tickerRouter = require("./ticker");

const router = Router();

router.use("/ticker", tickerRouter);

module.exports = router;

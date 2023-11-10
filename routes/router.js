const express = require("express");
const userRouter = require("./users");
const cardRouter = require("./cards");
// const { userRouter } = require('../routes/users')

const router = express.Router();
router.use("/users", userRouter);
router.use("/cards", cardRouter);

module.exports = router;

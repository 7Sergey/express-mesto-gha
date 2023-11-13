const { NOT_FOUND_ERROR_CODE } = require("../constants/constants");
const express = require("express");
const userRouter = require("./users");
const cardRouter = require("./cards");
// const { userRouter } = require('../routes/users')

const router = express.Router();
router.use("/users", userRouter);
router.use("/cards", cardRouter);

router.use((req, res) => {
  res
    .status(NOT_FOUND_ERROR_CODE)
    .send({ message: "Такой страницы не сущетвует" });
});

module.exports = router;

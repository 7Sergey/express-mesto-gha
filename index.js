const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/router.js");

const app = express();
mongoose.connect("mongodb://127.0.0.1:27017/mestodb");

app.use((req, res, next) => {
  req.user = {
    _id: "654cac1196a81353cc9ac25d", // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use(express.json()); //метод обогащает последующие роуты body

app.use(router);

app.listen(3000, () => {
  console.log("Сервер запущен");
});

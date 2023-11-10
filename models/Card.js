const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    name: {
      // у пользователя есть имя — опишем требования к имени в схеме:
      type: String, // имя — это строка
      required: true, // оно должно быть у каждого пользователя, так что имя — обязательное поле
      minlength: 2, // минимальная длина имени — 2 символа
      maxlength: 30, // а максимальная — 30 символов
    },
    link: {
      //описание
      type: String,
      required: true, // оно должно быть у каждого пользователя, так что имя — обязательное поле
    },
    owner: {
      //владелец корточки
      type: String,
      required: true,
    },
    likes: {
      //лайкнувшие
      type: Array,
      required: true,
      default: [],
    },
    createdAt: {
      //дата создания
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false, //не отслеживать версию схемы во время создания карточки
    timestamps: true, //время создания.
  }
);

module.exports = mongoose.model("card", cardSchema);

const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String, // имя — это строка
      required: true, // оно должно быть у каждого пользователя, так что имя — обязательное поле
      minlength: 2, // минимальная длина имени — 2 символа
      maxlength: 30, // а максимальная — 30 символов
    },
    link: {
      type: String,
      required: true, // оно должно быть у каждого пользователя, так что имя — обязательное поле
    },
    owner: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      required: true,
      default: [],
    },
    createdAt: {
      //  дата создания
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false, // не отслеживать версию схемы во время создания карточки
    timestamps: true, //  время создания.
  },
)

module.exports = mongoose.model('card', cardSchema)

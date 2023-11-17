const mongoose = require('mongoose')
const { default: isEmail } = require('validator/lib/isEmail')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, // имя — это строка
      minlength: 2, // минимальная длина имени — 2 символа
      maxlength: 30, // а максимальная — 30 символов
      default: 'Жак-Ив Кусто',
    },
    about: {
      //  описание
      type: String,
      minlength: 2, // минимальная длина имени — 2 символа
      maxlength: 30, // а максимальная — 30 символов
      default: 'Исследователь',
    },

    avatar: {
      //  аватар
      type: String,
      default:
        'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    },
    email: {
      type: String,
      unique: true,
      required: true,
      minlength: 8,
      // валидация поля email
      validate: {
        validator: (v) => isEmail(v),
        message: 'Некорректный формат email',
      },
    },
    password: {
      //  пароль
      type: String,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false, // не отслеживать версию схемы во время создания карточки
    timestamps: true, //  время создания.
  },
)

module.exports = mongoose.model('user', userSchema)

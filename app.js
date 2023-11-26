const express = require('express')
const mongoose = require('mongoose')
const { errors } = require('celebrate')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')

const router = require('./routes/router')
const {
  CLIENT_ERROR_CODE,
  MONGO_DUPLICATE_ERROR_CODE,
  CONFLICT_ERROR_CODE,
} = require('./constants/constants')

require('dotenv').config() // Подключаем переменные окружения из файла .env

const app = express()
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Максимальное количество запросов за указанный период
  message: 'Превышен лимит запросов, пожалуйста, подождите некоторое время.',
})

// Подключаем rate limiter к всем запросам
app.use(limiter)
mongoose.connect('mongodb://127.0.0.1:27017/mestodb')
// Набор middleware функций для express, который помогает защитить ваше приложение Node.js от уязвимостей и кибератак, включая CSRF, XSS и другие.
app.use(helmet())

app.use(express.json()) // метод обогащает последующие роуты body
app.use(cookieParser())
app.use(router)

app.use(errors()) // обработчик ошибок Celebrate

// Централизованный обработчик ошибок
// игнорируем ошибку eslint о неиспользованном аргументе
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = error
  // проверка на ошибки

  if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
    return res
      .status(CONFLICT_ERROR_CODE)
      .send({ message: 'Такой пользователь уже существует' })
  }
  if (error.name === 'CastError') {
    return res
      .status(CLIENT_ERROR_CODE)
      .send({ message: 'Ошибка валидации полей' })
  }

  if (error.name === 'ValidationError') {
    return res
      .status(CLIENT_ERROR_CODE)
      .send({ message: 'Ошибка валидации полей' })
  }
  if (error.name === 'ValidationError') {
    return res
      .status(CLIENT_ERROR_CODE)
      .send({ message: 'Ошибка валидации полей' })
  }

  return res.status(statusCode).send({
    // проверяем статус и выставляем сообщение в зависимости от него
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  })
})
app.listen(3000, () => {
  console.log('Сервер запущен')
})

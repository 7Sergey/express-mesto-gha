const express = require('express')
const mongoose = require('mongoose')
const { errors } = require('celebrate')

const cookieParser = require('cookie-parser')

const router = require('./routes/router')

require('dotenv').config() // Подключаем переменные окружения из файла .env

const app = express()
// const { MONGO_URL } = process.env
mongoose.connect('mongodb://127.0.0.1:27017/mestodb')

app.use(express.json()) // метод обогащает последующие роуты body
app.use(cookieParser())
app.use(router)

app.use(errors()) // обработчик ошибок celebrate

app.listen(3000, () => {
  console.log('Сервер запущен')
})

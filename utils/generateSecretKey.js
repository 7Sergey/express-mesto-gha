// generateSecretKey.js
const crypto = require('crypto')

const generateRandomKey = () => {
  return crypto.randomBytes(32).toString('hex')
}

const secretKey = generateRandomKey()
console.log('Секретный ключ:', secretKey)

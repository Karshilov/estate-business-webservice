//@ts-check
const { Pool } = require('pg')
const secret = require('./postgre-secret')

let connectionPool = null

module.exports = {
  async connect() {
    if (!connectionPool) {
      connectionPool = new Pool(secret.info)
    }
    return await connectionPool.connect()
  }
}
const Redis = require("ioredis")
const conf = require('../sdk/sdk.json').redis
const redis = new Redis(conf)

module.exports = async (ctx, next) => {
  ctx.redis = redis
  await next()
}
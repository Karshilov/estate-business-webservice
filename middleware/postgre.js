//@ts-check
const pg = require('../database/postgre')

module.exports = async (ctx, next) => {
  ctx.db = await pg.connect()
  try {
    await next()
  } finally {
    await ctx.db.release()
  }
}
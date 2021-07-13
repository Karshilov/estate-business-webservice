//@ts-check
const pg = require('../database/postgre')

module.exports = async (ctx, next) => {
  try {
    ctx.db = await pg.connect()
  } catch (e) {
    console.log(e)
  }
  console.log('db connected')
  try {
    await next()
  } finally {
    await ctx.db.end()
  }
}
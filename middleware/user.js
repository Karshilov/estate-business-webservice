module.exports = async (ctx, next) => {
  ctx.userHelper = {
    getUserById: async (id) => {
      let records = await ctx.db.query(`
        SELECT USERNAME, AVATAR, NICKNAME
        FROM ESTATE_USER
        WHERE ID = $1
      `, [id])
      if (records.rows.length !== 1) {
        throw '查找失败'
      }
      return records.rows[0]
    }
  }
  console.log('user finded')
  await next()
}
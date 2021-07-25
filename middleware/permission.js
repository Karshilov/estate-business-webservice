module.exports = async (ctx, next) => {
  ctx.perms = {
    getPerm: async (userid) => {
      let records = await ctx.db.query(`
        SELECT ER.ALTER_NAME
        FROM ESTATE_USER_ROLE EUR
        INNER JOIN ESTATE_ROLE ER on ER.ID = EUR.ROLEID
        WHERE EUR.USERID = $1
      `, [userid])
      if (records.rows.length > 0) {
        return records.rows[0]['alter_name']
      }
      return 'unknown'
    },
    hasPermOnTeam: async (userid, teamid) => {
      // 只有团队创建人和管理员有权限
      let records = await ctx.db.query(`
        SELECT ER.ALTER_NAME
        FROM ESTATE_USER_ROLE EUR
        INNER JOIN ESTATE_ROLE ER on ER.ID = EUR.ROLEID
        WHERE EUR.USERID = $1
      `, [userid])
      if (records.rows.length === 0 || records.rows[0]['teamid'] === 'client') {
        return false
      }
      if (records.rows[0]['alter_name'] === 'admin') {
        return true
      }
      // 判断是否为团队创建人
      let ownTeam = await ctx.db.query(`
        SELECT COUNT(*)
        FROM ESTATE_TEAM
        WHERE LEADER_ID = $1 AND ID = $2
      `, [userid, teamid])
      return ownTeam.rows[0]['count'] === '1'
    }
  }
  await next()
}
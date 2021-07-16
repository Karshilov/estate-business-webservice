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
        SELECT ER.ALTER_NAME, EUR.TEAMID
        FROM ESTATE_USER_ROLE EUR
        INNER JOIN ESTATE_ROLE ER on ER.ID = EUR.ROLEID
        WHERE EUR.USERID = $1
      `, [userid])
      if (records.rows.length === 0) {
        return false
      }
      let rolename = records.rows[0]['alter_name'], ownteamid = records.rows[0]['teamid']
      return rolename === 'admin' || (rolename === 'broker' && ownteamid === teamid)
    }
  }
  await next()
}
module.exports = async (ctx, next) => {
  ctx.userHelper = {
    getUserById: async (id) => {
      let records = await ctx.db.query(`
        SELECT USERNAME, AVATAR, NICKNAME, EMAIL, GENDER, PHONE_NUMBER
        FROM ESTATE_USER
        WHERE ID = $1
      `, [id])
      if (records.rows.length !== 1) {
        throw '查找失败'
      }
      return records.rows[0]
    },
    getTeamById: async (id) => {
      let records = await ctx.db.query(`
        SELECT EUR.TEAMID, ET.NAME, ET.LEADER_ID, ET.MEMBER_IDS
        FROM ESTATE_USER_ROLE EUR
        INNER JOIN ESTATE_TEAM ET
        ON ET.id = EUR.teamid
        WHERE EUR.userid = $1
      `, [id])
      if (records.rows.length !== 1) {
        return null
      }
      // 切分团队成员列表
      records.rows[0].member_ids = records.rows[0].member_ids.split(',')
      return records.rows[0]
    }
  }
  await next()
}
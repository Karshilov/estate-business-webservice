const moment = require('moment')
exports.route = {
  async get({user_id}) {
    if (!user_id) {
      user_id = this.user.id
    }
    try {
      let result = await this.db.query(`
        SELECT *
        FROM ESTATE_JOIN_TEAM
        WHERE USER_ID = $1
      `, [user_id])
      return result.rows
    } catch (e) {
      throw '数据库异常'
    }
  },
  async post({team_id}) {
    if (!team_id) {
      throw '团队不存在'
    }
    let now = moment().format('X')
    // 判断是否有团队
    let curTeam = await this.userHelper.getTeamById(this.user.id)
    if (curTeam) {
      throw '已加入团队'
    }
    let apply_info = await this.db.query(`
      SELECT ID
      FROM ESTATE_JOIN_TEAM
      WHERE TEAM_ID = $1 AND USER_ID = $2
    `, [team_id, this.user.id])
    //判断是否提交过申请  
    if (apply_info.rows.length !== 0) {
      throw '重复提交'
    }
    try {
      await this.db.query(`
        INSERT INTO ESTATE_JOIN_TEAM
        (TEAM_ID, USER_ID, CREATE_DATE)
        VALUES($1, $2, $3)
      `, [team_id, this.user.id, now])
    } catch (e) {
      throw '数据库错误'
    }
    return '申请成功'
  },
  async delete({team_id}) {
    try {
      var result = await this.db.query(`
        DELETE FROM ESTATE_JOIN_TEAM
        WHERE TEAM_ID = $1 AND USER_ID = $2
      `, [team_id, this.user.id])
    } catch (e) {
      throw '数据库错误'
    }
    if (result.rowCount === 0) {
      throw '申请不存在'
    }
    return '撤销成功'
  }
}
const moment = require('moment')
exports.route = {
  async post({team_id}) {
    if (!team_id) {
      throw '团队不存在'
    }
    let now = moment().format('X')
    try {
      // 判断是否有团队
      let curTeam = await this.userHelper.getTeamById(team_id)
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
        return '您已经申请过加入，请勿再次提交'
      }

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
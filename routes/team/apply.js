const moment = require('moment')

exports.route = {
  async get({team_id}) {
    // let now = moment().format('X')
    try {
      var user_ids = (await this.db.query(`
        SELECT ID,USER_ID,CREATE_DATE
        FROM ESTATE_JOIN_TEAM
        WHERE TEAM_ID = $1 AND APPLY_STATUS = 0
      `, [team_id])).rows
      // console.log(user_ids.rows[0].id)
    } catch (e) {
      throw '数据库错误'
    }
    // console.log('length',user_ids.rows.length)
    for (let i = 0; i < user_ids.length; i++) {
      user_ids[i].user = await this.userHelper.getUserById(user_ids[i].user_id)
      user_ids[i].user.id = user_ids[i].user_id
      user_ids[i].user.avatar = await this.genGetURL('avatar', user_ids[i].user.avatar)
      user_ids[i].user_id = undefined
    }
    return user_ids
  },

  async post({application_id, approve, reason}) {
    let {team_id, user_id} = (await this.db.query(`
      SELECT TEAM_ID, USER_ID
      FROM ESTATE_JOIN_TEAM
      WHERE ID = $1
    `, [application_id])).rows[0]
    if (!await this.perms.hasPermOnTeam(this.user.id, team_id)) {
      throw '权限不足'
    }
    if (approve) {
      // 接受申请
      // 判断成员是否加入团队
      if (await this.userHelper.getTeamById(user_id)) {
        throw '用户已加入团队'
      }
      let now = moment().format('X')
      try {
        let ids = await this.db.query(`
          SELECT MEMBER_IDS
          FROM ESTATE_TEAM
          WHERE ID = $1
        `, [team_id])
        // 增加团队成员
        await this.db.query(`
          UPDATE ESTATE_TEAM
          SET MEMBER_IDS = $1
          WHERE ID = $2
        `, [user_id + ',' + ids.rows[0].member_ids, team_id])
        // 设置成员所属团队
        await this.db.query(`
          UPDATE ESTATE_USER_ROLE
          SET TEAMID = $1
          WHERE USERID = $2
        `, [team_id, user_id])
        // 更改审核记录
        await this.db.query(`
          UPDATE ESTATE_JOIN_TEAM
          SET APPLY_STATUS = 1, REASON = $2, ACCEPT_DATE = $3
          WHERE ID = $1
        `, [application_id, null, now])
      } catch (e) {
        console.log(e)
        throw '审核失败'
      }
    } else {
      //拒绝申请
      await this.db.query(`
          UPDATE ESTATE_JOIN_TEAM
          SET APPLY_STATUS = -1, REASON = $2
          WHERE ID = $1
        `, [application_id, reason])
    }
    return '审核成功'
  }
}
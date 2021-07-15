const moment = require('moment')
exports.route = {
  async post({name}) {
    // 未提供名称时显示所有
    if (!name) {
      throw '团队不存在'
    }
    let now = moment().format('X')
    try {
      let team_id = await this.db.query(`
        SELECT ID
        FROM ESTATE_TEAM
        WHERE NAME = $1
      `, [name])
      console.log(team_id.rows[0].id)
      let apply_info = await this.db.query(`
        SELECT ID
        FROM ESTATE_JOIN_TEAM
        WHERE TEAM_ID = $1 AND USER_ID = $2
    `, [team_id.rows[0].id,this.user.id])
      if(apply_info.rows.length!=0){//判断是否提交过申请
        return '您已经申请过加入，请勿再次提交'
      }

      await this.db.query(`
        INSERT INTO ESTATE_JOIN_TEAM
        (TEAM_ID,USER_ID,CREATE_DATE,APPLY_STATUS)
        VALUES($1,$2,$3,$4)
      `, [team_id.rows[0].id,this.user.id,now,0])//申请状态设置为0 待处理

      
    } catch (e) {
      throw '数据库错误'
    }
    return '已发出加入团队申请'
  },
  async delete({team_id}) {
    console.log(team_id)
    try {
      await this.db.query(`
        DELETE FROM ESTATE_JOIN_TEAM
        WHERE TEAM_ID = $1 AND USER_ID = $2
      `, [team_id,this.user.id])
    } catch (e) {
      throw '数据库错误'
    }
    return '撤销成功'
  }
}
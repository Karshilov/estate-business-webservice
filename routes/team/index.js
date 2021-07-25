let moment = require('moment')

exports.route = {
  async get({ id }) {
    console.log(this.user.role)
    if (!id) {
      throw '缺少参数'
    }
    let record = (await this.db.query(`
      SELECT *
      FROM ESTATE_TEAM
      WHERE ID = $1
    `, [id])).rows[0]
    record.teamid = record.id
    record.id = undefined
    record.leader = await this.userHelper.getUserById(record.leader_id)
    record.leader.id = record.leader_id
    record.leader.avatar = await this.genGetURL('avatar', record.leader.avatar)
    record.leader_id = undefined
    record.member_ids = record.member_ids.split(',')
    for (let i = 0; i < record.member_ids.length; i++) {
      let user_id = record.member_ids[i]
      record.member_ids[i] = await this.userHelper.getUserById(record.member_ids[i])
      record.member_ids[i].avatar = await this.genGetURL('avatar', record.member_ids[i].avatar)
      record.member_ids[i].user_id = user_id
    }
    record.member_ids.reverse()
    return record
  },
  
  async post({name}) {
    // 仅经纪人能够使用
    if (await this.perms.getPerm(this.user.id) !== 'broker') {
      throw '没有权限'
    }
    // 判断用户是否已经有团队了
    let team = await this.userHelper.getTeamById(this.user.id)
    if (team) {
      throw '团队已存在'
    }
    let now = moment().format('X')
    try {
      // 新增团队
      await this.db.query(`
        INSERT INTO ESTATE_TEAM
        (NAME, LEADER_ID, MEMBER_IDS, CREATE_TIME)
        VALUES ($1, $2, $3, $4)
      `, [name, this.user.id, this.user.id, now])
    } catch (e) {
      console.log(e)
      throw '添加失败'
    }
    return '添加成功'
  },
  async delete({id}) {
    // 仅创建人或管理员能够使用
    if (!await this.perms.hasPermOnTeam(this.user.id, id)) {
      throw '权限不足'
    }
    // 删除加入团队的成员, 加入团队记录
    try {
      result = await this.db.query(`
        UPDATE ESTATE_USER_ROLE
        SET TEAMID = $1
        WHERE TEAMID = $2
      `, [null, id])
    } catch (e) {
      throw '删除失败'
    }
    // 删除团队
    try {
      var result = await this.db.query(`
        DELETE FROM ESTATE_TEAM
        WHERE ID = $1
      `, [id])
    } catch (e) {
      console.log(e)
      throw '团队删除失败'
    }
    if (result.rowCount === 0) {
      throw '团队不存在'
    }
    return '删除成功'
  }
}
exports.route = {
  async get({name, page_size = 10, page_num = 1}) {
    if (await this.perms.getPerm(this.user.id) === 'client') {
      throw '没有权限'
    }
    // 未提供名称时显示所有
    if (!name) {
      name = ''
    }
    name = '%' + name + '%'
    let result, total
    try {
      let cntRecords = await this.db.query(`
        SELECT COUNT(*)
        FROM ESTATE_TEAM
        WHERE STATUS = 1 AND NAME LIKE $1
      `, [name])
      total = parseInt(cntRecords.rows[0].count)

      result = await this.db.query(`
        SELECT ID, NAME, LEADER_ID, MEMBER_IDS, CREATE_TIME
        FROM ESTATE_TEAM
        WHERE STATUS = 1 AND NAME LIKE $1
        LIMIT $2 OFFSET $3
      `, [name, page_size, (page_num - 1) * page_size])
    } catch (e) {
      throw '数据库错误'
    }
    // 分割成员列表, 处理成员信息
    for (let i = 0; i < result.rows.length; i++) {
      result.rows[i].teamid = result.rows[i].id
      result.rows[i].id = undefined
      result.rows[i].leader = await this.userHelper.getUserById(result.rows[i].leader_id)
      result.rows[i].leader.user_id = result.rows[i].leader_id
      result.rows[i].leader.avatar = await this.genGetURL('avatar', result.rows[i].leader.avatar)
      result.rows[i].leader.phone_number = undefined
      result.rows[i].leader.email = undefined
      result.rows[i].leader_id = undefined
      result.rows[i].member_ids = result.rows[i].member_ids.split(',')
      for (let j = 0; j < result.rows[i].member_ids.length; j++) {
        let user_id = result.rows[i].member_ids[j]
        result.rows[i].member_ids[j] = await this.userHelper.getUserById(result.rows[i].member_ids[j])
        result.rows[i].member_ids[j].user_id = user_id
        result.rows[i].member_ids[j].avatar = await this.genGetURL('avatar', result.rows[i].member_ids[j].avatar)
        result.rows[i].member_ids[j].email = undefined
        result.rows[i].member_ids[j].phone_number = undefined
      }
    }
    return {total, list: result.rows}
  }
}
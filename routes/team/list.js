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
        WHERE STATUS != 'auditing' AND NAME LIKE $1
      `, [name])
      total = cntRecords.rows[0].count

      result = await this.db.query(`
        SELECT ID, NAME, LEADER_ID, MEMBER_IDS, COUNT
        FROM ESTATE_TEAM
        WHERE STATUS != 'auditing' AND NAME LIKE $1
        LIMIT $2 OFFSET $3
      `, [name, page_size, (page_num - 1) * page_size])
    } catch (e) {
      throw '数据库错误'
    }
    result.rows.forEach((val) => {
      val.member_ids = val.member_ids.split(',')
    })
    return {total, list: result.rows}
  }
}
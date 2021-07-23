exports.route = {
  async get({page_size, page_num}) {
    if (await this.perms.getPerm(this.user.id) !== 'admin') {
      throw '权限不足'
    }
    if (!page_size || !page_num) {
      throw '参数不全'
    }
    [page_size, page_num] = [parseInt(page_size), parseInt(page_num)]
    try {
      var cnt = await this.db.query(`
        SELECT COUNT(*)
        FROM ESTATE_RENT_DETAIL
        WHERE STATUS = 'audit'
      `)
      var records = await this.db.query(`
        SELECT *
        FROM ESTATE_RENT_DETAIL
        WHERE STATUS = 'audit'
        LIMIT $1 OFFSET $2
      `, [page_size, (page_num-1)*page_size])
    } catch (e) {
      throw '数据库异常'
    }
    return {total: cnt.rows[0].count, list: records.rows}
  },
  async post({house_id, approval, reason}) {
    if (await this.perms.getPerm(this.user.id) !== 'admin') {
      throw '权限不足'
    }
    if (!house_id || !reason) {
      throw '参数不全'
    }
    let status = 'reject', results
    if (approval) {
      status = 'approve'
      reason = null
    }
    try {
      results = await this.db.query(`
        UPDATE ESTATE_RENT_DETAIL
        SET STATUS = $1, REASON = $2
        WHERE ID = $3
      `, [status, reason, house_id])
    } catch (e) {
      throw '参数异常'
    }
    if (results.rowCount !== 1) {
      throw '房源ID错误'
    }
    return '审核成功'
  }
}
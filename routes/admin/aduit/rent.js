exports.route = {
  async post({house_id, approval, reason}) {
    if (!house_id || !reason) {
      throw '参数不全'
    }
    let status = 'fail', results
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
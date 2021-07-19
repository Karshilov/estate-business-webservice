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
        FROM ESTATE_TEAM
        WHERE STATUS = 0
      `)
      var records = await this.db.query(`
        SELECT *
        FROM ESTATE_TEAM
        WHERE STATUS = 0
        LIMIT $1 OFFSET $2
      `, [page_size, (page_num-1)*page_size])
    } catch (e) {
      throw '数据库异常'
    }
    return {total: cnt.rows[0].count, list: records.rows}
  },
  async post({team_id, approval, reason}) {
    if (await this.perms.getPerm(this.user.id) !== 'admin') {
      throw '权限不足'
    }
    var result
    if (approval) {
      try {
        // 设置审核状态
        result = await this.db.query(`
          UPDATE ESTATE_TEAM
          SET STATUS = 1, REASON = $2
          WHERE ID = $1
          RETURNING LEADER_ID
        `, [team_id, null])
      } catch (e) {
        throw '修改失败'
      }
      if (result.rowCount === 0) {
        throw '团队不存在'
      }
      // 设置创始人所属团队
      await this.db.query(`
        UPDATE ESTATE_USER_ROLE
        SET TEAMID = $1
        WHERE USERID = $2
      `, [team_id, result.rows[0].leader_id])
    } else {
      try {
        result = await this.db.query(`
          UPDATE ESTATE_TEAM
          SET STATUS = -1, REASON = $2
          WHERE ID = $1
        `, [team_id, reason])
      } catch (e) {
        throw '修改失败'
      }
      if (result.rowCount === 0) {
        throw '团队不存在'
      }
    }
    return '审核成功'
  }
}
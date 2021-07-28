exports.route = {
  async get({ house_id }) {
    if (!house_id) {
      throw '缺少参数'
    }

    try {
      let records = await this.db.query(`
        SELECT ID, USER_ID, RATE_SCORE, RATE_COMMENT, CREATE_TIME, MODIFY_TIME
        FROM ESTATE_RATE
        WHERE HOUSE_ID = $1 AND HOUSE_TYPE = $2
      `, [house_id, 'rent'])
      return records.rows
    } catch (e) {
      throw '查找失败'
    }
  },
  async post({house_id, rate_score, rate_comment}) {
    if (!house_id || !rate_score) {
      throw '缺少参数'
    }

    try {
      let records = await this.db.query(`
      SELECT COUNT(*)
      FROM ESTATE_RENT_DETAIL
      WHERE ID = $1
      `, [house_id])
      if (parseInt(records.rows[0].count) === 0) {
        throw '没有房源'
      }
    } catch (e) {
      throw '没有房源'
    }
    
    let now = moment().format('X')
    try {
      await this.db.query(`
        INSERT INTO ESTATE_RATE
        (HOUSE_ID, USER_ID, HOUSE_TYPE, RATE_SCORE, RATE_COMMENT, CREATE_TIME, MODIFY_TIME)
        VALUES ($1, $2, $3, $4, $5, $6, $6)
      `, [house_id, this.user.id, 'rent', rate_score, rate_comment, now])
    } catch (e) {
      throw '增加失败'
    }
    return '增加成功'
  },
  async put({id, house_id, rate_score, rate_comment}) {
    if (!id || !house_id || !rate_score) {
      throw '缺少参数'
    }

    let now = moment().format('X'), result
    try {
      result = await this.db.query(`
        UPDATE ESTATE_RATE
        SET RATE_SCORE = $1, RATE_COMMENT = $2, MODIFY_TIME = $3
        WHERE ID = $4 AND USER_ID = $5 AND HOUSE_ID = $6
      `, [rate_score, rate_comment, now, id, this.user.id, house_id])
    } catch (e) {
      throw '修改失败'
    }
    if (result.rowCount !== 1) {
      throw '记录不存在'
    }
    return '修改成功'
  },
  async delete({id}) {
    if (!id) {
      throw '缺少参数'
    }

    let result
    try {
      result = await this.db.query(`
        DELETE FROM ESTATE_RATE
        WHERE ID = $1 AND USER_ID = $2
      `, [id, this.user.id])
    } catch (e) {
      throw '删除失败'
    }
    if (result.rowCount !== 1) {
      throw '记录不存在'
    }
    return '删除成功'
  }
}
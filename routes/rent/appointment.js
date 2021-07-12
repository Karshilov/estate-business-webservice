const moment = require('moment')

exports.route = {
  async get({ house_id }) {
    if (!house_id) {
      throw '缺少参数'
    }

    try {
      let records = await this.db.query(`
        SELECT ID, APPOINTMENT_TIME, CREATE_TIME, MODIFY_TIME
        FROM ESTATE_APPOINTMENT
        WHERE HOUSE_ID = $1 AND USER_ID = $2 AND HOUSE_TYPE = $3
      `, [house_id, this.user.id, 'rent'])
      return records.rows
    } catch (e) {
      throw '查找失败'
    }
  },
  async post({house_id, appointment_time}) {
    if (!house_id || !appointment_time) {
      throw '缺少参数'
    }

    let now = moment().format('X')
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

    try {
      await this.db.query(`
        INSERT INTO ESTATE_APPOINTMENT
        (HOUSE_ID, HOUSE_TYPE, USER_ID, APPOINTMENT_TIME, CREATE_TIME, MODIFY_TIME)
        VALUES ($1, $2, $3, $4, $5, $5)
      `, [house_id, 'rent', this.user.id, appointment_time, now])
    } catch (e) {
      console.log(e)
      throw '增加失败'
    }
    return '增加成功'
  },
  async put({id, house_id, appointment_time}) {
    if (!id || !house_id || !appointment_time) {
      throw '缺少参数'
    }

    let now = moment().format('X'), result
    try {
      result = await this.db.query(`
        UPDATE ESTATE_APPOINTMENT
        SET APPOINTMENT_TIME = $1, MODIFY_TIME = $2
        WHERE ID = $3 AND USER_ID = $4 AND HOUSE_ID = $5
      `, [appointment_time, now, id, this.user.id, house_id])
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
        DELETE FROM ESTATE_APPOINTMENT
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
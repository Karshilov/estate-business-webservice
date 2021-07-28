const moment = require('moment')

exports.route = {
  async post({house_id}) {
    if (!house_id) {
      throw '缺少参数'
    }
    let now = moment().format('X')
    try {
      await this.db.query(`
        INSERT INTO ESTATE_VR_APPOINTMENT
        (HOUSE_ID, CREATE_TIME)
        VALUES ($1, $2)
      `, [house_id, now])
      return '增加成功'
    } catch (e) {
      console.log(e)
      throw '增加失败'
    }
  }
}
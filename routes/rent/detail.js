const moment = require('moment')

exports.route = {
  async get({ id }) {
    if (!id) {
      throw '缺少参数'
    }
    let record = await this.db.query(`
      SELECT *
      FROM ESTATE_RENT_DETAIL
      WHERE ID = $1
    `, [id])
    if (record.rows.length === 0) {
      throw '找不到房源'
    } else if (record.rows.length > 1) {
      throw 'ID异常'
    }
    record = record.rows[0]
    // 获取用户信息
    record.owner = await this.userHelper.getUserById(record.owner)
    // 获取用户头像URL
    record.owner.avatar = await this.genGetURL('avatar', record.owner.avatar)
    // 分割features
    record.features = record.features.split(',')
    // 解析图片URL
    record.photos = record.photos.split(',')
    for (let i = 0; i < record.photos.length; i++) {
      record.photos[i] = await this.genGetURL('house', record.photos[i])
    }
    return record
  },
  async post({title, photos, area, floor, total_floor, 
    price, house_type, decoration, features, neighbourhood, 
    city, rent_type, equipments}) {
    let now = moment().format('X')
    // 转为逗号分隔
    photos = photos.toString()
    features = features.toString()
    try {
      await this.db.query(`
        INSERT INTO ESTATE_RENT_DETAIL
        (TITLE, PHOTOS, AREA, CREATE_TIME, FLOOR, TOTAL_FLOOR,
        PRICE, OWNER, HOUSE_TYPE, DECORATION, FEATURES, NEIGHBOURHOOD,
        CITY, LAST_MODIFY_TIME, RENT_TYPE, EQUIPMENTS)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $4, $14, $15)
      `, [title, photos, area, now, floor, total_floor, price, this.user.id, house_type, 
        decoration, features, neighbourhood, city, rent_type, equipments])
    } catch (e) {
      console.log(e)
      throw '添加失败'
    }
    return '添加成功'
  }
}
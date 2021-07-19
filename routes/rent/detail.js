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
    let userid = record.owner
    record.owner = await this.userHelper.getUserById(userid)
    record.owner.userid = userid
    // 获取用户身份
    record.owner.role = await this.perms.getPerm(userid)
    // 去除用户信息中联系方式等信息
    record.owner.email = record.owner.phone_number = undefined
    // 对于经纪人，增加团队信息
    if (await this.perms.getPerm(this.user.id) === 'broker') {
      record.owner.team = await this.userHelper.getTeamById(this.user.id)
      // 删除团队领导和成员信息
      if (record.owner.team) {
        record.owner.team.leader_id = undefined
        record.owner.team.member_ids = undefined
      }
    }
    // 获取用户头像URL
    record.owner.avatar = await this.genGetURL('avatar', record.owner.avatar)
    // 分割features
    record.features = record.features.split(',')
    // 解析图片URL
    if (record.photos) {
      record.photos = record.photos.split(',')
      for (let i = 0; i < record.photos.length; i++) {
        record.photos[i] = await this.genGetURL('house', record.photos[i])
      }
    } else {
      // 模拟图片
      record.photos = [await this.genGetURL('house', 'foobar1.jpg'), await this.genGetURL('house', 'foobar2.jpg')]
    }
    // 记录用户访问的房源
    await this.db.query(`
      INSERT INTO ESTATE_VIEW_HISTORY
      (USERID, HOUSE_TYPE, HOUSE_ID)
      VALUES ($1, $2, $3)
    `, [this.user.id, 'rent', id])
    // 更新热度记录
    try {
      await this.db.query(`
        UPDATE ESTATE_RENT_DETAIL
        SET HOT = $1
        WHERE ID = $2
      `, [record.hot + 1, record.id])
    } catch (e) {
      console.log(e)
      throw e
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
  },

  async put({id,title, photos, area, floor, total_floor, 
    price, house_type, decoration, features, neighbourhood, 
    city, rent_type, equipments}) {
    let now = moment().format('X')
    photos = photos.toString()
    features = features.toString()
    try {
      await this.db.query(`
        UPDATE ESTATE_RENT_DETAIL
        SET 
          TITLE = $1, 
          PHOTOS = $2, 
          AREA = $3, 
          FLOOR = $4, 
          TOTAL_FLOOR = $5,
          PRICE = $6, 
          OWNER = $7, 
          HOUSE_TYPE = $8, 
          DECORATION = $9, 
          FEATURES = $10, 
          NEIGHBOURHOOD = $11,
          CITY = $12, 
          LAST_MODIFY_TIME = $13, 
          RENT_TYPE = $14, 
          EQUIPMENTS = $15       
        WHERE   
          ID = $16
      `, [title, photos, area,  floor, total_floor, price, this.user.id, house_type, 
        decoration, features, neighbourhood, city, now, rent_type, equipments, id])
    } catch (e) {
      console.log(e)
      throw '修改失败'
    }
    return '修改成功'
  },

  async delete({id}) {
    try {
      await this.db.query(`
        DELETE FROM ESTATE_RENT_DETAIL
        WHERE ID = $1
      `, [id])
    } catch (e) {
      console.log(e)
      throw '删除失败'
    }
    return '删除成功'
  }
}
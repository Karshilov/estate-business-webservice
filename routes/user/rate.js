exports.route = {
  async get({id, page_num, page_size}) {
    if (!page_num || !page_size) {
      throw '参数不全'
    }
    if(!id){//不填id 默认查看用户自己的预约信息
      id = this.user.id
    }
    let cnt = await this.db.query(`
      SELECT COUNT(*)
      FROM ESTATE_RATE
      WHERE USER_ID = $1
    `, [id])
    if (cnt.rows[0].count === '0') {
      return {total: 0, list: []}
    }
    let userCommentInfo
    try {
      userCommentInfo = await this.db.query(`
        SELECT HOUSE_ID, RATE_SCORE, RATE_COMMENT, CREATE_TIME, MODIFY_TIME
        FROM ESTATE_RATE
        WHERE USER_ID = $1
      `, [id])
    } catch (e) {
      throw '数据库异常'
    }
    let result = []
    if(!result){
      return '不存在'
    }
    for (let {house_id, rate_score, rate_comment, create_time, modify_time} of userCommentInfo.rows) {
      let record = await this.db.query(`
        SELECT ID, TITLE, PHOTOS, AREA, FEATURES, FEATURES, FLOOR, TOTAL_FLOOR
        FROM ESTATE_RENT_DETAIL
        WHERE ID = $1
      `, [house_id])
      record.rows[0].features = record.rows[0].features.split(',')
      if (!record.rows[0].photos) {
        record.rows[0].cover = await this.genGetURL('house', 'foobar1.jpg')
      } else {
        record.rows[0].cover = await this.genGetURL('house', record.rows[0].photos.split(',')[0])
      }
      record.rows[0].photos = undefined
      record.rows[0].rate_score = rate_score
      record.rows[0].rate_comment = rate_comment
      record.rows[0].modify_time = modify_time
      record.rows[0].create_time = create_time
      result.push(record.rows[0])
    }
    return {total: cnt.rows[0].count, list: result}
  },
  async post({house_id, appointment_time}) {
    let now = moment().format('X')
    // 转为逗号分隔
    try {
      await this.db.query(`
        INSERT INTO ESTATE_APPOINTMENT
        (HOUSE_ID,USER_ID,APPOINT_TIME,CREATE_TIME,MODIFY_TIME)
        VALUES ($1, $2, $3, $4, $5)
      `, [house_id, this.user.id, appointment_time, now, now])
    } catch (e) {
      console.log(e)
      throw '添加失败'
    }
    return '添加成功'
  }
}
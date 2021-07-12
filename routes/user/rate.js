exports.route = {
  async get({id}) {
    if(!id){//不填id 默认查看用户自己的预约信息
      id = this.user.id
    }
    let USER_COMMENT_INFO
    try {
      USER_COMMENT_INFO = await this.db.query(`
        SELECT HOUSE_ID,RATE_SCORE,RATE_COMMENT,MODIFY_TIME
        FROM ESTATE_RATE
        WHERE USER_ID = $1
      `, [id])
    } catch (e) {
      throw '数据库异常'
    }
    let MyComment = USER_COMMENT_INFO.rows
    if(!MyComment){
      return '不存在'
    }
    return {MyComment}
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
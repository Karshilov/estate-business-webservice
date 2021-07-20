//@ts-check
let moment = require('moment')
exports.route = {
  async get({id}) {
    if (!id) {
      throw '缺少参数'
    }
    var result = (await this.db.query(`
      SELECT *
      FROM ESTATE_BLOG
      WHERE ID = $1
    `, [id])).rows[0]
    // 获取用户信息
    let userid = result.user_id
    result.user_id = undefined
    result.user = await this.userHelper.getUserById(userid)
    result.user.userid = userid
    result.user.email = undefined
    result.user.phone_number = undefined
    // 获取用户头像
    result.user.avatar = await this.genGetURL('avatar', result.user.avatar)
    return result
  },
  async post({title, abstract, body}) {
    if (!title || !abstract || !body) {
      throw '缺少参数'
    }
    let now = moment().format('X')
    try {
      await this.db.query(`
        INSERT INTO ESTATE_BLOG
        (TITLE, ABSTRACT, BODY, CREATE_TIME, MODIFY_TIME, USER_ID)
        VALUES ($1, $2, $3, $4, $4, $5)
      `, [title, abstract, body, now, this.user.id])
    } catch (e) {
      throw '添加失败'
    }
    return '添加成功'
  },
  async put({id, title, abstract, body}) {
    if (!id || !title || !abstract || !body) {
      throw '缺少参数'
    }
    let now = moment().format('X')
    try {
      var result = await this.db.query(`
        UPDATE ESTATE_BLOG
        SET TITLE = $1, ABSTRACT = $2, BODY = $3, MODIFY_TIME = $4
        WHERE ID = $5 AND USER_ID = $6
      `, [title, abstract, body, now, id, this.user.id])
    } catch (e) {
      throw '修改失败'
    }
    if (result.rowCount !== 1) {
      throw 'ID不存在'
    }
    return '修改成功'
  },
  async delete({id}) {
    if (!id) {
      throw '参数不全'
    }
    try {
      var result = await this.db.query(`
        DELETE FROM ESTATE_BLOG
        WHERE ID = $1 AND USER_ID = $2
      `, [id, this.user.id])
    } catch (e) {
      throw '删除失败'
    }
    if (result.rowCount !== 1) {
      throw 'ID不存在'
    }
    return '删除成功'
  }
}
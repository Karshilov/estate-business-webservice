exports.route = {
  async get({id}) {
    // 默认返回本人用户信息
    if (!id) {
      id = this.user.id
    }

    let ret
    try {
      ret = await this.userHelper.getUserById(id)
    } catch (e) {
      throw '用户ID无效'
    }
    try {
      ret.avatar = await this.genGetURL('avatar', ret.avatar)
    } catch(e) {
      console.log(e)
      throw '图片链接获取失败'
    }
    // 非本人时不返回联系方式信息
    if (id !== this.user.id) {
      ret.email = ret.phone_number = undefined
    }
    return ret
  },
  async put({username, nickname, email, gender, phone_number}) {
    if (!username || !nickname || !email) {
      throw '参数不全'
    }
    try {
      var result = await this.db.query(`
        UPDATE ESTATE_USER
        SET USERNAME = $1, NICKNAME = $2, 
        EMAIL = $3, GENDER = $4, PHONE_NUMBER = $5
        WHERE ID = $6
      `, [username, nickname, email, gender, phone_number, this.user.id])
    } catch (e) {
      throw '数据库异常'
    }
    if (result.rowCount !== 1) {
      throw '用户ID无效'
    }
    return '修改成功'
  }
}
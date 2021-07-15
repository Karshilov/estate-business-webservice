exports.route = {
  async post({verify, new_password}) {
    if (!verify || !new_password) {
      throw '参数缺失'
    }
    let result = await this.redis.get(this.user.email)
    if (result !== verify) {
      throw '验证码错误'
    }
    let newPw = this.passwdHash(new_password)
    await this.db.query(`
      UPDATE ESTATE_USER
      SET PASSWD = $1
      WHERE ID = $2
    `, [newPw, this.user.id])
    return '修改成功'
  }
}
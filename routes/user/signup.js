exports.route = {
  async post({username, password, nickname, email, role, verify}) {
    if (!username || !password || !role || !nickname || !email || !verify) {
      throw '参数缺失'
    }
    if (role !== 'client' && role !== 'broker') {
      throw '角色指定异常'
    }
    let result = await this.redis.get(email)
    if (result !== verify) {
      throw '验证码错误'
    }
    let passwdHash = this.passwdHash(password)
    let userid, roleid
    try {
      userid = (await this.db.query(`
        INSERT INTO ESTATE_USER
        (USERNAME, PASSWD, NICKNAME, EMAIL)
        VALUES ($1, $2, $3, $4)
        RETURNING ID
      `, [username, passwdHash, nickname, email])).rows[0]['id']
      roleid = (await this.db.query(`
        SELECT ID
        FROM ESTATE_ROLE
        WHERE ALTER_NAME = $1
      `, [role])).rows[0]['id']
      await this.db.query(`
        INSERT INTO ESTATE_USER_ROLE
        (USERID, ROLEID)
        VALUES ($1, $2)
      `, [userid, roleid])
    } catch (e) {
      throw '数据库异常'
    }
    return '创建成功'
  }
}
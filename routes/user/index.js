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
    ret.team = await this.userHelper.getTeamById(id)
    if (ret.team) {
      ret.team.leader = await this.userHelper.getUserById(ret.team.leader_id)
      ret.team.leader.userid = ret.team.leader_id
      ret.team.leader.avatar = await this.genGetURL('avatar', ret.team.leader.avatar)
      ret.team.leader.email = undefined
      ret.team.leader.phone_number = undefined
      ret.team.leader_id = undefined
      for (let i = 0; i < ret.team.member_ids.length; i++) {
        let id = ret.team.member_ids[i]
        ret.team.member_ids[i] = await this.userHelper.getUserById(id)
        ret.team.member_ids[i].userid = id
        ret.team.member_ids[i].avatar = await this.genGetURL('avatar', ret.team.member_ids[i].avatar)
        ret.team.member_ids[i].email = undefined
        ret.team.member_ids[i].phone_number = undefined
      }
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
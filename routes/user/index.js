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
  }
}
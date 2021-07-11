exports.route = {
  async get() {
    let ret = this.user
    try {
      ret.avatar = await this.genGetURL('avatar', ret.avatar)
    } catch(e) {
      console.log(e)
      throw '图片链接获取失败'
    }
    return ret
  }
}
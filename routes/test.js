exports.route = { 
  async get() {
    let apidoc = (await this.get("https://tommy.seu.edu.cn/ws4/api/")).data
    let res = {
      apidoc, 
      user: this.user
    }
    return res
  },
  async post() {
    return ''
  }
}
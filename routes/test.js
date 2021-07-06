exports.route = { 
  async get() {
    let res = await this.get("https://tommy.seu.edu.cn/ws4/api/")
    return res.data
  },
  async post() {
    return ''
  }
}
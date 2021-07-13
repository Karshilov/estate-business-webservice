const apiKey = 'B2EBZ-YEB6Q-WVF55-GBMOS-R5YV7-GGFPE'

exports.route = {
  async get(info) {
    console.log('enter address')
    const { addr } = info
    const res = await this.get(`https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(addr)}&key=${apiKey}`)
    if (res.data.status === 0) {
      return res.data.result
    } else {
      throw res.data.message
    }
  },
}
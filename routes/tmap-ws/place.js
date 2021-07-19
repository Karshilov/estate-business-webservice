const url = 'https://apis.map.qq.com/ws/place/v1/search/'
const apiKey = 'B2EBZ-YEB6Q-WVF55-GBMOS-R5YV7-GGFPE'

exports.route = {
  async get({ keyword, lat, lng, category, radius }) {
    try {
      console.log(keyword, lat, lng, category, radius)
      const res =
        await this.get(`${url}?keyword=${encodeURIComponent(category)}&boundary=nearby(${lat},${lng},${radius},0)&filter=category=${encodeURIComponent(category)}&key=${apiKey}&orderby=_distance`)
      if (res.data.status === 0) {
        return res.data
      } else {
        throw res.data.message
      }
    } catch (e) {
      console.log(e)
    }
  }
}
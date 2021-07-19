// @ts-check
exports.route = {
  async get(n) {
    if (!n) {
      throw '缺少参数'
    }
    n = parseInt(n)
    let userId = this.user.id
    let cnts = [], recomIds = []
    if (!Object.prototype.hasOwnProperty.call(this.recommend.sim, userId)) {
      throw '无浏览记录'
    }
    // 取出相似用户
    for (let user of Object.keys(this.recommend.sim[userId])) {
      cnts.push({user, cnt: this.recommend.sim[userId][user]})
    }
    // 按相似度大小排序
    cnts.sort((a, b) => {
      return b.cnt - a.cnt
    })
    for (let userCnt of cnts) {
      recomIds = recomIds.concat(this.recommend.user2house[userCnt.user])
    }
    // filter实现unique
    recomIds = recomIds.filter((value, index, self) => {
      return self.indexOf(value) === index
    })
    if (recomIds > n) {
      recomIds = recomIds.slice(n)
    }
    // 找出对应房源
    let ans = []
    for (let id of recomIds) {
      let record = await this.db.query(`
        SELECT ID, TITLE, PHOTOS, AREA, CREATE_TIME, FLOOR, TOTAL_FLOOR, PRICE, FEATURES
        FROM ESTATE_RENT_DETAIL
        WHERE ID = $1
      `, [id])
      // 特征分割
      record.rows[0].features = record.rows[0].features.split(',')
      // 封面URL获取
      if (!record.rows[0].photos) {
        record.rows[0].cover = await this.genGetURL('house', 'foobar1.jpg')
      } else {
        record.rows[0].cover = await this.genGetURL('house', record.rows[0].photos.split(',')[0])
      }
      record.rows[0].photos = undefined
      ans.push(record.rows[0])
    }
    return ans
  }
}
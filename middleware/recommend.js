let lastTime = 0
let moment = require('moment')
let user2house, house2user, sim
module.exports = async (ctx, next) => {
  let now = moment()
  if (now - lastTime > 15 * 60 * 1000) {
    lastTime = now
    let record = await ctx.db.query(`
      SELECT USERID, HOUSE_ID
		  FROM ESTATE_VIEW_HISTORY
    `)
    user2house = {}, house2user = {}, sim = {}
    for (let row of record.rows) {
      let {userid, house_id} = row
      if (!Object.prototype.hasOwnProperty.call(user2house, userid)) {
        user2house[userid] = []
      }
      user2house[userid].push(house_id)
      if (!Object.prototype.hasOwnProperty.call(house2user, house_id)) {
        house2user[house_id] = []
      }
      house2user[house_id].push(userid)
    }
    // 计算相似记录条目
    for (let usersKey of Object.keys(house2user)) {
      let users = house2user[usersKey]
      for (let userI of users) {
        for (let userJ of users) {
          if (userI === userJ) {
            continue
          }
          if (!Object.prototype.hasOwnProperty.call(sim, userI)) {
            sim[userI] = {}
          }
          if (!Object.prototype.hasOwnProperty.call(sim[userI], userJ)) {
            sim[userI][userJ] = 0
          }
          sim[userI][userJ]++
        }
      }
    }
    for (let userI of Object.keys(sim)) {
      for (let userJ of Object.keys(sim[userI])) {
        sim[userI][userJ] = sim[userI][userJ] / Math.sqrt(user2house[userI].length * user2house[userJ].length)
      }
    }
  }
  ctx.recommend = {
    user2house, house2user, sim
  }
  await next()
}
exports.route = {
  async get({city}) {
    // 仅经纪人和管理员能够调用, 经纪人仅查看自己名下的房源情况
    let conds = ` WHERE CITY LIKE '%' `, role = await this.perms.getPerm(this.user.id)
    if (city) {
      conds = ` WHERE CITY = '${city}' `
    }
    if (role === 'broker') {
      conds += ` AND OWNER = '${this.user.id}' `
    } else if (role !== 'admin') {
      throw '权限不足'
    }
    try {
    // 按城市分类的结果
      let cityResults = await this.db.query(`
        SELECT CITY, COUNT(*)
        FROM ESTATE_RENT_DETAIL
      ` + conds + `GROUP BY CITY`)
      // 按整合租分类的结果
      let wholeResult = await this.db.query(`
        SELECT LEFT(title, 2), COUNT(*)
        FROM ESTATE_RENT_DETAIL
        ` + conds + `
        GROUP BY LEFT(title, 2)
        ORDER BY LEFT(title, 2)
      `)
      if (wholeResult.rows[0].left === '整租') {
      // 缺少合租信息
        wholeResult = {合租: 0, 整租: parseInt(wholeResult.rows[0].count)}
      } else if (wholeResult.rows.length === 1) {
      // 缺少整租信息
        wholeResult = {合租: parseInt(wholeResult.rows[0].count), 整租: 0}
      } else {
        wholeResult = {合租: parseInt(wholeResult.rows[0].count), 整租: parseInt(wholeResult.rows[1].count)}
      }
      // 按面积分类的结果
      let areaResult = await this.db.query(`
        SELECT FLOOR(AREA / 20) * 20 LOWER, COUNT(*)
        FROM ESTATE_RENT_DETAIL
        ` + conds + `
        GROUP BY LOWER
        ORDER BY LOWER
      `)
      return {city: cityResults.rows, whole: wholeResult, area: areaResult.rows}
    } catch (e) {
      console.log(e)
      throw '数据库异常'
    }
  },
}
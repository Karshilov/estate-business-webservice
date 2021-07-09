exports.route = {
  async get({city, neighborhood}) {
    if (!city || !neighborhood) {
      throw '缺少参数'
    }
    let records = await this.db.query(`
      SELECT ID, TITLE, PHOTOS, AREA, CREATE_TIME, FLOOR, TOTAL_FLOOR
      FROM ESTATE_RENT_DETAIL
      WHERE CITY = $1 AND NEIGHBOURHOOD LIKE $2
    `, [city, neighborhood])
    return records.rows
  }
}
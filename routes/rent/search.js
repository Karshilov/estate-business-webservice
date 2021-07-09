exports.route = {
  async get({city, neighborhood, page_size = 10, page_num = 1}) {
    if (!city || !neighborhood) {
      throw '缺少参数'
    }
    neighborhood = '%' + neighborhood + '%'
    let records, total
    try {
      let cntRecords = await this.db.query(`
        SELECT COUNT(*)
        FROM ESTATE_RENT_DETAIL
        WHERE CITY = $1 AND NEIGHBOURHOOD LIKE $2
      `, [city, neighborhood])

      total = parseInt(cntRecords.rows[0].count)
      records = await this.db.query(`
        SELECT ID, TITLE, PHOTOS, AREA, CREATE_TIME, FLOOR, TOTAL_FLOOR
        FROM ESTATE_RENT_DETAIL
        WHERE CITY = $1 AND NEIGHBOURHOOD LIKE $2
        LIMIT $3 OFFSET $4
      `, [city, neighborhood, page_size, (page_num - 1) * page_size])
    } catch (e) {
      throw '数据库异常'
    }
    records.rows.forEach((row) => {
      if (!row.photos) {
        row.cover = ''
      }
      row.cover = row.photos.split(',')[0]
      row.photos = undefined
    })
    return { total, list: records.rows }
  }
}
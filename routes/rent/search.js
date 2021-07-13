exports.route = {
  async get({city, neighbourhood, page_size = 10, page_num = 1}) {
    if (!city) {
      throw '缺少参数'
    }
<<<<<<< HEAD
    neighborhood = '%' + neighborhood + '%'
    let records, total, features
=======
    if (!neighbourhood) {
      neighbourhood = '%'
    } else {
      neighbourhood = '%' + neighbourhood + '%'
    }
    let records, total
>>>>>>> 38edafbd009cb40e4050315571634b012c90a9c3
    try {
      let cntRecords = await this.db.query(`
        SELECT COUNT(*)
        FROM ESTATE_RENT_DETAIL
        WHERE CITY = $1 AND NEIGHBOURHOOD LIKE $2
      `, [city, neighbourhood])

      total = parseInt(cntRecords.rows[0].count)
      records = await this.db.query(`
        SELECT ID, TITLE, PHOTOS, AREA, CREATE_TIME, FLOOR, TOTAL_FLOOR, PRICE
        FROM ESTATE_RENT_DETAIL
        WHERE CITY = $1 AND NEIGHBOURHOOD LIKE $2
        LIMIT $3 OFFSET $4
      `, [city, neighborhood, page_size, (page_num - 1) * page_size])
      features = await this.db.query(`
        SELECT FEATURES
        FROM ESTATE_RENT_DETAIL
        WHERE CITY = $1 AND NEIGHBOURHOOD LIKE $2
        LIMIT $3 OFFSET $4
      `, [city, neighborhood, page_size, (page_num - 1) * page_size])
    } catch (e) {
      console.log(e)
      throw '数据库异常'
    }
    features = features.rows[0].features.split(',')
    console.log(features)
    for (let i = 0; i < records.rows.length; i++) {
      if (!records.rows[i].photos) {
        records.rows[i].cover = ''
      }
      records.rows[i].cover = await this.genGetURL('house', records.rows[i].photos.split(',')[0])
      records.rows[i].photos = undefined
    }
    let result = {list:records.rows[0]}
    result['list']['features'] = features
    return { total, result}
  }
}
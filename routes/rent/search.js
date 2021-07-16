exports.route = {
  async get({city, neighbourhood, page_size, page_num, whole, price_lower, price_upper, house_type, order_by, desc}) {
    if (!city) {
      throw '缺少参数'
    }
    if (!neighbourhood) {
      neighbourhood = '%'
    } else {
      neighbourhood = '%' + neighbourhood + '%'
    }
    // 拼接条件
    let conds = '', orderConds = ''
    // 拼接整租合租
    if (whole !== 0) {
      if (whole === 1) {
        conds += ` AND TITLE LIKE '整租%' `
      } else if (whole === 2) {
        conds += ` AND TITLE LIKE '合租%' `
      }
    }
    // 拼接价格范围
    if (price_lower && price_upper) {
      conds += ` AND PRICE BETWEEN ${price_lower} AND ${price_upper} `
    } else if (price_lower) {
      conds += ` AND PRICE >= ${price_lower} `
    } else if (price_upper) {
      conds += ` AND PRICE <= ${price_upper} `
    }
    // 拼接房屋类型
    if (house_type) {
      conds += ` AND HOUSE_TYPE LIKE '${house_type}%' `
    }
    // 拼接排序标准
    if (order_by === 'area' || order_by === 'price') {
      orderConds += ` ORDER BY ${order_by} `
    }
    // 拼接降序
    if (desc === 'true') {
      orderConds += ` DESC `
    }
    try {
      let cntRecords = await this.db.query(`
        SELECT COUNT(*)
        FROM ESTATE_RENT_DETAIL
        WHERE CITY = $1 AND NEIGHBOURHOOD LIKE $2
      ` + conds, [city, neighbourhood])

      var total = parseInt(cntRecords.rows[0].count)
      var records = await this.db.query(`
        SELECT ID, TITLE, PHOTOS, AREA, CREATE_TIME, FLOOR, TOTAL_FLOOR, PRICE, FEATURES
        FROM ESTATE_RENT_DETAIL
        WHERE CITY = $1 AND NEIGHBOURHOOD LIKE $2
      ` + conds + orderConds + `LIMIT $3 OFFSET $4`, [city, neighbourhood, page_size, (page_num - 1) * page_size])
    } catch (e) {
      console.log(e)
      throw '数据库异常'
    }
    for (let i = 0; i < records.rows.length; i++) {
      records.rows[i].features = records.rows[i].features.split(',')
      if (!records.rows[i].photos) {
        records.rows[i].cover = await this.genGetURL('house', 'foobar1.jpg')
      } else {
        records.rows[i].cover = await this.genGetURL('house', records.rows[i].photos.split(',')[0])
      }
      records.rows[i].photos = undefined
    }
    return { total, list: records.rows }
  }
}
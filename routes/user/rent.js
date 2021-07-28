exports.route = {
  async get({id, page_size, page_num}) {
    if (!page_size || !page_num) {
      throw '参数不全'
    }
    if (!id) {
      id = this.user.id
    }
    try {
      // 计算数目
      var cntRecords = await this.db.query(`
        SELECT COUNT(*)
        FROM ESTATE_RENT_DETAIL
        WHERE OWNER = $1
      `, [id])
      cntRecords = parseInt(cntRecords.rows[0].count)

      // 选取记录
      var records = await this.db.query(`
        SELECT ID, TITLE, AREA, CREATE_TIME, FLOOR, 
        TOTAL_FLOOR, PHOTOS, FEATURES, STATUS, REASON, REALSEE
        FROM ESTATE_RENT_DETAIL
        WHERE OWNER = $1 
        LIMIT $2 OFFSET $3
      `, [id, page_size, (page_num - 1) * page_size])
    } catch (e) {
      console.log(e)
      throw '数据库异常'
    }
    // features分割, 生成封面URL
    for (let i = 0; i < records.rows.length; i++) {
      records.rows[i].features = records.rows[i].features.split(',')
      if (!records.rows[i].photos) {
        records.rows[i].cover = ''
      } else {
        records.rows[i].cover = await this.genGetURL('house', records.rows[i].photos.split(',')[0])
      }
      records.rows[i].photos = undefined
    }
    return { total: cntRecords, list: records.rows }

  }
}
exports.route = {
  async get({page_size, page_num}) {
    try {
      var results = await this.db.query(`
        SELECT eva.ID, eva.HOUSE_ID, eva.CREATE_TIME, erd.TITLE, erd.CITY, 
          erd.FLOOR, erd.PRICE, erd.NEIGHBOURHOOD, erd.OWNER, erd.OWNER, erd.HOUSE_TYPE,
          erd.CREATE_TIME, erd.FLOOR, erd.TOTAL_FLOOR, erd.AREA
        FROM ESTATE_VR_APPOINTMENT eva
        INNER JOIN ESTATE_RENT_DETAIL erd
        ON eva.house_id = erd.id
        LIMIT $1 OFFSET $2
      `, [page_size, (page_num-1)*page_size])
      for (let i = 0; i < results.rows.length; i++) {
        results.rows[i].user = await this.userHelper.getUserById(results.rows[i].owner)
        results.rows[i].user.id = results.rows[i].owner
        results.rows[i].owner = undefined
      }
      return results.rows
    } catch (e) {
      throw '查看失败'
    }
  }
}
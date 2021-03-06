exports.route = {
  async get({userid, keyword, order_by, page_num, page_size, desc}) {
    if (!page_num || !page_size) {
      throw '参数不全'
    }
    if (!userid) {
      userid = ``
    } else {
      userid = ` USER_ID = '${userid}' AND `
    }
    if (!keyword) {
      keyword = '%'
    } else {
      keyword = '%' + keyword + '%'
    }
    if (order_by === 'time') {
      order_by = ` ORDER BY CREATE_TIME `
      if (desc !== 'false') {
        order_by += ` DESC `
      }
    }
    try {
      var cnt = await this.db.query(`
        SELECT COUNT(*)
        FROM ESTATE_BLOG
        WHERE` + userid + ` TITLE LIKE $3
        LIMIT $1 OFFSET $2`, [page_size, (page_num-1) * page_size, keyword])
      var result = await this.db.query(`
        SELECT ID, TITLE, ABSTRACT, CREATE_TIME, MODIFY_TIME
        FROM ESTATE_BLOG
        WHERE` + userid + ` TITLE LIKE $3
      ` + order_by + `LIMIT $1 OFFSET $2`, [page_size, (page_num-1) * page_size, keyword])
    } catch (e) {
      console.log(e)
      throw '查找失败'
    }
    if (cnt.rows.length === 0) {
      return {total: 0, list: []}
    }
    return {total: parseInt(cnt.rows[0].count), list: result.rows}
  }
}
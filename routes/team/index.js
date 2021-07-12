exports.route = {
  async get({ id }) {
    if (!id) {
      throw '缺少参数'
    }
    let record = await this.db.query(`
      SELECT *
      FROM ESTATE_TEAM
      WHERE ID = $1
    `, [id])
    return record.rows
  },

  async post({name}) {
    try {
      await this.db.query(`
        INSERT INTO ESTATE_TEAM
        (NAME,LEADER_ID)
        VALUES ($1, $2)
      `, [name, this.user.id])
    } catch (e) {
      console.log(e)
      throw '添加失败'
    }
    return '添加成功'
  },

  async delete({id}) {
    try {
      await this.db.query(`
        DELETE FROM ESTATE_TEAM
        WHERE ID = $1
      `, [id])
    } catch (e) {
      console.log(e)
      throw '删除失败'
    }
    return '删除成功'
  }
}
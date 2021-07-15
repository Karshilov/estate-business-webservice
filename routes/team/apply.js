exports.route = {
  async get() {
    let team_id = await this.db.query(`
      SELECT ID
      FROM ESTATE_TEAM
      WHERE LEADER_ID = $1
    `, [this.user.id])
    let L = team_id.rows.length
    let team_ids = team_id.rows
    let apply_info
    let result
    console.log(team_ids[0].id)
    for(var i =0;i<L;i++){
      apply_info = await this.db.query(`
      SELECT USER_ID
      FROM ESTATE_JOIN_TEAM
      WHERE TEAM_ID = $1
    `,[team_ids[i].id])

      result['team_id']=team_ids[i].id
      result['user_id']=apply_info
      console.log(result)
    }
    
    return {result}
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
  async put({id}) {
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
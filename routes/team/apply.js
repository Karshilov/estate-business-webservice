exports.route = {
  async get({team_id}) {
    // let now = moment().format('X')
    let user_ids
    var result = {}
    try {
      user_ids = await this.db.query(`
        SELECT ID,USER_ID,CREATE_DATE
        FROM ESTATE_JOIN_TEAM
        WHERE TEAM_ID = $1
      `, [team_id])
      // console.log(user_ids.rows[0].id)  
    } catch (e) {
      throw '数据库错误'
    }
    let p
    // console.log('length',user_ids.rows.length)
    for(var i=0;i<user_ids.rows.length;i++){
      p = {id:user_ids.rows[i].id,user_id:user_ids.rows[i].user_id,create_date:user_ids.rows[i].create_date}
      var key = 'applicant'+i
      result[key]=p     
    }
    
    return result
  },

  async post({application_id,application_result}) {
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
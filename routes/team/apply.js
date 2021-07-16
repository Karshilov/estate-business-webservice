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

  async post({team_name,application_id,application_result}) {
    try {
      let applicant = await this.db.query(`
        SELECT USER_ID
        FROM ESTATE_JOIN_TEAM
        WHERE ID = $1
      `,[application_id])//获取申请者的id

      if(application_result == 1){//接受申请
        console.log('接受')
        let ids = await this.db.query(`
        SELECT MEMBER_IDS
        FROM ESTATE_TEAM
        WHERE name = $1
      `, [team_name])
        console.log(ids.rows)
        console.log('start changing member_ids')
        console.log(applicant.rows[0].user_id+','+ids.rows[0].member_ids)
        await this.db.query(`
        UPDATE ESTATE_TEAM
        SET 
          MEMBER_IDS = $1
        WHERE 
          NAME = $2
      `, [applicant.rows[0].user_id+','+ids.rows[0].member_ids,team_name])
        console.log('start changing apply_status')
        await this.db.query(`
        UPDATE ESTATE_JOIN_TEAM
        SET 
          APPLY_STATUS = 1
        WHERE ID = $1
      `, [application_id])
      }
      else if(application_result == -1){//拒绝申请
        await this.db.query(`
        UPDATE ESTATE_JOIN_TEAM
        SET
          APPLY_STATUS = -1
        WHERE ID = $1
      `, [application_id])
      }
    } catch (e) {
      console.log(e)
      throw '添加失败'
    }
    return '添加成功'
  }
}
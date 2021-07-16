exports.route = {
  async get({ id }) {
    console.log(this.user.role)
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
  async put({team_id,ids}){
    let L = ids.length
    let member_ids
    let afterStr
    let delete_ids={}
    // console.log(L)
    // for(var i =0;i<L;i++){
    //   console.log(ids[i])
    // }
    try{
      member_ids = await this.db.query(`
      SELECT MEMBER_IDS
      FROM ESTATE_TEAM
      WHERE ID = $1
      `,[team_id])
      // console.log(member_ids.rows[0].member_ids)
      member_ids = member_ids.rows[0].member_ids
      afterStr = ''
      let len = (member_ids.length+1)/37
      console.log("开始匹配,Len = ",len)
      for(var ii=0;ii<len;ii++){
        let tmpStr = member_ids.substring(ii*37,ii*37+36)
        let ok = true
        for(var j=0;j<L;j++){
          if(tmpStr == ids[j]){
            console.log("匹配"+ids[j])
            ok = false
            break
          }
        }
        if(ok){
          if(ii==len-1){
            afterStr = afterStr + ids[j]
          }
          else{
            afterStr = afterStr + ids[j] + ','
          }
          console.log("ids: ",afterStr)
        }
        else{
          let key = 'id'+j
          let val = tmpStr
          delete_ids[key] = val
          console.log('删除了',tmpStr)
        }
        // console.log(tmpStr+'\n')
      }
      // console.log('最终结果为:',afterStr)
      await this.db.query(`
      UPDATE ESTATE_TEAM
      SET
        MEMBER_IDS = $1
      WHERE ID = $2
      `,[afterStr,team_id])
    }catch(e){
      throw '数据库错误'
    }
    return {delete_ids}
  },
  async delete({id}) {
    try {
      await this.db.query(`
        DELETE FROM ESTATE_TEAM
        WHERE ID = $1
      `, [id])
    } catch (e) {
      console.log(e)
      throw '团队删除失败'
    }
    return '团队删除成功'
  }
}
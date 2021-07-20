exports.route = {
  async post({avatar}) {
    if (!avatar) {
      throw '缺少参数'
    }
    try {
      await this.db.query(`
        UPDATE ESTATE_USER
        SET AVATAR = $1
        WHERE ID = $2
      `, [avatar, this.user.id])
    } catch (e) {
      throw '上传失败'
    }
    return '上传成功'
  }
}
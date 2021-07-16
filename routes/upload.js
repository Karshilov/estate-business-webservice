const moment = require('moment')
exports.route = {
  async get({type, file_name}) {
    if (typeof type !== 'string' || typeof file_name !== 'string') {
      throw '未指定参数'
    }
    let key = moment().format('x') + '-' + this.user.id.replace(/-/g,'') + '-' + file_name, url
    try {
      url = await new Promise((resolve, reject) => {
        let policy = this.minio.newPostPolicy()
        policy.setBucket(type)
        policy.setKey(key)
        policy.setExpires(new Date(+moment().add(600, 's')))
        policy.setContentLengthRange(1, 1024 * 1024 * 10)
        this.minio.presignedPostPolicy(policy, async (err, presignedUrl) => {
          if (err) {
            reject(err)
          }
          resolve(presignedUrl)
        })
      })
    } catch(e) {
      throw '文件上传失败'
    }
    return { url, key }
  },
  async delete({type, file_name}) {
    if (typeof type !== 'string' || typeof file_name !== 'string') {
      throw '未指定参数'
    }
    let result
    let myUUID = this.user.id.replace(/-/g,'')
    let fileUUID = file_name.split('-')
    if (fileUUID.length !== 3 || fileUUID[1] !== myUUID) {
      throw '无删除权限'
    }
    try {
      result = await new Promise((resolve, reject) => {
        this.minio.removeObject(type, file_name, async (err) => {
          if (err) {
            reject(err)
          }
          resolve('删除成功')
        })
      })
    } catch(e) {
      throw '删除失败'
    }
    return result
  }
}
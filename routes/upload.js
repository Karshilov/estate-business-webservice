const moment = require('moment')
const uuid = require('uuid')
exports.route = {
  async get({type, file_name}) {
    if (typeof type !== 'string' || typeof file_name !== 'string') {
      throw '未指定参数'
    }

    let url, key = moment().format('x') + uuid.v1().replace(/-/g,'') + file_name
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
    return { url }
  }
}
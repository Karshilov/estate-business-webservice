exports.route = {
  async get({type, name}) {
    if (typeof type !== 'string' ||  typeof name !== 'string') {
      throw '缺少参数'
    }
    let url
    try {
      url = await new Promise((res, rej) => {
        this.minio.presignedGetObject(type, name, 60 * 20, async (err, url)=> {
          if (err) {
            rej(err)
          }
          res(url)
        })})
    } catch (e) {
      throw 'URL分配失败'
    }
    return url
  }
}
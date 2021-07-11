const Minio = require('minio')
const config = require('../sdk/sdk.json').minio
let minioClient = new Minio.Client(config)

module.exports = async (ctx, next) => {
  ctx.minio = minioClient
  ctx.genGetURL = async (type, name) => {
    return await new Promise((res, rej) => {
      minioClient.presignedGetObject(type, name, 60 * 20, async (err, url)=> {
        if (err) {
          rej(err)
        }
        res(url)
      })})
  }
  await next()
}
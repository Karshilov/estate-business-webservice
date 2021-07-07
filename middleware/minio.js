const Minio = require('minio')
const config = require('../sdk/sdk.json').minio
let minioClient = new Minio.Client(config)

module.exports = async (ctx, next) => {
  ctx.minio = minioClient
  await next()
}
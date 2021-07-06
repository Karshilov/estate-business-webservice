/*
  用户身份认证中间件
  保持完整的前后端分离特性，同时提供灵活性。
*/
// const crypto = require('crypto')
// const config = require('../database/postgre-secret')

// const passwdHash = (passwd) => {
//   let hmac = crypto.createHmac('sha1', config.info.password)
//   hmac.update()
//   hmac.digest('base64')
// }

module.exports = async (ctx, next) => {
  // 对于 auth 路由的请求，直接截获，不交给 kf-router
  if (ctx.path === '/auth') {
    // POST /auth 登录认证
    if (ctx.method.toUpperCase() !== 'POST') {
      throw 405
    }
  }
  await next()
}
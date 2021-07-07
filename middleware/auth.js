/*
  用户身份认证中间件
  保持完整的前后端分离特性，同时提供灵活性。
  提供 ctx.username 和 ctx.password 参数
*/
const crypto = require('crypto')
const config = require('../database/postgre-secret')

// 对密码进行加密
const passwdHash = (passwd) => {
  let hmac = crypto.createHmac('sha256', config.info.password)
  hmac.update(passwd)
  return hmac.digest('base64')
}

// 对 token 进行摘要
const hash = value => {
  return Buffer.from(crypto.createHash('sha256').update(value).digest()).toString('hex')
}

module.exports = async (ctx, next) => {
  // 对于 auth 路由的请求，直接截获，不交给 kf-router
  if (ctx.path === '/auth') {
    // POST /auth 登录认证
    if (ctx.method.toUpperCase() !== 'POST') {
      throw 405
    }
    let {username, password} = ctx.params
    if (typeof username !== 'string' || typeof password !== 'string') {
      throw '缺少认证参数'
    }
    // SHA256加密
    password = passwdHash(password)
    let {rows} = await ctx.db.query(`
      SELECT AVATAR, NICKNAME 
      FROM ESTATE_USER
      WHERE USERNAME = $1 AND PASSWD = $2
      `, [username, password])
    let avatar, nickname
    if (rows && rows.length === 1) {
      [avatar, nickname] = [rows[0]['avatar'], rows[0]['nickname']]
    }
    // 生成 32 字节 token 转为十六进制，及其哈希值
    let token = Buffer.from(crypto.randomBytes(20)).toString('hex')
    let tokenHash = hash(token)
    // 记录 token
    await ctx.db.query(`
      INSERT INTO ESTATE_AUTH
      (USERNAME, TOKEN_HASH, AVATAR, NICKNAME)
      VALUES ($1, $2, $3, $4)
    `, [username, tokenHash, avatar, nickname])
    ctx.body = token
    console.log(`${username}[${nickname}]-身份认证成功`)
    return
  } else if (ctx.request.headers['x-api-token']) {
    // 在数据库中根据 token 查找用户信息
    let token = ctx.request.headers['x-api-token']
    let tokenHash = hash(token)
    // TODO: Redis 接入
    let {rows} = await ctx.db.query(`
      SELECT ID, USERNAME, AVATAR, NICKNAME
      FROM ESTATE_AUTH
      WHERE TOKEN_HASH = $1
    `, [tokenHash])
    let id, username, avatar, nickname
    if (rows && rows.length === 1) {
      [id, username, avatar, nickname] = [rows[0]['id'], rows[0]['username'], rows[0]['avatar'], rows[0]['nickname']]
    } else {
      throw '认证token错误'
    }
    ctx.user = {
      isLogin: true,
      token: tokenHash, 
      id, username, avatar, nickname
    }
  } else if (ctx.path !== '/signup') {
    throw '未登录'
  }
  ctx.passwdHash = passwdHash
  await next()
}
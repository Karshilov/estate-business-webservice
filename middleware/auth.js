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
      SELECT AVATAR, NICKNAME, EMAIL, ID
      FROM ESTATE_USER
      WHERE USERNAME = $1 AND PASSWD = $2
      `, [username, password])
    let avatar, nickname, email, userid
    if (rows && rows.length === 1) {
      [avatar, nickname, email, userid] = [rows[0]['avatar'], rows[0]['nickname'], rows[0]['email'], rows[0]['id']]
    } else {
      throw '用户名或密码错误'
    }
    // 生成 32 字节 token 转为十六进制，及其哈希值
    let token = Buffer.from(crypto.randomBytes(20)).toString('hex')
    let tokenHash = hash(token)
    // 记录 token
    if (ctx.redis) {
      // Redis存储
      await ctx.redis.set(tokenHash, JSON.stringify({username, avatar, nickname, email, userid}))
    } else {
      // DB存储
      await ctx.db.query(`
        INSERT INTO ESTATE_AUTH
        (USERNAME, TOKEN_HASH, AVATAR, NICKNAME, EMAIL, USERID)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [username, tokenHash, avatar, nickname, email, userid])
    }
    ctx.body = {
      userid,
      token,
      username,
      avatar,
      nickname,
      email
    }
    console.log(`${username}[${nickname}]-身份认证成功`)
    return
  } else if (ctx.request.headers['x-api-token']) {
    // 在数据库中根据 token 查找用户信息
    let token = ctx.request.headers['x-api-token']
    let tokenHash = hash(token)
    if (ctx.redis) {
      let result = await ctx.redis.get(tokenHash)
      if (!result) {
        throw 'token错误'
      } else {
        result = JSON.parse(result)
        let {userid: id, username, avatar, nickname, email} = result
        ctx.user = {
          isLogin: true,
          token: tokenHash, 
          id, username, avatar, nickname, email
        }
      }
    } else {
      let {rows} = await ctx.db.query(`
        SELECT USERID, USERNAME, AVATAR, NICKNAME, EMAIL
        FROM ESTATE_AUTH
        WHERE TOKEN_HASH = $1
      `, [tokenHash])
      if (rows && rows.length === 1) {
        let {userid: id, username, avatar, nickname, email} = rows[0]
        ctx.user = {
          isLogin: true,
          token: tokenHash, 
          id, username, avatar, nickname, email
        }
      } else {
        throw 'token错误'
      }
    }
  } else if (ctx.path !== '/user/signup' && ctx.path !== '/email') {
    throw '未登录'
  }
  ctx.passwdHash = passwdHash
  await next()
}
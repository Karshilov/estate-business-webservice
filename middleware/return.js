/**
  # 返回格式中间件
  按照一定的规则，规范返回格式，将 HTTP Status Code 下放到 JSON 中，使 HTTP Status Code 保持为 200。
 */
module.exports = async (ctx, next) => {

  // 不要使用这个对流程控制具有迷惑性的 API，请直接用 throw 代替
  ctx.throw = (code) => { throw code, console.log(code) }
  try {
    await next()
  } catch (e) {
    ctx.body = ''
    if (!e) {
      ctx.status = 400
    } else if (typeof e === 'number') {
      ctx.status = e
    } else if (typeof e === 'string') {
      ctx.body = e
      ctx.logMsg = e
      ctx.status = 400
    } else if (e.message
      && /^Request failed with status code (\d+)$/.test(e.message)) { // 探测 Axios 异常
      ctx.status = 503
    } else if (e.message
      && /^timeout of \d+ms exceeded$/.test(e.message)) { // 探测 Axios 异常
      ctx.status = 408
    } else {
      // console.trace(e)
      ctx.logMsg = e.name + ':' + e.message
      ctx.status = 400
    }
  }

  let json = {}

  if (ctx.response.get('Location')) {
    ctx.status = 302
    return
  } else if (ctx.status < 400) {
    json = {
      success: true,
      code: ctx.status || 200,
      result: ctx.body,
    }
  } else {
    json = {
      success: false,
      code: ctx.status || 200,
      reason: ctx.body,
    }
  }

  ctx.body = json
  ctx.status = 200
}

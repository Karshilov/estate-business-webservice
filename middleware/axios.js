/*
  网络请求中间件: 允许模块代码直接进行网络请求。

  为路由提供接口:

  ctx.get         (string, object?) => Promise<AxiosResponse>
  ctx.post        (string, stringOrObject?, object?) => Promise<AxiosResponse>
  ctx.put         (string, stringOrObject?, object?) => Promise<AxiosResponse>
  ctx.delete      (string, object?) => Promise<AxiosResponse>
  ctx.cookieJar   tough.CookieJar

  如: `let res = (await this.get/post/put/delete('http://google.com')).data`
*/
const axios = require('axios')

const qs = require('querystring')
/* eslint no-empty:off */
// 关闭 SSL 安全验证。
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

module.exports = async (ctx, next) => {

  /**
  ## 实现

  支持 get/post/put/delete 四个方法
 */
  let _axios = axios.create({

    withCredentials: true,

    // 覆盖默认的状态码判断，防止在禁用重定向时误判 302 为错误返回
    validateStatus: s => s < 400,

    // 默认使用 URLEncoded 方式编码请求
    transformRequest(req) {
      if (typeof req === 'object') {
        return qs.stringify(req)
      }
      return req
    },

  })

  ;['get', 'post', 'put', 'delete'].forEach(k => {
    ctx[k] = async (...args) => {
      return await _axios[k](...args)
    }
  })

  await next()
}

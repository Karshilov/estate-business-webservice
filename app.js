const koa = require('koa')
const app = new koa()
const program = require('commander')
const kf = require('kf-router')
// const fs = require('fs')
const chalk = require('chalk')


program
  .version('1.0.0')
  .option('-m --mode <mode>', '执行模式 <production|development|profile>')
  .option('-p, --port <port>', '监听端口', parseInt)
  .parse(process.argv)


// 将 moment 导出到全局作用域
global.moment = require('moment')
// 运行参数导出到全局
global.program = program.opts()

// 控制台输出的样式颜色
global.chalkColored = new chalk.constructor({ level: 2 })

// 为 Moment 设置默认语言
moment.locale('zh-cn')

// 出错输出
process.on('unhandledRejection', e => { throw e })
process.on('uncaughtException', console.trace)

// 监听两个结束进程事件，将它们绑定至 exit 事件，有两个作用：
// 1. 使用 child_process 运行子进程时，可直接监听主进程 exit 事件来杀掉子进程；
// 2. 防止按 Ctrl+C 时程序变为后台僵尸进程。
process.on('SIGTERM', () => process.exit())
process.on('SIGINT', () => process.exit())

/**
  中间件引入
  参考 herald_webservice 的中间件层级排列
 */

/**
  ## A. 超监控层
  不受监控、不受格式变换的一些高级操作
 */
// 1. 跨域中间件，定义允许访问本服务的第三方前端页面
app.use(require('./middleware/cors'))

/**
  ## B. 接口层
  为了方便双方通信，负责对服务收到的请求和发出的返回值做变换的中间件。
*/
// 1. 参数格式化，对上游传入的 URL 参数和请求体参数进行合并
app.use(require('./middleware/params'))
// 2. 返回格式化，将下游返回内容包装一层JSON
app.use(require('./middleware/return'))


/**
  ## C. PostgreSQL 数据库
 */
app.use(require('./middleware/postgre'))

/**
 ## D. Redis 数据库
 */
app.use(require('./middleware/redis'))

/**
  ## E. API 层
  负责为路由处理程序提供 API 以便路由处理程序使用的中间件。
*/
// 1. 身份认证
app.use(require('./middleware/auth'))
// 2. 获取请求时的身份等级
app.use(require('./middleware/role'))
// 4. 权限控制
app.use(require('./middleware/permission'))
// 5. 用户信息
app.use(require('./middleware/user'))
// 6. 静态文件
app.use(require('./middleware/minio'))
// 7. 网络请求，为身份认证和路由处理程序提供了网络请求 API
app.use(require('./middleware/axios'))
// 8. 推荐数据，为推荐系统构建赋能
app.use(require('./middleware/recommend'))
/**
  ## E. 路由层
  负责调用路由处理程序执行处理的中间件。
*/
app.use(kf())
app.listen(global.program.port)

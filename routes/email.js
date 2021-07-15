const crypto = require('crypto')
const nodemailer = require('nodemailer')
const config = require('../sdk/sdk.json').email
const mailer = nodemailer.createTransport(config)

exports.route = {
  async get({to}) {
    if (!to) {
      throw '参数不全'
    }
    let result = await this.redis.get(to)
    if (result) {
      throw '验证码已发送, 稍后重试'
    }
    let verify = crypto.randomBytes(6).toString('base64').slice(0,6)
    await this.redis.set(to, verify, 'EX', 360)
    try {
      await mailer.sendMail({
        from: '"zpchen" <chenzhipeng2009@126.com>',
        to: `"用户" <${to}>`,
        subject: '验证码',
        text: `验证码为${verify}, 6分钟后失效`
      })
      return '邮件已发送'
    } catch (e) {
      console.log(e)
      throw '发送验证码失败'
    }
  }
}
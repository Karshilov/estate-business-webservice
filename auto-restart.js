const schedule = require('node-schedule')
const fs = require('fs/promises')

const scheduleCronstyle = () => {
  //每分钟的第30秒定时执行一次:
  schedule.scheduleJob('30 * * * * *', async () => {
    await fs.writeFile(require('path').resolve(__dirname, 'cur.json'), JSON.stringify({ cur: new Date()}))
  })
}

module.exports = scheduleCronstyle

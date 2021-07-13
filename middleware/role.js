module.exports = async (ctx, next) => {
  console.log('role')
  await next()
}
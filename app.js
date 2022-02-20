const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/log4j')
const users = require('./routes/users')
const router = require("koa-router")()  // 直接引入 koa-router
// error handler
onerror(app)
// 数据库
require('./config/db')
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))


 
// logger
app.use(async (ctx, next) => {
  log4js.info(`get params:${JSON.stringify(ctx.request.query)}`);  // 使用自己封装的 log4j 来打印日志信息
  log4js.info(`post params:${JSON.stringify(ctx.request.body)}`);  // 使用自己封装的 log4j 来打印日志信息
  await next();
  
})

// routes
router.prefix("/api")
router.use(users.routes(),users.allowedMethods())
app.use(router.routes(), router.allowedMethods())  

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
  log4js.error(`${err.stack}`)
});

module.exports = app

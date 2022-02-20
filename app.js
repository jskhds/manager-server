const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/log4j')
const users = require('./routes/users')

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
  await next();


  log4js.info(`log output`);  // 使用自己封装的 log4j 来打印日志信息
})

// routes
// app.use(index.routes(), index.allowedMethods())  // 一级路由
app.use(users.routes(), users.allowedMethods()) // 二级路由

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
  log4js.error(`${err.stack}`)
});

module.exports = app

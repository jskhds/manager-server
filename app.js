const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/log4j')
const users = require('./routes/users')
const jwt = require('jsonwebtoken')
const koajwt = require('koa-jwt')
const util = require('./utils/util')
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


 
// logger中间件 参数:ctx 接下来做的事: next

app.use(async (ctx, next) => {
  log4js.info(`get params:${JSON.stringify(ctx.request.query)}`);  // 使用自己封装的 log4j 来打印日志信息
  log4js.info(`post params:${JSON.stringify(ctx.request.body)}`);  // 使用自己封装的 log4j 来打印日志信息
  await next().catch((err)=>{
    if(err.status == 401){
      ctx.status = 200;
      ctx.body = util.fail('Token认证失败,请重新登录',util.CODE.AUTH_ERROR)
    }else{
      throw err
    }
  })
   
  
})

// 用中间件来拦截 token 是否有效
app.use(koajwt({ secret: 'tokenSecret' }).unless({
  path: [/^\/api\/users\/login/]
}))
// routes的公共前缀
router.prefix("/api")

// // 定义接口测试 token
// router.get('/leave/count', (ctx)=>{
//   // const token =  ctx.request.headers.authorization.split(' ')[1]
//   // const payload = jwt.verify(token,'tokenSecret')
//   ctx.body = 'body';
// })

router.use(users.routes(),users.allowedMethods())
app.use(router.routes(), router.allowedMethods())  

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
  log4js.error(`${err.stack}`)
});

module.exports = app

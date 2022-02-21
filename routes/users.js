/**
 * 用户管理模块
 */
const router = require("koa-router")();
const User = require("./../models/userSchema");
const util = require("./../utils/util");
const jwt = require("jsonwebtoken");
router.prefix("/users");



// 二级路由已经加了，所以我们只需要定义接口就可以了
// ctx 是 koa 的上下文对象，通过 ctx 可以拿到请求的参数

// 登录路由
router.post("/login", async (ctx) => {
  try {
    const { userName, userPwd } = ctx.request.body; //post 请求从 body 拿到
    // MongoDB的语法 查询,以及按需返回
    /**
     * 返回数据库指定字段，有三种方式
     * 1. 'userId userName userEmail state role deptId roleList'
     * 2. {userId:1,_id:0}
     * 3. select('userId')
     */
    const res = await User.findOne({
      userName,
      userPwd,
    },'userId userName userEmail state role deptId roleList');

    // 定义 jwt 生成的 token
    const data = res._doc  // res._doc 下是用户信息
    const token = jwt.sign({
      data:data
    }, 'tokenSecret',{expiresIn: "24h"});  // 30s 过期
    console.log("data=>",data);
    // console.log("token",token)
    if (data) {
      data.token = token;
      ctx.body = util.success(data);
    } else {
      ctx.body = util.fail("账号或密码错误");
    }
  } catch (err) {
    ctx.body = util.fail(err.msg);
  }
});

module.exports = router;

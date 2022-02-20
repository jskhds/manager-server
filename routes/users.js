/**
 * 用户管理模块
 */
const router = require("koa-router")();
const User = require("./../models/userSchema");
const util = require("./../utils/util");
router.prefix("/users");
// 二级路由已经加了，所以我们只需要定义接口就可以了
// ctx 是 koa 的上下文对象，通过 ctx 可以拿到请求的参数
router.post("/login", async (ctx) => {
  try {
    const { userName, userPwd } = ctx.request.body; //post 请求从 body 拿到
    // 查询
    const res = await User.findOne({
      userName,
      userPwd,
    });
    if (res) {
      ctx.body = util.success(res);
    } else {
      ctx.body = util.fail("账号或密码错误");
    }
  } catch (err) {
    ctx.body = util.fail(err.msg);
  }
});

module.exports = router;

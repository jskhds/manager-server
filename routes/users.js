/**
 * 用户管理模块
 */
const router = require("koa-router")();
const User = require("./../models/userSchema");
const util = require("./../utils/util");
const jwt = require("jsonwebtoken");
const Counter = require('./../models/counterSchema')
const md5 = require('md5')
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


// 用户列表
router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query)
  let params = {}
  if (userId) params.userId = userId;
  if (userName) params.userName = userName;
  if (state && state != '0') params.state = state;
  try {
    // 根据条件查询所有用户列表
    const query = User.find(params, { _id: 0, userPwd: 0 })
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await User.countDocuments(params);

    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })
  } catch (error) {
    ctx.body = util.fail(`查询异常:${error.stack}`)
  }
})


// 获取全部用户列表(用于作为部门管理时的负责人选择)
router.get('/all/list', async (ctx) => {
  try {
    const list = await User.find({}, "userId userName userEmail")
    ctx.body = util.success(list)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})


// 用户删除/批量删除 删除用 post 请求
router.post('/delete', async (ctx) => {
  // 待删除的用户Id数组
  const { userIds } = ctx.request.body
  // User.updateMany({ $or: [{ userId: 10001 }, { userId: 10002 }] })
  // 更新多个：用 in 比较方便，把状态改为2 （我们实现软删除，只是把状态改为离职，实际上数据还是在的）
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
  console.log(res)
  if (res.matchedCount) {
    console.log(res.matchedCount);
    ctx.body = util.success(res, `共删除成功${res.matchedCount}条`)
    return;
  }
  ctx.body = util.fail('删除失败');
}),



// 用户新增/编辑
router.post('/operate', async (ctx) => {
  const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } = ctx.request.body;
  if (action == 'add') {
    if (!userName || !userEmail || !deptId) {
      ctx.body = util.fail('参数错误', util.CODE.PARAM_ERROR)
      return;
    }
    const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, '_id userName userEmail')
    
    if (res) {
      ctx.body = util.fail(`系统监测到有重复的用户,信息如下:${res.userName} - ${res.userEmail}`)
    } else {
      const doc = await Counter.findOneAndUpdate({ _id: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })
      try {
        const user = new User({
          userId: doc.sequence_value,
          userName,
          userPwd: md5('123456'),
          userEmail,
          role: 1, //默认普通用户
          roleList,
          job,
          state,
          deptId,
          mobile
        })
        user.save();
        ctx.body = util.success('', '用户创建成功');
      } catch (error) {
        ctx.body = util.fail(error.stack, '用户创建失败');
      }
    }
  } else {
    if (!deptId) {
      ctx.body = util.fail('部门不能为空', util.CODE.PARAM_ERROR)
      return;
    }
    try {
      const res = await User.findOneAndUpdate({ userId }, { mobile, job, state, roleList, deptId, })
      ctx.body = util.success(res, '更新成功')
    } catch (error) {
      ctx.body = util.fail(error.stack, '更新失败')
    }
  }
})

module.exports = router;

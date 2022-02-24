/**
 * 部门管理模块
 */
 const router = require('koa-router')()
 const Dept = require('../models/deptSchema')
 const util = require('../utils/util')
 const jwt = require('jsonwebtoken')
 const md5 = require('md5')
 router.prefix('/dept')

// 部门树形列表
router.get('/list', async (ctx) => {
   let { deptName } = ctx.request.query;
   let params = {}
   if (deptName) params.deptName = deptName;
   let rootList = await Dept.find(params)
   if (deptName) {
       ctx.body = util.success(rootList);
   } else {
       let tressList = getTreeDept(rootList, null, [])
       ctx.body = util.success(tressList)
   }
})


// 递归拼接树形列表
// 第一次遍历：先获取一级菜单，也就是外面的根菜单，
// 然后去遍历一级菜单，依次进行，中间传递的是上一级菜单的 id
function getTreeDept(rootList, id, list) {
   for (let i = 0; i < rootList.length; i++) {
       let item = rootList[i]
       if (String(item.parentId.slice().pop()) == String(id)) {
           list.push(item._doc)
       }
   }
   list.map(item => {
       item.children = []
       getTreeDept(rootList, item._id, item.children)
       if (item.children.length == 0) {
           delete item.children;
       }
   })
   return list;
}

//  部门操作：创建，删除，编辑
router.post('/operate', async (ctx) => {
   const { _id, action, ...params } = ctx.request.body;
   let res, info;
   try {
       if (action == 'create') {
           await Dept.create(params)
           info = "创建成功"
       } else if (action == 'edit') {
           params.updateTime = new Date()
           await Dept.findByIdAndUpdate(_id, params)
           info = "编辑成功"
       } else if (action == 'delete') {
           await Dept.findByIdAndRemove(_id)
         //   如果把上一级删除了，下一级也全部都要删除
           await Dept.deleteMany({ parentId: { $all: [_id] } })
           info = "删除成功"
       }
       ctx.body = util.success('', info)
   } catch (error) {
       ctx.body = util.fail(error.stack)
   }
})

 module.exports = router;
const router = require('koa-router')()
const util = require('../utils/util')
const Menu = require('../models/menuSchema')

router.prefix('/menu')



// 菜单列表查询
router.get('/list', async (ctx) => {
    const { menuName, menuState } = ctx.request.query;
    const params = {}
    if (menuName) params.menuName = menuName;
    if (menuState) params.menuState = menuState;
    let rootList = await Menu.find(params) || []
    // 一级菜单的 parentId 为 null
    const permissionList = util.getTreeMenu(rootList, null, [])
    ctx.body = util.success(permissionList);
})
 

// 菜单编辑、删除、新增功能
router.post('/operate', async (ctx) => {
    const { _id, action, ...params } = ctx.request.body;
    let res, info;
    try {
        if (action == 'add') {
            // mongoose 创建表单：new 或者 create，没什么区别
            res = await Menu.create(params)
            info = '创建成功'
        } else if (action == 'edit') {
            params.updateTime = new Date();
            res = await Menu.findByIdAndUpdate(_id, params);
            info = '编辑成功'
        } else {
            // 删除的时候不能只删除一条，需要把关联的子数据也删除
            res = await Menu.findByIdAndRemove(_id)
            // 所以需要判断，因为子id会指向 parentId，所以包含这个子id的parent也都要删掉
            await Menu.deleteMany({ parentId: { $all: [_id] } })
            info = '删除成功'
        }
        ctx.body = util.success('', info);
    } catch (error) {
        ctx.body = util.fail(error.stack);
    }

})

module.exports = router;
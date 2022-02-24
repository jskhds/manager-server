/**
 * 通用工具函数封装
 */
const jwt = require("jsonwebtoken")
 const log4js = require('./log4j')
 const CODE = {
     SUCCESS: 200,
     PARAM_ERROR: 10001, // 参数错误
     USER_ACCOUNT_ERROR: 20001, //账号或密码错误
     USER_LOGIN_ERROR: 30001, // 用户未登录
     BUSINESS_ERROR: 40001, //业务请求失败
     AUTH_ERROR: 500001, // 认证失败或TOKEN过期
 }
//  导出对象，
 module.exports = {
     /**
      * 分页结构封装
      * @param {number} pageNum 
      * @param {number} pageSize 
      */

     pager({ pageNum = 1, pageSize = 10 }) {
         pageNum *= 1;  // 用 * 号确保是数字而不是字符串
         pageSize *= 1;
         const skipIndex = (pageNum - 1) * pageSize;  // 计算下一次从什么索引开始查询，是 MongoDB的模式
         return {
             page: {
                 pageNum,
                 pageSize
             },
             skipIndex
         }
     },
     /**
      * 状态码封装
      * @param {*} data 
      * @param {*} msg 
      * @param {*} code 
      * @returns 
      */
     success(data = '', msg = '', code = CODE.SUCCESS) {
         log4js.debug(data); // 成功的时候看一下打印的 data
         return {
             code, data, msg
         }
     },
     fail(msg = '', code = CODE.BUSINESS_ERROR, data = '') {
         log4js.debug(msg);  // 失败的时候 data 肯定拿不到，为空，主要看一下 msg 的信息
         return {
             code, data, msg
         }
     }, 
     CODE,
      // 递归拼接树 形成列表 需要好好理解
    getTreeMenu(rootList, id, list) {
        for (let i = 0; i < rootList.length; i++) {
            let item = rootList[i]
            if (String(item.parentId.slice().pop()) == String(id)) {
                list.push(item._doc)
            }
        }
        list.map(item => {
            item.children = []
            this.getTreeMenu(rootList, item._id, item.children)
            if (item.children.length == 0) {
                delete item.children;
            } else if (item.children.length > 0 && item.children[0].menuType == 2) {
                // 快速区分按钮和菜单，用于后期做菜单按钮权限控制
                item.action = item.children;
            }
        })
        return list;
    },
    // token 解密函数
    decoded(authorization){
        if(authorization){
            let token = authorization.split(" ")[1];
            return jwt.verify(token,"tokenSecret");
          }
          return '';

    },
    // 格式化日期
    formateDate(date, rule) {
        let fmt = rule || 'yyyy-MM-dd hh:mm:ss'
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, date.getFullYear())
        }
        const o = {
            // 'y+': date.getFullYear(),
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                const val = o[k] + '';
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? val : ('00' + val).substr(val.length));
            }
        }
        return fmt;
    },
 }
/**
 * 通用工具函数封装
 */
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
     CODE     
 }
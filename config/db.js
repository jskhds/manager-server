/**
 * 数据库连接
 */
// getting-started.js
const mongoose = require('mongoose');
const config = require('./index')
const log4js = require('./../utils/log4j')
main().catch(err => console.log("error",err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/managerDatabase');
}

const db = mongoose.connection;
db.on('error', ()=>{
    log4js.error('数据库连接失败')
})
db.on('open', ()=>{
    log4js.info('数据库连接成功')
})
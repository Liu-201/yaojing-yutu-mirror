const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 数据库环境变量检查:');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLPORT:', process.env.MYSQLPORT);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '已设置' : '未设置');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ 数据库连接失败，完整错误:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  } else {
    console.log('✅ 数据库连接成功');
    connection.release();
  }
});

module.exports = pool.promise();
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 数据库环境变量检查:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已设置' : '未设置');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
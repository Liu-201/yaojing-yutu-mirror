const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// 创建连接池，使用 Railway 自动注入的 MySQL 环境变量
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 添加一个简单的测试连接函数（可选，用于日志）
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
  } else {
    console.log('✅ 数据库连接成功');
    connection.release();
  }
});

module.exports = pool.promise();
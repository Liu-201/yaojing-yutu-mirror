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

// 自动创建表（如果不存在）
const createTables = async () => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        nickname VARCHAR(50),
        phone VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        herb_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorite (user_id, herb_id)
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS qa_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        refs TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 数据库表已检查/创建');
  } catch (err) {
    console.error('❌ 创建表失败:', err);
  } finally {
    connection.release();
  }
};

// 测试连接并建表
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ 数据库连接失败，完整错误:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  } else {
    console.log('✅ 数据库连接成功');
    connection.release();
    createTables(); // 连接成功后自动建表
  }
});

module.exports = pool.promise();
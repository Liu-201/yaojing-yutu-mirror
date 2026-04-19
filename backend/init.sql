-- 创建数据库
CREATE DATABASE IF NOT EXISTS yaojing;
USE yaojing;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  nickname VARCHAR(50),
  phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  herb_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, herb_id)
);

-- 问答历史表
CREATE TABLE IF NOT EXISTS qa_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  refs TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入一个测试用户（密码为 123456，bcrypt 加密示例）
INSERT INTO users (username, nickname, phone, password) 
VALUES ('testuser', '测试用户', '13800138000', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr5u8qRrXZ6Q6Mq8Qq8Qq8Qq8Qq8Qq');
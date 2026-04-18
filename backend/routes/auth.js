const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  const { username, phone, password, code } = req.body;
  if (code !== '123456') {
    return res.status(400).json({ message: '验证码错误' });
  }
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(400).json({ message: '手机号已注册' });
    }
    const [existingUser] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, nickname, phone, password) VALUES (?, ?, ?, ?)',
      [username, username, phone, hashedPassword]
    );
    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      user: { id: result.insertId, username, nickname: username, phone, avatar: null }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 密码登录
router.post('/login/password', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(401).json({ message: '手机号或密码错误' });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: '手机号或密码错误' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 验证码登录
router.post('/login/sms', async (req, res) => {
  const { phone, code } = req.body;
  if (code !== '123456') {
    return res.status(400).json({ message: '验证码错误' });
  }
  try {
    const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(401).json({ message: '手机号未注册' });
    }
    const user = users[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 发送验证码（模拟）
router.post('/send-sms', async (req, res) => {
  const { phone } = req.body;
  // 实际项目中调用短信服务商 API
  res.json({ success: true, message: '验证码已发送（演示：123456）' });
});

module.exports = router;
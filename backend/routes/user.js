const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, nickname, phone, avatar FROM users WHERE id = ?', [req.userId]);
    if (users.length === 0) return res.status(404).json({ message: '用户不存在' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新个人资料
router.put('/profile', authMiddleware, async (req, res) => {
  const { nickname, avatar } = req.body;
  try {
    await db.query('UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar) WHERE id = ?', 
      [nickname, avatar, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '更新失败' });
  }
});

// 修改密码
router.put('/password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.userId]);
    const valid = await bcrypt.compare(oldPassword, users[0].password);
    if (!valid) return res.status(401).json({ message: '原密码错误' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '修改失败' });
  }
});

// 获取收藏列表
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT herb_id FROM favorites WHERE user_id = ?', [req.userId]);
    res.json(rows.map(r => r.herb_id));
  } catch (err) {
    res.status(500).json({ message: '获取失败' });
  }
});

// 添加收藏
router.post('/favorites', authMiddleware, async (req, res) => {
  const { herbId } = req.body;
  try {
    await db.query('INSERT IGNORE INTO favorites (user_id, herb_id) VALUES (?, ?)', [req.userId, herbId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '添加失败' });
  }
});

// 取消收藏
router.delete('/favorites/:herbId', authMiddleware, async (req, res) => {
  const herbId = parseInt(req.params.herbId);
  try {
    await db.query('DELETE FROM favorites WHERE user_id = ? AND herb_id = ?', [req.userId, herbId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '取消失败' });
  }
});

// 获取问答历史
router.get('/qa-history', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, question, answer, refs, created_at FROM qa_history WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '获取失败' });
  }
});

// 保存问答记录
router.post('/qa-history', authMiddleware, async (req, res) => {
  const { question, answer, refs } = req.body;
  try {
    await db.query(
      'INSERT INTO qa_history (user_id, question, answer, refs) VALUES (?, ?, ?, ?)',
      [req.userId, question, answer, JSON.stringify(refs || [])]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '保存失败' });
  }
});

// 清空问答历史
router.delete('/qa-history', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM qa_history WHERE user_id = ?', [req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '清空失败' });
  }
});

module.exports = router;
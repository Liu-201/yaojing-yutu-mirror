const express = require('express');
const db = require('../db');
const router = express.Router();

// 获取所有药材列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM herbs ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个药材详情
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [rows] = await db.query('SELECT * FROM herbs WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: '药材不存在' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有产区
router.get('/areas/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM producing_areas');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
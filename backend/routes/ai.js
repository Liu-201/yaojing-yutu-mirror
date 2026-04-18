const express = require('express');
const router = express.Router();

// 此处可对接真实大模型 API（如 DeepSeek、文心一言）
router.post('/chat', async (req, res) => {
  const { question } = req.body;
  // 前端已有模拟回答，后端仅做示例转发
  // 实际项目中可调用第三方 API
  res.json({
    answer: `【后端代理】您的问题是：“${question}”。如需真实回答，请接入大模型 API。`,
    refs: []
  });
});

module.exports = router;
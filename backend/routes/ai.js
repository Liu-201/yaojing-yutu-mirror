const express = require('express');
const router = express.Router();

// DeepSeek API 对话接口
router.post('/chat', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: '问题不能为空' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('❌ DEEPSEEK_API_KEY 环境变量未设置');
    return res.status(500).json({
      answer: 'AI 服务配置错误，请联系管理员。',
      refs: []
    });
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的中医药知识助手，专注于回答中药材相关问题。
                      请基于权威知识（如《中国药典》、《中药学》教材等）回答。
                      如果问题与中药材无关，请礼貌地说明无法回答。
                      回答要简洁、准确，可以适当引用经典文献。`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API 错误 (${response.status}):`, errorText);
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';

    // 可选：从回答中提取参考来源（简单模拟，实际 DeepSeek 不返回结构化 refs）
    // 这里返回空数组，前端可以忽略
    res.json({
      answer: answer,
      refs: []
    });
  } catch (error) {
    console.error('调用 DeepSeek API 出错:', error);
    res.status(500).json({
      answer: 'AI 服务暂时不可用，请稍后再试。',
      refs: []
    });
  }
});

module.exports = router;
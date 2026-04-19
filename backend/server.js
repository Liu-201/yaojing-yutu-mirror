const app = require('./app');

// 使用 Railway 分配的端口，如果没有则默认 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
});
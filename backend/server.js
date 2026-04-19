const app = require('./app');

// 使用 Railway 分配的端口，若无默认8080
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {console.log(`✅ 服务器运行在端口 ${PORT}`);
});
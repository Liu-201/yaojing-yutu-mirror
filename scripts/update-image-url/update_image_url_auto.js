const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');

dotenv.config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// COS URL 前缀（例如：https://bucket.cos.region.myqcloud.com/herbs/）
const urlPrefix = process.env.COS_URL_PREFIX;

// 扩展名优先级（按顺序尝试）
const EXTENSIONS = ['.jpg', '.png', '.jpeg', '.webp', '.gif'];

// 检查文件是否存在（HEAD 请求）
function checkFileExists(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

// 对中文进行 URL 编码
function encodeFilename(name) {
  return encodeURIComponent(name).replace(/%2F/g, '/');
}

async function updateImageUrls() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 获取所有需要更新的药材（可根据条件筛选，例如 image_url 为空或不是 https 开头）
    const [rows] = await connection.execute(
      `SELECT id, name FROM herbs WHERE image_url IS NULL OR image_url NOT LIKE 'https://%'`
    );
    console.log(`📋 找到 ${rows.length} 条药材需要更新`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const row of rows) {
      const { id, name } = row;
      let finalUrl = null;

      // 尝试每个扩展名
      for (const ext of EXTENSIONS) {
        const fileName = `${name}${ext}`;
        const encodedFileName = encodeFilename(fileName);
        const testUrl = `${urlPrefix}${encodedFileName}`;
        const exists = await checkFileExists(testUrl);
        if (exists) {
          finalUrl = testUrl;
          console.log(`✅ ${name} -> 找到 ${ext} 文件`);
          break;
        }
      }

      if (finalUrl) {
        await connection.execute(`UPDATE herbs SET image_url = ? WHERE id = ?`, [finalUrl, id]);
        updatedCount++;
      } else {
        console.warn(`⚠️ ${name} (id=${id}) 未找到任何图片文件（尝试了 ${EXTENSIONS.join(', ')}）`);
        notFoundCount++;
      }
    }

    console.log(`\n🎉 完成！更新了 ${updatedCount} 条记录，未找到 ${notFoundCount} 条。`);
  } catch (err) {
    console.error('❌ 错误:', err);
  } finally {
    if (connection) await connection.end();
  }
}

updateImageUrls();
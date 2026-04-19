const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const Bucket = process.env.COS_BUCKET;
const Region = process.env.COS_REGION;

// 本地图片文件夹路径（相对于当前脚本）
const localImagesDir = path.join(__dirname, '../frontend/public/images/herbs');

// 目标 COS 路径前缀（建议保持 /herbs/）
const cosPrefix = 'herbs/';

// 支持的图片格式
const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// 上传单个文件
function uploadFile(localPath, cosKey) {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket,
      Region,
      Key: cosKey,
      Body: fs.createReadStream(localPath),
      onProgress: (progressData) => {
        console.log(`⏫ 上传中: ${cosKey} (${Math.floor(progressData.percent * 100)}%)`);
      }
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// 批量上传
async function uploadAll() {
  if (!fs.existsSync(localImagesDir)) {
    console.error(`❌ 目录不存在: ${localImagesDir}`);
    return;
  }

  const files = fs.readdirSync(localImagesDir);
  const imageFiles = files.filter(file => extensions.includes(path.extname(file).toLowerCase()));

  if (imageFiles.length === 0) {
    console.log('⚠️ 没有找到图片文件');
    return;
  }

  console.log(`📷 找到 ${imageFiles.length} 张图片，开始上传...\n`);

  const results = [];

  for (const file of imageFiles) {
    const localPath = path.join(localImagesDir, file);
    const cosKey = `${cosPrefix}${file}`;
    try {
      const data = await uploadFile(localPath, cosKey);
      const url = `https://${Bucket}.cos.${Region}.myqcloud.com/${cosKey}`;
      console.log(`✅ 上传成功: ${file} -> ${url}`);
      results.push({ file, url });
    } catch (err) {
      console.error(`❌ 上传失败: ${file}`, err);
    }
  }

  console.log('\n🎉 上传完成！以下是对应的图片 URL，可填入数据库 image_url 字段：');
  results.forEach(r => {
    console.log(`${r.file}: ${r.url}`);
  });
}

uploadAll().catch(console.error);
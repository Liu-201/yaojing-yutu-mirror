// 模拟发送短信验证码
const sendSmsCode = async (phone) => {
  // 实际项目中调用第三方短信服务商
  console.log(`向 ${phone} 发送验证码：123456`);
  return true;
};

module.exports = { sendSmsCode };
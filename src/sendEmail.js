const nodemailer = require('nodemailer');
const user = process.env.MAILL_USER
const pass = process.env.MAILL_PASS
const sendMail = async (data) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: '465',
    service:'qq',
    secureConnection: true,
    auth: {
      user,
      pass,
    }
  });

  data.from = `"${data.from}" ${user}`;

  await transporter.sendMail(data);
};

module.exports = sendMail;

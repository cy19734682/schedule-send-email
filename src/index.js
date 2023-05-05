const dotenv = require("dotenv")
dotenv.config()
const user = process.env.MAILL_USER
const pass = process.env.MAILL_PASS
const to = process.env.MAILL_TO
const weatherKey = process.env.WEATHER_KEY
const tianXingKey = process.env.TIANXING_KEY
if(!(user && pass && to && weatherKey && tianXingKey)){
  console.log("ERROR：请检查配置文件")
  return
}
const fetch = require('node-fetch');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

const sendEmail = require('./sendEmail');
const emailHtml = require('./emailHtml');
// 给dayjs添加时区选项
dayjs.extend(utc);
dayjs.extend(timezone);

const nowDay = dayjs().tz('Asia/Chongqing') //获取当前时区时间

const {
  fromDisplayText,
  fromDisplaySubText,
  location,
  type,
  startDay,
} = require('./config');

async function init() {
  try {
    // 获取天气信息
    const weatherRes = await fetch(
      `https://devapi.qweather.com/v7/weather/3d?key=${weatherKey}&location=${location}`
    );
    const weatherData = await weatherRes.json();

    // 获取天气生活指数
    const lifeRes = await fetch(
      `https://devapi.qweather.com/v7/indices/1d?key=${weatherKey}&location=${location}&type=${type}`
    );
    const lifeData = await lifeRes.json();

    // 获取one一个文案及图片
    const oneRes = await fetch(
      `https://apis.tianapi.com/one/index?key=${tianXingKey}&date=${nowDay.format('YYYY-MM-DD')}`
    );
    const oneData = await oneRes.json();
    const { word, imgurl } = oneData.result;
    
    // 计算日期
    const lovingDays = dayjs(nowDay).diff(
      startDay,
      'days'
    );

    // 用邮件模版生成字符串
    const htmlStr = emailHtml(weatherData, lifeData, word, imgurl, lovingDays);

    // 发送邮件;
    sendEmail({
      from: fromDisplayText,
      to,
      subject: fromDisplaySubText + `(${nowDay.format('YYYY年MM月DD日')})`,
      html: htmlStr,
    });
  } catch (e) {
    console.error(e)
    // 发送邮件给自己提示
    sendEmail({
      from: '报错啦',
      to: user,
      subject: '定时邮件-报错提醒',
      html: '请查看github actions',
    });
  }
}

init();

/*
 *
 *
脚本功能：单词鸭-消消乐背单词-导入单词自建词库-场景主题英语词根词缀
软件版本：3.8.2
下载地址：
脚本作者：
更新时间：
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
^https:\/\/zhcn\.api\.wordln\.com\/tomato-word url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/dcy.js

[mitm]
hostname = zhcn.api.wordln.com
*
*
*/




let body = $response.body;
let obj = JSON.parse(body);

if (obj.data) {
  // 设置所有常见的VIP相关字段
  let vipData = {
    vipActive: true,
    vipFlag: 1,
    vipEndTime: 4102415999000,
    vipExpireTime: "2099-12-31",
    needVip: false,
    gold: 9999,
    physical: 9999,
    nickName: "VIP用户",
    appleId: "com.wordln.app.super_1"
  };
  
  // 批量设置字段
  for (let key in vipData) {
    if (obj.data.hasOwnProperty(key)) {
      obj.data[key] = vipData[key];
    }
  }
  
  // 批量修改词库单元权限
  if (obj.data.childTypes) {
    obj.data.childTypes.forEach(unit => {
      if (unit.needVip !== undefined) unit.needVip = false;
      if (unit.vipFlag !== undefined) unit.vipFlag = 0;
    });
  }
}

$done({body: JSON.stringify(obj)});


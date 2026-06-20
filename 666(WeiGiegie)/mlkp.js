
/*
 *
 *
脚本功能：麻溜快跑 无限金币+钻石
软件版本：微信小程序
下载地址：
脚本作者：
更新时间：2026
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
# > 麻溜快跑 无限金币+钻石
^https?:\/\/udl.lesejie.com\/api\/game\/info url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/mlkp.js

[mitm]
hostname = udl.lesejie.com
*
*
*/

let body = $response.body;
let obj = JSON.parse(body);

// 修改外层的金币和钻石
obj.data.gold = 99999999;
obj.data.diamond = 99999999;

// 修改 game1 内部的数值
let game1 = JSON.parse(obj.data.game1);
game1.AmountOfCoins = "99999999";
game1.AmountOfKeys = "99999999";
obj.data.game1 = JSON.stringify(game1);

$done({ body: JSON.stringify(obj) });

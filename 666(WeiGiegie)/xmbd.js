/*
 *
 *
脚本功能：消灭病毒 (微信小程序) 修改金币、钻石、
软件版本：
脚本作者：
更新时间：2026-03-31
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
^https?:\/\/wx-bingdu\.lanfeitech\.com\/api\/archive\/get url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/xmbd.js

[mitm]
hostname = wx-bingdu.lanfeitech.com
*
*
*/




var body = $response.body;
let obj = JSON.parse(body);

if (obj.data && obj.data.record) {
    let record = JSON.parse(obj.data.record);

    record.money = "99999999999999999999999999999999999";//金币
    record.zuanShi = 99999;//钻石💎改多会封号😭

    obj.data.record = JSON.stringify(record);
}

$done({ body: JSON.stringify(obj) });

/*
 *
 *
脚本功能：心晴计划-日常计划-project50自律健身打卡-习惯养成
软件版本：1.4.6
下载地址：
脚本作者：
更新时间：
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
^https:\/\/relaxed\.navolove\.com\/api\/refreshUserInfo url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/xqjh.js

[mitm]
hostname = relaxed.navolove.com
*
*
*/


let body = $response.body;
let obj = JSON.parse(body);

if (obj.data) {
    obj.data.is_vip = true;
    obj.data.vip_type = 5;
    obj.data.end_at = "2099-12-31 23:59:59";
    obj.data.expire_time = 9999999999;
    obj.data.expire_time_format = "永久有效";
}

body = JSON.stringify(obj);
$done({body});

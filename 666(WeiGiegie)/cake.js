/*
 *
 *
脚本功能：cake-学习英语与韩语
软件版本：
下载地址：
脚本作者：
更新时间：
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
^https:\/\/api\.mycake\.me\/app\/start url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/cake.js

[mitm]
hostname = api.mycake.me
*
*
*/


var obj = JSON.parse($response.body);

if (obj && obj.extra) {
    obj.extra.membershipBenefitBridgeId = 0;
    obj.extra.membershipSource = "CAKE";
    obj.extra.membership = "PLUS";
    obj.extra.subscriptionStatus = "FREE_TRIAL";
}

$done({body: JSON.stringify(obj)});
/******************************

脚本功能：蜜柚短剧——解锁VIP
下载地址：https://is.gd/87umId
软件版本：1.0.7
脚本作者：彭于晏💞
更新时间：2025-4-22
问题反馈：QQ+89996462
QQ会员群：779392027💞
TG反馈群：https://t.me/plus8889
TG频道群：https://t.me/py996
使用声明：⚠️此脚本仅供学习与交流，请勿转载与贩卖！⚠️⚠️⚠️

*******************************

[rewrite_local]

^http[s]?:\/\/api.duoyolo.cn\/play\/app\/user\/v1\/userInfo url script-response-body https://raw.githubusercontent.com/89996462/Quantumult-X/main/ycdz/duoyolo.js

[mitm] 

hostname = api.duoyolo.cn

*******************************/

var body = $response.body.replace(/memberStatus":\w+/g,'memberStatus":true')
.replace(/expDate":\w+/g,'expDate":"2999-09-09 09:09:09"')
$done({ body });

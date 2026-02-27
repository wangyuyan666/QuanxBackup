/*
 *
 *
脚本功能：疯狂背单词-英语学习常备软件
软件版本：2.5
下载地址：
脚本作者：
更新时间：
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
^https?:\/\/api.fengkuangapp.com\/account\/grant\/detail\/info\/ url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/fkbdc.js

[mitm]
hostname = api.fengkuangapp.com
*
*
*/




var body = JSON.parse($response.body);

body.data.vip_info = {
    "id": 139,
    "title": "终身VIP",
    "subtitle": "终身VIP",
    "is_vip": 1,
    "is_permanent": 1,
    "product_id": "shark.crazyword.continuous",
    "price": "98",
    "original_price": "998",
    "continue_price": "98",
    "vip_start_time": "2026-01-01 00:00:00",
    "vip_end_time": "9999-01-01 00:00:00",
    "vip_days": 99999,
    "remain_days": 99999,
    "vip_type": 4,
    "vip_level": 10,
    "is_sale": 1,
    "time_limit": 1,
    "always": 0,
    "auto_buy": 1,
    "status": 1,
    "finish_date": "9999-01-01 00:00:00",
    "days": 999999
};

// 用户组改成VIP权限
body.data.group = 10;
body.data.role_id = 2;
// 用户名/头像
body.data.nick = "@t.me/GieGie777";
body.data.photo = "http://ykhp-user-imges.yikaobang.com.cn/Uploads/Avatar/2024/08/18/66c188e2d4fab.jpg";
$done({ body: JSON.stringify(body) });


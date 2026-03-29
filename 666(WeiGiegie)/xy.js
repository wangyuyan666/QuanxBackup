/*
 *
 *
脚本功能：现映-短剧独家好剧抢先看
软件版本：3.0.1
下载地址：
脚本作者：
更新时间：
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
^https:\/\/xianying-api.fansxiaoshuo.cn\/(usercenter\/client|video\/client\/short_play) url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/xy.js

[mitm]
hostname = xianying-api.fansxiaoshuo.cn
*
*
*/



















var body = $response.body;
var url = $request.url;
var obj = JSON.parse(body);

const p1 = '/short_play/episode_list';  
const p2 = '/usercenter/client/mine_tab';       

// 短剧解锁：试看完整时长 + 移除付费限制
if (url.indexOf(p1) !== -1) {
    if (obj.body && obj.body.episode_list) {
        for (var i = 0; i < obj.body.episode_list.length; i++) {
            var episode = obj.body.episode_list[i];
            // 试看时长设为完整时长
            episode.try_duration = episode.duration;
            // 解锁类型：0 = 已解锁/免费
            episode.unlock_type = 0;
            // 播放权限：1 = 可播放
            episode.can_play = 1;
            // 价格清零
            episode.price = 0;
            // 如果高清链接存在但普清为空，则补充普清链接（可选）
            if (!episode.play_url && episode.play_url_265) {
                episode.play_url = episode.play_url_265;
            }
        }
    }
    body = JSON.stringify(obj);
}

if (url.indexOf(p2) !== -1) {
    obj.body.vip_info.vip_type = 1;
    obj.body.vip_info.expire_time = 32493834549000;
    obj.body.vip_info.vip_expire = 32493834549000;
    obj.body.vip_info.vip_type = 1;
    obj.body.vip_info.vip_code = "subscription_xianying_oneyear_299yuan";
    body = JSON.stringify(obj);
}
$done({ body: body });

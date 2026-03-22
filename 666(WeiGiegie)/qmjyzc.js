/*
 *
 *
脚本功能：全民解压找茬 - 关卡辅助（系统通知显示操作提示 + 延长游戏时间）
软件版本：微信小程序
下载地址：
脚本作者：
更新时间：
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
^https?:\/\/res5.haotgame.com\/cu03\/static\/OpenDoors\/Res\/data\/levels\/\d+\.json url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/qmjyzc.js

[mitm]
hostname = res5.haotgame.com
*
*
*/

// 环境判断
const ENV = {
  isQX: typeof $task !== "undefined",
  isLoon: typeof $loon !== "undefined",
  isSurge: typeof $httpClient !== "undefined" && typeof $loon === "undefined"
};

// 通用通知函数
function showNotification(title, subtitle, message, openUrl) {
  if (ENV.isQX) {
    if (openUrl) {
      $notify(title, subtitle, message, { "open-url": openUrl });
    } else {
      $notify(title, subtitle, message);
    }
  } else if (ENV.isLoon) {
    if (openUrl) {
      $notification.post(title, subtitle, message, openUrl);
    } else {
      $notification.post(title, subtitle, message);
    }
  } else if (ENV.isSurge) {
    if (openUrl) {
      $notification.post(title, subtitle, message, { url: openUrl });
    } else {
      $notification.post(title, subtitle, message);
    }
  }
}

// 日志输出
function log(message) {
  console.log(`[全民解压找茬] ${message}`);
}

// 格式化提示（添加序号）
function formatTips(answers) {
  if (!answers || typeof answers !== "object") return "";
  let index = 1;
  const lines = [];
  for (let key in answers) {
    lines.push(`${index}、${answers[key]}`);
    index++;
  }
  return lines.join("\n");
}

// 主函数
try {
  let obj = JSON.parse($response.body);

  const gameType = obj.GameType || "未知";
  const originalTitle = obj.Title || "";
  log(`关卡加载: ${gameType} - ${originalTitle}`);

  // 1. 延长游戏时间至 9999 秒
  if (obj.Time) {
    const oldTime = obj.Time;
    obj.Time = 9999;
    log(`游戏时间已从 ${oldTime} 秒延长至 ${obj.Time} 秒`);
  }

  // 2. 提取并格式化操作提示
  let fullTips = "";
  if (obj.answers && typeof obj.answers === "object") {
    fullTips = formatTips(obj.answers);
    const tipCount = Object.keys(obj.answers).length;
    log(`操作提示已提取，共 ${tipCount} 条`);
    log(`完整提示内容:\n${fullTips}`);
  } else {
    fullTips = "无操作提示";
    log(`未找到 answers 字段`);
  }

  // 3. 发送系统通知（限制长度避免超出）
  const notifyMsg = fullTips.length > 200 ? fullTips.substring(0, 200) + "…" : fullTips;
  const gameFullName = "全民解压找茬";
  const subTitle = obj.Title || `关卡 ${gameType}`;
  log(`准备发送通知: 标题="${gameFullName} - 关卡辅助", 副标题="${subTitle}", 通知消息长度=${notifyMsg.length}`);
  showNotification(`${gameFullName} - 关卡辅助`, subTitle, notifyMsg);
  log(`通知已发送`);

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  log(`处理出错: ${e.message}`);
  $done({ body: $response.body });
}

/**
 * 来连VPN 节点提取脚本 
 * 作者：https://t.me/GieGie777
 * 日期：2026-06-27
 * 更新：将节点链接直接输出到控制台，避免剪贴板不可用时无法查看
 * 兼容：Quantumult X, Loon, Surge
 * 注意：仅用于学习交流，请24小时内删除
 */

/******************** 环境检测 ********************/
const ENV = {
  isQX: typeof $task !== "undefined",
  isLoon: typeof $loon !== "undefined",
  isSurge: typeof $httpClient !== "undefined" && typeof $loon === "undefined"
};

/******************** 工具函数 ********************/
function safeJsonParse(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

function httpRequest(options) {
  return new Promise(resolve => {
    if (ENV.isQX) {
      $task.fetch(options).then(res => {
        resolve({
          statusCode: res.statusCode,
          body: res.body || null,
          error: null
        });
      }).catch(err => {
        resolve({ statusCode: 500, body: null, error: String(err) });
      });
    } else if (ENV.isLoon || ENV.isSurge) {
      const method = (options.method || "GET").toUpperCase();
      const httpFn = method === "POST" ? $httpClient.post : $httpClient.get;
      httpFn(options, (err, res, body) => {
        resolve({
          statusCode: err ? 500 : (res.status || res.statusCode || 200),
          body: err ? null : body,
          error: err ? String(err) : null
        });
      });
    } else {
      resolve({ statusCode: 500, body: null, error: "Unknown environment" });
    }
  });
}

function done(response = {}) {
  if (typeof $done !== "undefined") $done(response);
}

function showNotification(title, subtitle, message, openUrl) {
  if (ENV.isQX) {
    $notify(title, subtitle, message, openUrl ? { "open-url": openUrl } : {});
  } else if (ENV.isLoon) {
    $notification.post(title, subtitle, message, openUrl);
  } else if (ENV.isSurge) {
    $notification.post(title, subtitle, message, openUrl ? { url: openUrl } : {});
  }
}

function log(msg) {
  console.log(`[来连VPN] ${msg}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 剪贴板写入兼容
function setClipboard(text) {
  try {
    if (typeof $clipboard !== "undefined") {
      $clipboard.text = text;
      return true;
    } else if (typeof $pb !== "undefined") {
      $pb.write(text);
      return true;
    }
  } catch (e) {}
  return false;
}

/******************** 随机生成 ********************/
function randomHex(len) {
  return Array.from({length: len}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
function generateDeviceUid() {
  return randomHex(32) + 'x';
}

const DEVICE_NAME_POOL = [
  "iPhone13,4", "iPhone14,5", "iPhone15,3", "iPhone15,4",
  "iPad13,16", "iPad14,3", "iPad16,1", "iPhone14,2", "iPhone15,5"
];
function randomDeviceName() {
  return DEVICE_NAME_POOL[Math.floor(Math.random() * DEVICE_NAME_POOL.length)];
}

/******************** 常量 ********************/
const UA = "evvpn/1 CFNetwork/1402.0.8 Darwin/22.2.0";
const BASE = "https://api.lailian.app";

/******************** 主流程 ********************/
async function main() {
  try {
    // 1. 注册主设备
    const mainUid = generateDeviceUid();
    const mainName = randomDeviceName();
    log(`主设备注册 → ${mainName} / ${mainUid}`);

    const mainRes = await httpRequest({
      url: `${BASE}/api/user/auth/deviceLogin`,
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Accept-Language": "zh-CN,zh-Hans;q=0.9"
      },
      body: JSON.stringify({
        deviceName: mainName,
        osVersion: "16.2",
        deviceType: "ios",
        deviceUid: mainUid
      })
    });
    const mainData = safeJsonParse(mainRes.body);
    if (!mainData || mainData.code !== 200) throw new Error("主设备注册失败");

    const mainToken = mainData.data.token;
    log("主账号 token 获取成功");

    // 2. 注册子设备
    const subUid = generateDeviceUid();
    const subName = randomDeviceName();
    log(`子设备注册 → ${subName} / ${subUid}`);

    const subRes = await httpRequest({
      url: `${BASE}/api/user/auth/deviceLogin`,
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Accept-Language": "zh-CN,zh-Hans;q=0.9"
      },
      body: JSON.stringify({
        deviceName: subName,
        osVersion: "16.2",
        deviceType: "ios",
        deviceUid: subUid
      })
    });
    const subData = safeJsonParse(subRes.body);
    if (!subData || subData.code !== 200) throw new Error("子设备注册失败");

    const subToken = subData.data.token;
    log("子账号 token 获取成功");

    // 3. 获取主账号邀请码
    const inviteRes = await httpRequest({
      url: `${BASE}/api/user/self/inviteDetail`,
      method: "POST",
      headers: {
        "Accept": "application/json",
        "X-Token": mainToken,
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Accept-Language": "zh-CN,zh-Hans;q=0.9"
      },
      body: ""
    });
    const inviteData = safeJsonParse(inviteRes.body);
    if (!inviteData || inviteData.code !== 200) throw new Error("获取邀请码失败");

    const inviteCode = inviteData.data.inviteCode;
    log(`邀请码 → ${inviteCode}`);

    // 4. 子账号绑定邀请（静默，不影响后续）
    try {
      const bindRes = await httpRequest({
        url: `${BASE}/api/user/self/bindInviter`,
        method: "POST",
        headers: {
          "Accept": "application/json",
          "X-Token": subToken,
          "Content-Type": "application/json",
          "User-Agent": UA,
          "Accept-Language": "zh-CN,zh-Hans;q=0.9"
        },
        body: JSON.stringify({ inviteCode })
      });
      const bindData = safeJsonParse(bindRes.body);
      const msg = bindData?.data?.message || bindData?.message || "";
      log(msg.includes("已绑定") ? "绑定结果 → 已自动绑定或风控" : `绑定结果 → ${msg}`);
    } catch (e) {
      log("绑定请求异常，继续提取节点");
    }

    // 5. 获取全部节点列表
    const nodeListRes = await httpRequest({
      url: `${BASE}/api/user/node/nodeList`,
      method: "POST",
      headers: {
        "Accept": "application/json",
        "X-Token": mainToken,
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "x-platform": "ios"
      },
      body: ""
    });
    const nodeListData = safeJsonParse(nodeListRes.body);
    if (!nodeListData || nodeListData.code !== 200) throw new Error("节点列表获取失败");

    const allNodes = nodeListData.data.nodes || [];
    log(`共发现 ${allNodes.length} 个节点，开始逐个提取（间隔2秒）...`);

    // 6. 逐个节点请求 connect 接口，提取链接
    const extractedLinks = [];
    for (const node of allNodes) {
      const { id: nodeId, nodeName, tags = [] } = node;

      // 构造备注：美国-5(大带宽-流媒体解锁)
      let remark = nodeName;
      if (tags.length > 0) remark += `(${tags.join('-')})`;

      try {
        const connRes = await httpRequest({
          url: `${BASE}/api/user/node/connect`,
          method: "POST",
          headers: {
            "Accept": "application/json",
            "X-Token": mainToken,
            "Content-Type": "application/json",
            "User-Agent": UA,
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "x-platform": "ios"
          },
          body: JSON.stringify({ nodeId })
        });

        const connData = safeJsonParse(connRes.body);
        if (connData?.code === 200 && connData.data?.links?.length > 0) {
          let link = connData.data.links[0];
          // 替换 # 后的名称
          const hashIdx = link.indexOf('#');
          const newHash = encodeURIComponent(remark);
          link = (hashIdx !== -1)
            ? link.substring(0, hashIdx) + '#' + newHash
            : link + '#' + newHash;
          extractedLinks.push(link);
          log(`✅ 成功 → ${remark}`);
        } else {
          log(`⏭️ 跳过 → ${remark} (权限不足或暂无链路)`);
        }
      } catch (e) {
        log(`❌ 异常 → ${remark} - ${String(e)}`);
      }

      // 间隔2秒
      await sleep(2000);
    }

    // 7. 最终处理
    if (extractedLinks.length === 0) {
      log("未提取到任何可用节点，可能套餐已过期或网络异常");
      showNotification("来连VPN节点提取失败", "无可用节点", "请稍后重试");
    } else {
      const content = extractedLinks.join('\n');
      log(`提取完成，共 ${extractedLinks.length} 个节点`);

      // 输出节点内容到控制台，确保即使剪贴板不可用也能看到
      console.log("============ 节点列表 ============");
      console.log(content);
      console.log("================================");

      // 尝试写入剪贴板
      const copied = setClipboard(content);
      if (!copied) log("⚠️ 当前环境不支持剪贴板，请手动复制上方的节点链接");

      showNotification(
        "来连VPN节点提取成功",
        `共 ${extractedLinks.length} 个节点${copied ? " (已复制)" : ""}`,
        copied ? "节点已复制到剪贴板" : "节点已输出至日志"
      );
    }
  } catch (e) {
    log(`脚本异常终止: ${e.message || e}`);
    showNotification("来连VPN节点提取错误", "", e.message || String(e));
  } finally {
    done();
  }
}

// 执行入口
main();

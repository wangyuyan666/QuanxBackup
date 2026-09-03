

const VIP_KEYS = [
  "isVip",
  "vipStatus",
  "vip",
  "isMember",
  "member",
  "memberStatus",
  "isVipUser",
  "vipLevel",
  "vipType",
  "isvip",
  "vipFlag",
];

const FREE_KEYS = [
  // 需付费 / 收费 -> 置为0或false
  "isCharge",
  "needPay",
  "isPay",
  "isChargeable",
  "charge",
  "isPayVip",
  "needCharge",
  "isVipCharge",
  "isPaid",
  "isBuy",
  // 解锁相关 -> 置为true
  "isUnlock",
  "unlock",
  "isVipUnlock",
  "canWatch",
];

function normalize(obj) {
  if (obj === null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach(normalize);
    return;
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const lk = String(key).toLowerCase();

    if (VIP_KEYS.some((k) => k.toLowerCase() === lk)) {
      // 会员状态：数字 1/2 或布尔 true 均可，统一为“已开通”
      if (typeof val === "number") obj[key] = 1;
      else if (typeof val === "boolean") obj[key] = true;
      else obj[key] = 1;
      continue;
    }

    if (FREE_KEYS.some((k) => k.toLowerCase() === lk)) {
      if (lk === "isunlock" || lk === "unlock" || lk === "canwatch") {
        obj[key] = true; // 解锁
      } else {
        obj[key] = 0; // 免付费
      }
      continue;
    }

    // 递归处理对象/数组
    if (val && typeof val === "object") normalize(val);
  }
}

// 响应体由 QX 自动解压为纯文本，返回时自动再压缩
let body = $response.body;
try {
  const data = JSON.parse(body);
  normalize(data);
  body = JSON.stringify(data);
} catch (e) {
  // 非JSON，原样放行（例如空响应或文件流）
}

$done({ body });

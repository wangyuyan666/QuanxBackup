/**
 App: lovekey
 2026-05-16：无限制使用
 2026-10-11：支持1.9.0版本
支持1.8.2版本
[rewrite_local]
# 聊天 / 开场白 / 超级对话（覆盖所有 *-ow-msg / *-stream-msg / stream_super_msg）
^https://sea\.api\.lovekeyboard\.com/\S*(?:-(?:ow|stream)-msg|stream_super_msg) url script-request-header https://raw.githubusercontent.com/ios151/Rewrite/refs/heads/main/lovekey.js
https://sea.api.lovekeyboard.com/v2/account url script-response-body https://raw.githubusercontent.com/ios151/Rewrite/refs/heads/main/lovekey.js
 
[mitm]
hostname = sea.api.lovekeyboard.com

**/
const CHAT_API_REGEX = /\w+-(?:ow|stream)-msg|stream_super_msg/i;



const ACCOUNT_ENC_REGEX = /(?:\/v2\/account\?current_version=|\/v2\/account\/presets\/list\?category_id=[^&]*)/i;


const ACCOUNT_PLAIN_REGEX = /\/account\/presets\/add-to-keyboar/i;

const GUEST_API_URL = 'https://sea.api.lovekeyboard.com/v2/auth/guest';
const VERSION = 'v1.9.0';
const SOURCE  = 'App store';
const SECRET  = 'BeJsdgiq1azlQItxc93W';
const RESP_AES_KEY = 'd4XvusEYeafO9SBK';

const UTILS_URL = 'https://raw.githubusercontent.com/xzxxn777/Surge/main/Utils/Utils.js';
const CACHE_KEY_CODE = 'Utils_Code';
const CACHE_KEY_TIME = 'Utils_Codetime';

(async () => {
  try {
    const isReq  = typeof $request  !== 'undefined' && $request && $request.url;
    const isResp = typeof $response !== 'undefined';

    if (isReq && !isResp && CHAT_API_REGEX.test($request.url)) {
      const token = await getAccessTokenLK();
      const src = $request.headers || {};
      const headers = {};
      for (const k in src) if (Object.prototype.hasOwnProperty.call(src,k)) headers[k]=src[k];
      delete headers['authorization']; delete headers['Authorization'];
      if (token) headers['Authorization'] = 'Bearer ' + token;
      return $done({ headers });
    }

    // 明文：/account/presets/add-to-keyboar
    if (isReq && isResp && ACCOUNT_PLAIN_REGEX.test($request.url)) {
      let bodyText = $response.body || '';
      if (typeof bodyText !== 'string') bodyText = String(bodyText || '');
      bodyText = patchAccountByRegex(bodyText); // 直接在纯文本 JSON 上做全局替换
      const newHeaders = $response.headers || {};
      const ctKey = Object.keys(newHeaders).find(k=>k.toLowerCase()==='content-type') || 'Content-Type';
      newHeaders[ctKey] = 'application/json; charset=utf-8';
      return $done({ body: bodyText, headers: newHeaders });
    }

    // 加密：/v2/account?current_version=、/presets/add-to-keyboard
    if (isReq && isResp && ACCOUNT_ENC_REGEX.test($request.url)) {
      const utils = await loadUtilsCached();
      if (!utils || typeof utils.createCryptoJS !== 'function') return $done({});
      const CryptoJS = utils.createCryptoJS(); if (!CryptoJS) return $done({});

      const outer = safeJson($response.body || '');
      if (!outer || typeof outer.data !== 'string') return $done({});

      const key = CryptoJS.enc.Utf8.parse(RESP_AES_KEY);
      const dec = CryptoJS.AES.decrypt(
        { ciphertext: CryptoJS.enc.Base64.parse(outer.data) },
        key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
      );
      let plain = dec.toString(CryptoJS.enc.Utf8);
      if (!plain) return $done({});

      plain = patchAccountByRegex(plain);

      // 针对 add-to-keyboard 外层 message 同步为成功
      if (/\/presets\/add-to-keyboard/i.test($request.url)) {
        outer.message = '操作成功';
        if (Object.prototype.hasOwnProperty.call(outer, 'code')) outer.code = 200;
        if (Object.prototype.hasOwnProperty.call(outer, 'status')) outer.status = 1;
      }

      const enc = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(plain),
        key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
      );
      outer.data = enc.ciphertext.toString(CryptoJS.enc.Base64);

      const newHeaders = $response.headers || {};
      const ctKey = Object.keys(newHeaders).find(k=>k.toLowerCase()==='content-type') || 'Content-Type';
      newHeaders[ctKey] = 'application/json; charset=utf-8';
      return $done({ body: JSON.stringify(outer), headers: newHeaders });
    }

    return $done({});
  } catch {
    return $done({});
  }
})();

/* ===== 批量替换（全局正则，任意层级/数组都改） ===== */
function patchAccountByRegex(jsonStr){
  jsonStr = replaceJsonString(jsonStr, 'nickname', 'baby');
  jsonStr = replaceJsonBool(jsonStr,   'guest', false);
  jsonStr = replaceJsonNumber(jsonStr, 'member_id', 99999999);
  jsonStr = replaceJsonNumber(jsonStr, 'perpetual_vip', 1);
  jsonStr = replaceJsonString(jsonStr, 'vip_expired_at', '3742732800');
  jsonStr = replaceJsonNumber(jsonStr, 'member_vip', 2);
  jsonStr = replaceJsonNumber(jsonStr, 'is_vip', 0);
  jsonStr = replaceJsonString(jsonStr, 'message', '操作成功');
  return jsonStr;
}

/* ===== JSON 文本替换工具 ===== */
function escapeJSONString(s){
  return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\u0008/g,'\\b')
    .replace(/\t/g,'\\t').replace(/\n/g,'\\n').replace(/\f/g,'\\f').replace(/\r/g,'\\r');
}
function replaceJsonString(jsonStr, key, val){
  const v = `"${escapeJSONString(val)}"`;
  const re = new RegExp(`("${key}"\\s*:\\s*)"(?:\\\\.|[^"\\\\])*"`, 'g');
  return jsonStr.replace(re, `$1${v}`);
}
function replaceJsonNumber(jsonStr, key, num){
  const v = String(num);
  const re = new RegExp(`("${key}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?|true|false|null|"[^"\\\\]*(?:\\\\.[^"\\\\]*)*")`, 'g');
  return jsonStr.replace(re, `$1${v}`);
}
function replaceJsonBool(jsonStr, key, boolVal){
  const v = boolVal ? 'true' : 'false';
  const re = new RegExp(`("${key}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?|true|false|null|"[^"\\\\]*(?:\\\\.[^"\\\\]*)*")`, 'g');
  return jsonStr.replace(re, `$1${v}`);
}

/* ===== 获取 token ===== */
async function getAccessTokenLK(){
  try{
    const utils = await loadUtilsCached();
    if (!utils || typeof utils.createCryptoJS !== 'function') return null;
    const CryptoJS = utils.createCryptoJS(); if (!CryptoJS) return null;

    const tMs  = Date.now();
    const tSec = Math.floor(tMs/1000);
    const deviceName = pick(['iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14']);
    const identifier = generateUUID();
    const platform   = '0';

    const seedSrc = identifier.replace(/-/g,'');
    const seed    = (seedSrc.slice(0,16) || '').padEnd(16,'0');
    const utilsMD5 = CryptoJS.MD5(seed + String(tMs)).toString();

    const encKey = (k)=>k.replace(/\[/g,'%5B').replace(/\]/g,'%5D');
    const kv = [
      ['device[identifier]', identifier],
      ['device[name]', deviceName],
      ['device[platform]', platform],
      ['install_id', utilsMD5],
      ['source', SOURCE],
      ['version', VERSION],
    ];
    const left = kv.map(([k,v])=> `${encKey(k)}=${encodeURIComponent(String(v))}`).join('&');
    const sign = CryptoJS.MD5(left + String(tSec) + SECRET).toString();

    const headers = {
      'User-Agent': 'LoveKeyboard/1.9.0 (com.fd.lovekeyboard; build:55; iOS 26.0.0) Alamofire/5.10.2',
      'device-name': 'iPhone',
      'channel': '1',
      'app-locale': 'zh-Hans',
      'priority': 'u=3, i',
      'device-band': deviceName,
      'device-version': '26.0',
      'sign': sign,
      'app-lan': 'zh',
      'authorization': '',
      'timestamp': String(tSec),
      'accept-language': 'zh-Hans-CN;q=1.0',
      'device-type': '1',
      'accept': '*/*',
      'content-type': 'application/json;charset=utf-8',
      'app-version': VERSION,
      'accept-encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
      'X-Surge-Skip-Scripting': true,
    };

    const body = JSON.stringify({
      version: VERSION,
      install_id: utilsMD5,
      device: { name: deviceName, platform, identifier },
      source: SOURCE,
    });

    const { body: respBody } = await fetchRemote({ url: GUEST_API_URL, method:'POST', headers, body, timeout: 15000 });
    const outer = safeJson(respBody || '');
    if (!outer || typeof outer.data !== 'string') return null;

    const k = CryptoJS.enc.Utf8.parse(RESP_AES_KEY);
    const d = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(outer.data) },
      k, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const plain = d.toString(CryptoJS.enc.Utf8);
    const fin = safeJson(plain);
    return fin && fin.access_token ? fin.access_token : null;
  }catch{ return null; }
}

/* ===== Utils / KV / 网络层 ===== */
async function loadUtilsCached(){
  const cached = kvGet(CACHE_KEY_CODE);
  if (cached) {
    try{ eval(cached); if (typeof creatUtils==='function') return creatUtils(); if (typeof createUtils==='function') return createUtils(); kvSet(CACHE_KEY_CODE,''); }catch{ kvSet(CACHE_KEY_CODE,''); }
  }
  try{
    const { body } = await fetchRemote({ url: UTILS_URL, method:'GET', timeout:15000 });
    if (!body) return null;
    try{
      eval(body);
      if (typeof creatUtils==='function' || typeof createUtils==='function'){
        kvSet(CACHE_KEY_CODE, body); kvSet(CACHE_KEY_TIME, String(Date.now()));
        return typeof creatUtils==='function' ? creatUtils() : createUtils();
      }
      return null;
    }catch{ return null; }
  }catch{ return null; }
}
function kvGet(key){
  try{
    if (typeof $prefs!=='undefined' && $prefs.valueForKey) return $prefs.valueForKey(key)||'';
    if (typeof $persistentStore!=='undefined' && $persistentStore.read) return $persistentStore.read(key)||'';
  }catch{}
  return '';
}
function kvSet(key,val){
  try{
    if (typeof $prefs!=='undefined' && $prefs.setValueForKey) return $prefs.setValueForKey(val,key);
    if (typeof $persistentStore!=='undefined' && $persistentStore.write) return $persistentStore.write(val,key);
  }catch{}
  return false;
}
function fetchRemote(options){
  return new Promise((resolve,reject)=>{
    const method=(options.method||'GET').toUpperCase();
    if (typeof $httpClient!=='undefined'){
      const fn = method==='POST' ? $httpClient.post : $httpClient.get;
      fn(options,(error,response,body)=>{ if(error) return reject(error); resolve({response,body}); });
    } else if (typeof $task!=='undefined'){
      if (method==='POST') options.method='POST';
      $task.fetch(options).then(
        resp=>resolve({response:resp, body:resp.body}),
        err=>reject(err&&err.error||err)
      );
    } else { reject('Unsupported environment'); }
  });
}

/* ===== 小工具 ===== */
function safeJson(s){ try{ return JSON.parse(s); }catch{ return null; } }
function generateUUID(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
    const r=Math.random()*16|0, v=c==='x'?r:((r&0x3)|0x8); return v.toString(16).toUpperCase();
  });
}
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

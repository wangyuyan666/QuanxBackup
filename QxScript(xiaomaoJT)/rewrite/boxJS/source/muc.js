function Env(name) {
  // 判断当前环境是否为 Loon
  const isLoon = typeof $loon !== "undefined";
  // 判断当前环境是否为 Surge
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
  // 判断当前环境是否为 QuantumultX
  const isQX = typeof $task !== "undefined";

  // 定义 read 方法，用于读取数据
  const read = (key) => {
    if (isLoon || isSurge) return $persistentStore.read(key);
    if (isQX) return $prefs.valueForKey(key);
  };

  // 定义 write 方法，用于写入数据
  const write = (key, value) => {
    if (isLoon || isSurge) return $persistentStore.write(key, value);
    if (isQX) return $prefs.setValueForKey(key, value);
  };

  // 定义 notify 方法，用于发送通知
  const notify = (
    title = "XiaoMao",
    subtitle = "",
    message = "",
    url = "",
    url2 = url
  ) => {
    if (isLoon) $notification.post(title, subtitle, message, url);
    if (isSurge) $notification.post(title, subtitle, message, { url });
    if (isQX)
      $notify(title, subtitle, message, { "open-url": url, "media-url": url2 });
  };

  // 定义 get 方法，用于发送 GET 请求
  const get = (url, callback) => {
    if (isLoon || isSurge) $httpClient.get(url, callback);
    if (isQX) {
      url.method = `GET`;
      $task.fetch(url).then((resp) => callback(null, {}, resp.body));
    }
  };

  // 定义 post 方法，用于发送 POST 请求
  const post = (url, callback) => {
    if (isLoon || isSurge) $httpClient.post(url, callback);
    if (isQX) {
      url.method = `POST`;
      $task.fetch(url).then((resp) => callback(null, {}, resp.body));
    }
  };

  // 定义 put 方法，用于发送 PUT 请求
  const put = (url, callback) => {
    if (isLoon || isSurge) $httpClient.put(url, callback);
    if (isQX) {
      url.method = "PUT";
      $task.fetch(url).then((resp) => callback(null, {}, resp.body));
    }
  };

  // 定义 toObj 方法，用于将字符串转为对象
  const toObj = (str) => JSON.parse(str);

  // 定义 toStr 方法，用于将对象转为字符串
  const toStr = (obj) => JSON.stringify(obj);

  // 定义 queryStr 方法，用于将对象转为可以请求的字符串
  const queryStr = (obj) => {
    return Object.keys(obj)
      .map((key) => `${key}=${obj[key]}`)
      .join("&");
  };

  // 定义 log 方法，用于输出日志
  const log = (message) => console.log(message);

  // 定义 done 方法，用于结束任务
  const done = (value = {}) => $done(value);

  // 返回包含所有方法的对象
  return {
    name,
    read,
    write,
    notify,
    get,
    post,
    put,
    toObj,
    toStr,
    queryStr,
    log,
    done,
  };
}

const $ = new Env("XiaoMaoMusicCode");
let requestUrl = $request.url;
let matcheUrl = null;
if (requestUrl.includes("baidu")) {
  const uuidRegex =
    /^https:\/\/(?:m|www)\.baidu\.com\/s\?.*?[?&](?:word|wd)=(?:md|ml)%23[^&]+/gi;
  matcheUrl = requestUrl.match(uuidRegex);
} else {
  const uuidRegex =
    /^https?:\/\/(?:[a-zA-Z0-9-]+\.)?google\.[a-zA-Z.]+\/search\?[^&]*q=(md|ml)%23([^&]+)/gi;
  matcheUrl = requestUrl.match(uuidRegex);
}
if (!matcheUrl && matcheUrl.length) {
  getError("匹配出错了～");
  return;
}
let musicCode = matcheUrl[0].split("%23")[1];
let musicType = matcheUrl[0].indexOf("=md%23") == -1 ? true : false;
if (musicCode) {
  $.get(
    {
      url: `https://www.qqmp3.vip/api/songs.php?type=search&keyword=${musicCode}`,
    },
    (err, resp, response) => {
      if (response) {
        let obj = JSON.parse(response);
        if (obj?.data && obj.data.length) {
          let musicDownloadTips = "";
          let musicPlayId = "";
          obj.data.map((el, i) => {
            if (i == 0) {
              musicPlayId = el.rid;
            }
            musicDownloadTips =
              musicDownloadTips + `【${el.artist}】${el.name}\n`;
            el.downurl.map((dl, index) => {
              let downUrl = dl.split("$$");
              musicDownloadTips =
                musicDownloadTips + `🔗${downUrl[0]}：${downUrl[1]}\n`;
            });
            musicDownloadTips = musicDownloadTips + "\n";
          });
          if(!musicType){
            $.notify(
              `查询到 ${obj.data.length}首 歌曲`,
              "点击查看下载地址",
              `${musicDownloadTips}`
            );
          }
          
          // 在线播放
          if (musicType) {
            $.get(
              {
                url: `https://www.qqmp3.vip/api/kw.php?rid=${musicPlayId}&type=json&level=exhigh&lrc=false`,
              },
              (err2, resp2, response2) => {
                let obj2 = JSON.parse(response2);
                if (obj2?.data && obj2.data.url) {
                  let musicListenTips = `当前歌曲：${obj2.data.name} - ${obj2.data.artist}\n`;
                  musicListenTips =
                    musicListenTips +
                    `🎵歌名：${obj2.data.name}\n🎭演唱：${obj2.data.artist}\n🪘音质：${obj2.data.quality}\n🕒时长：${obj2.data.duration}\n💽大小：${obj2.data.size}\n🔗下载：${obj2.data.url}`;
                  $.notify(
                    `获取到歌曲 ${obj2.data.name} - ${obj2.data.artist}`,
                    "点击在线播放",
                    `${musicListenTips}`,
                    `${obj2.data.url}`
                  );
                } else {
                  getError("在线播放地址获取失败！");
                }
              }
            );
          }
        } else {
          getError("搜索结果为空");
        }
      } else {
        getError("请求失败，请稍后重试");
      }
    }
  );
} else {
  $done();
}

function getError(params = "") {
  $.notify(
    "🎼XiaoMao_音乐搜索",
    "",
    "🚧获取失败，错误：" + params + "❗️",
    "https://i.pixiv.re/img-original/img/2022/09/19/08/00/04/101330591_p0.png"
  );
  $done();
}
setTimeout(() => {
  $done();
}, 8000);

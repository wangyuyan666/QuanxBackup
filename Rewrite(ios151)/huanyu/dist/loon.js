// 幻宇星球 Loon 脚本
// 插件配置: requires-body=true, binary-body-mode=true
// $request.body / 响应 data 均为 Uint8Array，无 UTF-8 解码问题
var WORKER = "https://huanyu-proxy.daoyufan.workers.dev";

var url = $request.url;
var method = ($request.method || "GET").toLowerCase();
var match = url.match(/^https?:\/\/([^/?#]+)(\/[^?#]*)?(\?.*)?/);

if (match) {
  var targetUrl = WORKER + (match[2] || "/") + (match[3] || "");
  var headers = {};
  var orig = $request.headers || {};
  for (var k in orig) {
    var lk = k.toLowerCase();
    if (lk !== "host" && lk !== "content-length") {
      headers[k] = orig[k];
    }
  }

  var options = {
    url: targetUrl,
    headers: headers,
    timeout: 15000,
    "binary-mode": true,
  };

  // binary-body-mode=true → $request.body 是 Uint8Array
  if ($request.body) options.body = $request.body;

  var fn = $httpClient[method] || $httpClient.get;
  fn(options, function (error, response, data) {
    if (error) {
      $done({ response: { status: 502, body: String(error) } });
      return;
    }
    var resp = response || {};
    var code = resp.status || 200;
    var h = resp.headers || {};
    var out = {};
    for (var k in h) {
      if (!/^(content-encoding|content-length|transfer-encoding)$/i.test(k)) out[k] = h[k];
    }
    // binary-mode=true → data 是 Uint8Array
    $done({ response: { status: code, headers: out, body: data } });
  });
} else {
  $done({});
}

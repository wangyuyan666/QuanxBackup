

# TikTok-Unlock (免拔卡解鎖 TikTok)

TikTok 無需拔卡解鎖，最新支援 iPhone & iPad。支援地區切換、影片發佈、Live 直播、點讚評論、私信聊天等完整功能！

> 目录

* [準備工作](#準備工作)
* [Quantumult X](#Quantumult-X)
* [Loon](#Loon)
* [Surge](#Surge)
* [Shadowrocket](#Shadowrocket)
* [抖音無法觀看](#抖音)

---

> **🎉 最新版本更新說明：**

> **現在無需下載歷史版本，且無需進行 HTTPS 解密 (MitM)！**

> **您只需直接在 App Store 下載最新版 TikTok，搭配代理工具的「分流規則 (Rule / 節點)」即可正常使用。**

> **⚠️ 唯一前提：您的代理節點 IP 必須原生支援解鎖 TikTok。**

---

## <a id="📌 準備工作"> 📌 準備工作 </a>##

1. **下載 TikTok 最新版**：
   - 請自備美區、日區、台區、韓區等非中國大陸區的 Apple ID。
   - 在 App Store 搜尋並直接下載最新版 TikTok。
2. **準備工具**：
   - 自備 Quantumult X、Loon、Surge 或 Shadowrocket (小火箭) 等 iOS 代理工具。
3. **準備解鎖節點（核心）**：
   - 您的代理節點（SS / SSR / Vmess / Trojan 等）必須**支援 TikTok**（即原生 IP 或機場有提供特別優化的路線）。

---

## 🚀 核心原理與換區說明

當前最新版本的 TikTok 解鎖機制已大幅簡化。只要您的代理節點本身支援 TikTok ，就**不需要**再進行繁瑣的 MitM 憑證安裝和 URL 重寫 (Rewrite)。

🌍 **關於地區切換**：
由於現在完全依賴節點本身來解鎖，您在 TikTok 上看到的地區內容，將**直接取決於您所使用的節點 IP 所在國家/地區**。
- 想看 **日本區** TikTok 👉 請將策略切換至 **日本節點**
- 想看 **美國區** TikTok 👉 請切換至 **美國節點**
- 想看 **台灣區** TikTok 👉 請切換至 **台灣節點**

---

## 🛠 分流配置教學

以下提供主流代理工具的「分流規則」配置方法，只需將 TikTok 的流量引導至支援解鎖的節點即可。

### <a id="Quantumult-X"> Quantumult X </a> ###
1、打開 Quantumult X 進入設定。
2、在 資源-分流 中添加 TikTok 分流規則：
```
https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Quantumult-X/TikTok.list
```

3、開啟 Quantumult X 即可愉快使用。

### <a id="Loon"> Loon </a> ###

1、打開 Loon 進入設定。
2、在 `[Remote Rule]` (遠端規則) 下方添加 TikTok 分流規則：
```
https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Loon/TikTok.list
```

3、確保該策略組內選中了支援解鎖的節點。

### <a id="Surge"> Surge </a> ###

1、打開 Surge。
2、在「規則 (Rule)」中添加以下分流，並指向對應的策略組：
```
https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Surge/TikTok.list
```

### <a id="Shadowrocket"> Shadowrocket </a> ###

1、打開 Shadowrocket。
2、點擊 `配置` → 點擊您正在使用的配置文件後方的 `i` → `規則` → 右上角 `+` 號新增。
3、**類型**：選擇 `RULE-SET`
4、**策略**：選擇 `PROXY` 或您專門為 TikTok 建立的策略組。
5、**規則集 URL** 填寫以下連結：
```
https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Shadowrocket/TikTok.list
```

6、點擊右上角「儲存」並確保套用配置。

---

## ❓ 常見問題 (FAQ)

**Q1：為什麼配置了分流還是無法觀看，一直轉圈圈、黑屏或提示「無網絡連接」？**

A：這百分之百是因為**您的代理節點不支援 TikTok **（該節點 IP 已被 TikTok 官方封鎖或識別為機房 IP）。請聯絡您的機場供應商確認是否支援 TikTok，或自行更換為「原生 IP」節點。

**Q2：我還需要像以前一樣安裝憑證並開啟 HTTPS 解密 (MitM) 嗎？**

A：**完全不需要！** 新方案直接依賴 App Store 最新版 + 支援的節點，免去了安裝憑證、信任憑證和 URL 重寫的步驟，更安全且不影響其他 App 運行。

**Q3：<a id="抖音"> 我有同時使用中國版抖音，代理會影響抖音觀看嗎？ </a>**

A：有可能。如果發現國內抖音無法觀看，建議添加抖音的直連分流規則以排除代理干擾。您可以在配置中加入以下抖音 IP 分流訂閱（策略選 `DIRECT` 直連）：

```
https://raw.githubusercontent.com/Semporia/Quantumult-X/master/Filter/DouYin.list
```

---

> **免責聲明**：本專案僅供學習與交流使用，請遵守當地法律法規，請勿用於非法用途。

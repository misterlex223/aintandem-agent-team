---
description: 初始化 Kai Notifier 配置檔
argument-hint: [default-channel]
allowed-tools: ["Read", "Write", "Bash"]
---

# /init-kai-notify - 初始化 Kai Notifier

在專案根目錄建立 `.kai-notify.json` 配置檔。

## 用法

```
/init-kai-notify [default-channel]
```

## 參數

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `default-channel` | 預設通知頻道 (`line` 或 `slack`) | `line` |

## 執行步驟

### 1. 檢查配置檔是否已存在

```
檢查專案根目錄是否已有 .kai-notify.json
```

如果已存在：
```
⚠️ .kai-notify.json 已存在
若要重新建立，請先刪除舊檔案：rm .kai-notify.json
```

### 2. 建立配置檔

根據指定的 `default-channel` 建立對應的配置範本：

#### 預設 LINE

```json
{
  "defaultChannel": "line",
  "channels": {
    "slack": {
      "enabled": false,
      "botToken": "",
      "webhookUrl": "",
      "defaultChannel": "#general"
    },
    "line": {
      "enabled": true,
      "channelAccessToken": "",
      "channelSecret": "",
      "defaultUserId": ""
    }
  }
}
```

#### 預設 Slack

```json
{
  "defaultChannel": "slack",
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "",
      "webhookUrl": "",
      "defaultChannel": "#general"
    },
    "line": {
      "enabled": false,
      "channelAccessToken": "",
      "channelSecret": "",
      "defaultUserId": ""
    }
  }
}
```

### 3. 後續步驟提示

配置檔建立後，顯示設定提示：

```
✓ 配置檔已建立: .kai-notify.json

接下來請填入所需的認證資訊：

[LIN E]
- channelAccessToken: LINE Channel Access Token
- channelSecret: LINE Channel Secret
- defaultUserId: 接收通知的 User ID

[Slack]
- botToken: Slack Bot Token (xoxb-...)
- webhookUrl: Slack Incoming Webhook URL (選用)
- defaultChannel: 預設發送頻道 (如 #general)

完成設定後，安裝 kai-notifier plugin 即可使用：
/plugin install kai-notifier@aintandem-agent-team
```

## 範例

### 範例 1: 初始化為 LINE（預設）

```
/init-kai-notify
```

輸出：
```
✓ 配置檔已建立: .kai-notify.json
預設頻道: line
```

### 範例 2: 初始化為 Slack

```
/init-kai-notify slack
```

輸出：
```
✓ 配置檔已建立: .kai-notify.json
預設頻道: slack
```

### 範例 3: 配置檔已存在

```
/init-kai-notify
```

輸出：
```
⚠️ .kai-notify.json 已存在
若要重新建立，請先刪除舊檔案：rm .kai-notify.json
```

## 注意事項

- 配置檔應建立於專案根目錄
- 敏感資訊（Token, Secret）請妥善保管
- 建議將 `.kai-notify.json` 加入 `.gitignore`

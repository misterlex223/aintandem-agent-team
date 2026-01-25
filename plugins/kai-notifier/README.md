# Kai Notifier Plugin

多平台通知 Plugin，透過 kai-notify MCP server 發送任務完成通知。

## 功能特色

- **多平台支援**: LINE、Slack 等多種通知管道
- **MCP 整合**: 使用 kai-notify MCP server 提供的通知功能
- **自動觸發**: 適合在自動化流程完成後發送通知
- **彈性配置**: 透過 `.kai-notify.json` 管理各平台設定

## 支援平台

| 平台 | 說明 |
|------|------|
| `line` | LINE Messaging API |
| `slack` | Slack Webhook / Bot Token |

## 安裝

```bash
/plugin install kai-notifier@aintandem-agent-team
```

## 配置

建立 `.kai-notify.json` 於專案根目錄：

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

**說明**:
- `defaultChannel`: 全域預設通知頻道 (`line` 或 `slack`)

## 使用方式

### 基本用法

當你完成複雜任務或多步驟任務時（特別是在 YOLO mode 或 auto-accept edit 模式），使用 `sendNotification` tool 發送通知：

```
channel: line
message: "Mission Completed: Fixed login bug and deployed to staging"
```

### 多平台範例

#### LINE 通知

```
channel: line
message: "Mission Completed: Implemented user authentication feature"
```

#### Slack 通知

```
channel: slack
message: "Deploy successful: Production v2.3.0 is live"
```

### 使用時機

在以下情況使用此 tool：

1. **完成複雜任務**: 當你完成一個多步驟的複雜任務時
2. **自動模式**: 在 YOLO mode 或 auto-accept edit 模式完成任務後
3. **重要里程碑**: 完成重要的開發階段時

### 訊息格式建議

```
# 任務完成
"Mission Completed: [description]"

# 階段完成
"Phase 完成: [description]"

# 錯誤通知
"⚠️ [description]"

# 部署通知
"Deploy: [environment] v[version] is live"
```

## Plugin 結構

```
plugins/kai-notifier/
├── .claude-plugin/
│   └── plugin.json           # Plugin 清單與 MCP server 配置
├── skills/
│   └── task-notification/
│       └── SKILL.md          # 通知行為指引
└── README.md                 # 說明文件
```

## 可用功能

| 類型 | 名稱 | 說明 |
|------|------|------|
| **MCP Tool** | `sendNotification` | 發送通知 (由 kai-notify MCP 提供) |
| **Skill** | `task-notification` | 任務完成通知行為指引 |

## AI 行為

安裝此 plugin 後，AI Agent 會：

1. **讀取配置**: 自動讀取 `.kai-notify.json` 中的 `defaultChannel`
2. **適時通知**: 在複雜任務完成、需要決策、或發生錯誤時主動發送通知
3. **格式化訊息**: 依情境使用適當的訊息格式

## MCP Server

此 plugin 使用 kai-notify MCP server：

```json
{
  "mcpServers": {
    "kai-notify": {
      "command": "npx",
      "args": ["-y", "kai-notify", "--mcp"],
      "description": "Kai Notify - Multi-platform notification server"
    }
  }
}
```

## 環境需求

- Claude Code with MCP support
- Node.js 18+ (用於執行 npx kai-notify)
- `.kai-notify.json` 配置檔

## 授權

MIT License

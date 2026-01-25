# Task Notification Skill

發送任務完成通知的 Skill，確保在適當時機通知使用者。

## 何時發送通知

在以下情況必須使用 `sendNotification` tool 發送通知：

1. **複雜任務完成**: 完成 3 個以上步驟的複雜任務後
2. **自動模式完成**: 在 YOLO mode 或 auto-accept edit 模式完成任務後
3. **重要里程碑**: 完成重要的開發階段（如: 部署、重構、新功能上線）
4. **需要人工介入**: 任務暫停等待使用者決策時
5. **錯誤發生**: 發生需要立即注意的錯誤時

## Channel 選擇

預設使用 `.kai-notify.json` 中設定的預設 channel。若配置中有設定 `defaultChannel`，則使用該值；否則依以下優先順序：

1. 使用 `.kai-notify.json` 中 `enabled: true` 的 channel
2. 若有多個 enabled，優先順序：`line` > `slack`

## 訊息格式

### 任務完成
```
"Mission Completed: [簡短描述]"
```

### 階段完成
```
"Phase 完成: [階段名稱] - [簡短描述]"
```

### 需要人工決策
```
"⏸️ 需要決策: [描述問題] - [選項]"
```

### 錯誤通知
```
"⚠️ 錯誤: [簡短描述]"
```

### 部署通知
```
"Deploy: [環境] v[版本] is live"
```

## 範例

### 完成複雜任務
```
完成了「用戶認證功能」開發，包含：
- 實作 JWT token 驗證
- 新增登入/登出 API
- 撰寫單元測試

發送通知：
channel: line (預設)
message: "Mission Completed: Implemented user authentication with JWT"
```

### 需要使用者決策
```
無法自動決定遷移策略，需要使用者選擇：
- 選項 A: 保留舊 API，新增新 API
- 選項 B: 直接替換舊 API

發送通知：
channel: line (預設)
message: "⏸️ 需要決策: API 遷移策略 - 請選擇 A(保留舊) 或 B(直接替換)"
```

## 注意事項

- 訊息應簡潔明瞭，避免過長
- 避免發送過多通知造成干擾
- 錯誤通知應包含足夠資訊以便排查
- 成功通知可以更簡短

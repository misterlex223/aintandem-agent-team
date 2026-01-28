---
description: 執行驗收測試，支援 Playwright E2E 和 API 測試
argument-hint: [--mode=feature|full] [--target=2.8] [--spec-path=file]
allowed-tools: ["Read", "Write", "Bash", "Grep", "Glob", "TodoWrite"]
---

# /run-acceptance - 執行驗收測試

根據測試規格或功能區塊執行驗收測試。

## 用法

```
/run-acceptance [--mode=feature|full] [--target=2.8] [--spec-path=file]
```

## 參數

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `--mode` | `feature` - 功能驗收<br>`full` - 完整驗收 | `feature` |
| `--target` | 功能區塊編號（feature 模式） | 最新未完成功能 |
| `--spec-path` | 直接指定規格文件路徑 | 自動查找 |

## 執行步驟

### 1. 確定測試範圍

**feature 模式 + target**：
```
使用 docs/specs/[feature-name]-spec.md
```

**feature 模式 + 無 target**：
```
查找 docs/specs/ 中最新的規格文件
```

**full 模式**：
```
執行 docs/specs/ 下所有規格文件
```

**spec-path 模式**：
```
使用指定的規格文件
```

### 2. 建立測試任務

使用 TodoWrite 建立測試任務清單：

```
✅ 解析測試範圍
⏳ 執行 Playwright E2E 測試
⏳ 執行 API 測試
⏳ 人工檢查項目
⏳ 生成測試報告
```

### 3. 執行 Playwright E2E 測試

對於每個自動化測試場景：

```
1. launch_browser
2. navigate_to [URL]
3. 執行測試步驟
4. screenshot
5. 檢查 browser_console_messages (level="error")
6. 驗證結果
```

**Console 檢查**（每個場景必須執行）：

```
使用 browser_console_messages 工具
- level="error" - 檢查錯誤訊息
- level="warning" - 檢查警告訊息

有錯誤:
  - 測試結果標記為「失敗」
  - 記錄錯誤訊息和來源 (檔案:行號)

有警告:
  - 測試結果標記為「警告」
  - 記錄警告訊息
```

### 4. 執行 API 測試

對於 API 相關測試：

```
1. 解析 API 端點和預期回應
2. 使用 curl 或 REST API 工具發送請求
3. 驗證:
   - HTTP 狀態碼
   - 回應格式 (JSON schema)
   - 回應內容
   - 錯誤處理
```

API 測試腳本範例：

```bash
# GET 請求測試
curl -X GET "$API_URL/workflows" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### 5. 人工檢查項目

產生人工檢查清單：

```
請人工驗證以下項目:

## 視覺設計
- [ ] 符合設計稿 (Figma 連結: [連結])
- [ ] 字體、顏色、間距正確
- [ ] 響應式布局正常

## 互動設計
- [ ] Hover 狀態正確
- [ ] Focus 狀態正確
- [ ] Disabled 狀態正確
- [ ] Loading 狀態正確

## 可訪問性
- [ ] 鍵盤導航可用
- [ ] Screen reader 可讀
- [ ] 顏色對比度符合 WCAG AA
- [ ] ARIA 標籤正確
```

### 6. 生成測試報告

測試完成後，產生 Markdown 報告：

```
📄 測試報告: docs/test-reports/test-report-[date].md
```

**報告必須包含**：
- 測試摘要（日期、環境、功能）
- 測試結果統計
- Console 錯誤摘要
- 每個場景的詳細結果
- API 測試結果
- 人工檢查清單
- 問題清單與建議

## 範例

### 範例 1: 功能驗收

```
/run-acceptance --mode=feature --target=2.8
```

輸出：
```
✅ 找到規格文件: docs/specs/batch-upload-spec.md
✅ 解析測試場景: 5 個
- 自動化測試: 3 個
- 人工檢查: 2 個

⏳ 開始執行測試...
✅ 場景 1: 正常上傳 | Console: 無錯誤
✅ 場景 2: 多檔案上傳 | Console: 無錯誤
✅ 場景 3: 錯誤處理 | Console: 無錯誤
✅ API 測試: /api/upload 端點正常
⏳ 場景 4: 視覺檢查 (需人工驗證)
⏳ 場景 5: 響應式 (需人工驗證)

📊 測試完成: 3/3 自動化測試通過
📋 Console 摘要: 0 錯誤, 0 警告
📄 報告已生成: docs/test-reports/test-report-2.8-2026-01-28.md
```

### 範例 2: 完整驗收

```
/run-acceptance --mode=full
```

輸出：
```
✅ 找到 5 個規格文件
⏳ 開始完整驗收測試...

📋 功能 2.7: 使用者設定
✅ 3/3 測試通過

📋 功能 2.8: 批次上傳
✅ 5/5 測試通過

📋 功能 2.9: 圖片裁剪
❌ 2/5 測試失敗
   🔴 場景 2.9.2: Console 錯誤
      Error: "Cannot read property 'crop' of undefined" (ImageEditor.ts:45)

📊 測試完成: 10/12 通過
📋 Console 摘要: 1 錯誤, 2 警告
📄 報告已生成: docs/test-reports/test-report-full-2026-01-28.md

❌ 驗收失敗: 有未修復的 critical 問題
```

### 範例 3: 直接指定規格

```
/run-acceptance --spec-path=docs/specs/login-spec.md
```

## 測試報告格式

```markdown
# 前端測試報告 - [功能名稱]

## 測試摘要
- **測試日期**: [日期]
- **測試模式**: [feature/full]
- **測試環境**: [環境]
- **規格版本**: [版本]

## 測試結果

| 類別 | 總數 | 通過 | 失敗 | 跳過 |
|------|------|------|------|------|
| 自動化測試 | N | N | N | N |
| API 測試 | N | N | N | N |
| 人工檢查 | N | N | N | N |

## Console 摘要
- 錯誤: N 個
- 警告: N 個

## 詳細結果

### 場景 1: [場景名稱]
**狀態**: ✅ 通過 | ❌ 失敗 | ⚠️ 警告

**執行步驟**:
- ✅ 步驟 1: [描述]
- ❌ 步驟 2: [描述] - [失敗原因]

**Console 錯誤** (如有):
```
Error: [錯誤訊息]
  at [檔案:行號]
```

### API 測試: [端點名稱]
**狀態**: ✅ 通過 | ❌ 失敗

**請求**:
```http
POST /api/upload
```

**預期回應**: 200 OK
**實際回應**: 200 OK

## 人工檢查清單

### 視覺設計
- [ ] 符合設計稿
- [ ] 字體、顏色、間距正確
- [ ] 響應式布局正常

### 互動設計
- [ ] 各種狀態正確

### 可訪問性
- [ ] 鍵盤導航可用
- [ ] Screen reader 可讀
- [ ] 顏色對比度符合 WCAG AA

## 問題清單

| ID | 嚴重度 | 描述 | 建議修正 |
|----|--------|------|---------|
| 1 | 🔴 高 | [問題描述] | [建議] |

## 建議

1. [建議項目]
2. [建議項目]
```

## 錯誤處理

| 錯誤 | 處理方式 |
|------|---------|
| 規格文件不存在 | 顯示錯誤並提示使用 /generate-test-plan |
| Playwright 未啟動 | 提示啟動 Playwright MCP Server |
| 測試 URL 無法訪問 | 記錄錯誤並繼續其他測試 |
| Console 發現錯誤 | 測試標記失敗，記錄錯誤訊息 |
| API 測試失敗 | 測試標記失敗，記錄回應內容 |

## 與 version-manager 整合

在發布檢查清單中加入：

```markdown
### 測試驗證
- [ ] 執行 /run-acceptance --mode=full
- [ ] 測試報告無 critical 失敗
- [ ] 所有 console 錯誤已修復
```

## 相關命令

- `/generate-test-plan` - 生成測試計劃
- `/test-spec <file>` - 根據規格執行測試
- `/test-spec-template [path]` - 產生規格範本

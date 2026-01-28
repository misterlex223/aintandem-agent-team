# Frontend Tester 擴展設計

**日期**: 2026-01-28
**作者**: Claude
**狀態**: 已審核

## 概述

擴展 `frontend-tester` plugin，使其能夠根據 PRD.md 自動生成測試計劃，並新增驗收測試 Agent 與 `version-manager` 整合。

## 設計目標

1. 根據 PRD.md 自動生成測試計劃
2. 支援兩種測試模式：功能驗收、完整測試
3. 與 version-manager 整合，作為發布流程的一部分
4. 雙層輸出：策略層級測試計劃 + 可執行 spec 文件

## 架構

### 檔案結構

```
frontend-tester/
├── commands/
│   ├── test-spec.md              # 現有：執行測試
│   ├── test-spec-template.md     # 現有：產生規格範本
│   ├── generate-test-plan.md     # 🆕：根據 PRD 生成測試計劃
│   └── run-acceptance.md         # 🆕：執行驗收測試
├── agents/
│   ├── frontend-test-engineer.md # 現有
│   └── acceptance-tester.md      # 🆕：驗收測試 Agent
├── templates/
│   ├── spec-template.md          # 現有
│   └── test-plan-template.md     # 🆕：測試計劃範本
└── utils/
    └── prd-parser.js             # 🆕：PRD 解析工具
```

### 輸出路徑

| 類型 | 路徑 |
|------|------|
| 測試計劃 | `docs/test-plans/TP-[version]-[date].md` |
| 執行規格 | `docs/specs/[feature]-spec.md` |
| 測試報告 | `docs/test-reports/test-report-[date].md` |

## 指令設計

### `/generate-test-plan`

```bash
/generate-test-plan [--mode=feature|full] [--version=X.Y.Z] [prd-path]
```

**參數**：
- `--mode=feature` - 功能驗收模式（預設），針對未勾選功能
- `--mode=full` - 完整測試模式，為整個版本生成測試計劃
- `--version` - 版本號（full 模式需要）
- `prd-path` - PRD 路徑（預設 `docs/PRD.md`）

**執行流程**：
1. 解析 PRD.md，提取功能列表
2. 生成測試計劃文件 → `docs/test-plans/TP-[version]-[date].md`
3. 為每個功能生成 spec 文件 → `docs/specs/[feature]-spec.md`

### `/run-acceptance`

```bash
/run-acceptance [--mode=feature|full] [--target=2.8]
```

**參數**：
- `--mode=feature` - 驗收指定功能
- `--mode=full` - 完整驗收測試
- `--target` - 功能區塊編號（feature 模式使用）

**執行流程**：
1. 讀取 spec 文件
2. 執行 Playwright 自動化測試
3. 執行 API 測試
4. 生成測試報告 → `docs/test-reports/`

## Agent 設計

### `acceptance-tester`

**觸發條件**：
- 用戶提及「驗收」、「acceptance test」、「測試計劃」
- 功能區塊所有 checkbox 完成時自動觸發
- 與 `version-manager` 整合時被呼叫

**職責**：
1. **PRD 解析**：掃描 PRD.md，識別新增功能、未勾選功能、完成度狀態
2. **測試計劃生成**：產生策略層級測試計劃
3. **測試執行**：Playwright E2E + API 測試
4. **報告生成**：測試結果摘要、失敗詳情、建議修正

## 測試計劃範本

```markdown
# 測試計劃: {{version}} {{mode}} 驗收

**生成日期**: {{date}}
**PRD 版本**: {{prd_version}}
**測試環境**: {{env}}

## 測試範圍

| 功能區塊 | 狀態 | 優先級 |
|---------|------|--------|
| {{feature_1}} | {{status}} | {{priority}} |

## 測試策略

### E2E 測試 (Playwright)
- 覆蓋核心使用者流程
- 驗證 UI 互動正確性
- 檢查無 console 錯誤

### API 測試
- 驗證 REST API 端點
- 檢查錯誤處理
- 驗證資料一致性

### 人工檢查
- 視覺設計符合 Figma
- 響應式布局
- 可訪問性 (WCAG AA)

## 通過標準

- ✅ 所有关鍵流程測試通過
- ✅ Console 無 error 級別訊息
- ✅ API 回應時間 < {{threshold}}ms
- ✅ 無 critical / high 級別問題
```

## 工作流程

### 開發階段 - 功能驗收

```
用戶完成功能區塊 (如 2.8)
    ↓
acceptance-tester 自動觸發
    ↓
generate-test-plan --mode=feature --target=2.8
    ↓
生成 docs/specs/batch-upload-spec.md
    ↓
run-acceptance --mode=feature --target=2.8
    ↓
生成測試報告 → docs/test-reports/
```

### 發布階段 - 完整驗收

```
用戶執行 /prepare-release
    ↓
version-manager 整合驗收測試
    ↓
generate-test-plan --mode=full --version=0.7.0
    ↓
生成 docs/test-plans/TP-0.7.0-full-*.md
    ↓
run-acceptance --mode=full
    ↓
測試通過 → version snapshot → finalize release
```

## 狀態檔整合

`.claude/version-state.json` 新增測試狀態：

```json
{
  "currentVersion": "0.6.0",
  "nextVersion": "0.7.0",
  "status": "in-development",
  "features": [
    {
      "id": "2.8",
      "title": "批次上傳多張圖片",
      "status": "completed",
      "tested": true,
      "testReport": "docs/test-reports/test-report-2.8-2026-01-28.md"
    }
  ],
  "releaseChecklist": {
    "featuresComplete": true,
    "acceptanceTestPassed": false,
    "docsUpdated": false
  }
}
```

## 與 version-manager 整合

在 `prepare-release` 檢查清單中加入：

```markdown
### 測試驗證
- [ ] 執行 /run-acceptance --mode=full
- [ ] 測試報告無 critical 失敗
- [ ] 所有 console 錯誤已修復
```

## 執行方式

- **Playwright 自動化**：瀏覽器端 E2E 測試
- **API 測試**：使用 curl/REST API 測試後端驗證
- **人工檢查**：視覺、UX、可訪問性需人工驗證

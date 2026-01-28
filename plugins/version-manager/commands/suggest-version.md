---
name: suggest-version
description: 分析 PRD 變更，建議下一版本號（遵循 SemVer）
arguments: []
---

# 建議版本號

根據 PRD 變更自動建議符合 Semantic Versioning 的版本號。

## 使用方式

```bash
/version-manager suggest-version
```

## 分析邏輯

1. **讀取 PRD.md**，查找 🆕 標記的新增功能
2. **搜尋破壞性變更**關鍵字：
   - 「移除」、「廢棄」、「刪除」
   - 「API 變更」、「介面變更」
   - 「BREAKING」、「breaking change」
3. **判斷變更類型**：
   - 破壞性變更 → MAJOR (0.6.0 → 1.0.0)
   - 新增功能 → MINOR (0.6.0 → 0.7.0)
   - Bug 修正 → PATCH (0.6.0 → 0.6.1)

## 輸出格式

```
📊 版本分析結果

當前版本: v0.6.0
建議版本: v0.7.0 (MINOR)

變更摘要:
  新增機能: 3
    - 2.8 批次上傳多張圖片
    - 2.9 自訂品牌覆蓋層
    - 2.10 多種價格層級

  破壞性變更: 0

  Bug 修正: 0

版本號建議理由:
  檢測到 3 個新功能，無破壞性變更，建議遞增 MINOR 版本。

是否採用此版本號？(y/n)
```

## Semantic Versioning 規則

- **MAJOR**: 破壞性變更（不向後相容）
- **MINOR**: 新增功能（向後相容）
- **PATCH**: Bug 修正（向後相容）

## 相關指令

- 採用建議並準備發布：`/version-manager prepare-release <version>`
- 查看當前狀態：`/version-manager version-status`

---
name: version-history
description: 顯示版本歷史與變更對比
arguments:
  - name: from
    description: 起始版本（如 0.6.0），留空使用當前版本
    required: false
    default: current
  - name: to
    description: 結束版本（如 0.7.0），留空使用下一版本
    required: false
    default: next
---

# 版本歷史與對比

顯示版本歷史記錄，或對比兩個版本間的差異。

## 使用方式

```bash
# 對比當前版本與下一版本
/version-manager version-history

# 對比指定版本
/version-manager version-history 0.6.0 0.7.0

# 查看單一版本資訊
/version-manager version-history 0.6.0
```

## 對比內容

讀取兩個版本的 `docs/specs/vX.X.X/PRD.md`，顯示：

### 新增功能

```markdown
## ✨ 新增功能 (v0.6.0 → v0.7.0)

### 2.8 批次上傳多張圖片
**目的：** 提升大量商品處理效率
**變更：** 支援一次選擇多張圖片、多圖預覽、進度追蹤

### 2.9 自訂品牌覆蓋層
**目的：** 強化品牌識別度
**變更：** 上傳 logo、自訂顏色、儲存範本
```

### 移除功能

```markdown
## ❌ 移除功能 (v0.6.0 → v0.7.0)

無
```

### 修改內容

```markdown
## 🔄 修改內容 (v0.6.0 → v0.7.0)

### 2.2 價格覆蓋層
- 新增: 支援多種價格層級
- 修改: 介面重新設計
```

## 版本清單

列出所有可用的版本：

```
📚 可用版本:

  v0.6.0 (當前生產環境)
    - 發布日期: 2026-01-25
    - 功能: 基礎上傳、價格覆蓋層

  v0.7.0 (開發中)
    - 預計發布: 2026-01-28
    - 功能: 批次上傳、品牌覆蓋層、多價格層級
```

## 讀取來源

- `.claude/version-state.json` - 當前與下一版本
- `docs/specs/vX.X.X/PRD.md` - 各版本規格
- `docs/specs/vX.X.X/RELEASE-NOTES.md` - 發布說明

## 注意事項

- 版本必須已建立快照才能對比
- 對比基於 PRD.md 的章節與 checkbox
- 如果版本不存在，會顯示錯誤

## 相關指令

- 查看當前狀態：`/version-manager version-status`
- 建立版本快照：`/version-manager create-snapshot <version>`

---
name: prepare-release
description: 準備版本發布，分析 PRD 變更並引導完成發布檢查清單
arguments:
  - name: version
    description: 版本號（如 0.7.0），留空自動根據 SemVer 建議
    required: false
    default: auto
---

# 準備版本發布

這個指令會引導你完成版本發布的準備工作。

## 執行步驟

1. **讀取 PRD.md**，分析新增功能（🆕 標記）
2. **分析變更類型**，建議版本號（如未指定）
3. **更新狀態檔** `.claude/version-state.json`
4. **生成發布檢查清單**
5. **逐步引導完成**每個檢查項目

## 使用方式

```bash
# 自動建議版本號
/version-manager prepare-release

# 指定版本號
/version-manager prepare-release 0.7.0
```

## 發布檢查清單

完成後會產生以下檢查清單：

### 功能完整性
- [ ] PRD.md 中所有相關 checkbox 已完成
- [ ] 所有新功能已手動測試
- [ ] 測試報告已更新

### 文件完整性
- [ ] PRD.md 頂部摘要已填寫完整
- [ ] TECH.md 已更新（如有架構變動）
- [ ] RELEASE-NOTES.md 已撰寫

### 部署準備
- [ ] D1 migration 已準備（如有）
- [ ] 已部署至測試環境並驗證

## 下一步

完成檢查清單後，使用：

```bash
/version-manager create-snapshot <version>
```

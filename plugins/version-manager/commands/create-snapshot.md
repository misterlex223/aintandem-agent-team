---
name: create-snapshot
description: 建立版本快照目錄並複製相關檔案
arguments:
  - name: version
    description: 版本號（如 0.7.0）
    required: true
---

# 建立版本快照

這個指令會建立完整的版本快照，包含 PRD、技術文件、測試報告等。

## 執行步驟

1. **建立版本目錄** `docs/specs/v<version>/`
2. **複製 PRD.md** → `docs/specs/v<version>/PRD.md`
3. **檢查 TECH.md** 是否有變動，有則複製
4. **複製測試報告** → `docs/specs/v<version>/test-reports/`
5. **複製狀態檔** → `docs/specs/v<version>/version-state.json`
6. **生成 RELEASE-NOTES.md 模板**

## 使用方式

```bash
/version-manager create-snapshot 0.7.0
```

## 輸出結構

```
docs/specs/v0.7.0/
├── PRD.md
├── TECH.md (如有變動)
├── RELEASE-NOTES.md
├── version-state.json
└── test-reports/
```

## 注意事項

- 此指令僅建立快照，不會修改原始檔案
- RELEASE-NOTES.md 是模板，需要手動填寫完整內容
- 完成後使用 `finalize-release` 完成發布

## 下一步

檢查並編輯 `docs/specs/v<version>/RELEASE-NOTES.md`，然後執行：

```bash
/version-manager finalize-release <version>
```

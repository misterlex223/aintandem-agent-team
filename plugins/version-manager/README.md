# Version Manager Plugin

自動化管理軟體版本發布流程的 Claude Code Plugin。

## 功能特色

- ✅ **版本規劃**: 分析 PRD 變更，建議符合 SemVer 的版本號
- ✅ **發布準備**: 引導完成發布檢查清單
- ✅ **快照管理**: 建立版本快照目錄並複製相關檔案
- ✅ **發布執行**: 更新 PRD、建立 git tag、生成發布說明
- ✅ **版本查詢**: 提供版本狀態、歷史與變更對比

## 安裝

```bash
# 從 marketplace 安裝
claude plugin install https://gitcode.com/misterlex223/aintandem-agent-team
```

## 使用方式

### Slash Commands

```bash
# 準備發布
/version-manager prepare-release [version]

# 建立快照
/version-manager create-snapshot <version>

# 完成發布
/version-manager finalize-release <version>

# 查詢狀態
/version-manager version-status

# 建議版本號
/version-manager suggest-version

# 版本歷史
/version-manager version-history [from] [to]
```

### 自然語言

```
幫我準備發布 v0.7.0
目前版本是什麼？
建議下個版本號
對比 v0.6.0 和 v0.7.0 的差異
```

## 工作流程

### 1. 開發階段

```bash
# 查詢當前進度
/version-manager version-status

# 當所有功能完成後，建議版本號
/version-manager suggest-version
```

### 2. 準備發布

```bash
# 準備發布（自動或手動指定版本號）
/version-manager prepare-release
# 或
/version-manager prepare-release 0.7.0

# 引導完成發布檢查清單：
# - 功能完整性
# - 文件完整性
# - 部署準備
```

### 3. 建立快照

```bash
# 建立版本快照
/version-manager create-snapshot 0.7.0

# 會產生：
# docs/specs/v0.7.0/
# ├── PRD.md
# ├── TECH.md (如有變動)
# ├── RELEASE-NOTES.md
# ├── version-state.json
# └── test-reports/
```

### 4. 完成發布

```bash
# 編輯 RELEASE-NOTES.md 後執行
/version-manager finalize-release 0.7.0

# 會執行：
# - 更新 PRD.md（移除摘要與 🆕 標記）
# - Git commit: "release: v0.7.0"
# - Git tag: "v0.7.0"
```

## 狀態檔

`.claude/version-state.json`：

```json
{
  "currentVersion": "0.6.0",
  "nextVersion": "0.7.0",
  "nextVersionType": "minor",
  "status": "in-development",
  "lastUpdated": "2026-01-28T08:30:00Z",
  "features": [
    {
      "id": "2.8",
      "title": "批次上傳多張圖片",
      "status": "completed",
      "addedAt": "2026-01-26"
    }
  ],
  "releaseChecklist": {
    "featuresComplete": false,
    "tested": false,
    "docsUpdated": false,
    "migrationReady": false
  }
}
```

## 檔案結構

```
.claude/plugins/version-manager/
├── .claude-plugin/
│   └── plugin.json              # Plugin 宣告
├── agents/
│   └── version-manager.md       # Agent 定義
├── commands/
│   ├── prepare-release.md       # 準備發布
│   ├── create-snapshot.md       # 建立快照
│   ├── finalize-release.md      # 完成發布
│   ├── version-status.md        # 版本狀態
│   ├── suggest-version.md       # 建議版本號
│   └── version-history.md       # 版本歷史
├── skills/
│   └── version-management/
│       └── SKILL.md             # 自然語言觸發
├── templates/
│   ├── version-state.json       # 狀態檔模板
│   └── RELEASE-NOTES.md         # 發布說明模板
└── README.md
```

## Semantic Versioning

版本號遵循 [Semantic Versioning 2.0.0](https://semver.org/)：

- **MAJOR**: 破壞性變更（不向後相容）
- **MINOR**: 新增功能（向後相容）
- **PATCH**: Bug 修正（向後相容）

### 版本號建議邏輯

```javascript
if (有破壞性變更) {
  return MAJOR; // 0.6.0 → 1.0.0
} else if (有新功能) {
  return MINOR; // 0.6.0 → 0.7.0
} else if (有 bug 修正) {
  return PATCH; // 0.6.0 → 0.6.1
}
```

## 版本快照結構

```
docs/specs/
├── v0.6.0/
│   ├── PRD.md
│   ├── TECH.md
│   ├── RELEASE-NOTES.md
│   ├── version-state.json
│   └── test-reports/
└── v0.7.0/
    ├── PRD.md
    ├── TECH.md
    ├── RELEASE-NOTES.md
    ├── version-state.json
    └── test-reports/
```

## 與專案整合

### PRD.md 格式

```markdown
# 產品需求文檔 (PRD)

## v0.7.0 新增功能 (2026-01-28)

### 2.8 批次上傳多張圖片
**目的：** 提升大量商品處理效率
**變更：** 支援多選、進度追蹤

---

## 2. 功能需求

### 2.8 批次上傳多張圖片 🆕
- [x] 支援一次選擇多張圖片
- [x] 多圖預覽網格介面
- [ ] 上傳進度條顯示
```

### 發布前 PRD 頂部摘要

開發期間，在 PRD.md 頂部加入版本摘要：

```markdown
## v0.7.0 新增功能 (2026-01-28)

### 2.8 批次上傳多張圖片
**目的：** 提升效率
**變更：** [詳細變更]

### 2.9 品牌覆蓋層
**目的：** 強化品牌
**變更：** [詳細變更]
```

發布時會移除此摘要。

## 常見問題

### Q: 狀態檔會進 git 嗎？

A: 不會。`.claude/version-state.json` 是本地工作狀態，不進 git。版本歷史記錄在 `docs/specs/vX.X.X/version-state.json`。

### Q: 如何回溯舊版本規格？

A: 查看 `docs/specs/vX.X.X/PRD.md`，每個版本都有完整快照。

### Q: 發布後可以修改嗎？

A: Git tag 可以刪除重建，但不建議。如需緊急修正，建議發布 PATCH 版本。

### Q: 支援多個並行開發版本嗎？

A: 目前支援單一版本的開發追蹤。多版本開發需使用 git branches。

## 授權

MIT License

## 作者

Lex Yang

## 相關資源

- [Claude Code Plugins](https://github.com/anthropics/claude-code-plugins)
- [Semantic Versioning](https://semver.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

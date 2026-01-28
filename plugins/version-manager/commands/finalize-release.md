---
name: finalize-release
description: 完成發布，更新 PRD、移除標記、建立 git tag
arguments:
  - name: version
    description: 版本號（如 0.7.0）
    required: true
  - name: tag
    description: Git tag（預設與版本相同）
    required: false
    default: auto
---

# 完成版本發布

這個指令會完成最後的發布步驟，更新檔案並建立 git tag。

## 執行步驟

1. **確認所有檢查項目**已完成
2. **更新 PRD.md**：
   - 移除頂部的版本摘要
   - 移除內容中的 🆕 emoji
   - 更新版本號
3. **更新狀態檔** `.claude/version-state.json`
4. **Git commit** -m "release: v<version>"
5. **Git tag** -a "v<version>" -m "Release v<version>"

## 使用方式

```bash
# 使用預設 tag (與版本相同)
/version-manager finalize-release 0.7.0

# 指定不同的 tag
/version-manager finalize-release 0.7.0 --tag v0.7.0-prod
```

## 前置條件

執行前必須先完成：
- ✅ `/version-manager prepare-release <version>`
- ✅ `/version-manager create-snapshot <version>`
- ✅ 編輯 `docs/specs/v<version>/RELEASE-NOTES.md`

## 變更摘要

此指令會修改以下檔案：
- `docs/PRD.md` - 移除版本摘要與 🆕 標記
- `.claude/version-state.json` - 更新版本狀態

## Git 操作

執行以下 git 操作：

```bash
git add .
git commit -m "release: v0.7.0"
git tag -a "v0.7.0" -m "Release v0.7.0"
```

**注意**: 不會自動推送到遠端，需手動執行 `git push --tags`

## 注意事項

- 此指令會修改 PRD.md，請確認快照已建立
- Git 操作不可逆，請確認版本號正確
- 執行後狀態會變更為 "released"

## 發布後

1. 檢查 git status
2. 確認 commit 訊息正確
3. 推送到遠端：`git push && git push --tags`
4. 通知團隊新版本已發布

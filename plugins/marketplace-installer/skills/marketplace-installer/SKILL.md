---
description: 自動檢測並安裝 marketplace 層級的 commands
---

# Marketplace Installer Skill

自動檢測並安裝 marketplace 層級的 commands 到使用者的 commands 目錄。

## 使用時機

當使用者需要：
- 安裝 marketplace 提供的額外 commands
- 更新已安裝的 marketplace commands
- 檢查 marketplace 中有哪些可用的 commands

## 執行步驟

### 1. 檢測 marketplace 環境

- 檢查當前目錄是否在 marketplace 中
- 尋找 `.claude-plugin/marketplace.json`
- 驗證 marketplace 結構

### 2. 讀取 commands 列表

- 解析 `marketplace.json` 中的 commands 欄位
- 列出所有可用的 commands

### 3. 檢查安裝狀態

- 比較 marketplace commands 與使用者 commands 目錄
- 識別未安裝或需要更新的 commands

### 4. 執行安裝

- 複製 commands 到 `~/.claude/commands/`
- 處理檔案衝突（詢問使用者或跳過）
- 驗證安裝結果

### 5. 報告結果

- 顯示安裝成功的 commands
- 顯示跳過的 commands（已存在且版本相同）
- 提示重新載入 commands

## 範例對話

### 範例 1: 自動檢測並提示安裝

**User**: 進入 marketplace 目錄

**Assistant**: 我檢測到這個 marketplace 提供了額外的 commands：
- `add-git-mirror`: 為 git repo 添加鏡像推送

這些 commands 尚未安裝。要現在安裝嗎？

### 範例 2: 手動觸發安裝

**User**: 幫我安裝 marketplace 的 commands

**Assistant**: 我來幫您安裝 marketplace 的 commands。

[執行安裝流程]

✓ 已成功安裝 `add-git-mirror`
✓ 共安裝 1 個 command

您現在可以直接使用 `/add-git-mirror` 命令了。

### 範例 3: 檢查更新

**User**: 檢查 marketplace commands 是否有更新

**Assistant**: 我來檢查 marketplace commands 的更新狀態。

[檢查當前安裝的 commands]

✓ 所有 commands 都是最新版本

## 實作注意事項

- 使用 bash commands 執行檔案操作
- 比較檔案內容來判斷是否需要更新
- 在必要時詢問使用者確認
- 提供清晰的進度反饋

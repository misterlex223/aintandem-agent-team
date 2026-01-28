# Marketplace Installer Plugin

自動安裝 marketplace 層級的 commands 到使用者的 commands 目錄。

## 功能

- 🔍 自動檢測 marketplace 提供的 commands
- 📦 一鍵安裝所有 marketplace commands
- 🔄 更新已安裝的 commands
- 💡 Session 時自動提示未安裝的 commands

## 使用方式

### 1. 自動提示（推薦）

當你在 marketplace 目錄中啟動 session 時，如果有未安裝的 commands，會自動顯示提示：

```
📦 發現 1 個未安裝的 marketplace commands:
  - /add-git-mirror

執行 /install-marketplace-commands 來安裝這些 commands
```

### 2. 手動安裝

執行以下命令安裝所有 marketplace commands：

```
/install-marketplace-commands
```

### 3. 強制更新

如果要覆蓋已存在的 commands：

```
/install-marketplace-commands --force
```

## Commands

### `/install-marketplace-commands`

安裝 marketplace 層級的 commands 到使用者的 commands 目錄。

**參數：**
- `--force`: 強制覆蓋已存在的 commands

## Hooks

### SessionStart

在 session 啟動時自動檢查並提示未安裝的 commands。

## 技術細節

- **安裝目標**: `~/.claude/commands/`
- **來源**: `marketplace.json` 中的 `commands` 欄位
- **檔案操作**: 複製（不使用符號連結）
- **版本檢查**: 比較檔案內容的 MD5 hash

## 開發

如果要添加新的 marketplace command：

1. 在 marketplace 根目錄的 `commands/` 目錄中創建 command 文件
2. 在 `.claude-plugin/marketplace.json` 中添加 command 條目
3. 使用 `/install-marketplace-commands` 安裝

## 授權

MIT © Lex Yang

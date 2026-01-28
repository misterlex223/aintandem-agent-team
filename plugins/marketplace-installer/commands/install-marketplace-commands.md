---
description: 安裝 marketplace 層級的 commands 到使用者的 commands 目錄
argument-hint: [--force]
allowed-tools: Bash
---

# /install-marketplace-commands - 安裝 Marketplace Commands

將 marketplace 層級的 commands 安裝到使用者的 commands 目錄。

## 用法

```
/install-marketplace-commands [--force]
```

## 參數

- `--force`: 強制覆蓋已存在的 commands

## 執行步驟

### 1. 檢查 marketplace 根目錄

```
確定 marketplace 的根目錄（包含 .claude-plugin/marketplace.json 的目錄）
```

### 2. 讀取 marketplace.json

```
解析 marketplace.json 中的 commands 列表
```

### 3. 檢查使用者的 commands 目錄

```
通常位於 ~/.claude/commands/
```

### 4. 複製 commands

```
對於每個 command：
- 檢查目標位置是否已存在
- 如果不存在或使用 --force，則複製檔案
- 建立符號連結或複製檔案內容
```

### 5. 驗證安裝

```
確認所有 commands 都已正確安裝
```

## 範例

### 範例 1: 安裝所有 marketplace commands

```
/install-marketplace-commands
```

輸出：
```
檢測到 marketplace: aintandem-agent-team
找到 1 個 command:
  - add-git-mirror

安裝 commands 到 ~/.claude/commands/...
✓ 已安裝 add-git-mirror

完成！共安裝 1 個 command。
```

### 範例 2: 強制覆蓋已存在的 commands

```
/install-marketplace-commands --force
```

輸出：
```
檢測到 marketplace: aintandem-agent-team
找到 1 個 command:
  - add-git-mirror

安裝 commands 到 ~/.claude/commands/...
✓ 已覆蓋 add-git-mirror

完成！共安裝 1 個 command。
```

### 範例 3: 所有 commands 已安裝

```
/install-marketplace-commands
```

輸出：
```
檢測到 marketplace: aintandem-agent-team
找到 1 個 command:
  - add-git-mirror

檢查安裝狀態...
✓ add-git-mirror 已安裝（已是最新版本）

所有 commands 都已是最新版本，無需安裝。
```

## 執行邏輯

```bash
#!/bin/bash

# 1. 解析參數
FORCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
      shift
      ;;
    *)
      echo "❌ 未知參數: $1"
      exit 1
      ;;
  esac
done

# 2. 找到 marketplace 根目錄
MARKETPLACE_ROOT=""
CURRENT_DIR="$PWD"

while [[ "$CURRENT_DIR" != "/" ]]; do
  if [[ -f "$CURRENT_DIR/.claude-plugin/marketplace.json" ]]; then
    MARKETPLACE_ROOT="$CURRENT_DIR"
    break
  fi
  CURRENT_DIR="$(dirname "$CURRENT_DIR")"
done

if [[ -z "$MARKETPLACE_ROOT" ]]; then
  echo "❌ 找不到 marketplace 根目錄"
  exit 1
fi

echo "檢測到 marketplace: $(basename "$MARKETPLACE_ROOT")"

# 3. 讀取 marketplace.json
MARKETPLACE_JSON="$MARKETPLACE_ROOT/.claude-plugin/marketplace.json"

if [[ ! -f "$MARKETPLACE_JSON" ]]; then
  echo "❌ 找不到 marketplace.json"
  exit 1
fi

# 解析 commands（使用 jq 或簡單的 grep）
COMMANDS=()
while IFS= read -r line; do
  COMMANDS+=("$line")
done < <(grep -A1 '"name":' "$MARKETPLACE_JSON" | grep '"source":' | sed 's/.*"\(.*\)".*/\1/' | sed "s|^\./||")

if [[ ${#COMMANDS[@]} -eq 0 ]]; then
  echo "這個 marketplace 沒有額外的 commands"
  exit 0
fi

echo "找到 ${#COMMANDS[@]} 個 command:"
for cmd in "${COMMANDS[@]}"; do
  echo "  - $(basename "$cmd" .md)"
done
echo ""

# 4. 檢查使用者的 commands 目錄
USER_COMMANDS_DIR="$HOME/.claude/commands"

if [[ ! -d "$USER_COMMANDS_DIR" ]]; then
  echo "建立 commands 目錄: $USER_COMMANDS_DIR"
  mkdir -p "$USER_COMMANDS_DIR"
fi

# 5. 複製 commands
INSTALLED_COUNT=0
SKIPPED_COUNT=0

echo "安裝 commands 到 $USER_COMMANDS_DIR/..."
echo ""

for cmd_src in "${COMMANDS[@]}"; do
  CMD_FILE="$MARKETPLACE_ROOT/$cmd_src"
  CMD_NAME="$(basename "$cmd_src" .md)"
  CMD_DEST="$USER_COMMANDS_DIR/$CMD_NAME.md"

  if [[ ! -f "$CMD_FILE" ]]; then
    echo "⚠️  跳過 $CMD_NAME（找不到原始檔案）"
    continue
  fi

  # 檢查是否需要安裝
  if [[ -f "$CMD_DEST" && "$FORCE" == false ]]; then
    # 比較檔案內容
    if diff -q "$CMD_FILE" "$CMD_DEST" > /dev/null 2>&1; then
      echo "✓ $CMD_NAME 已安裝（已是最新版本）"
      ((SKIPPED_COUNT++))
    else
      echo "⚠️  $CMD_NAME 已存在但版本不同（使用 --force 強制覆蓋）"
    fi
    continue
  fi

  # 複製檔案
  if cp "$CMD_FILE" "$CMD_DEST"; then
    echo "✓ 已安裝 $CMD_NAME"
    ((INSTALLED_COUNT++))
  else
    echo "❌ 安裝 $CMD_NAME 失敗"
  fi
done

echo ""
echo "完成！共安裝 $INSTALLED_COUNT 個 command${SKIPPED_COUNT}，跳過 $SKIPPED_COUNT 個。"
```

## 注意事項

- 需要在 marketplace 目錄中執行此命令
- 會複製檔案到 `~/.claude/commands/` 目錄
- 使用 `--force` 可以強制覆蓋已存在的 commands
- 安裝後需要重新啟動 Claude Code 或載入新的 commands

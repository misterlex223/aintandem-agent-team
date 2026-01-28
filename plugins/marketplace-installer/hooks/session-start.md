---
description: 在 session 啟動時檢查並提示安裝 marketplace commands
---

# SessionStart Hook - Marketplace Commands Installer

在 session 啟動時自動檢查是否有未安裝的 marketplace commands。

## 執行邏輯

```bash
#!/bin/bash

# 只在 marketplace 目錄中執行
if [[ ! -f ".claude-plugin/marketplace.json" ]]; then
  exit 0
fi

# 讀取 marketplace.json
MARKETPLACE_JSON=".claude-plugin/marketplace.json"

# 解析 commands 列表
COMMANDS=()
while IFS= read -r line; do
  COMMANDS+=("$line")
done < <(grep -A1 '"name":' "$MARKETPLACE_JSON" | grep '"source":' | sed 's/.*"\(.*\)".*/\1/' | sed "s|^\./||")

if [[ ${#COMMANDS[@]} -eq 0 ]]; then
  exit 0
fi

# 檢查使用者的 commands 目錄
USER_COMMANDS_DIR="$HOME/.claude/commands"

if [[ ! -d "$USER_COMMANDS_DIR" ]]; then
  exit 0
fi

# 檢查哪些 commands 未安裝
UNINSTALLED=()

for cmd_src in "${COMMANDS[@]}"; do
  CMD_NAME="$(basename "$cmd_src" .md)"
  CMD_DEST="$USER_COMMANDS_DIR/$CMD_NAME.md"

  if [[ ! -f "$CMD_DEST" ]]; then
    UNINSTALLED+=("$CMD_NAME")
  fi
done

# 如果有未安裝的 commands，輸出提示
if [[ ${#UNINSTALLED[@]} -gt 0 ]]; then
  echo ""
  echo "📦 發現 ${#UNINSTALLED[@]} 個未安裝的 marketplace commands:"
  for cmd in "${UNINSTALLED[@]}"; do
    echo "  - /$cmd"
  done
  echo ""
  echo "執行 /install-marketplace-commands 來安裝這些 commands"
  echo ""
fi
```

## 輸出格式

當有未安裝的 commands 時，顯示類似這樣的訊息：

```
📦 發現 1 個未安裝的 marketplace commands:
  - /add-git-mirror

執行 /install-marketplace-commands 來安裝這些 commands
```

## 注意事項

- 此 hook 只在 marketplace 根目錄中啟動 session 時觸發
- 不會強制安裝，只提示使用者
- 可以透過 plugin 設定禁用此 hook

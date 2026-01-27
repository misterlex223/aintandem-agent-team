---
description: 為 git repo 添加鏡像推送（GitHub ↔ GitCode 雙向支援）
argument-hint: [remote-name] [--github|--gitcode]
allowed-tools: Bash
---

# /add-gitcode-mirror - 添加 Git 鏡像推送

為當前 git repository 添加鏡像推送目標，支援 GitHub ↔ GitCode 雙向同步。

## 用法

```
/add-gitcode-mirror [remote-name] [--github|--gitcode]
```

## 參數

- `remote-name`: Remote 名稱（預設：`origin`）
- `--github`: 強制添加 GitHub 鏡像（用於 GitCode 專案）
- `--gitcode`: 強制添加 GitCode 鏡像（用於 GitHub 專案）

如果不指定 `--github` 或 `--gitcode`，工具會自動檢測當前 remote URL 並添加對應的鏡像。

## 執行步驟

### 1. 檢查當前 remote 配置

```
檢查當前 git remote 的 fetch 和 push URL
```

### 2. 自動檢測或手動指定鏡像方向

- **自動檢測**：根據當前 URL 自動判斷
  - 如果是 `github.com` → 添加 GitCode 鏡像
  - 如果是 `gitcode.net` 或 `gitcode.com` → 添加 GitHub 鏡像
- **手動指定**：使用 `--github` 或 `--gitcode` 強制指定

### 3. 轉換 URL

- `github.com/user/repo` ↔ `gitcode.com/user/repo`
- `gitcode.net/user/repo` ↔ `github.com/user/repo`

### 4. 添加 pushurl

將鏡像 URL 添加為額外的 pushurl。

## 範例

### 範例 1: 為 GitHub 專案自動添加 GitCode 鏡像

```
/add-gitcode-mirror
```

輸出：
```
當前 remote: origin
Fetch URL: https://github.com/user/repo.git
Push URL: https://github.com/user/repo.git

檢測到 GitHub 專案，添加 GitCode 鏡像...
GitCode URL: https://gitcode.com/user/repo.git
✓ 已添加 GitCode pushurl
```

### 範例 2: 為 GitCode 專案自動添加 GitHub 鏡像

```
/add-gitcode-mirror
```

輸出：
```
當前 remote: origin
Fetch URL: https://gitcode.net/user/repo.git
Push URL: https://gitcode.net/user/repo.git

檢測到 GitCode 專案，添加 GitHub 鏡像...
GitHub URL: https://github.com/user/repo.git
✓ 已添加 GitHub pushurl
```

### 範例 3: 強制為 GitCode 專案添加 GitHub 鏡像

```
/add-gitcode-mirror origin --github
```

### 範例 4: 強制為 GitHub 專案添加 GitCode 鏡像

```
/add-gitcode-mirror origin --gitcode
```

### 範例 5: 已經配置過

```
/add-gitcode-mirror
```

輸出：
```
✓ 鏡像 pushurl 已存在
```

## 執行邏輯

```bash
#!/bin/bash

# 1. 解析參數
REMOTE_NAME="origin"
MIRROR_MODE="auto"  # auto, github, gitcode

while [[ $# -gt 0 ]]; do
  case $1 in
    --github)
      MIRROR_MODE="github"
      shift
      ;;
    --gitcode)
      MIRROR_MODE="gitcode"
      shift
      ;;
    -*)
      echo "❌ 未知參數: $1"
      exit 1
      ;;
    *)
      REMOTE_NAME="$1"
      shift
      ;;
  esac
done

# 2. 檢查 remote 是否存在
if ! git remote | grep -q "^$REMOTE_NAME$"; then
  echo "❌ Remote '$REMOTE_NAME' 不存在"
  exit 1
fi

# 3. 獲取當前 URL
FETCH_URL=$(git remote get-url "$REMOTE_NAME")

echo "當前 remote: $REMOTE_NAME"
echo "Fetch URL: $FETCH_URL"
echo "Push URL: $(git remote get-url --push "$REMOTE_NAME" | head -1)"
echo ""

# 4. 決定鏡像目標和 URL
if [[ "$MIRROR_MODE" == "auto" ]]; then
  if [[ "$FETCH_URL" =~ github\.com ]]; then
    MIRROR_MODE="gitcode"
    echo "檢測到 GitHub 專案，添加 GitCode 鏡像..."
  elif [[ "$FETCH_URL" =~ gitcode\.(net|com) ]]; then
    MIRROR_MODE="github"
    echo "檢測到 GitCode 專案，添加 GitHub 鏡像..."
  else
    echo "⚠️  無法自動檢測平台類型，請使用 --github 或 --gitcode 指定"
    exit 1
  fi
fi

# 5. 轉換 URL
if [[ "$MIRROR_MODE" == "gitcode" ]]; then
  # 添加 GitCode 鏡像
  MIRROR_URL=$(echo "$FETCH_URL" | sed 's|github\.com|gitcode.com|')
  MIRROR_NAME="GitCode"
else
  # 添加 GitHub 鏡像
  MIRROR_URL=$(echo "$FETCH_URL" | sed -E 's|gitcode\.(net|com)|github.com|')
  MIRROR_NAME="GitHub"
fi

echo "$MIRROR_NAME URL: $MIRROR_URL"

# 6. 檢查是否已添加
if git remote get-url --push "$REMOTE_NAME" 2>/dev/null | grep -q "$MIRROR_URL"; then
  echo "✓ $MIRROR_NAME pushurl 已存在"
else
  git config --add "remote.$REMOTE_NAME.pushurl" "$MIRROR_URL"
  echo "✓ 已添加 $MIRROR_NAME pushurl: $MIRROR_URL"
fi

# 7. 顯示最終配置
echo ""
echo "當前 push 配置:"
git remote -v | grep "^$REMOTE_NAME"
```

## 注意事項

- 自動模式會根據當前 URL 自動判斷要添加的鏡像類型
- GitCode 支援 `gitcode.net` 和 `gitcode.com` 兩種域名
- 原有的 push URL 會保留，新增的鏡像會作為額外的 pushurl
- 推送時會同時推送到所有配置的 pushurl

## 驗證推送

配置完成後，可以用以下命令驗證：

```bash
git push --dry-run $REMOTE_NAME
```

或實際推送：

```bash
git push $REMOTE_NAME main
```

這會同時推送到 GitHub 和 GitCode。

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
- `--github`: 只添加 GitHub 鏡像（用於 GitCode 專案）
- `--gitcode`: 只添加 GitCode 鏡像（用於 GitHub 專案）

如果不指定 `--github` 或 `--gitcode`（自動模式），工具會同時確保 GitHub 和 GitCode 的 pushurl 都存在，實現真正的雙向鏡像。

## 執行步驟

### 1. 檢查當前 remote 配置

```
檢查當前 git remote 的 fetch 和 push URL
```

### 2. 自動檢測或手動指定鏡像方向

- **自動模式**（無參數）：同時確保 GitHub 和 GitCode 的 pushurl 都存在
  - 根據當前 fetch URL 自動生成對應的鏡像 URL
  - 檢查並添加缺失的 pushurl
  - 最終確保兩個平台都有 pushurl，實現雙向同步
- **手動模式**（`--github` 或 `--gitcode`）：只添加指定的單一鏡像

### 3. 轉換 URL

- `github.com/user/repo` ↔ `gitcode.com/user/repo`
- `gitcode.net/user/repo` ↔ `github.com/user/repo`

### 4. 添加 pushurl

將鏡像 URL 添加為額外的 pushurl。

## 範例

### 範例 1: 為 GitHub 專案自動設置雙向鏡像

```
/add-gitcode-mirror
```

輸出：
```
當前 remote: origin
Fetch URL: https://github.com/user/repo.git
Push URL: https://github.com/user/repo.git

自動模式：確保雙向鏡像...
GitHub URL: https://github.com/user/repo.git
✓ GitHub pushurl 已存在
GitCode URL: https://gitcode.com/user/repo.git
✓ 已添加 GitCode pushurl

當前 push 配置:
origin	https://github.com/user/repo.git (fetch)
origin	https://github.com/user/repo.git (push)
origin	https://gitcode.com/user/repo.git (push)
```

### 範例 2: 為 GitCode 專案自動設置雙向鏡像

```
/add-gitcode-mirror
```

輸出：
```
當前 remote: origin
Fetch URL: https://gitcode.net/user/repo.git
Push URL: https://gitcode.net/user/repo.git

自動模式：確保雙向鏡像...
GitHub URL: https://github.com/user/repo.git
✓ 已添加 GitHub pushurl
GitCode URL: https://gitcode.com/user/repo.git
✓ GitCode pushurl 已存在

當前 push 配置:
origin	https://gitcode.net/user/repo.git (fetch)
origin	https://gitcode.com/user/repo.git (push)
origin	https://github.com/user/repo.git (push)
```

### 範例 3: 只添加 GitHub 鏡像（手動模式）

```
/add-gitcode-mirror origin --github
```

### 範例 4: 只添加 GitCode 鏡像（手動模式）

```
/add-gitcode-mirror origin --gitcode
```

### 範例 5: 雙向鏡像已配置完成

```
/add-gitcode-mirror
```

輸出：
```
當前 remote: origin
Fetch URL: https://github.com/user/repo.git
Push URL: https://github.com/user/repo.git

自動模式：確保雙向鏡像...
GitHub URL: https://github.com/user/repo.git
✓ GitHub pushurl 已存在
GitCode URL: https://gitcode.com/user/repo.git
✓ GitCode pushurl 已存在

✓ 雙向鏡像配置已完成
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

# 4. 生成 GitHub 和 GitCode 的 URL
GITHUB_URL=""
GITCODE_URL=""

if [[ "$FETCH_URL" =~ github\.com ]]; then
  # 當前是 GitHub，生成對應的 GitCode URL
  GITHUB_URL="$FETCH_URL"
  GITCODE_URL=$(echo "$FETCH_URL" | sed 's|github\.com|gitcode.com|')
elif [[ "$FETCH_URL" =~ gitcode\.(net|com) ]]; then
  # 當前是 GitCode，生成對應的 GitHub URL
  GITCODE_URL=$(echo "$FETCH_URL" | sed -E 's|gitcode\.net|gitcode.com|')
  GITHUB_URL=$(echo "$GITCODE_URL" | sed 's|gitcode\.com|github.com|')
else
  echo "⚠️  無法自動檢測平台類型，請使用 --github 或 --gitcode 指定"
  exit 1
fi

# 5. 根據模式添加鏡像
if [[ "$MIRROR_MODE" == "auto" ]]; then
  # 自動模式：確保雙向鏡像
  echo "自動模式：確保雙向鏡像..."
  echo ""

  # 處理 GitHub
  echo "GitHub URL: $GITHUB_URL"
  if git remote get-url --push "$REMOTE_NAME" 2>/dev/null | grep -q "$GITHUB_URL"; then
    echo "✓ GitHub pushurl 已存在"
  else
    git config --add "remote.$REMOTE_NAME.pushurl" "$GITHUB_URL"
    echo "✓ 已添加 GitHub pushurl: $GITHUB_URL"
  fi
  echo ""

  # 處理 GitCode
  echo "GitCode URL: $GITCODE_URL"
  if git remote get-url --push "$REMOTE_NAME" 2>/dev/null | grep -q "$GITCODE_URL"; then
    echo "✓ GitCode pushurl 已存在"
  else
    git config --add "remote.$REMOTE_NAME.pushurl" "$GITCODE_URL"
    echo "✓ 已添加 GitCode pushurl: $GITCODE_URL"
  fi
  echo ""

  # 檢查是否雙向都已完成
  if git remote get-url --push "$REMOTE_NAME" 2>/dev/null | grep -q "$GITHUB_URL" && \
     git remote get-url --push "$REMOTE_NAME" 2>/dev/null | grep -q "$GITCODE_URL"; then
    echo "✓ 雙向鏡像配置已完成"
  fi

elif [[ "$MIRROR_MODE" == "github" ]]; then
  # 手動模式：只添加 GitHub
  echo "手動模式：只添加 GitHub 鏡像..."
  echo "GitHub URL: $GITHUB_URL"

  if git remote get-url --push "$REMOTE_NAME" 2>/dev/null | grep -q "$GITHUB_URL"; then
    echo "✓ GitHub pushurl 已存在"
  else
    git config --add "remote.$REMOTE_NAME.pushurl" "$GITHUB_URL"
    echo "✓ 已添加 GitHub pushurl: $GITHUB_URL"
  fi

elif [[ "$MIRROR_MODE" == "gitcode" ]]; then
  # 手動模式：只添加 GitCode
  echo "手動模式：只添加 GitCode 鏡像..."
  echo "GitCode URL: $GITCODE_URL"

  if git remote get-url --push "$REMOTE_NAME" 2>/dev/null | grep -q "$GITCODE_URL"; then
    echo "✓ GitCode pushurl 已存在"
  else
    git config --add "remote.$REMOTE_NAME.pushurl" "$GITCODE_URL"
    echo "✓ 已添加 GitCode pushurl: $GITCODE_URL"
  fi
fi

# 6. 顯示最終配置
echo ""
echo "當前 push 配置:"
git remote -v | grep "^$REMOTE_NAME"
```

## 注意事項

- **自動模式**會同時確保 GitHub 和 GitCode 的 pushurl 都存在，實現真正的雙向同步
- **手動模式**只添加指定的單一鏡像，適合只需要單向推送的場景
- GitCode 支援 `gitcode.net` 和 `gitcode.com` 兩種域名，工具會自動轉換為 `gitcode.com`
- 原有的 push URL 會保留，新增的鏡像會作為額外的 pushurl
- 推送時會同時推送到所有配置的 pushurl
- 可以用 `git remote -v` 驗證配置是否正確

## 驗證推送

配置完成後，可以用 `git remote -v` 確認雙向鏡像已正確設置：

```bash
git remote -v
```

應該看到類似這樣的輸出：
```
origin	https://github.com/user/repo.git (fetch)
origin	https://github.com/user/repo.git (push)
origin	https://gitcode.com/user/repo.git (push)
```

然後可以用以下命令驗證推送（不實際執行）：

```bash
git push --dry-run $REMOTE_NAME
```

或實際推送：

```bash
git push $REMOTE_NAME main
```

這會同時推送到 GitHub 和 GitCode 兩個平台。

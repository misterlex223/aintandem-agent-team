---
description: 為當前 git repo 添加 GitCode 鏡像推送
argument-hint: [remote-name]
allowed-tools: Bash
---

# /add-gitcode-mirror - 添加 GitCode 鏡像推送

為當前 git repository 添加 GitCode 作為鏡像推送目標。

## 用法

```
/add-gitcode-mirror [remote-name]
```

## 參數

- `remote-name`: Remote 名稱（預設：`origin`）

## 執行步驟

### 1. 檢查當前 remote 配置

```
檢查當前 git remote 的 fetch 和 push URL
```

### 2. 轉換 URL

將 GitHub URL 轉換為 GitCode URL：
- `github.com/user/repo` → `gitcode.com/user/repo`

### 3. 添加 pushurl

將 GitCode URL 添加為額外的 pushurl。

## 範例

### 範例 1: 為 origin 添加 GitCode 鏡像

```
/add-gitcode-mirror
```

輸出：
```
當前 remote: origin
Fetch URL: https://github.com/user/repo.git
Push URL: https://github.com/user/repo.git

GitCode URL: https://gitcode.com/user/repo.git
✓ 已添加 GitCode pushurl
```

### 範例 2: 為指定的 remote 添加

```
/add-gitcode-mirror upstream
```

### 範例 3: 已經配置過

```
/add-gitcode-mirror
```

輸出：
```
✓ GitCode pushurl 已存在
```

## 執行邏輯

```bash
# 1. 獲取 remote 名稱（預設 origin）
REMOTE_NAME="${1:-origin}"

# 2. 檢查 remote 是否存在
if ! git remote | grep -q "^$REMOTE_NAME$"; then
  echo "❌ Remote '$REMOTE_NAME' 不存在"
  exit 1
fi

# 3. 獲取當前 URL
FETCH_URL=$(git remote get-url "$REMOTE_NAME")

# 4. 轉換為 GitCode URL
GITCODE_URL=$(echo "$FETCH_URL" | sed 's/github.com/gitcode.com/')

# 5. 檢查是否已添加
if git remote get-url --push "$REMOTE_NAME" | grep -q "$GITCODE_URL"; then
  echo "✓ GitCode pushurl 已存在"
else
  git config --add "remote.$REMOTE_NAME.pushurl" "$GITCODE_URL"
  echo "✓ 已添加 GitCode pushurl: $GITCODE_URL"
fi

# 6. 顯示最終配置
echo ""
echo "當前 push 配置:"
git remote -v | grep "^$REMOTE_NAME"
```

## 注意事項

- GitCode URL 會根據當前的 GitHub URL 自動轉換
- 如果 remote 的 URL 不是 GitHub，會嘗試直接添加 gitcode.com 版本
- 原有的 GitHub push URL 會保留

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

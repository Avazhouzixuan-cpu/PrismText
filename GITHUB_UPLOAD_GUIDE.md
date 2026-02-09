# GitHub 上传指南

## 步骤 1: 在 GitHub 上创建仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 **"+"** 按钮，选择 **"New repository"**
3. 填写仓库信息：
   - **Repository name**: `PrismText` (或你喜欢的名字)
   - **Description**: A Gemini 3–Based Cross-Cultural Semantic Alignment and Risk Decision System
   - 选择 **Public** 或 **Private**
   - **不要勾选** "Initialize this repository with a README"（因为项目已有 README）
4. 点击 **"Create repository"**

## 步骤 2: 在本地初始化 Git 并推送代码

在 PowerShell 中执行以下命令（**请将 YOUR_USERNAME 和 YOUR_REPO_NAME 替换为你的实际信息**）：

```powershell
# 1. 进入项目目录
cd c:\Users\Ava_z\Desktop\PrismText

# 2. 初始化 Git 仓库
git init

# 3. 添加所有文件到暂存区
git add .

# 4. 提交代码
git commit -m "Initial commit: PrismText Chrome Extension"

# 5. 添加远程仓库（替换 YOUR_USERNAME 和 YOUR_REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. 重命名主分支为 main（如果默认是 master）
git branch -M main

# 7. 推送到 GitHub
git push -u origin main
```

## 步骤 3: 如果遇到认证问题

如果推送时要求输入用户名和密码，你需要：

### 方法 A: 使用 Personal Access Token (推荐)

1. 在 GitHub 上：**Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. 点击 **"Generate new token"**
3. 选择权限：至少勾选 `repo`
4. 生成后复制 token
5. 推送时：
   - 用户名：你的 GitHub 用户名
   - 密码：粘贴刚才复制的 token

### 方法 B: 使用 GitHub CLI

```powershell
# 安装 GitHub CLI (如果还没安装)
winget install GitHub.cli

# 登录
gh auth login

# 然后就可以正常 push 了
git push -u origin main
```

## 步骤 4: 验证上传成功

1. 刷新你的 GitHub 仓库页面
2. 应该能看到所有项目文件
3. README.md 会自动显示在仓库首页

## 后续更新代码

当你修改代码后，使用以下命令更新 GitHub：

```powershell
git add .
git commit -m "描述你的更改"
git push
```

## 常见问题

**Q: 如果我想忽略某些文件怎么办？**
A: 编辑 `.gitignore` 文件，添加要忽略的文件或文件夹名称

**Q: 如何删除已上传的文件？**
A: 
```powershell
git rm 文件名
git commit -m "删除文件"
git push
```

**Q: 如何查看提交历史？**
A: `git log`

**Q: 如何撤销最后一次提交？**
A: `git reset --soft HEAD~1` (保留更改) 或 `git reset --hard HEAD~1` (丢弃更改)

# X-says 部署到 GitHub Pages

## 直接使用 `docs` 目录

1. 将整个项目推送到 GitHub 仓库。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 选择当前分支和 **`/docs`** 目录，然后保存。

GitHub 完成发布后，网站会出现在 `https://<用户名>.github.io/<仓库名>/`。

## 仅上传静态文件

解压 `X-says-GitHub-Pages.zip`，将其中所有文件放到 GitHub Pages 仓库根目录即可。

## 重新生成

项目更新后执行 `npm run build:pages`，新的静态站点会生成到 `docs` 目录。

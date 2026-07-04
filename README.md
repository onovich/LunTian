# LunTian

Mancala-like sowing roguelike card prototype, refactored from a single-file handoff into a Vite project.<br/>**轮田是一个类播棋播种机制的肉鸽卡牌原型，已从单文件交接稿重构为 Vite 项目。**

## Project Status

- The original handoff files remain in `origin/` for reference.<br/>**原始交接文件保留在 `origin/` 中，方便对照。**
- Runtime code is split into template, styles, catalog data, pure preview rules, and app orchestration under `src/`.<br/>**运行代码已拆分到 `src/`：模板、样式、数据配置、纯预览规则和应用编排分离。**
- GitHub Pages deployment is configured through GitHub Actions.<br/>**线上部署通过 GitHub Actions 的 GitHub Pages 流程配置。**

## Commands

```powershell
npm install
npm run dev
npm run build
npm run preview
```

Double-click `StartLocalTest.cmd` to start a local Vite dev server with fallback ports, or run a dry check:<br/>**双击 `StartLocalTest.cmd` 可以用备用端口启动本地 Vite 开发服务器，也可以先做干跑检查：**

```powershell
.\StartLocalTest.cmd -DryRun
```

Double-click `OpenOnlineTest.cmd` to open the GitHub Pages URL after deployment, or run:<br/>**部署完成后双击 `OpenOnlineTest.cmd` 打开 GitHub Pages 线上地址，也可以运行：**

```powershell
.\OpenOnlineTest.cmd -DryRun
```

## Deployment

The expected Pages URL is `https://onovich.github.io/LunTian/`.<br/>**预期 GitHub Pages 地址是 `https://onovich.github.io/LunTian/`。**

If the first deployment does not appear, check `Settings -> Pages -> Source` and select `GitHub Actions`.<br/>**如果首次部署后页面未出现，请在仓库 `Settings -> Pages -> Source` 中选择 `GitHub Actions`。**

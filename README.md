# MC 服务器官方首页

一个为 Minecraft 服务器打造的官方首页网站，包含服务器信息展示、在线人数查询、游戏截图预览、玩法介绍和客户端下载等功能。
  ![演示截图](./DEMO.png)

## 项目结构

```
MCHTMLserver/
├── index.html          # 首页 HTML 文件
├── mc-proxy.js         # Node.js 后端服务
├── 启动.bat            # Windows 一键启动脚本
└── images/             # 图片资源目录
    ├── JT (1).jpg ~ JT (6).jpg    # 游戏截图
    └── zs1.jpg ~ zs5.jpg          # 模组展示图
```

## 功能特性

- 🖥️ **服务器信息展示** - 显示服务器 IP、游戏版本、在线人数、服务器模式
- 👥 **在线玩家查询** - 实时获取并展示当前在线玩家列表
- 📸 **游戏截图预览** - 支持点击放大查看游戏截图和模组展示
- 🎮 **玩法介绍** - 展示服务器特色玩法
- ⬇️ **客户端下载** - 提供整合包下载入口
- 🎨 **精美 UI** - 深色科技风设计，流畅动画效果
- 📱 **响应式布局** - 适配桌面端和移动端

## 技术栈

- **前端**: 原生 HTML + CSS + JavaScript
- **后端**: Node.js (内置 http 模块)
- **协议**: Minecraft Server List Ping (SLP) 协议

## 快速开始

### 环境要求

- Node.js (任意较新版本)

### 启动方式

#### Windows 系统

双击运行 `启动.bat` 即可一键启动服务并自动打开浏览器。

#### 命令行启动

```bash
node mc-proxy.js
```

启动后访问 http://localhost:3456 查看网站。

## API 接口

### 获取服务器状态

**请求**: `GET /api/server-status`

**响应示例**:

```json
{
  "online": true,
  "players": {
    "online": 12,
    "max": 4399,
    "list": ["player1", "player2", "player3"]
  }
}
```

服务器离线时返回：

```json
{
  "online": false,
  "error": "Connection timeout"
}
```

## 服务器配置

在 [mc-proxy.js](file:///e:/workbenc/HTML/MCHTMLserver/mc-proxy.js) 中修改以下配置：

- **服务器地址**: 第 165 行 `queryMinecraftServer('服务器域名', 端口)`
- **服务端口**: 第 187 行 `const PORT = 端口`
- **协议版本**: 第 50 行 `const protocolVersion = writeVarInt(767)` (767 对应 1.21.1)

## 自定义内容

### 修改服务器信息

编辑 [index.html](file:///e:/workbenc/HTML/MCHTMLserver/index.html) 中的服务器信息卡片：

- 服务器 IP: 第 673 行
- 游戏版本: 第 677 行
- 服务器模式: 第 685 行

### 添加/修改截图

将图片放入 `images/` 目录，然后在 [index.html](file:///e:/workbenc/HTML/MCHTMLserver/index.html) 的 `.preview-grid` 中添加对应的 `.preview-item`。

### 修改下载链接

在 [index.html](file:///e:/workbenc/HTML/MCHTMLserver/index.html) 第 770 行修改下载按钮的链接地址。

## 注意事项

- 服务器状态查询依赖 Minecraft SLP 协议，需确保目标服务器已开启查询功能
- 静态文件服务有路径安全校验，防止目录遍历攻击
- 在线人数每 30 秒自动刷新一次

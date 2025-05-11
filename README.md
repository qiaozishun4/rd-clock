# 🕒 多功能计时器

**作者：RealDream**  
**[问题反馈](https://qpoem.org.cn)**  
![GitHub](https://img.shields.io/badge/license-MIT-blue)

简易Web计时器，支持正/倒计时、分段记录、音效控制等特性，采用前沿Web技术实现高精度计时。

## 🌟 主要功能

### 核心功能
- 精确到毫秒的计时系统（±1ms精度）
- 双模式切换：正计时 ⏲️ / 倒计时 ⏳
- 智能状态管理：运行/暂停/重置
- 响应式布局（适配移动端）

### 扩展功能
- 🎵 声音反馈系统（可开关）
- 📝 分段记录与历史追溯
- ⚙️ 自定义时间预设
- 🔄 本地存储自动保存
- 📁 记录导出功能
- 🌓 暗色模式适配

## 🚀 快速开始

[https://clock.qpoem.org.cn/](https://clock.qpoem.org.cn/)

## 🎮 使用指南

### 基础操作
- ▶️ 空格键：开始/暂停
- 🔄 Esc键：重置
- ⏺️ L键：记录分段
- ⚙️ S键：打开设置

### 高级功能
1. **倒计时设置**：
   - 通过设置面板输入目标时间
   - 支持小时/分钟/秒独立设置
   - 自动换算溢出值（65秒 → 1分05秒）

2. **分段记录**：
   - 实时记录每个分段的时间
   - 显示分段时长与累计时长
   - 自动保存至本地存储

3. **声音控制**：
   - 🔊 启用/禁用音效反馈
   - 不同操作触发不同频率提示音
   - 系统音量同步控制

## 🛠 技术栈

### 核心技术
- **HTML5**：语义化结构
- **CSS3**：Flex/Grid布局、CSS动画
- **ES6+**：类模块化开发

### 高级特性
- Web Audio API
- LocalStorage 持久化
- requestAnimationFrame 动画
- Media Query 响应式
- Web Notifications API

## 📚 开发文档

### 项目结构
```
├── index.html          # 主界面
├── styles.css         # 样式表
├── app.js             # 核心逻辑
└── beep.mp3           # 提示音效
```

### 代码规范
- 遵循Airbnb JavaScript规范
- 语义化Git提交信息
- 模块化状态管理

## 🤝 参与贡献

欢迎通过以下方式参与改进：
1. 在 [问题反馈页面](https://qpoem.org.cn) 报告问题
2. Fork仓库并提交Pull Request
3. 提出新功能建议

## 📜 许可协议

本项目采用 [MIT License](LICENSE)

Copyright © 2023 [RealDream](https://github.com/RealDream)
```

---

> 📌 提示：首次使用建议允许浏览器通知权限以获得完整功能体验  
> 🔧 推荐使用 Chrome/Firefox 等现代浏览器访问  
> 📦 支持 PWA 安装为桌面应用（需HTTPS环境）

# Custom Assets - Cocos Creator 游戏框架

一个基于 Cocos Creator 3.8.4 的完整游戏开发框架，提供丰富的功能模块和工具集。

## 📋 项目简介

Custom Assets 是一个专为 Cocos Creator 游戏开发设计的综合框架，集成了多种常用功能模块，包括：

- 🎮 **游戏框架核心** - 统一的应用程序管理
- 🎨 **UI 管理系统** - 完整的界面管理解决方案
- 🔊 **音频管理** - 背景音乐和音效管理
- 📦 **资源管理** - 高效的资源加载和缓存
- 🔄 **热更新系统** - 支持游戏内容热更新
- 🌐 **网络通信** - HTTP 请求和数据传输
- 💾 **数据管理** - 本地数据存储和加密
- 🎭 **场景管理** - 场景切换和生命周期管理
- ⚡ **事件系统** - 全局事件通信机制

## ✨ 主要特性

### 🏗️ 框架架构
- **单例模式** - 全局统一的应用程序管理
- **模块化设计** - 各功能模块独立，易于扩展
- **生命周期管理** - 完整的应用启动、运行、销毁流程
- **类型安全** - 基于 TypeScript 开发，提供完整的类型定义

### 🎨 UI 系统
- **UI 管理器** - 统一的界面管理
- **对话框系统** - 支持多种对话框类型
- **加载界面** - 自定义加载动画和进度显示
- **滚动视图** - 优化的滚动列表组件

### 🔊 音频系统
- **背景音乐管理** - 支持多轨道背景音乐
- **音效管理** - 音效播放和音量控制
- **音频缓存** - 智能音频资源缓存机制

### 📦 资源管理
- **异步加载** - 支持异步资源加载
- **资源缓存** - 智能缓存管理
- **预加载机制** - 提升游戏启动速度
- **资源释放** - 自动内存管理

### 🔄 热更新
- **增量更新** - 支持游戏内容增量更新
- **版本管理** - 完整的版本控制机制
- **更新队列** - 有序的更新流程管理

### 💾 数据管理
- **本地存储** - 支持本地数据持久化
- **数据加密** - 敏感数据加密存储
- **用户数据** - 用户配置和游戏进度管理

## 🚀 快速开始

### 环境要求

- Cocos Creator 3.8.4 或更高版本
- Node.js 18.17.1 或更高版本
- TypeScript 4.3.4 或更高版本

### 安装依赖

```bash
# 安装项目依赖
npm install

# 安装框架扩展依赖
cd extensions/bl-framework
npm install
```

### 构建项目

```bash
# 构建框架扩展
cd extensions/bl-framework
npm run build

# 或者使用监听模式
npm run watch
```

### 使用框架

1. **初始化应用**
```typescript
initApplication();
```

2. **使用管理器**
```typescript
// 访问各种管理器
app.manager.ui.showDialog('DialogName');
app.manager.audio.playBGM('BGM1');
app.manager.scene.loadScene('SceneName');
```

3. **事件通信**
```typescript
// 监听事件
app.manager.event.on('EVENT_NAME', callback);

// 发送事件
app.manager.event.emit('EVENT_NAME', data);
```

## 📁 项目结构

```
custom-assets/
├── assets/                    # 游戏资源目录
│   ├── res/                   # 资源文件
│   ├── scene.ts              # 主场景脚本
│   └── test/                 # 测试用例
├── extensions/               # 扩展目录
│   └── bl-framework/         # 核心框架
│       ├── assets/           # 框架资源
│       │   ├── common/       # 通用工具
│       │   ├── manager/      # 管理器模块
│       │   ├── ui/          # UI 组件
│       │   ├── network/     # 网络模块
│       │   └── hotupdate/   # 热更新模块
│       ├── source/          # 框架源码
│       └── package.json     # 扩展配置
├── library/                 # Cocos Creator 库文件
├── settings/               # 项目设置
└── package.json           # 项目配置
```

## 🎯 核心模块

### FWApplication
应用程序主类，负责框架的初始化和生命周期管理。

### FWManager
框架管理器，统一管理所有功能模块：
- **FWUIManager** - UI 界面管理
- **FWAudioManager** - 音频管理
- **FWAssetManager** - 资源管理
- **FWSceneManager** - 场景管理
- **FWEventManager** - 事件管理
- **FWDataManager** - 数据管理
- **FWHotupdateManager** - 热更新管理

## 🔧 开发指南

### 添加新的管理器

1. 在 `extensions/bl-framework/assets/manager/manager/` 目录下创建新的管理器类
2. 继承 `FWBaseManager` 基类
3. 在 `FWManager` 中注册新管理器
4. 在 `index.ts` 中导出

### 自定义 UI 组件

1. 在 `extensions/bl-framework/assets/ui/` 目录下创建组件
2. 继承相应的基类
3. 在 UI 管理器中注册

### 扩展网络功能

1. 在 `extensions/bl-framework/assets/network/` 目录下添加网络模块
2. 实现相应的网络接口
3. 在管理器中进行集成

## 📝 测试用例

项目包含丰富的测试用例，位于 `assets/test/` 目录：

- **3D 测试** - 3D 模型和动画测试
- **音频测试** - 音频播放和效果测试
- **数据测试** - 数据存储和加密测试
- **对话框测试** - UI 对话框功能测试
- **加载测试** - 资源加载和进度显示测试
- **网络测试** - HTTP 请求和通信测试
- **场景测试** - 场景切换和生命周期测试

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 参与讨论

---

**注意**: 本项目基于 Cocos Creator 3.8.4 开发，请确保使用兼容的版本。 
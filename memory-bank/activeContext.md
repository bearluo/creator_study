# 活动上下文

## 当前任务
**任务**: 将 core 和 creator 剥离，方便不同游戏引擎接入框架  
**模式**: VAN (Verification, Analysis, Navigation)  
**日期**: 2025-01-27

## 任务目标
将 bl-framework 的核心功能与 Cocos Creator 特定实现分离，使框架能够适配不同的游戏引擎。

## 相关背景
- 项目已有 4 个核心 npm 包（core, ecs, behaviortree, behaviortree-ecs），这些包已经是引擎无关的
- Creator 扩展目录包含大量 Creator 特定代码（管理器、UI、网络等）
- 需要设计抽象层和适配器模式来支持多引擎

## 当前阶段
CREATIVE 模式 - 设计决策完成，可以进入 IMPLEMENT 模式

## 分析结果
- **复杂度**: Level 4 - Complex System（架构级重构）
- **关键发现**:
  - 核心包（packages/）已经是引擎无关的
  - Creator 扩展（extensions/bl-framework/assets/）包含大量 Creator 依赖
  - 需要设计引擎抽象层和适配器模式
  - 需要保持向后兼容

## CREATIVE 模式完成情况
- ✅ 引擎抽象接口设计（IEngine, IResourceManager, IUIManager 等）
- ✅ 适配器模式设计（Creator 适配器结构）
- ✅ 依赖注入机制设计（服务定位器 + 可选注入）
- ✅ 设计文档创建（3个设计文档）

## 下一步
- ⏭️ **可以进入 IMPLEMENT 模式**（设计决策已完成）
- 实现引擎抽象接口
- 实现 Creator 适配器
- 重构现有管理器使用抽象接口


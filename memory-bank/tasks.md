# 任务跟踪

## 当前任务：将 core 和 creator 剥离，方便不同游戏引擎接入框架

### 任务信息
- **任务ID**: ARCH-001
- **任务名称**: Core 与 Creator 架构剥离
- **复杂度**: Level 4 - Complex System（架构级重构）
- **状态**: VAN 分析中
- **创建时间**: 2025-01-27

### 任务目标
将 bl-framework 的核心功能与 Cocos Creator 特定实现分离，使框架能够适配不同的游戏引擎（如 Unity、Unreal Engine、Phaser 等）。

### VAN 分析结果

#### 1. 当前架构分析

**核心包（引擎无关）**：
- `packages/core/` - 核心工具和事件系统（FWPath, FWEventDispatcher, FWLog, FWDecorator）
- `packages/ecs/` - ECS 框架（Entity, Component, System, World）
- `packages/behaviortree/` - 行为树系统
- `packages/behaviortree-ecs/` - 行为树与 ECS 集成

**Creator 扩展（引擎特定）**：
- `bl-framework-demo/extensions/bl-framework/assets/` - Creator 扩展代码
  - `events/FWEvents.ts` - 使用 `Node, EventTouch, Component` from 'cc'
  - `common/FWConstant.ts` - 使用 `Vec2, Vec3, Vec4, Prefab, SpriteFrame, AudioClip` from 'cc'
  - `manager/` - 各种管理器（Asset, Audio, UI, Scene 等）
  - `ui/` - UI 系统
  - `network/` - 网络模块
  - `hotupdate/` - 热更新系统

#### 2. Creator 依赖识别

**直接依赖**：
- `FWEvents.ts`: `Node, EventTouch, Component` from 'cc'
- `FWConstant.ts`: `Vec2, Vec3, Vec4, Prefab, SpriteFrame, AudioClip` from 'cc'
- 管理器系统：可能依赖 Creator 的资源管理、场景管理等 API
- UI 系统：依赖 Creator 的 UI 组件系统
- 网络模块：可能依赖 Creator 的网络 API

**间接依赖**：
- 通过接口和类型定义间接依赖 Creator 类型
- 通过扩展系统依赖 Creator 的扩展机制

#### 3. 复杂度评估

**Level 4 - Complex System** 原因：
- ✅ **架构级重构**：需要重新设计整个框架的架构
- ✅ **多子系统影响**：影响事件系统、管理器系统、UI 系统、网络系统等
- ✅ **抽象层设计**：需要设计引擎抽象层/适配器模式
- ✅ **向后兼容**：需要保持现有 Creator 项目的兼容性
- ✅ **多引擎支持**：需要支持多种游戏引擎
- ✅ **时间跨度**：预计需要数周至数月的开发时间

#### 4. 关键挑战

1. **抽象层设计**
   - 如何抽象不同引擎的通用概念（节点、组件、资源等）
   - 如何设计适配器接口
   - 如何处理引擎特定的功能差异

2. **依赖管理**
   - 识别所有 Creator 依赖点
   - 设计依赖注入机制
   - 处理可选依赖

3. **向后兼容**
   - 保持现有 Creator 项目正常工作
   - 提供迁移路径
   - 处理 API 变更

4. **测试策略**
   - 多引擎测试环境
   - 兼容性测试
   - 性能对比测试

### PLAN 模式完成情况

#### 已完成
- ✅ 详细任务分解（5个阶段，30+个主要任务）
- ✅ 架构设计文档（目标架构、抽象接口设计）
- ✅ 分阶段实施计划（7-11周）
- ✅ 风险评估和缓解措施（6个主要风险）
- ✅ 验收标准制定
- ✅ 时间估算和依赖关系分析

#### 详细计划文档
- [架构剥离详细计划.md](../docs/架构剥离详细计划.md) - 完整的实施计划

### 实施计划概览

**阶段 1: 接口设计和抽象层设计（1-2周）**
- 设计引擎抽象接口（IEngine, IResourceManager, IUIManager 等）
- 设计适配器模式
- 设计依赖注入机制

**阶段 2: Creator 适配器实现（2-3周）**
- 实现所有 Creator 适配器
- 实现 Creator 引擎适配器
- 编写单元测试

**阶段 3: 重构管理器系统（2-3周）**
- 重构事件系统和常量定义
- 重构所有管理器使用抽象接口
- 保持向后兼容

**阶段 4: 测试和验证（1-2周）**
- 单元测试、集成测试、兼容性测试、性能测试

**阶段 5: 文档和示例（1周）**
- 架构文档、示例代码、API 文档

### IMPLEMENT 模式进度

#### 阶段 1: 引擎抽象接口实现 ✅
- ✅ 创建 engine 目录结构
- ✅ 实现 IEngine 核心接口
- ✅ 实现 IResourceManager 接口
- ✅ 实现 IUIManager 接口
- ✅ 实现 ISceneManager 接口（可选）
- ✅ 实现 IAudioManager 接口（可选）
- ✅ 实现 INetworkManager 接口（可选）
- ✅ 实现 IHotupdateManager 接口（可选）
- ✅ 实现 EngineServiceLocator 服务定位器
- ✅ 更新 core 包导出

#### 阶段 2: Creator 适配器实现 ✅
- ✅ 创建适配器目录结构
- ✅ 实现 CreatorEngine 适配器
- ✅ 实现 CreatorResourceManager 适配器
- ✅ 实现 CreatorUIManager 适配器
- ✅ 实现 CreatorNode 适配器
- ✅ 实现 CreatorBundle 适配器

#### 阶段 3: 重构管理器系统（进行中）
- [x] 重构事件系统（FWEvents.ts）
  - ✅ 移除 Creator 类型依赖（Component, EventTouch）
  - ✅ 使用抽象接口（INode, ITouchEvent）
  - ✅ 创建 CreatorTouchEvent 适配器
- [x] 重构常量定义（FWConstant.ts）
  - ✅ 添加抽象接口支持（IVec2, IVec3, IVec4, IColor）
  - ✅ 保持向后兼容（仍支持 Creator 类型）
  - ✅ 添加工厂方法（createVec2, createVec3 等）
- [x] 重构资源管理器（FWAssetManager）
  - ✅ 内部使用 IResourceManager 抽象接口
  - ✅ 保持向后兼容（回退到 Creator 直接调用）
  - ✅ 通过 EngineServiceLocator 获取资源管理器
- [x] 重构 UI 管理器（FWUIManager）
  - ✅ 内部使用 IUIManager 抽象接口
  - ✅ 通过 EngineServiceLocator 获取 UI 管理器实例
  - ✅ 保持向后兼容（回退到 Creator 直接调用）
  - ✅ 更新 FWUIRoot 使用 CreatorTouchEvent 适配器
- [x] 重构其他管理器
  - ✅ 重构音频管理器（FWAudioManager）
    - ✅ 创建 CreatorAudioManager 适配器
    - ✅ 创建 CreatorAudioClip 和 CreatorAudioSource 适配器
    - ✅ 内部使用 IAudioManager 抽象接口
    - ✅ 保持向后兼容
  - [ ] 重构场景管理器（FWSceneManager）- 可选
  - [ ] 重构热更新管理器（FWHotupdateManager）- 可选

#### 设计文档
- [creative-engine-abstraction.md](../memory-bank/creative/creative-engine-abstraction.md) - 引擎抽象接口设计
- [creative-adapter-pattern.md](../memory-bank/creative/creative-adapter-pattern.md) - 适配器模式设计
- [creative-dependency-injection.md](../memory-bank/creative/creative-dependency-injection.md) - 依赖注入机制设计

### 下一步行动

根据 CREATIVE 模式规则，设计决策已完成，可以进入 **IMPLEMENT 模式** 开始实现。

**建议的实施顺序**：
1. ⏭️ 实现引擎抽象接口（packages/core/src/engine/）
2. ⏭️ 实现服务定位器和管理器工厂
3. ⏭️ 实现 Creator 适配器（extensions/bl-framework/adapters/creator/）
4. ⏭️ 重构现有管理器使用抽象接口

### 相关文档
- ✅ [架构剥离详细计划.md](../docs/架构剥离详细计划.md) - 完整的实施计划
- 待创建：引擎抽象层设计文档（CREATIVE 模式）
- 待创建：适配器模式设计文档（CREATIVE 模式）

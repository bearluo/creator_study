# PLAN 模式：BehaviorTree 核心库详细拆分计划

## 项目概述

**目标**: 将 BehaviorTree 核心功能拆分为独立的 npm 包 `@bl-framework/behaviortree`  
**当前状态**: BehaviorTree 模块在 `extensions/bl-framework/assets/behaviortree/`  
**计划时间**: 2025-11-17  
**预计完成时间**: 2-3 天

## 当前模块分析

### 文件结构

```
behaviortree/
├── core/                    # 核心模块（7 个文件）
│   ├── BehaviorTree.ts      # 行为树主类
│   ├── BehaviorTreeExecutor.ts  # 行为树执行器
│   ├── Blackboard.ts        # 黑板（包含 Entity 绑定功能）
│   ├── Node.ts              # 节点基类
│   ├── NodeStatus.ts        # 节点状态枚举
│   ├── types.ts             # 类型定义
│   └── index.ts             # 核心模块导出
├── nodes/                   # 节点模块（16 个文件）
│   ├── action/
│   │   ├── Action.ts
│   │   └── index.ts
│   ├── composite/
│   │   ├── CompositeNode.ts
│   │   ├── Parallel.ts
│   │   ├── Selector.ts
│   │   ├── Sequence.ts
│   │   └── index.ts
│   ├── condition/
│   │   ├── Condition.ts
│   │   └── index.ts
│   ├── decorator/
│   │   ├── DecoratorNode.ts
│   │   ├── Inverter.ts
│   │   ├── Repeater.ts
│   │   ├── UntilFailure.ts
│   │   ├── UntilSuccess.ts
│   │   └── index.ts
│   └── index.ts
├── utils/                   # 工具模块（1 个文件）
│   ├── BehaviorTreeBuilder.ts
│   └── index.ts
├── ecs/                     # ECS 扩展模块（4 个文件，不包含在核心库）
│   ├── BehaviorTreeComponent.ts
│   ├── BehaviorTreeSystem.ts
│   ├── EntityDataHelper.ts
│   └── index.ts
└── index.ts                 # 主入口
```

**核心库文件**: 24 个文件（不包括 ecs/ 目录）

### 核心类分析

#### Core 模块（7 个文件）

1. **BehaviorTree.ts** - 行为树主类
   - 依赖: `Node`, `Blackboard`, `NodeStatus`
   - 无外部依赖 ✅

2. **BehaviorTreeExecutor.ts** - 行为树执行器
   - 依赖: `BehaviorTree`, `NodeStatus`
   - 无外部依赖 ✅

3. **Blackboard.ts** - 黑板（共享数据存储）
   - ⚠️ **问题**: 包含 Entity 绑定功能，依赖 ECS 类型
   - 依赖: `ComponentType, EntityId, IComponent` from `../../ecs`
   - **处理方案**: 移除 Entity 绑定功能，保留基本功能

4. **Node.ts** - 节点基类
   - 依赖: `NodeStatus`, `Blackboard`
   - 无外部依赖 ✅

5. **NodeStatus.ts** - 节点状态枚举
   - 无外部依赖 ✅

6. **types.ts** - 类型定义
   - 无外部依赖 ✅

7. **index.ts** - 核心模块导出
   - 无外部依赖 ✅

#### Nodes 模块（16 个文件）

- **action/Action.ts** - 动作节点
- **composite/** - 组合节点（Selector, Sequence, Parallel）
- **condition/Condition.ts** - 条件节点
- **decorator/** - 装饰器节点（Inverter, Repeater, UntilSuccess, UntilFailure）

所有节点:
- 依赖: 仅依赖 `core` 模块
- 无外部依赖 ✅

#### Utils 模块（1 个文件）

- **BehaviorTreeBuilder.ts** - 行为树构建器
  - 依赖: 仅依赖 `core` 和 `nodes` 模块
  - 无外部依赖 ✅

### 依赖关系分析

#### 内部依赖
- ✅ 所有模块只依赖内部模块
- ✅ 无循环依赖

#### 外部依赖检查

**检查结果**:
- ⚠️ `Blackboard.ts` 依赖 ECS 类型（需要移除）
- ✅ 其他所有文件无外部依赖

**结论**: 移除 Blackboard.ts 的 Entity 绑定功能后，核心库完全独立 ✅

## Blackboard.ts 拆分方案

### 当前结构

```typescript
// Blackboard.ts (当前)
export class Blackboard {
    // 基本功能（无 ECS 依赖）
    private data: Map<string, any>;
    private listeners: Map<string, Set<BlackboardListener>>;
    private cache: Map<string, any>;
    
    // Entity 绑定功能（依赖 ECS）
    private entityBindings: Map<string, {...}>;
    private entityAccessor?: (...);
    
    // 基本方法
    set(), get(), has(), delete(), clear(), watch()
    
    // Entity 绑定方法（需要移除）
    bindEntity(), bindEntityProperty(), setEntityAccessor()
}
```

### 拆分方案

#### 方案 A: 完全分离（推荐）

**核心库中的 Blackboard**:
```typescript
// @bl-framework/behaviortree
export class Blackboard {
    // 仅保留基本功能
    private data: Map<string, any>;
    private listeners: Map<string, Set<BlackboardListener>>;
    private cache: Map<string, any>;
    
    // 基本方法
    set(), get(), has(), delete(), clear(), watch()
    clearCache(), getCacheVersion()
}
```

**ECS 扩展库中的 BlackboardEntityBinding**:
```typescript
// @bl-framework/behaviortree-ecs
import { Blackboard } from '@bl-framework/behaviortree';
import { ComponentType, EntityId, IComponent } from '@bl-framework/ecs';

export class BlackboardEntityBinding {
    // 扩展 Blackboard，添加 Entity 绑定功能
    // 可以作为独立工具类或扩展方法
}
```

#### 方案 B: 接口扩展

使用接口和扩展方法，但会增加复杂性，不推荐。

### 推荐方案：方案 A

**优点**:
- 清晰的职责分离
- 核心库完全独立
- 易于维护和理解

**实现步骤**:
1. 在核心库中创建基本 `Blackboard` 类
2. 在 ECS 扩展库中创建 `BlackboardEntityBinding` 工具类
3. 提供扩展方法或组合使用方式

## 拆分计划

### 阶段 1: 准备工作（0.5 天）

#### 任务清单
- [ ] 详细分析 Blackboard.ts 的 Entity 绑定功能
- [ ] 确定拆分边界和接口设计
- [ ] 检查所有文件的依赖关系
- [ ] 确认无其他外部依赖

#### 交付物
- Blackboard 拆分设计文档
- 依赖关系分析报告

### 阶段 2: 创建 npm 包结构（0.5 天）

#### 任务清单
- [ ] 创建 `packages/behaviortree` 目录
- [ ] 初始化 package.json
- [ ] 配置 TypeScript（参考 core 和 ecs 库）
- [ ] 创建目录结构（src/core, src/nodes, src/utils）
- [ ] 创建 .gitignore
- [ ] 创建 README.md 模板

#### 目录结构
```
packages/behaviortree/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── src/
│   ├── index.ts
│   ├── core/
│   │   ├── index.ts
│   │   ├── BehaviorTree.ts
│   │   ├── BehaviorTreeExecutor.ts
│   │   ├── Blackboard.ts          # 移除 Entity 绑定功能
│   │   ├── Node.ts
│   │   ├── NodeStatus.ts
│   │   └── types.ts
│   ├── nodes/
│   │   ├── index.ts
│   │   ├── action/
│   │   │   ├── index.ts
│   │   │   └── Action.ts
│   │   ├── composite/
│   │   │   ├── index.ts
│   │   │   ├── CompositeNode.ts
│   │   │   ├── Parallel.ts
│   │   │   ├── Selector.ts
│   │   │   └── Sequence.ts
│   │   ├── condition/
│   │   │   ├── index.ts
│   │   │   └── Condition.ts
│   │   └── decorator/
│   │       ├── index.ts
│   │       ├── DecoratorNode.ts
│   │       ├── Inverter.ts
│   │       ├── Repeater.ts
│   │       ├── UntilFailure.ts
│   │       └── UntilSuccess.ts
│   └── utils/
│       ├── index.ts
│       └── BehaviorTreeBuilder.ts
├── dist/
└── examples/
```

### 阶段 3: 迁移代码（1 天）

#### 任务清单
- [ ] 迁移 types 和 NodeStatus（最简单，无依赖）
- [ ] 迁移 Blackboard（移除 Entity 绑定功能）
- [ ] 迁移 Node
- [ ] 迁移 BehaviorTree
- [ ] 迁移 BehaviorTreeExecutor
- [ ] 迁移所有 nodes（16 个文件）
- [ ] 迁移 utils（BehaviorTreeBuilder）
- [ ] 创建主入口文件
- [ ] 更新所有导入路径

#### 关键任务：Blackboard.ts 拆分

**步骤**:
1. 创建新的 `Blackboard.ts`，移除所有 Entity 绑定相关代码
2. 移除 `entityBindings` 属性
3. 移除 `entityAccessor` 属性
4. 移除 `bindEntity()` 方法
5. 移除 `bindEntityProperty()` 方法
6. 移除 `setEntityAccessor()` 方法
7. 修改 `get()` 方法，移除 Entity 绑定逻辑
8. 修改 `has()` 方法，移除 Entity 绑定检查
9. 修改 `clear()` 方法，移除 Entity 绑定清理

**保留的功能**:
- 基本数据存储（`data` Map）
- 监听器（`listeners` Map）
- 缓存（`cache` Map）
- 基本方法：`set()`, `get()`, `has()`, `delete()`, `clear()`, `watch()`
- 缓存管理：`clearCache()`, `getCacheVersion()`

### 阶段 4: 处理依赖和编译（0.5 天）

#### 任务清单
- [ ] 检查并修复导入路径
- [ ] 运行 TypeScript 编译
- [ ] 修复编译错误
- [ ] 验证类型定义生成
- [ ] 检查导出是否正确

### 阶段 5: 文档和示例（0.5 天）

#### 任务清单
- [ ] 编写 README.md
  - 安装说明
  - 快速开始
  - API 文档
  - 使用示例
- [ ] 创建使用示例（examples/）
- [ ] 编写迁移指南

### 阶段 6: 测试和验证（0.5 天）

#### 任务清单
- [ ] 创建基础测试用例
- [ ] 验证核心功能
- [ ] 验证类型定义
- [ ] 检查导出完整性

### 阶段 7: 发布和集成准备（0.5 天）

#### 任务清单
- [ ] 发布到 npm
- [ ] 验证安装
- [ ] 准备 ECS 扩展库拆分（下一步）

## 详细任务分解

### 任务 1: Blackboard.ts 拆分（阶段 3，关键任务）

**优先级**: 高  
**预计时间**: 2 小时

**拆分步骤**:

1. **分析当前代码**
   - 识别 Entity 绑定相关代码
   - 确定需要移除的部分
   - 确定需要保留的部分

2. **创建新的 Blackboard.ts**
   ```typescript
   // 移除的导入
   // import { ComponentType, EntityId, IComponent } from '../../ecs';
   
   // 移除的属性
   // private entityBindings: Map<...>
   // private entityAccessor?: (...)
   
   // 移除的方法
   // bindEntity(), bindEntityProperty(), setEntityAccessor()
   
   // 修改的方法
   // get() - 移除 Entity 绑定逻辑
   // has() - 移除 Entity 绑定检查
   // clear() - 移除 Entity 绑定清理
   ```

3. **验证功能**
   - 确保基本功能正常
   - 确保无编译错误
   - 确保类型定义正确

### 任务 2: 代码迁移（阶段 3）

**优先级**: 高  
**预计时间**: 4 小时

**迁移顺序**:
1. types.ts, NodeStatus.ts（无依赖）
2. Blackboard.ts（移除 Entity 绑定）
3. Node.ts（依赖 Blackboard）
4. BehaviorTree.ts（依赖 Node, Blackboard）
5. BehaviorTreeExecutor.ts（依赖 BehaviorTree）
6. nodes/ 目录（依赖 core）
7. utils/ 目录（依赖 core 和 nodes）
8. 主入口文件

**注意事项**:
- 保持文件结构一致
- 更新相对路径导入
- 确保类型导出正确

### 任务 3: 编译验证（阶段 4）

**优先级**: 高  
**预计时间**: 1 小时

**验证项**:
- [ ] TypeScript 编译成功
- [ ] 生成所有 .d.ts 文件
- [ ] 生成所有 .js 文件
- [ ] 导出结构正确

### 任务 4: 文档编写（阶段 5）

**优先级**: 中  
**预计时间**: 2 小时

**文档内容**:
- API 参考
- 使用示例
- 迁移指南
- 最佳实践

## Blackboard.ts 拆分详细设计

### 当前代码结构

```typescript
export class Blackboard {
    // 基本数据存储
    private data: Map<string, any> = new Map();
    private listeners: Map<string, Set<BlackboardListener>> = new Map();
    private cache: Map<string, any> = new Map();
    private cacheVersion: number = 0;
    
    // Entity 绑定（需要移除）
    private entityBindings: Map<string, {
        entityId: EntityId;
        componentType: ComponentType<IComponent>;
        propertyKey: string;
    }> = new Map();
    private entityAccessor?: (entityId: EntityId, componentType: ComponentType<IComponent>, propertyKey: string) => any;
    
    // 基本方法（保留）
    set<T>(key: string, value: T): void
    get<T>(key: string, defaultValue?: T): T  // 需要修改，移除 Entity 绑定逻辑
    has(key: string): boolean  // 需要修改，移除 Entity 绑定检查
    delete(key: string): boolean
    clear(): void  // 需要修改，移除 Entity 绑定清理
    watch(key: string, listener: BlackboardListener): () => void
    clearCache(): void
    getCacheVersion(): number
    
    // Entity 绑定方法（移除）
    bindEntity<T extends IComponent>(...): void
    bindEntityProperty<T extends IComponent>(...): void
    setEntityAccessor(...): void
}
```

### 拆分后的核心库 Blackboard

```typescript
// @bl-framework/behaviortree
export class Blackboard {
    // 基本数据存储
    private data: Map<string, any> = new Map();
    private listeners: Map<string, Set<BlackboardListener>> = new Map();
    private cache: Map<string, any> = new Map();
    private cacheVersion: number = 0;
    
    // 基本方法
    set<T>(key: string, value: T): void {
        const oldValue = this.data.get(key);
        this.data.set(key, value);
        this.cache.set(key, value);
        this.cacheVersion++;
        
        // 触发监听器
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(listener => listener(value, oldValue));
        }
    }
    
    get<T>(key: string, defaultValue?: T): T {
        // 检查缓存
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        // 从数据存储获取
        const value = this.data.get(key);
        if (value !== undefined) {
            this.cache.set(key, value);
            return value;
        }
        
        return defaultValue as T;
    }
    
    has(key: string): boolean {
        return this.data.has(key);
    }
    
    delete(key: string): boolean {
        const result = this.data.delete(key);
        this.cache.delete(key);
        this.cacheVersion++;
        return result;
    }
    
    clear(): void {
        this.data.clear();
        this.cache.clear();
        this.listeners.clear();
        this.cacheVersion++;
    }
    
    watch(key: string, listener: BlackboardListener): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(listener);
        
        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }
    
    clearCache(): void {
        this.cache.clear();
        this.cacheVersion++;
    }
    
    getCacheVersion(): number {
        return this.cacheVersion;
    }
}
```

### ECS 扩展库的 BlackboardEntityBinding（下一步实现）

```typescript
// @bl-framework/behaviortree-ecs
import { Blackboard } from '@bl-framework/behaviortree';
import { ComponentType, EntityId, IComponent } from '@bl-framework/ecs';

export class BlackboardEntityBinding {
    private blackboard: Blackboard;
    private entityBindings: Map<string, {
        entityId: EntityId;
        componentType: ComponentType<IComponent>;
        propertyKey: string;
    }> = new Map();
    private entityAccessor?: (entityId: EntityId, componentType: ComponentType<IComponent>, propertyKey: string) => any;
    
    constructor(blackboard: Blackboard) {
        this.blackboard = blackboard;
    }
    
    // Entity 绑定方法
    bindEntity<T extends IComponent>(...): void
    bindEntityProperty<T extends IComponent>(...): void
    setEntityAccessor(...): void
    
    // 扩展 get() 方法，支持 Entity 绑定
    get<T>(key: string, defaultValue?: T): T {
        // 先检查 Entity 绑定
        if (this.entityBindings.has(key) && this.entityAccessor) {
            const binding = this.entityBindings.get(key)!;
            const value = this.entityAccessor(
                binding.entityId,
                binding.componentType,
                binding.propertyKey
            );
            if (value !== undefined) {
                return value;
            }
        }
        
        // 回退到基本 Blackboard
        return this.blackboard.get(key, defaultValue);
    }
}
```

## 风险评估

### 技术风险

1. **Blackboard.ts 拆分复杂性**
   - 风险: Entity 绑定功能与基本功能耦合较深
   - 缓解: 仔细分析代码，确保功能分离清晰

2. **类型兼容性**
   - 风险: 移除 Entity 绑定后，类型定义可能不兼容
   - 缓解: 保持类型定义一致，使用类型导出

3. **向后兼容性**
   - 风险: 移除功能可能影响现有代码
   - 缓解: 在 ECS 扩展库中提供完整功能

### 时间风险

- **预计时间**: 2-3 天
- **缓冲时间**: 0.5 天
- **总时间**: 2.5-3.5 天

## 成功标准

### 功能标准
- ✅ 所有核心功能正常工作
- ✅ Blackboard 基本功能正常（无 Entity 绑定）
- ✅ TypeScript 编译成功
- ✅ 类型定义完整
- ✅ 无编译错误和警告

### 集成标准
- ✅ npm 包可以正常安装
- ✅ 可以独立使用（不依赖 ECS）
- ✅ 类型定义完整

### 文档标准
- ✅ README 完整
- ✅ API 文档完整
- ✅ 使用示例完整
- ✅ 迁移指南完整

## 下一步行动

### 立即开始
1. ⏳ 详细分析 Blackboard.ts 的 Entity 绑定功能（阶段 1）
2. ⏳ 创建包结构（阶段 2）
3. ⏳ 开始代码迁移（阶段 3）

### 后续计划
1. 完成核心库拆分后，开始 ECS 扩展库拆分
2. 集成两个库到 bl-framework
3. 清理旧代码

## 参考

- Core 库拆分经验
- ECS 库拆分经验
- Core 库目录结构
- ECS 库目录结构
- Core 库 package.json 配置
- ECS 库 package.json 配置

---

*计划时间: 2025-11-17*  
*下一步: 开始阶段 1 - 详细分析 Blackboard.ts*


# ECS 框架 - 移除 autoRegister 功能

## 📋 移除说明

根据用户要求，已移除 `autoRegister` 功能。现在系统需要手动注册，这样更加直观和可控。

## ✅ 移除内容

### 1. 装饰器配置简化

**之前**:
```typescript
export interface SystemDecoratorConfig {
    name?: string;
    priority?: number;
    autoRegister?: boolean;  // 已移除
}
```

**现在**:
```typescript
export interface SystemDecoratorConfig {
    name?: string;
    priority?: number;
}
```

### 2. 移除相关函数

**已移除的函数**:
- `getAutoRegisterSystems()`
- `clearAutoRegisterSystems()`

### 3. World 配置简化

**之前**:
```typescript
export interface WorldConfig {
    initialEntityPoolSize?: number;
    componentPoolSize?: number;
    debug?: boolean;
    autoRegisterSystems?: boolean;  // 已移除
}
```

**现在**:
```typescript
export interface WorldConfig {
    initialEntityPoolSize?: number;
    componentPoolSize?: number;
    debug?: boolean;
}
```

### 4. World 构造函数简化

**之前**:
```typescript
constructor(config: WorldConfig = {}) {
    this.config = {
        initialEntityPoolSize: 1000,
        componentPoolSize: 100,
        debug: false,
        autoRegisterSystems: true,  // 已移除
        ...config,
    };

    // 自动注册逻辑
    if (this.config.autoRegisterSystems) {
        this.registerAutoSystems();
    }
}
```

**现在**:
```typescript
constructor(config: WorldConfig = {}) {
    this.config = {
        initialEntityPoolSize: 1000,
        componentPoolSize: 100,
        debug: false,
        ...config,
    };
}
```

## 🎯 使用方式变化

### 之前（自动注册）

```typescript
// 定义系统
@system({ autoRegister: true, priority: 0 })
class MovementSystem extends System { }

@system({ autoRegister: true, priority: 100 })
class RenderSystem extends System { }

// 创建 World，系统自动注册
const world = new World();
// 系统已自动注册！
```

### 现在（手动注册）

```typescript
// 定义系统
@system({ priority: 0 })
class MovementSystem extends System { }

@system({ priority: 100 })
class RenderSystem extends System { }

// 创建 World 并手动注册系统
const world = new World();
world.registerSystem(MovementSystem);
world.registerSystem(RenderSystem);
```

## 📊 对比分析

### 优势

| 方面 | 自动注册 | 手动注册 |
|------|---------|---------|
| **代码清晰度** | ❌ 隐式注册 | ✅ 显式注册 |
| **控制性** | ❌ 难以控制顺序 | ✅ 完全控制 |
| **调试** | ❌ 难以追踪 | ✅ 容易调试 |
| **灵活性** | ❌ 固定模式 | ✅ 动态注册 |
| **学习成本** | ❌ 需要理解机制 | ✅ 直观易懂 |

### 使用场景

#### 手动注册更适合

- ✅ **学习阶段**: 新手更容易理解
- ✅ **小项目**: 系统数量少，手动注册简单
- ✅ **复杂逻辑**: 需要条件注册系统
- ✅ **调试需求**: 需要精确控制系统注册
- ✅ **动态系统**: 运行时添加/移除系统

#### 自动注册的问题

- ❌ **隐式行为**: 系统注册不够明显
- ❌ **难以调试**: 不知道哪些系统被注册了
- ❌ **缺乏控制**: 无法控制注册顺序
- ❌ **复杂性**: 增加了框架的复杂度

## 🔧 迁移指南

### 现有代码迁移

如果你之前使用了 `autoRegister`，需要这样修改：

#### 步骤 1: 移除 autoRegister 配置

```typescript
// 之前
@system({ autoRegister: true, priority: 0 })
class MovementSystem extends System { }

// 现在
@system({ priority: 0 })
class MovementSystem extends System { }
```

#### 步骤 2: 添加手动注册

```typescript
// 之前
const world = new World();
// 系统自动注册

// 现在
const world = new World();
world.registerSystem(MovementSystem);
world.registerSystem(RenderSystem);
```

#### 步骤 3: 移除相关配置

```typescript
// 之前
const world = new World({
    autoRegisterSystems: true
});

// 现在
const world = new World();
```

## 📝 最佳实践

### 推荐的系统注册模式

```typescript
class GameManager extends Component {
    private world!: World;

    onLoad() {
        this.initWorld();
        this.registerSystems();
        this.createEntities();
    }

    private initWorld() {
        this.world = new World({
            debug: true,
            initialEntityPoolSize: 1000,
            componentPoolSize: 100
        });
    }

    private registerSystems() {
        // 按优先级顺序注册
        this.world.registerSystem(InputSystem);      // priority: 0
        this.world.registerSystem(PhysicsSystem);    // priority: 10
        this.world.registerSystem(AISystem);         // priority: 20
        this.world.registerSystem(RenderSystem);     // priority: 100
    }

    private createEntities() {
        // 创建游戏实体
    }
}
```

### 系统注册顺序建议

```typescript
// 1. 输入系统（最先）
world.registerSystem(InputSystem);

// 2. 游戏逻辑系统
world.registerSystem(PhysicsSystem);
world.registerSystem(AISystem);
world.registerSystem(CombatSystem);

// 3. 渲染系统（最后）
world.registerSystem(RenderSystem);
```

## 📚 文档更新

### 已更新的文档

1. ✅ `decorators/system.ts` - 移除 autoRegister 配置
2. ✅ `decorators/index.ts` - 移除相关函数导出
3. ✅ `types/index.ts` - 移除 WorldConfig.autoRegisterSystems
4. ✅ `core/World.ts` - 移除自动注册逻辑
5. ✅ `DECORATOR_USAGE.md` - 更新使用说明
6. ✅ `QUICK_START.md` - 更新快速入门
7. ✅ `assets/test/ecs/README.md` - 移除相关示例

### 新增的文档

8. ✅ `ECS_REMOVE_AUTOREGISTER.md` - 本移除说明

## ✅ 验证清单

- [x] 移除 autoRegister 配置项
- [x] 移除相关函数
- [x] 简化 World 配置
- [x] 更新所有文档
- [x] 保持向后兼容（除了 autoRegister）
- [x] 零 Lint 错误
- [x] 示例代码更新

## 🎯 总结

### 移除原因

1. **简化框架**: 减少不必要的复杂性
2. **提高可控性**: 手动注册更直观
3. **便于调试**: 明确知道哪些系统被注册
4. **降低学习成本**: 新手更容易理解

### 影响

- ✅ **API 更简洁**: 减少了配置选项
- ✅ **代码更清晰**: 系统注册一目了然
- ✅ **调试更容易**: 可以精确控制系统
- ✅ **学习成本更低**: 概念更简单

### 建议

对于大多数项目，手动注册系统是更好的选择：
- 代码更清晰
- 控制更精确
- 调试更容易
- 学习成本更低

---

**移除时间**: 2025-10-22  
**移除类型**: 功能简化  
**影响范围**: 系统注册机制  
**向后兼容**: ⚠️ 需要少量代码修改  
**状态**: ✅ 完成

**🎯 ECS 框架现在更加简洁和易用！**

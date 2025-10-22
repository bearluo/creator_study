# ECS 框架 - autoRegister 功能实现

## 📋 问题描述

用户发现 `SystemDecoratorConfig` 中的 `autoRegister` 配置没有被实现，这是继 `ComponentDecoratorConfig` 的 `pooled` 和 `poolSize` 问题之后发现的第二个配置遗漏。

## ✅ 实现内容

### 1. 装饰器层面 (`decorators/system.ts`)

#### 新增功能
- ✅ 添加全局自动注册系统列表 `autoRegisterSystems`
- ✅ 在装饰器中检测 `autoRegister: true` 并记录系统
- ✅ 导出 `getAutoRegisterSystems()` 获取所有自动注册系统
- ✅ 导出 `clearAutoRegisterSystems()` 清空列表（用于测试）

#### 代码实现

```typescript
/** 自动注册的系统列表 */
const autoRegisterSystems: Set<new () => any> = new Set();

export function system(config: SystemDecoratorConfig = {}) {
    return function <T extends { new (...args: any[]): {} }>(
        constructor: T
    ): T {
        // 存储元数据
        systemMetadataMap.set(constructor, config);

        // 如果设置了自动注册，添加到自动注册列表
        if (config.autoRegister) {
            autoRegisterSystems.add(constructor as any);
        }

        // ... 处理优先级等其他配置
    };
}

export function getAutoRegisterSystems(): Array<new () => any> {
    return Array.from(autoRegisterSystems);
}
```

### 2. 类型定义层面 (`types/index.ts`)

#### 新增配置
- ✅ 在 `WorldConfig` 中添加 `autoRegisterSystems?: boolean` 配置项
- ✅ 默认值为 `true`，表示默认启用自动注册

```typescript
export interface WorldConfig {
    initialEntityPoolSize?: number;
    componentPoolSize?: number;
    debug?: boolean;
    autoRegisterSystems?: boolean;  // 新增
}
```

### 3. World 层面 (`core/World.ts`)

#### 新增功能
- ✅ 在构造函数中读取 `autoRegisterSystems` 配置
- ✅ 调用 `registerAutoSystems()` 自动注册标记的系统
- ✅ 调试模式下输出自动注册的系统信息

#### 代码实现

```typescript
import { getAutoRegisterSystems } from '../decorators/system';

constructor(config: WorldConfig = {}) {
    this.config = {
        initialEntityPoolSize: 1000,
        componentPoolSize: 100,
        debug: false,
        autoRegisterSystems: true, // 默认启用
        ...config,
    };

    // ... 初始化管理器

    // 自动注册标记为 autoRegister 的系统
    if (this.config.autoRegisterSystems) {
        this.registerAutoSystems();
    }
}

private registerAutoSystems(): void {
    const autoSystems = getAutoRegisterSystems();
    for (const systemType of autoSystems) {
        this.registerSystem(systemType);

        if (this.debug) {
            console.log(`[ECS] Auto-registered system: ${systemType.name}`);
        }
    }
}
```

### 4. 文档更新

#### 更新的文档
- ✅ `DECORATOR_USAGE.md` - 添加完整的 autoRegister 使用说明
  - 使用场景
  - 代码对比
  - 控制方法
  - 混合使用
  - 调试技巧
  
- ✅ `QUICK_START.md` - 在快速入门中添加自动注册示例
  - 方式一：手动注册
  - 方式二：自动注册（推荐）

#### 新增的文档
- ✅ `assets/test/ecs/AutoRegisterExample.ts` - 完整的自动注册示例

## 🎯 使用方式

### 基础使用

```typescript
import { System, system } from 'db://bl-framework/ecs';

// 标记系统为自动注册
@system({ 
    autoRegister: true,
    priority: 0 
})
class MovementSystem extends System {
    // ...
}

@system({ 
    autoRegister: true,
    priority: 100 
})
class RenderSystem extends System {
    // ...
}

// 创建 World 时自动注册
const world = new World({
    autoRegisterSystems: true  // 默认为 true
});

// MovementSystem 和 RenderSystem 已自动注册！
```

### 禁用自动注册

```typescript
// 禁用全局自动注册
const world = new World({
    autoRegisterSystems: false
});

// 需要手动注册所有系统
world.registerSystem(MovementSystem);
world.registerSystem(RenderSystem);
```

### 混合使用

```typescript
// 核心系统自动注册
@system({ autoRegister: true })
class CoreSystem extends System { }

// 可选系统手动注册
class OptionalSystem extends System { }

const world = new World();
// CoreSystem 已自动注册

// 根据需要手动注册
if (needOptional) {
    world.registerSystem(OptionalSystem);
}
```

## 📊 功能对比

### 使用 autoRegister 前

```typescript
// 定义 10 个系统
class System1 extends System { }
class System2 extends System { }
// ... 8 more systems

// 创建 World
const world = new World();

// 手动注册每个系统（10 行代码）
world.registerSystem(System1);
world.registerSystem(System2);
// ... 8 more lines
```

### 使用 autoRegister 后

```typescript
// 定义系统时标记
@system({ autoRegister: true, priority: 0 })
class System1 extends System { }

@system({ autoRegister: true, priority: 10 })
class System2 extends System { }
// ... 8 more systems

// 创建 World（自动注册所有系统）
const world = new World();
// 完成！所有系统已注册
```

## 🎨 适用场景

### ✅ 适合使用 autoRegister

1. **核心系统**：输入、物理、渲染等
2. **全局系统**：在所有场景都需要的系统
3. **系统较多**：10+ 个系统时减少样板代码

### ❌ 不适合使用 autoRegister

1. **可选系统**：只在某些场景使用
2. **条件系统**：根据配置动态启用
3. **测试场景**：需要精确控制系统注册顺序

## 🔍 调试支持

```typescript
const world = new World({ 
    debug: true,
    autoRegisterSystems: true 
});

// 控制台输出：
// [ECS] Auto-registered system: MovementSystem
// [ECS] Auto-registered system: RenderSystem
// [ECS] World created with config: {...}
```

## 📝 实现细节

### 全局注册表
- 使用 `Set` 存储系统类型，避免重复
- 装饰器执行时（类定义时）即注册
- World 创建时统一注册所有系统

### 优先级处理
- 自动注册的系统仍遵循优先级排序
- `priority` 和 `autoRegister` 可以同时使用
- `SystemManager` 会按 `priority` 排序执行

### 性能影响
- 装饰器执行开销：O(1)，只在类定义时执行一次
- 注册开销：O(n)，n 为系统数量，只在 World 创建时执行
- 运行时无额外开销

## ✅ 验证清单

- [x] 装饰器正确记录 autoRegister 系统
- [x] World 构造函数正确读取配置
- [x] 自动注册的系统按优先级排序
- [x] 可以通过配置禁用自动注册
- [x] 混合使用手动和自动注册
- [x] 调试模式显示注册信息
- [x] 无 Lint 错误
- [x] 类型定义完整
- [x] 文档更新完整
- [x] 示例代码可用

## 📦 文件变更清单

### 修改的文件
1. `extensions/bl-framework/assets/ecs/decorators/system.ts`
   - 添加自动注册列表
   - 实现注册逻辑
   - 导出获取函数

2. `extensions/bl-framework/assets/ecs/decorators/index.ts`
   - 导出新增的函数

3. `extensions/bl-framework/assets/ecs/types/index.ts`
   - 添加 `autoRegisterSystems` 配置

4. `extensions/bl-framework/assets/ecs/core/World.ts`
   - 实现自动注册逻辑
   - 添加调试输出

5. `extensions/bl-framework/assets/ecs/DECORATOR_USAGE.md`
   - 添加完整的使用说明

6. `extensions/bl-framework/assets/ecs/QUICK_START.md`
   - 添加自动注册示例

### 新增的文件
7. `assets/test/ecs/AutoRegisterExample.ts`
   - 完整的使用示例

8. `ECS_AUTOREGISTER_UPDATE.md`
   - 本更新说明文档

## 🎉 总结

`autoRegister` 功能已完整实现，解决了系统注册的样板代码问题。配合之前修复的 `ComponentDecoratorConfig`，ECS 框架的装饰器功能现在已经完全可用。

### 关键优势
1. **减少样板代码**：无需手动注册每个系统
2. **配置集中**：系统配置和定义在一起
3. **灵活控制**：可以全局禁用或混合使用
4. **调试友好**：清晰的日志输出

### 使用建议
- **大型项目**：推荐使用 autoRegister 减少注册代码
- **小型项目**：手动注册更直观
- **混合使用**：核心系统自动，可选系统手动

---

**实现时间**: 2025-10-22  
**功能状态**: ✅ 完成并测试通过  
**代码质量**: ✅ 零 Lint 错误  
**文档状态**: ✅ 完整更新


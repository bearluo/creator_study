# PLAN 检查点报告 - MVVM 调试工具链

## 任务信息

- **任务ID**: MVVM-DEBUG-001
- **任务名称**: 设计 MVVM 调试工具链
- **复杂度**: Level 3 - Intermediate Feature
- **创建时间**: 2025-01-XX
- **规划时间**: 2025-01-XX

---

## 📋 核心需求

### 功能需求

1. **调试 API**
   - 查询 Reactive 状态（当前值、Watcher 列表、依赖关系）
   - 查询 ViewModel 状态（绑定列表、数据快照、活跃绑定）
   - 查询 DataBinding 状态（绑定路径、模式、状态、错误信息）

2. **日志系统**
   - 可配置的日志级别（DEBUG, INFO, WARN, ERROR）
   - 分类日志（Reactive, Binding, ViewModel, Performance）
   - 日志过滤和搜索功能
   - 日志格式化（时间戳、分类、上下文）

3. **性能监控**
   - 响应式更新耗时统计
   - 绑定执行耗时统计
   - 批量更新性能分析
   - 内存使用监控（可选）

4. **依赖追踪可视化**
   - 显示数据路径的依赖关系图
   - 显示 Watcher 的依赖路径
   - 显示绑定关系图
   - 依赖变更历史（可选）

5. **错误增强**
   - 详细的错误堆栈
   - 上下文信息（当前数据、绑定状态、Watcher 状态）
   - 错误恢复建议
   - 错误分类和统计

### 非功能需求

1. **性能**：调试工具不应影响生产环境性能（通过环境变量控制）
2. **可选性**：调试功能应该是可选的，可以按需启用
3. **类型安全**：保持 TypeScript 类型安全
4. **模块化**：调试工具应该是独立的模块，可以按需引入
5. **向后兼容**：不能破坏现有 API

---

## 🏗️ 架构设计

### 整体架构

```
@bl-framework/mvvm
├── src/
│   ├── debug/                    # 新增：调试工具模块
│   │   ├── Debugger.ts          # 调试器主类
│   │   ├── Logger.ts            # 日志系统
│   │   ├── PerformanceMonitor.ts # 性能监控
│   │   ├── DependencyTracker.ts # 依赖追踪（调试增强版）
│   │   ├── ErrorEnhancer.ts     # 错误增强
│   │   └── types.ts             # 调试相关类型
│   ├── reactive/
│   │   └── Reactive.ts          # 修改：添加调试钩子
│   ├── core/
│   │   └── ViewModel.ts         # 修改：添加调试钩子
│   └── binding/
│       └── DataBinding.ts       # 修改：添加调试钩子
```

### 核心组件

#### 1. Debugger（调试器主类）

**职责**：
- 统一管理所有调试功能
- 提供全局调试 API
- 控制调试功能的启用/禁用

**API 设计**：
```typescript
class Debugger {
    // 启用/禁用调试
    static enable(): void;
    static disable(): void;
    static isEnabled(): boolean;
    
    // 查询状态
    static getReactiveState(reactive: Reactive<any>): ReactiveState;
    static getViewModelState(viewModel: ViewModel<any>): ViewModelState;
    static getBindingState(binding: DataBinding<any, any, any>): BindingState;
    
    // 依赖追踪
    static getDependencyGraph(reactive: Reactive<any>): DependencyGraph;
    static getWatcherDependencies(watcher: Watcher): string[];
    
    // 性能监控
    static getPerformanceStats(): PerformanceStats;
    static clearPerformanceStats(): void;
}
```

#### 2. Logger（日志系统）

**职责**：
- 提供分类日志功能
- 日志级别控制
- 日志过滤和格式化

**API 设计**：
```typescript
enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

enum LogCategory {
    REACTIVE = 'reactive',
    BINDING = 'binding',
    VIEWMODEL = 'viewmodel',
    PERFORMANCE = 'performance'
}

class Logger {
    static setLevel(level: LogLevel): void;
    static setCategoryEnabled(category: LogCategory, enabled: boolean): void;
    
    static debug(category: LogCategory, message: string, ...args: any[]): void;
    static info(category: LogCategory, message: string, ...args: any[]): void;
    static warn(category: LogCategory, message: string, ...args: any[]): void;
    static error(category: LogCategory, message: string, ...args: any[]): void;
}
```

#### 3. PerformanceMonitor（性能监控）

**职责**：
- 监控响应式更新性能
- 监控绑定执行性能
- 提供性能统计和报告

**API 设计**：
```typescript
interface PerformanceStats {
    reactiveUpdates: {
        count: number;
        totalTime: number;
        averageTime: number;
        maxTime: number;
        minTime: number;
    };
    bindingExecutions: {
        count: number;
        totalTime: number;
        averageTime: number;
        maxTime: number;
        minTime: number;
    };
}

class PerformanceMonitor {
    static startTracking(): void;
    static stopTracking(): void;
    static getStats(): PerformanceStats;
    static clearStats(): void;
    static generateReport(): string;
}
```

#### 4. DependencyTracker（依赖追踪 - 调试增强版）

**职责**：
- 追踪数据路径的依赖关系
- 构建依赖关系图
- 提供依赖查询 API

**API 设计**：
```typescript
interface DependencyGraph {
    paths: Map<string, {
        watchers: Watcher[];
        dependencies: string[];
        dependents: string[];
    }>;
    watchers: Map<Watcher, {
        dependencies: string[];
        runCount: number;
        lastRunTime: number;
    }>;
}

class DependencyTracker {
    static getGraph(reactive: Reactive<any>): DependencyGraph;
    static getPathDependencies(path: string): string[];
    static getPathDependents(path: string): string[];
    static getWatcherDependencies(watcher: Watcher): string[];
}
```

#### 5. ErrorEnhancer（错误增强）

**职责**：
- 增强错误信息
- 提供上下文信息
- 生成错误报告

**API 设计**：
```typescript
interface EnhancedError {
    originalError: Error;
    context: {
        reactive?: ReactiveState;
        viewModel?: ViewModelState;
        binding?: BindingState;
        stack: string[];
    };
    suggestions: string[];
}

class ErrorEnhancer {
    static enhance(error: Error, context?: any): EnhancedError;
    static format(error: EnhancedError): string;
}
```

---

## 🔧 技术方案

### 1. 调试钩子机制

**方案**：在核心类中添加可选的调试钩子，通过环境变量或配置控制。

**实现方式**：
- 在 `Reactive`、`ViewModel`、`DataBinding` 中添加调试钩子
- 使用条件编译或运行时检查控制调试代码
- 通过 `DEBUG` 环境变量或配置启用

**示例**：
```typescript
// Reactive.ts
class Reactive<T> {
    private debugHook?: DebugHook;
    
    constructor(value: T, debugHook?: DebugHook) {
        // ...
        if (Debugger.isEnabled()) {
            this.debugHook = debugHook || Debugger.getDefaultHook();
        }
    }
    
    private _notifyWatchers(path: string, newValue: any, oldValue: any): void {
        if (this.debugHook) {
            this.debugHook.onReactiveUpdate(path, newValue, oldValue);
        }
        // ... 原有逻辑
    }
}
```

### 2. 日志系统

**方案**：使用分类日志系统，支持级别控制和过滤。

**实现方式**：
- 创建 `Logger` 类管理日志
- 支持日志级别（DEBUG, INFO, WARN, ERROR）
- 支持分类过滤（Reactive, Binding, ViewModel, Performance）
- 日志格式化（时间戳、分类、上下文）

### 3. 性能监控

**方案**：使用高精度时间戳记录性能数据。

**实现方式**：
- 使用 `performance.now()` 记录时间
- 在关键路径添加性能监控点
- 统计平均、最大、最小耗时
- 提供性能报告生成

### 4. 依赖追踪

**方案**：扩展现有的 `DependencyTracker`，添加调试功能。

**实现方式**：
- 在 `DependencyTracker` 中记录依赖关系
- 构建依赖关系图
- 提供查询 API
- 支持依赖关系可视化（数据结构）

### 5. 错误增强

**方案**：在错误发生时捕获上下文信息。

**实现方式**：
- 使用 try-catch 包装关键操作
- 捕获错误时记录上下文
- 生成增强的错误对象
- 提供错误格式化功能

---

## 📝 分阶段实施计划

### 阶段 1: 基础调试 API（2-3 小时）

**目标**：实现核心调试 API，提供状态查询功能。

**任务**：
1. 创建 `packages/mvvm/src/debug/` 目录
2. 实现 `Debugger` 主类（启用/禁用、状态查询）
3. 在 `Reactive` 中添加调试钩子
4. 在 `ViewModel` 中添加调试钩子
5. 在 `DataBinding` 中添加调试钩子
6. 实现状态查询 API（`getReactiveState`, `getViewModelState`, `getBindingState`）

**输出**：
- `packages/mvvm/src/debug/Debugger.ts`
- `packages/mvvm/src/debug/types.ts`
- 修改 `Reactive.ts`、`ViewModel.ts`、`DataBinding.ts`

### 阶段 2: 日志系统（2-3 小时）

**目标**：实现分类日志系统。

**任务**：
1. 实现 `Logger` 类
2. 实现日志级别控制
3. 实现分类过滤
4. 实现日志格式化
5. 在核心类中集成日志
6. 创建日志使用示例

**输出**：
- `packages/mvvm/src/debug/Logger.ts`
- 更新 `Debugger.ts` 集成日志

### 阶段 3: 性能监控（2-3 小时）

**目标**：实现性能监控功能。

**任务**：
1. 实现 `PerformanceMonitor` 类
2. 在 `Reactive` 中添加性能监控点
3. 在 `DataBinding` 中添加性能监控点
4. 实现性能统计功能
5. 实现性能报告生成
6. 创建性能监控示例

**输出**：
- `packages/mvvm/src/debug/PerformanceMonitor.ts`
- 更新 `Debugger.ts` 集成性能监控

### 阶段 4: 依赖追踪增强（2-3 小时）

**目标**：实现依赖追踪可视化功能。

**任务**：
1. 扩展 `DependencyTracker` 添加调试功能
2. 实现依赖关系图构建
3. 实现依赖查询 API
4. 实现 Watcher 依赖追踪
5. 创建依赖追踪示例

**输出**：
- `packages/mvvm/src/debug/DependencyTracker.ts`（调试增强版）
- 更新 `Debugger.ts` 集成依赖追踪

### 阶段 5: 错误增强（1-2 小时）

**目标**：实现错误增强功能。

**任务**：
1. 实现 `ErrorEnhancer` 类
2. 在关键位置添加错误捕获
3. 实现上下文信息收集
4. 实现错误格式化
5. 创建错误增强示例

**输出**：
- `packages/mvvm/src/debug/ErrorEnhancer.ts`
- 更新 `Debugger.ts` 集成错误增强

### 阶段 6: 文档和示例（1-2 小时）

**目标**：创建文档和使用示例。

**任务**：
1. 更新 README.md（添加调试工具章节）
2. 创建调试工具使用示例
3. 创建调试工具 API 文档
4. 创建最佳实践文档

**输出**：
- `packages/mvvm/README.md` 更新
- `packages/mvvm/examples/debug-usage.ts`
- `packages/mvvm/docs/debug-tools.md`

---

## 🎨 CREATIVE 模式需求识别

### 需要 CREATIVE 模式的组件

1. **调试 API 设计**（推荐）
   - 需要设计统一的调试 API 接口
   - 需要设计状态查询的数据结构
   - 需要设计依赖关系图的数据结构

2. **日志系统设计**（可选）
   - 需要设计日志格式
   - 需要设计日志过滤机制
   - 需要设计日志存储方案（如果支持持久化）

3. **性能监控设计**（可选）
   - 需要设计性能指标
   - 需要设计性能报告格式
   - 需要设计性能分析算法

4. **依赖追踪可视化设计**（可选）
   - 需要设计依赖关系图的数据结构
   - 需要设计依赖查询 API
   - 需要设计依赖变更追踪机制

---

## ⚠️ 风险和挑战

### 技术风险

1. **性能影响**
   - **风险**：调试代码可能影响生产环境性能
   - **缓解**：使用环境变量控制，生产环境默认禁用
   - **验证**：性能测试，确保禁用时无性能影响

2. **API 兼容性**
   - **风险**：添加调试钩子可能影响现有 API
   - **缓解**：使用可选参数，保持向后兼容
   - **验证**：运行现有测试用例

3. **类型安全**
   - **风险**：调试 API 可能破坏类型安全
   - **缓解**：使用泛型和类型守卫
   - **验证**：TypeScript 编译检查

### 实现挑战

1. **依赖追踪复杂度**
   - **挑战**：构建依赖关系图需要处理复杂的数据结构
   - **缓解**：使用 Map 和 Set 优化性能
   - **验证**：性能测试和内存测试

2. **错误上下文收集**
   - **挑战**：在错误发生时收集完整的上下文信息
   - **缓解**：使用 try-catch 包装关键操作
   - **验证**：错误场景测试

3. **日志性能**
   - **挑战**：日志系统不应影响性能
   - **缓解**：使用条件检查，禁用时跳过日志
   - **验证**：性能测试

---

## ✅ 验收标准

### 功能验收

1. **调试 API**
   - ✅ 可以查询 Reactive 状态
   - ✅ 可以查询 ViewModel 状态
   - ✅ 可以查询 DataBinding 状态
   - ✅ 可以启用/禁用调试功能

2. **日志系统**
   - ✅ 支持日志级别控制
   - ✅ 支持分类过滤
   - ✅ 日志格式化正确
   - ✅ 日志不影响性能（禁用时）

3. **性能监控**
   - ✅ 可以监控响应式更新性能
   - ✅ 可以监控绑定执行性能
   - ✅ 可以生成性能报告
   - ✅ 性能监控不影响性能（禁用时）

4. **依赖追踪**
   - ✅ 可以查询依赖关系图
   - ✅ 可以查询路径依赖
   - ✅ 可以查询 Watcher 依赖

5. **错误增强**
   - ✅ 错误信息包含上下文
   - ✅ 错误格式化正确
   - ✅ 错误不影响性能（禁用时）

### 非功能验收

1. **性能**
   - ✅ 调试功能禁用时，性能影响 < 1%
   - ✅ 调试功能启用时，性能影响 < 5%

2. **兼容性**
   - ✅ 不破坏现有 API
   - ✅ 现有测试用例全部通过

3. **类型安全**
   - ✅ TypeScript 编译无错误
   - ✅ 类型定义完整

4. **文档**
   - ✅ README 更新
   - ✅ API 文档完整
   - ✅ 使用示例完整

---

## 📊 时间估算

### 总时间：8-12 小时

- **阶段 1**: 2-3 小时（基础调试 API）
- **阶段 2**: 2-3 小时（日志系统）
- **阶段 3**: 2-3 小时（性能监控）
- **阶段 4**: 2-3 小时（依赖追踪增强）
- **阶段 5**: 1-2 小时（错误增强）
- **阶段 6**: 1-2 小时（文档和示例）

### 缓冲时间

- **CREATIVE 模式**：+2-4 小时（如果需要设计调试 API）
- **测试和修复**：+2-3 小时
- **总计**：12-19 小时

---

## 🎯 下一步行动

1. **进入 CREATIVE 模式**（推荐）
   - 设计调试 API 接口
   - 设计状态查询数据结构
   - 设计依赖关系图数据结构

2. **或直接进入 BUILD 模式**（如果设计需求明确）
   - 开始阶段 1：基础调试 API
   - 按照计划逐步实施

---

**PLAN 模式状态**: ✅ **COMPLETE**

**建议下一步**: 进入 **CREATIVE 模式** 设计调试 API（推荐）


# 🎨 CREATIVE: MVVM 调试日志系统设计

## 任务信息

- **任务ID**: MVVM-DEBUG-001-CREATIVE-2
- **CREATIVE 类型**: API Design / Logging System Design
- **创建日期**: 2025-01-XX
- **设计者**: AI Assistant

---

## 🎯 问题陈述

### 当前问题

MVVM 框架缺乏统一的日志系统，开发者无法方便地追踪和调试框架内部行为：

1. **日志分散**：不同组件使用 `console.log/warn/error`，格式不统一
2. **无法过滤**：无法按类别或级别过滤日志
3. **缺乏上下文**：日志信息缺乏上下文（时间戳、分类、路径等）
4. **性能影响**：日志输出可能影响性能

### 需求

1. **分类日志**：支持按类别（Reactive, Binding, ViewModel, Performance）过滤
2. **级别控制**：支持日志级别（DEBUG, INFO, WARN, ERROR）
3. **格式化**：统一的日志格式（时间戳、分类、级别、消息）
4. **性能友好**：禁用时零性能影响
5. **可扩展**：支持自定义日志处理器

### 约束

1. **零运行时依赖**：不能引入新的运行时依赖
2. **可选性**：日志功能应该是可选的
3. **性能**：日志系统不应影响生产环境性能
4. **类型安全**：充分利用 TypeScript 类型系统

---

## 🔍 方案探索

### 方案 1: 简单日志类（推荐）

**核心思路**：创建简单的 Logger 类，提供分类和级别控制。

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
    private static level: LogLevel = LogLevel.WARN;
    private static categories: Set<LogCategory> = new Set(Object.values(LogCategory));
    private static enabled: boolean = false;
    
    static setLevel(level: LogLevel): void {
        this.level = level;
    }
    
    static setCategoryEnabled(category: LogCategory, enabled: boolean): void {
        if (enabled) {
            this.categories.add(category);
        } else {
            this.categories.delete(category);
        }
    }
    
    static debug(category: LogCategory, message: string, ...args: any[]): void {
        if (!this.enabled || this.level > LogLevel.DEBUG) return;
        if (!this.categories.has(category)) return;
        this._log('DEBUG', category, message, ...args);
    }
    
    static info(category: LogCategory, message: string, ...args: any[]): void {
        if (!this.enabled || this.level > LogLevel.INFO) return;
        if (!this.categories.has(category)) return;
        this._log('INFO', category, message, ...args);
    }
    
    static warn(category: LogCategory, message: string, ...args: any[]): void {
        if (!this.enabled || this.level > LogLevel.WARN) return;
        if (!this.categories.has(category)) return;
        this._log('WARN', category, message, ...args);
    }
    
    static error(category: LogCategory, message: string, ...args: any[]): void {
        if (!this.enabled || this.level > LogLevel.ERROR) return;
        if (!this.categories.has(category)) return;
        this._log('ERROR', category, message, ...args);
    }
    
    private static _log(level: string, category: LogCategory, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}] [${category.toUpperCase()}]`;
        console.log(prefix, message, ...args);
    }
    
    static enable(): void {
        this.enabled = true;
    }
    
    static disable(): void {
        this.enabled = false;
    }
}
```

**优点**：
- ✅ 简单易用
- ✅ 性能友好（禁用时零开销）
- ✅ 支持分类和级别过滤
- ✅ 零运行时依赖

**缺点**：
- ⚠️ 功能相对简单（但足够使用）

**适用场景**：推荐用于所有场景

---

### 方案 2: 可扩展日志系统

**核心思路**：支持自定义日志处理器，可以输出到文件、远程服务器等。

**API 设计**：
```typescript
interface LogHandler {
    handle(level: LogLevel, category: LogCategory, message: string, ...args: any[]): void;
}

class Logger {
    private static handlers: LogHandler[] = [new ConsoleLogHandler()];
    
    static addHandler(handler: LogHandler): void {
        this.handlers.push(handler);
    }
    
    static removeHandler(handler: LogHandler): void {
        const index = this.handlers.indexOf(handler);
        if (index !== -1) {
            this.handlers.splice(index, 1);
        }
    }
    
    // ... 其他方法类似方案 1
}
```

**优点**：
- ✅ 可扩展性强
- ✅ 支持多种输出方式

**缺点**：
- ❌ 实现复杂度较高
- ❌ 可能引入性能问题
- ❌ 对于基础调试需求可能过度设计

**适用场景**：如果需要高级日志功能（文件输出、远程日志等）

---

### 方案 3: 结构化日志

**核心思路**：使用结构化日志格式（JSON），便于后续分析。

**API 设计**：
```typescript
interface LogEntry {
    timestamp: number;
    level: LogLevel;
    category: LogCategory;
    message: string;
    data?: any;
    context?: Record<string, any>;
}

class Logger {
    private static _log(entry: LogEntry): void {
        const json = JSON.stringify(entry);
        console.log(json);
    }
}
```

**优点**：
- ✅ 结构化数据，便于分析
- ✅ 支持上下文信息

**缺点**：
- ❌ 可读性较差（JSON 格式）
- ❌ 实现复杂度较高

**适用场景**：如果需要日志分析工具

---

## 📊 方案对比

| 特性 | 方案 1: 简单日志类 | 方案 2: 可扩展系统 | 方案 3: 结构化日志 |
|------|------------------|------------------|------------------|
| **简单性** | ✅ 高 | ⚠️ 中 | ⚠️ 中 |
| **性能** | ✅ 高 | ⚠️ 中 | ⚠️ 中 |
| **可扩展性** | ⚠️ 低 | ✅ 高 | ⚠️ 中 |
| **可读性** | ✅ 高 | ✅ 高 | ❌ 低 |
| **实现复杂度** | ✅ 低 | ❌ 高 | ⚠️ 中 |

---

## ✅ 推荐方案

**推荐方案：方案 1 - 简单日志类**

**理由**：
1. **简单实用**：满足大部分调试需求
2. **性能友好**：禁用时零开销
3. **易于实现**：实现简单，维护成本低
4. **可读性好**：日志格式清晰易读
5. **可扩展**：未来如果需要，可以基于此方案扩展

**未来扩展**：
- 如果需要高级功能，可以在方案 1 基础上添加处理器机制（方案 2）
- 如果需要结构化日志，可以添加 JSON 格式化选项

---

## 🏗️ 实施方案

### Logger 类实现

**文件**: `packages/mvvm/src/debug/Logger.ts`

```typescript
/**
 * 日志级别
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

/**
 * 日志分类
 */
export enum LogCategory {
    REACTIVE = 'reactive',
    BINDING = 'binding',
    VIEWMODEL = 'viewmodel',
    PERFORMANCE = 'performance'
}

/**
 * MVVM 日志系统
 * 
 * 提供分类日志功能，支持级别控制和分类过滤
 * 
 * @example
 * ```typescript
 * // 启用日志
 * Logger.enable();
 * Logger.setLevel(LogLevel.DEBUG);
 * 
 * // 记录日志
 * Logger.debug(LogCategory.REACTIVE, 'Value updated', { path: 'name', value: 'John' });
 * Logger.warn(LogCategory.BINDING, 'Binding failed', { path: 'invalid.path' });
 * 
 * // 禁用特定分类
 * Logger.setCategoryEnabled(LogCategory.PERFORMANCE, false);
 * ```
 */
export class Logger {
    private static level: LogLevel = LogLevel.WARN;
    private static categories: Set<LogCategory> = new Set(Object.values(LogCategory));
    private static enabled: boolean = false;
    
    /**
     * 设置日志级别
     */
    static setLevel(level: LogLevel): void {
        this.level = level;
    }
    
    /**
     * 获取当前日志级别
     */
    static getLevel(): LogLevel {
        return this.level;
    }
    
    /**
     * 启用/禁用特定分类
     */
    static setCategoryEnabled(category: LogCategory, enabled: boolean): void {
        if (enabled) {
            this.categories.add(category);
        } else {
            this.categories.delete(category);
        }
    }
    
    /**
     * 检查分类是否启用
     */
    static isCategoryEnabled(category: LogCategory): boolean {
        return this.categories.has(category);
    }
    
    /**
     * 启用日志系统
     */
    static enable(): void {
        this.enabled = true;
    }
    
    /**
     * 禁用日志系统
     */
    static disable(): void {
        this.enabled = false;
    }
    
    /**
     * 检查日志系统是否启用
     */
    static isEnabled(): boolean {
        return this.enabled;
    }
    
    /**
     * 记录 DEBUG 级别日志
     */
    static debug(category: LogCategory, message: string, ...args: any[]): void {
        if (!this._shouldLog(LogLevel.DEBUG, category)) return;
        this._log('DEBUG', category, message, ...args);
    }
    
    /**
     * 记录 INFO 级别日志
     */
    static info(category: LogCategory, message: string, ...args: any[]): void {
        if (!this._shouldLog(LogLevel.INFO, category)) return;
        this._log('INFO', category, message, ...args);
    }
    
    /**
     * 记录 WARN 级别日志
     */
    static warn(category: LogCategory, message: string, ...args: any[]): void {
        if (!this._shouldLog(LogLevel.WARN, category)) return;
        this._log('WARN', category, message, ...args);
    }
    
    /**
     * 记录 ERROR 级别日志
     */
    static error(category: LogCategory, message: string, ...args: any[]): void {
        if (!this._shouldLog(LogLevel.ERROR, category)) return;
        this._log('ERROR', category, message, ...args);
    }
    
    /**
     * 检查是否应该记录日志
     */
    private static _shouldLog(level: LogLevel, category: LogCategory): boolean {
        if (!this.enabled) return false;
        if (level < this.level) return false;
        if (!this.categories.has(category)) return false;
        return true;
    }
    
    /**
     * 实际日志输出
     */
    private static _log(level: string, category: LogCategory, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}] [${category.toUpperCase()}]`;
        
        // 根据级别选择输出方法
        if (level === 'ERROR') {
            console.error(prefix, message, ...args);
        } else if (level === 'WARN') {
            console.warn(prefix, message, ...args);
        } else {
            console.log(prefix, message, ...args);
        }
    }
}
```

### 集成到核心类

**修改**: `packages/mvvm/src/reactive/Reactive.ts`

```typescript
import { Logger, LogCategory } from '../debug/Logger';

class Reactive<T> {
    private _notifyWatchers(path: string, newValue: any, oldValue: any): void {
        Logger.debug(LogCategory.REACTIVE, `Path "${path}" updated`, {
            oldValue,
            newValue
        });
        
        // ... 原有逻辑
    }
}
```

---

## ⚠️ 风险点

1. **性能影响**
   - **风险**：日志输出可能影响性能
   - **缓解**：使用 `_shouldLog()` 提前检查，禁用时零开销
   - **验证**：性能测试

2. **日志过多**
   - **风险**：DEBUG 级别可能产生大量日志
   - **缓解**：默认级别为 WARN，需要时手动启用 DEBUG
   - **验证**：日志量测试

---

## ✅ 验收标准

1. **功能完整性**
   - ✅ 支持所有日志级别
   - ✅ 支持所有日志分类
   - ✅ 支持级别和分类过滤

2. **性能**
   - ✅ 禁用时零性能影响
   - ✅ 启用时性能影响 < 1%

3. **易用性**
   - ✅ API 简单直观
   - ✅ 日志格式清晰易读

---

## 📝 实施任务清单

- [ ] 创建 `packages/mvvm/src/debug/Logger.ts` - 实现 Logger 类
- [ ] 在 `Reactive.ts` 中集成日志
- [ ] 在 `ViewModel.ts` 中集成日志
- [ ] 在 `DataBinding.ts` 中集成日志
- [ ] 创建日志使用示例

---

**CREATIVE 模式状态**: ✅ **COMPLETE**

**推荐方案**: 方案 1 - 简单日志类

**下一步**: 进入 BUILD 模式开始实现


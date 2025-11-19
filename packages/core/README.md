# @bl-framework/core

bl-framework 核心工具库和事件系统。

## 安装

```bash
npm install @bl-framework/core
```

## 功能

### 通用工具

#### FWPath - 路径工具

```typescript
import { FWPath } from '@bl-framework/core';

// 拼接路径
const path = FWPath.join('assets', 'images', 'logo.png');
// 结果: 'assets/images/logo.png'

// 获取文件扩展名
const ext = FWPath.getExtension('logo.png');
// 结果: '.png'
```

### 事件系统

#### FWEventDispatcher - 事件分发器

```typescript
import { FWEventDispatcher } from '@bl-framework/core';

// 定义事件类型
interface MyEvents {
    'user:login': [userId: string, timestamp: number];
    'user:logout': [];
}

// 创建事件分发器
const dispatcher = new FWEventDispatcher<MyEvents>();

// 监听事件
dispatcher.on('user:login', (userId, timestamp) => {
    console.log(`User ${userId} logged in at ${timestamp}`);
});

// 触发事件
dispatcher.emit('user:login', 'user123', Date.now());

// 移除监听
dispatcher.off('user:login', callback);

// 一次性监听
dispatcher.once('user:logout', () => {
    console.log('User logged out');
});
```

## API 文档

### FWPath

#### `join(...paths: string[]): string`
拼接多个路径片段为一个完整路径。

#### `getExtension(path: string): string`
获取文件扩展名（包含点号）。

### FWLog

日志工具类，提供不同级别的日志输出功能。

#### 配置日志

```typescript
import { setLogConfig, LogLevel } from '@bl-framework/core';

// 设置日志级别
setLogConfig({ level: LogLevel.DEBUG });

// 禁用时间戳
setLogConfig({ enableTimestamp: false });
```

#### 使用日志

```typescript
import { Log, log } from '@bl-framework/core';

// 使用类方法
Log.debug('Debug message');
Log.info('Info message');
Log.warn('Warning message');
Log.error('Error message');

// 使用默认导出
log.debug('Debug message');
log.info('Info message');
```

#### API

- `Log.debug(...args: any[]): void` - 调试级别日志
- `Log.info(...args: any[]): void` - 信息级别日志
- `Log.warn(...args: any[]): void` - 警告级别日志
- `Log.error(...args: any[]): void` - 错误级别日志
- `Log.errorWithStack(error: Error, message?: string): void` - 带堆栈的错误日志
- `setLogConfig(config: Partial<LogConfig>): void` - 设置日志配置
- `getCurrentLogLevel(): LogLevel` - 获取当前日志级别

### FWDecorator

装饰器工具，提供常用的方法装饰器。

#### TryCatch - 异常捕获装饰器

```typescript
import { TryCatch } from '@bl-framework/core';

class DataService {
    @TryCatch('default value')
    fetchData() {
        // 如果抛出异常，返回 'default value'
        throw new Error('Error');
    }
}
```

#### Delay - 延迟执行装饰器

```typescript
import { Delay } from '@bl-framework/core';

class MyClass {
    @Delay()
    updateUI() {
        // 在下一个事件循环中执行
        console.log('UI updated');
    }
}
```

#### Debounce - 防抖装饰器

```typescript
import { Debounce } from '@bl-framework/core';

class MyClass {
    @Debounce(300)
    handleInput(value: string) {
        // 输入停止 300ms 后才执行
        console.log('Input:', value);
    }
}
```

#### Throttle - 节流装饰器

```typescript
import { Throttle } from '@bl-framework/core';

class MyClass {
    @Throttle(1000)
    handleScroll() {
        // 每秒最多执行一次
        console.log('Scroll handled');
    }
}
```

### FWEventDispatcher

#### `on<T extends keyof TEventMap>(event: T, callback: (...args: TEventMap[T]) => void, target?: any): void`
监听事件。

#### `once<T extends keyof TEventMap>(event: T, callback: (...args: TEventMap[T]) => void, target?: any): void`
一次性监听事件。

#### `off<T extends keyof TEventMap>(event: T, callback?: (...args: TEventMap[T]) => void, target?: any): void`
移除事件监听。

#### `emit<T extends keyof TEventMap>(event: T, ...args: TEventMap[T]): void`
触发事件。

#### `removeAllListeners(event?: keyof TEventMap): void`
移除所有监听器。

## 类型定义

### EventMap

通用的事件映射类型，用于定义事件名称和参数类型：

```typescript
import { EventMap, FWEventDispatcher } from '@bl-framework/core';

interface MyEvents extends EventMap {
    'user:login': [userId: string, timestamp: number];
    'user:logout': [];
}

const dispatcher = new FWEventDispatcher<MyEvents>();
```

### EventName

从事件映射类型中提取事件名称类型：

```typescript
import { EventName, EventMap } from '@bl-framework/core';

interface MyEvents extends EventMap {
    'user:login': [userId: string];
}

type MyEventName = EventName<MyEvents>; // 'user:login'
```

## 版本

- **1.0.0** - 初始版本
  - ✅ FWPath 路径工具
  - ✅ FWEventDispatcher 事件分发器
  - ✅ EventMap 和 EventName 类型定义
  - ✅ FWLog 日志工具（已移除 Cocos Creator 依赖）
  - ✅ FWDecorator 装饰器工具（已移除 Cocos Creator 依赖）
  - 注意：框架特定的事件定义（如 IFWEvents）保留在扩展包中

## 示例

完整的使用示例请查看 `examples/` 目录。

### 快速开始

```typescript
import { 
    FWPath, 
    Log, 
    setLogConfig, 
    LogLevel,
    FWEventDispatcher,
    EventMap
} from '@bl-framework/core';

// 路径工具
const path = FWPath.join('assets', 'images', 'logo.png');

// 日志工具
setLogConfig({ level: LogLevel.DEBUG });
Log.info('Hello from @bl-framework/core');

// 事件系统
interface MyEvents extends EventMap {
    'user:login': [userId: string];
}

const dispatcher = new FWEventDispatcher<MyEvents>();
dispatcher.on('user:login', (userId) => {
    console.log('User logged in:', userId);
});
dispatcher.emit('user:login', 'user123');
```

## 许可证

MIT


# CREATIVE PHASE: FSM 模块 API 设计

📌 CREATIVE PHASE START: Finite State Machine Module API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**Description**: 设计独立的 `@bl-framework/fsm` 模块 API，提供有限状态机功能，解决状态管理混乱、转换逻辑分散的问题。

**Requirements**:
- 提供简单易用的 API（StateMachine 类）
- 类型安全，完整的 TypeScript 支持
- 支持状态生命周期钩子（onEnter、onExit）
- 支持状态转换验证
- 支持状态历史记录（可选）
- 与现有代码风格一致（参考 ECS 模块）
- 支持浏览器和 Node.js 环境

**Constraints**:
- 必须与 ECS 模块结构类似
- 必须支持泛型状态类型
- API 要直观，符合开发者直觉
- 必须正确处理边界情况（非法转换、循环转换等）

## 2️⃣ OPTIONS

### Option A: StateMachine 类 + 配置对象
**实现**：
```typescript
class StateMachine<TState = string> {
    constructor(config: FSMConfig<TState>)
    currentState: TState
    transition(event: string, data?: any): boolean
}
```

**特点**：
- 类式 API，符合现有代码风格
- 配置对象，灵活
- 支持泛型，类型安全

### Option B: StateMachine 类 + 构建器模式
**实现**：
```typescript
class StateMachineBuilder<TState> {
    addState(state: TState, config?: StateConfig): this
    addTransition(from: TState, to: TState, event: string): this
    build(): StateMachine<TState>
}
```

**特点**：
- 流畅的 API
- 易于配置复杂状态机
- 链式调用

### Option C: 函数式 API
**实现**：
```typescript
function createStateMachine<TState>(config: FSMConfig<TState>): StateMachine<TState>
```

**特点**：
- 函数式风格
- 易于测试

### Option D: 组合方案（推荐）
**实现**：结合 Option A + Option B
- StateMachine 类（核心 API）
- StateMachineBuilder（可选，用于复杂配置）
- 两者都提供，让开发者选择

## 3️⃣ ANALYSIS

| Criterion | Option A (Config) | Option B (Builder) | Option C (Function) | Option D (Combined) |
|-----------|------------------|-------------------|---------------------|---------------------|
| **易用性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **灵活性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **代码风格一致性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **可测试性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **扩展性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Key Insights**:
- 配置对象方式简单直接，适合简单场景
- 构建器模式最灵活，适合复杂状态机
- 函数式 API 易于测试，但不符合现有代码风格
- 组合方案提供最佳开发者体验

## 4️⃣ DECISION

**Selected**: Option D - 组合方案

**Rationale**: 
- StateMachine 类提供核心功能，配置对象方式简单易用
- StateMachineBuilder 提供构建器模式，适合复杂配置
- 两者都提供，让开发者根据场景选择
- 与 ECS 模块的类式风格一致

## 5️⃣ IMPLEMENTATION NOTES

### 5.1 类型定义

**状态类型**：
```typescript
/**
 * 状态类型（支持字符串、枚举、数字等）
 */
export type State = string | number | symbol;

/**
 * 状态配置
 */
export interface StateConfig<TState = State> {
    /** 状态标识 */
    state: TState;
    /** 状态名称（用于调试） */
    name?: string;
    /** 状态描述 */
    description?: string;
    /** 进入状态时的回调 */
    onEnter?: (from?: TState, data?: any) => void;
    /** 退出状态时的回调 */
    onExit?: (to?: TState, data?: any) => void;
}

/**
 * 转换配置
 */
export interface TransitionConfig<TState = State> {
    /** 源状态 */
    from: TState;
    /** 目标状态 */
    to: TState;
    /** 触发事件 */
    event: string;
    /** 转换条件（可选） */
    condition?: (data?: any) => boolean;
    /** 转换时的回调 */
    onTransition?: (from: TState, to: TState, data?: any) => void;
}

/**
 * 状态机配置
 */
export interface FSMConfig<TState = State> {
    /** 初始状态 */
    initialState: TState;
    /** 状态列表 */
    states: StateConfig<TState>[];
    /** 转换列表 */
    transitions: TransitionConfig<TState>[];
    /** 是否启用调试模式 */
    debug?: boolean;
    /** 是否记录状态历史 */
    enableHistory?: boolean;
    /** 历史记录最大长度 */
    maxHistoryLength?: number;
}
```

### 5.2 StateMachine 类实现

**API 签名**：
```typescript
/**
 * 有限状态机
 * 
 * 管理状态和状态转换，提供状态生命周期钩子和转换验证
 * 
 * @example
 * ```typescript
 * enum PlayerState {
 *     Idle = 'idle',
 *     Walking = 'walking',
 *     Jumping = 'jumping'
 * }
 * 
 * const fsm = new StateMachine<PlayerState>({
 *     initialState: PlayerState.Idle,
 *     states: [
 *         { state: PlayerState.Idle },
 *         { state: PlayerState.Walking },
 *         { state: PlayerState.Jumping }
 *     ],
 *     transitions: [
 *         { from: PlayerState.Idle, to: PlayerState.Walking, event: 'start_walk' },
 *         { from: PlayerState.Walking, to: PlayerState.Jumping, event: 'jump' },
 *         { from: PlayerState.Jumping, to: PlayerState.Idle, event: 'land' }
 *     ]
 * });
 * 
 * fsm.transition('start_walk'); // Idle -> Walking
 * ```
 */
export class StateMachine<TState = State> {
    /** 当前状态 */
    readonly currentState: TState;
    
    /** 状态历史（如果启用） */
    readonly history: TState[];
    
    /** 是否启用调试模式 */
    readonly debug: boolean;
    
    /**
     * 创建状态机
     * @param config 状态机配置
     */
    constructor(config: FSMConfig<TState>);
    
    /**
     * 触发状态转换
     * @param event 触发事件
     * @param data 转换数据（可选）
     * @returns 是否转换成功
     */
    transition(event: string, data?: any): boolean;
    
    /**
     * 检查是否可以转换
     * @param event 触发事件
     * @returns 是否可以转换
     */
    canTransition(event: string): boolean;
    
    /**
     * 获取所有可能的目标状态
     * @param event 触发事件
     * @returns 可能的目标状态列表
     */
    getPossibleStates(event: string): TState[];
    
    /**
     * 注册状态进入回调
     * @param state 状态
     * @param callback 回调函数
     */
    onEnter(state: TState, callback: (from?: TState, data?: any) => void): void;
    
    /**
     * 注册状态退出回调
     * @param state 状态
     * @param callback 回调函数
     */
    onExit(state: TState, callback: (to?: TState, data?: any) => void): void;
    
    /**
     * 注册转换回调
     * @param from 源状态
     * @param to 目标状态
     * @param callback 回调函数
     */
    onTransition(from: TState, to: TState, callback: (data?: any) => void): void;
    
    /**
     * 重置状态机到初始状态
     */
    reset(): void;
    
    /**
     * 检查状态是否存在
     * @param state 状态
     * @returns 是否存在
     */
    hasState(state: TState): boolean;
    
    /**
     * 获取状态配置
     * @param state 状态
     * @returns 状态配置
     */
    getStateConfig(state: TState): StateConfig<TState> | undefined;
}
```

**实现要点**：
1. 使用 Map 存储状态和转换，提高查找效率
2. 转换验证：检查转换是否存在、条件是否满足
3. 生命周期钩子：按顺序执行 onExit -> onTransition -> onEnter
4. 状态历史：使用数组存储，支持最大长度限制
5. 错误处理：非法转换抛出错误或返回 false

### 5.3 StateMachineBuilder 实现（可选）

**API 签名**：
```typescript
/**
 * 状态机构建器
 * 
 * 提供流畅的 API 用于构建复杂的状态机
 * 
 * @example
 * ```typescript
 * const fsm = new StateMachineBuilder<PlayerState>()
 *     .addState(PlayerState.Idle, { name: '空闲' })
 *     .addState(PlayerState.Walking, { name: '行走' })
 *     .addTransition(PlayerState.Idle, PlayerState.Walking, 'start_walk')
 *     .addTransition(PlayerState.Walking, PlayerState.Idle, 'stop_walk')
 *     .build();
 * ```
 */
export class StateMachineBuilder<TState = State> {
    /**
     * 添加状态
     * @param state 状态
     * @param config 状态配置（可选）
     * @returns 构建器实例（支持链式调用）
     */
    addState(state: TState, config?: Partial<StateConfig<TState>>): this;
    
    /**
     * 添加转换
     * @param from 源状态
     * @param to 目标状态
     * @param event 触发事件
     * @param config 转换配置（可选）
     * @returns 构建器实例（支持链式调用）
     */
    addTransition(
        from: TState, 
        to: TState, 
        event: string, 
        config?: Partial<TransitionConfig<TState>>
    ): this;
    
    /**
     * 设置初始状态
     * @param state 初始状态
     * @returns 构建器实例（支持链式调用）
     */
    setInitialState(state: TState): this;
    
    /**
     * 启用调试模式
     * @returns 构建器实例（支持链式调用）
     */
    enableDebug(): this;
    
    /**
     * 启用状态历史
     * @param maxLength 最大历史长度（可选）
     * @returns 构建器实例（支持链式调用）
     */
    enableHistory(maxLength?: number): this;
    
    /**
     * 构建状态机
     * @returns 状态机实例
     */
    build(): StateMachine<TState>;
}
```

### 5.4 模块结构

```
packages/fsm/src/
├── core/
│   ├── StateMachine.ts      # 状态机核心类
│   ├── StateMachineBuilder.ts # 状态机构建器（可选）
│   ├── types.ts              # 类型定义
│   └── index.ts              # 核心模块导出
├── utils/
│   └── index.ts              # 工具函数（可选）
└── index.ts                   # 主入口
```

### 5.5 导出策略

**core/index.ts**:
```typescript
export { StateMachine } from './StateMachine';
export { StateMachineBuilder } from './StateMachineBuilder';
export type { 
    State, 
    StateConfig, 
    TransitionConfig, 
    FSMConfig 
} from './types';
```

**src/index.ts**:
```typescript
/**
 * @bl-framework/fsm
 * 
 * Finite State Machine framework for bl-framework
 * 
 * 所有导出打包成一个对象 FSM
 */

// 类型定义
export type State = string | number | symbol;
export type { StateConfig, TransitionConfig, FSMConfig } from './core';

// 核心类
export { StateMachine } from './core/StateMachine';
export { StateMachineBuilder } from './core/StateMachineBuilder';

// 命名空间导出
import { StateMachine } from './core/StateMachine';
import { StateMachineBuilder } from './core/StateMachineBuilder';

export const FSM = {
    StateMachine,
    StateMachineBuilder,
} as const;

// 默认导出 FSM 对象
export default FSM;
```

### 5.6 使用示例

**基础用法**：
```typescript
import { StateMachine } from '@bl-framework/fsm';

enum PlayerState {
    Idle = 'idle',
    Walking = 'walking',
    Jumping = 'jumping'
}

const fsm = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [
        { state: PlayerState.Idle, name: '空闲' },
        { state: PlayerState.Walking, name: '行走' },
        { state: PlayerState.Jumping, name: '跳跃' }
    ],
    transitions: [
        { from: PlayerState.Idle, to: PlayerState.Walking, event: 'start_walk' },
        { from: PlayerState.Walking, to: PlayerState.Idle, event: 'stop_walk' },
        { from: PlayerState.Walking, to: PlayerState.Jumping, event: 'jump' },
        { from: PlayerState.Jumping, to: PlayerState.Idle, event: 'land' }
    ],
    debug: true
});

// 状态转换
fsm.transition('start_walk'); // Idle -> Walking
fsm.transition('jump'); // Walking -> Jumping
fsm.transition('land'); // Jumping -> Idle

// 检查是否可以转换
if (fsm.canTransition('jump')) {
    fsm.transition('jump');
}

// 生命周期钩子
fsm.onEnter(PlayerState.Walking, (from, data) => {
    console.log(`进入行走状态，来自: ${from}`);
});

fsm.onExit(PlayerState.Walking, (to, data) => {
    console.log(`退出行走状态，前往: ${to}`);
});
```

**构建器模式**：
```typescript
import { StateMachineBuilder } from '@bl-framework/fsm';

const fsm = new StateMachineBuilder<PlayerState>()
    .setInitialState(PlayerState.Idle)
    .addState(PlayerState.Idle, { 
        name: '空闲',
        onEnter: () => console.log('进入空闲状态')
    })
    .addState(PlayerState.Walking, { 
        name: '行走',
        onEnter: () => console.log('开始行走')
    })
    .addTransition(PlayerState.Idle, PlayerState.Walking, 'start_walk')
    .addTransition(PlayerState.Walking, PlayerState.Idle, 'stop_walk', {
        condition: (data) => data?.forceStop !== true
    })
    .enableDebug()
    .enableHistory(10)
    .build();
```

**条件转换**：
```typescript
const fsm = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [
        { state: PlayerState.Idle },
        { state: PlayerState.Walking }
    ],
    transitions: [
        {
            from: PlayerState.Idle,
            to: PlayerState.Walking,
            event: 'start_walk',
            condition: (data) => data?.canWalk === true
        }
    ]
});

// 只有满足条件才能转换
fsm.transition('start_walk', { canWalk: true }); // 成功
fsm.transition('start_walk', { canWalk: false }); // 失败
```

**状态历史**：
```typescript
const fsm = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [...],
    transitions: [...],
    enableHistory: true,
    maxHistoryLength: 10
});

fsm.transition('start_walk');
fsm.transition('jump');
fsm.transition('land');

console.log(fsm.history); // [Idle, Walking, Jumping, Idle]
```

### 5.7 边界情况处理

1. **非法状态转换**
   - 检查转换是否存在
   - 检查条件是否满足
   - 返回 false 或抛出错误（可配置）

2. **循环状态转换**
   - 支持循环转换（如 A -> B -> A）
   - 历史记录正确处理循环

3. **不存在的状态**
   - `hasState()` 检查状态是否存在
   - `getStateConfig()` 返回 undefined

4. **不存在的转换**
   - `canTransition()` 检查转换是否存在
   - `transition()` 返回 false

5. **空状态机**
   - 至少需要一个初始状态
   - 转换列表可以为空

### 5.8 性能考虑

1. **状态查找**
   - 使用 Map 存储状态配置，O(1) 查找
   - 使用 Map 存储转换规则，O(1) 查找

2. **转换验证**
   - 预计算可能的转换，缓存结果
   - 条件函数只在需要时执行

3. **历史记录**
   - 使用数组，支持最大长度限制
   - 超出长度时自动移除最旧记录

### 5.9 错误处理

```typescript
/**
 * 状态机错误
 */
export class FSMError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FSMError';
    }
}

/**
 * 非法转换错误
 */
export class InvalidTransitionError extends FSMError {
    constructor(from: State, to: State, event: string) {
        super(`Invalid transition: ${String(from)} -> ${String(to)} on event '${event}'`);
        this.name = 'InvalidTransitionError';
    }
}
```

### 5.10 测试要点

1. **StateMachine**
   - 状态转换功能
   - 转换验证功能
   - 生命周期钩子
   - 状态历史记录

2. **StateMachineBuilder**
   - 链式调用
   - 配置正确性
   - 构建结果验证

3. **边界情况**
   - 非法状态转换
   - 循环状态转换
   - 不存在的状态/转换
   - 空状态机

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END

## VERIFICATION

- [x] Problem clearly defined
- [x] Multiple options considered
- [x] Decision made with rationale
- [x] Implementation guidance provided
- [x] API signatures defined
- [x] Type definitions provided
- [x] Usage examples provided
- [x] Edge cases considered

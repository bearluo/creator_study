# @bl-framework/fsm

bl-framework 有限状态机（Finite State Machine, FSM）框架

## 安装

```bash
npm install @bl-framework/fsm
```

## 快速开始

### 基本使用

```typescript
import { StateMachine } from '@bl-framework/fsm';

enum PlayerState {
    Idle = 'idle',
    Walking = 'walking',
    Jumping = 'jumping'
}

// 创建状态机
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
    ]
});

// 状态转换
fsm.transition('start_walk'); // Idle -> Walking
fsm.transition('jump'); // Walking -> Jumping
fsm.transition('land'); // Jumping -> Idle

console.log('当前状态:', fsm.currentState); // 'idle'
```

### 构建器模式

```typescript
import { StateMachineBuilder } from '@bl-framework/fsm';

const fsm = new StateMachineBuilder<PlayerState>()
    .setInitialState(PlayerState.Idle)
    .addState(PlayerState.Idle, { name: '空闲' })
    .addState(PlayerState.Walking, { name: '行走' })
    .addTransition(PlayerState.Idle, PlayerState.Walking, 'start_walk')
    .addTransition(PlayerState.Walking, PlayerState.Idle, 'stop_walk')
    .enableDebug()
    .enableHistory(10)
    .build();
```

## API 文档

### StateMachine

状态机核心类，管理状态和状态转换。

#### 构造函数

```typescript
constructor(config: FSMConfig<TState>)
```

创建状态机实例。

#### 属性

- `currentState: TState` - 当前状态（只读）
- `history: readonly TState[]` - 状态历史（只读，如果启用）
- `debug: boolean` - 是否启用调试模式（只读）

#### 方法

##### `transition(event: string, data?: any): boolean`

触发状态转换。

- `event` - 触发事件
- `data` - 转换数据（可选，用于条件检查）
- 返回：是否转换成功

##### `canTransition(event: string, data?: any): boolean`

检查是否可以转换。

- `event` - 触发事件
- `data` - 转换数据（可选，用于条件检查）
- 返回：是否可以转换

##### `getPossibleStates(event: string): TState[]`

获取所有可能的目标状态。

- `event` - 触发事件
- 返回：可能的目标状态列表

##### `onEnter(state: TState, callback: (from?: TState, data?: any) => void): void`

注册状态进入回调。

##### `onExit(state: TState, callback: (to?: TState, data?: any) => void): void`

注册状态退出回调。

##### `onTransition(from: TState, to: TState, callback: (data?: any) => void): void`

注册转换回调。

##### `reset(): void`

重置状态机到初始状态。

##### `hasState(state: TState): boolean`

检查状态是否存在。

##### `getStateConfig(state: TState): StateConfig<TState> | undefined`

获取状态配置。

### StateMachineBuilder

状态机构建器，提供流畅的 API 用于构建复杂的状态机。

#### 方法

##### `addState(state: TState, config?: Partial<StateConfig<TState>>): this`

添加状态（支持链式调用）。

##### `addTransition(from: TState, to: TState, event: string, config?: Partial<TransitionConfig<TState>>): this`

添加转换（支持链式调用）。

##### `setInitialState(state: TState): this`

设置初始状态（支持链式调用）。

##### `enableDebug(): this`

启用调试模式（支持链式调用）。

##### `enableHistory(maxLength?: number): this`

启用状态历史（支持链式调用）。

##### `build(): StateMachine<TState>`

构建状态机实例。

## 类型定义

### State

状态类型，支持字符串、数字或符号：

```typescript
type State = string | number | symbol;
```

### StateConfig

状态配置接口：

```typescript
interface StateConfig<TState = State> {
    state: TState;
    name?: string;
    description?: string;
    onEnter?: (from?: TState, data?: any) => void;
    onExit?: (to?: TState, data?: any) => void;
}
```

### TransitionConfig

转换配置接口：

```typescript
interface TransitionConfig<TState = State> {
    from: TState;
    to: TState;
    event: string;
    condition?: (data?: any) => boolean;
    onTransition?: (from: TState, to: TState, data?: any) => void;
}
```

### FSMConfig

状态机配置接口：

```typescript
interface FSMConfig<TState = State> {
    initialState: TState;
    states: StateConfig<TState>[];
    transitions: TransitionConfig<TState>[];
    debug?: boolean;
    enableHistory?: boolean;
    maxHistoryLength?: number;
}
```

## 使用示例

### 生命周期钩子

```typescript
const fsm = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [
        {
            state: PlayerState.Idle,
            onEnter: (from, data) => {
                console.log('进入空闲状态');
            },
            onExit: (to, data) => {
                console.log('退出空闲状态');
            }
        }
    ],
    transitions: [
        {
            from: PlayerState.Idle,
            to: PlayerState.Walking,
            event: 'start_walk',
            onTransition: (from, to, data) => {
                console.log(`转换: ${from} -> ${to}`);
            }
        }
    ]
});

// 也可以动态注册回调
fsm.onEnter(PlayerState.Walking, (from, data) => {
    console.log('开始行走');
});
```

### 条件转换

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

### 状态历史

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

### 转换验证

```typescript
// 检查是否可以转换
if (fsm.canTransition('jump')) {
    fsm.transition('jump');
}

// 获取可能的目标状态
const possibleStates = fsm.getPossibleStates('start_walk');
```

## 命名空间导出

类似 ECS 模块，FSM 也提供命名空间导出：

```typescript
import { FSM } from '@bl-framework/fsm';

const fsm = new FSM.StateMachine<PlayerState>({...});
const builder = new FSM.StateMachineBuilder<PlayerState>();
```

## 版本

- **1.0.0** - 初始版本
  - ✅ StateMachine 核心类
  - ✅ StateMachineBuilder 构建器
  - ✅ 状态生命周期钩子
  - ✅ 条件转换支持
  - ✅ 状态历史记录
  - ✅ 完整的 TypeScript 类型支持

## 许可证

MIT

/**
 * @bl-framework/fsm 基础使用示例
 */

import { StateMachine, StateMachineBuilder } from '@bl-framework/fsm';

// ==================== 示例 1: 基础状态机 ====================

console.log('=== 示例 1: 基础状态机 ===');

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

console.log('初始状态:', fsm.currentState); // 'idle'

// 状态转换
fsm.transition('start_walk');
console.log('当前状态:', fsm.currentState); // 'walking'

fsm.transition('jump');
console.log('当前状态:', fsm.currentState); // 'jumping'

fsm.transition('land');
console.log('当前状态:', fsm.currentState); // 'idle'

// ==================== 示例 2: 生命周期钩子 ====================

console.log('\n=== 示例 2: 生命周期钩子 ===');

const fsm2 = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [
        {
            state: PlayerState.Idle,
            onEnter: (from, data) => {
                console.log(`进入空闲状态，来自: ${from}`);
            },
            onExit: (to, data) => {
                console.log(`退出空闲状态，前往: ${to}`);
            }
        },
        {
            state: PlayerState.Walking,
            onEnter: (from, data) => {
                console.log(`开始行走，来自: ${from}`);
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

// 动态注册回调
fsm2.onEnter(PlayerState.Walking, (from, data) => {
    console.log('动态注册的进入回调');
});

fsm2.transition('start_walk');

// ==================== 示例 3: 构建器模式 ====================

console.log('\n=== 示例 3: 构建器模式 ===');

const fsm3 = new StateMachineBuilder<PlayerState>()
    .setInitialState(PlayerState.Idle)
    .addState(PlayerState.Idle, { name: '空闲' })
    .addState(PlayerState.Walking, { name: '行走' })
    .addState(PlayerState.Jumping, { name: '跳跃' })
    .addTransition(PlayerState.Idle, PlayerState.Walking, 'start_walk')
    .addTransition(PlayerState.Walking, PlayerState.Idle, 'stop_walk')
    .addTransition(PlayerState.Walking, PlayerState.Jumping, 'jump')
    .addTransition(PlayerState.Jumping, PlayerState.Idle, 'land')
    .enableDebug()
    .build();

console.log('构建器创建的状态机，当前状态:', fsm3.currentState);

// ==================== 示例 4: 条件转换 ====================

console.log('\n=== 示例 4: 条件转换 ===');

const fsm4 = new StateMachine<PlayerState>({
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
    ],
    debug: true
});

// 条件不满足，转换失败
const result1 = fsm4.transition('start_walk', { canWalk: false });
console.log('转换结果（条件不满足）:', result1); // false

// 条件满足，转换成功
const result2 = fsm4.transition('start_walk', { canWalk: true });
console.log('转换结果（条件满足）:', result2); // true
console.log('当前状态:', fsm4.currentState); // 'walking'

// ==================== 示例 5: 状态历史 ====================

console.log('\n=== 示例 5: 状态历史 ===');

const fsm5 = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [
        { state: PlayerState.Idle },
        { state: PlayerState.Walking },
        { state: PlayerState.Jumping }
    ],
    transitions: [
        { from: PlayerState.Idle, to: PlayerState.Walking, event: 'start_walk' },
        { from: PlayerState.Walking, to: PlayerState.Jumping, event: 'jump' },
        { from: PlayerState.Jumping, to: PlayerState.Idle, event: 'land' }
    ],
    enableHistory: true,
    maxHistoryLength: 10
});

fsm5.transition('start_walk');
fsm5.transition('jump');
fsm5.transition('land');

console.log('状态历史:', fsm5.history);
// ['idle', 'walking', 'jumping', 'idle']

// ==================== 示例 6: 转换验证 ====================

console.log('\n=== 示例 6: 转换验证 ===');

const fsm6 = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [
        { state: PlayerState.Idle },
        { state: PlayerState.Walking }
    ],
    transitions: [
        { from: PlayerState.Idle, to: PlayerState.Walking, event: 'start_walk' }
    ]
});

// 检查是否可以转换
console.log('可以转换 start_walk?', fsm6.canTransition('start_walk')); // true
console.log('可以转换 jump?', fsm6.canTransition('jump')); // false

// 获取可能的目标状态
console.log('start_walk 可能的目标状态:', fsm6.getPossibleStates('start_walk')); // ['walking']

// ==================== 示例 7: 状态查询 ====================

console.log('\n=== 示例 7: 状态查询 ===');

const fsm7 = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [
        { state: PlayerState.Idle, name: '空闲' },
        { state: PlayerState.Walking, name: '行走' }
    ],
    transitions: []
});

console.log('状态 Idle 存在?', fsm7.hasState(PlayerState.Idle)); // true
console.log('状态 Jumping 存在?', fsm7.hasState(PlayerState.Jumping)); // false

const stateConfig = fsm7.getStateConfig(PlayerState.Idle);
console.log('Idle 状态配置:', stateConfig); // { state: 'idle', name: '空闲' }

// ==================== 示例 8: 重置状态机 ====================

console.log('\n=== 示例 8: 重置状态机 ===');

const fsm8 = new StateMachine<PlayerState>({
    initialState: PlayerState.Idle,
    states: [
        { state: PlayerState.Idle },
        { state: PlayerState.Walking }
    ],
    transitions: [
        { from: PlayerState.Idle, to: PlayerState.Walking, event: 'start_walk' }
    ],
    enableHistory: true
});

fsm8.transition('start_walk');
console.log('转换后状态:', fsm8.currentState); // 'walking'

fsm8.reset();
console.log('重置后状态:', fsm8.currentState); // 'idle'
console.log('重置后历史:', fsm8.history); // ['idle']

console.log('\n=== 所有示例完成 ===');

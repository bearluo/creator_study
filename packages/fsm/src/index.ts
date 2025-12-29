/**
 * @bl-framework/fsm
 * 
 * Finite State Machine framework for bl-framework
 * 
 * 所有导出打包成一个对象 FSM
 */

// ==================== 类型定义 ====================

/** 状态类型（支持字符串、数字、符号） */
export type State = string | number | symbol;

// ==================== 核心模块 ====================

// 导出核心类和类型
export { StateMachine } from './core/StateMachine';
export { StateMachineBuilder } from './core/StateMachineBuilder';
export type {
    StateConfig,
    TransitionConfig,
    FSMConfig
} from './core/types';
export { FSMError, InvalidTransitionError } from './core/types';

// ==================== 工具模块 ====================

// 导出工具函数（暂时为空）
export * from './utils';

// ==================== 命名空间导出 ====================

// 将所有导出打包成一个对象
import { StateMachine } from './core/StateMachine';
import { StateMachineBuilder } from './core/StateMachineBuilder';

/**
 * FSM 命名空间对象
 * 包含所有 FSM 相关的类、接口和工具
 */
export const FSM = {
    // 核心类
    StateMachine,
    StateMachineBuilder,
} as const;

// 默认导出 FSM 对象
export default FSM;

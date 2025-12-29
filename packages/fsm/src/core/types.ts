/**
 * FSM 类型定义
 */

/**
 * 状态类型（支持字符串、数字、符号）
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

/**
 * 状态机错误
 */
export class FSMError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FSMError';
        
        // 保持错误堆栈（Node.js 环境）
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FSMError);
        }
    }
}

/**
 * 非法转换错误
 */
export class InvalidTransitionError extends FSMError {
    constructor(from: State, to: State, event: string) {
        super(`Invalid transition: ${String(from)} -> ${String(to)} on event '${event}'`);
        this.name = 'InvalidTransitionError';
        
        // 保持错误堆栈（Node.js 环境）
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidTransitionError);
        }
    }
}

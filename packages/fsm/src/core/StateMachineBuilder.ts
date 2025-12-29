import { State, StateConfig, TransitionConfig, FSMConfig } from './types';
import { StateMachine } from './StateMachine';

/**
 * 状态机构建器
 * 
 * 提供流畅的 API 用于构建复杂的状态机
 * 
 * @example
 * ```typescript
 * const fsm = new StateMachineBuilder<PlayerState>()
 *     .setInitialState(PlayerState.Idle)
 *     .addState(PlayerState.Idle, { name: '空闲' })
 *     .addState(PlayerState.Walking, { name: '行走' })
 *     .addTransition(PlayerState.Idle, PlayerState.Walking, 'start_walk')
 *     .addTransition(PlayerState.Walking, PlayerState.Idle, 'stop_walk')
 *     .enableDebug()
 *     .build();
 * ```
 */
export class StateMachineBuilder<TState = State> {
    private initialState?: TState;
    private states: StateConfig<TState>[] = [];
    private transitions: TransitionConfig<TState>[] = [];
    private debug: boolean = false;
    private _enableHistory: boolean = false;
    private maxHistoryLength: number = 100;

    /**
     * 添加状态
     * @param state 状态
     * @param config 状态配置（可选）
     * @returns 构建器实例（支持链式调用）
     */
    addState(state: TState, config?: Partial<StateConfig<TState>>): this {
        // 检查状态是否已存在
        const existingIndex = this.states.findIndex(s => s.state === state);
        if (existingIndex >= 0) {
            // 合并配置
            this.states[existingIndex] = {
                ...this.states[existingIndex],
                ...config,
                state
            };
        } else {
            // 添加新状态
            this.states.push({
                state,
                ...config
            });
        }
        return this;
    }

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
    ): this {
        this.transitions.push({
            from,
            to,
            event,
            ...config
        });
        return this;
    }

    /**
     * 设置初始状态
     * @param state 初始状态
     * @returns 构建器实例（支持链式调用）
     */
    setInitialState(state: TState): this {
        this.initialState = state;
        // 如果状态不存在，自动添加
        if (!this.states.some(s => s.state === state)) {
            this.addState(state);
        }
        return this;
    }

    /**
     * 启用调试模式
     * @returns 构建器实例（支持链式调用）
     */
    enableDebug(): this {
        this.debug = true;
        return this;
    }

    /**
     * 启用状态历史
     * @param maxLength 最大历史长度（可选）
     * @returns 构建器实例（支持链式调用）
     */
    enableHistory(maxLength?: number): this {
        this._enableHistory = true;
        if (maxLength !== undefined) {
            this.maxHistoryLength = maxLength;
        }
        return this;
    }

    /**
     * 构建状态机
     * @returns 状态机实例
     * @throws {FSMError} 如果配置无效
     */
    build(): StateMachine<TState> {
        if (this.initialState === undefined) {
            throw new Error('StateMachineBuilder: Initial state must be set');
        }

        if (this.states.length === 0) {
            throw new Error('StateMachineBuilder: At least one state must be added');
        }

        const config: FSMConfig<TState> = {
            initialState: this.initialState,
            states: this.states,
            transitions: this.transitions,
            debug: this.debug,
            enableHistory: this._enableHistory,
            maxHistoryLength: this.maxHistoryLength
        };

        return new StateMachine(config);
    }
}

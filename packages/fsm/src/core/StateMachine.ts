import { State, StateConfig, TransitionConfig, FSMConfig, InvalidTransitionError, FSMError } from './types';

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
    private _currentState: TState;

    /** 状态配置映射 */
    private states: Map<TState, StateConfig<TState>> = new Map();

    /** 转换规则映射 (event -> TransitionConfig[]) */
    private transitions: Map<string, TransitionConfig<TState>[]> = new Map();

    /** 状态历史（如果启用） */
    private _history: TState[] = [];

    /** 是否启用调试模式 */
    public readonly debug: boolean;

    /** 是否启用历史记录 */
    private readonly enableHistory: boolean;

    /** 历史记录最大长度 */
    private readonly maxHistoryLength: number;

    /** 动态注册的回调 */
    private enterCallbacks: Map<TState, Array<(from?: TState, data?: any) => void>> = new Map();
    private exitCallbacks: Map<TState, Array<(to?: TState, data?: any) => void>> = new Map();
    private transitionCallbacks: Map<string, Array<(data?: any) => void>> = new Map();

    /**
     * 创建状态机
     * @param config 状态机配置
     */
    constructor(config: FSMConfig<TState>) {
        this.debug = config.debug ?? false;
        this.enableHistory = config.enableHistory ?? false;
        this.maxHistoryLength = config.maxHistoryLength ?? 100;

        // 验证初始状态
        if (!config.states.some(s => s.state === config.initialState)) {
            throw new FSMError(`Initial state '${String(config.initialState)}' is not defined in states`);
        }

        // 初始化状态
        this._currentState = config.initialState;

        // 构建状态映射
        for (const stateConfig of config.states) {
            this.states.set(stateConfig.state, stateConfig);
        }

        // 构建转换映射
        for (const transition of config.transitions) {
            // 验证状态存在
            if (!this.states.has(transition.from)) {
                throw new FSMError(`Transition from state '${String(transition.from)}' is not defined`);
            }
            if (!this.states.has(transition.to)) {
                throw new FSMError(`Transition to state '${String(transition.to)}' is not defined`);
            }

            // 添加到转换映射
            const event = transition.event;
            if (!this.transitions.has(event)) {
                this.transitions.set(event, []);
            }
            this.transitions.get(event)!.push(transition);
        }

        // 记录初始状态到历史
        if (this.enableHistory) {
            this._history.push(this._currentState);
        }

        if (this.debug) {
            console.log('[FSM] StateMachine created:', {
                initialState: this._currentState,
                states: Array.from(this.states.keys()),
                transitions: config.transitions.length
            });
        }
    }

    /**
     * 获取当前状态
     */
    get currentState(): TState {
        return this._currentState;
    }

    /**
     * 获取状态历史（只读）
     */
    get history(): readonly TState[] {
        return this._history;
    }

    /**
     * 触发状态转换
     * @param event 触发事件
     * @param data 转换数据（可选）
     * @returns 是否转换成功
     */
    transition(event: string, data?: any): boolean {
        const possibleTransitions = this.transitions.get(event);
        if (!possibleTransitions || possibleTransitions.length === 0) {
            if (this.debug) {
                console.warn(`[FSM] No transition found for event '${event}'`);
            }
            return false;
        }

        // 查找从当前状态出发的转换
        const transition = possibleTransitions.find(t => t.from === this._currentState);
        if (!transition) {
            if (this.debug) {
                console.warn(`[FSM] No transition from state '${String(this._currentState)}' for event '${event}'`);
            }
            return false;
        }

        // 检查转换条件
        if (transition.condition && !transition.condition(data)) {
            if (this.debug) {
                console.warn(`[FSM] Transition condition not met for event '${event}'`);
            }
            return false;
        }

        const fromState = this._currentState;
        const toState = transition.to;

        // 如果目标状态与当前状态相同，不需要转换
        if (fromState === toState) {
            if (this.debug) {
                console.log(`[FSM] Already in state '${String(toState)}'`);
            }
            return true;
        }

        // 执行生命周期钩子
        try {
            // 1. 执行退出回调
            const fromStateConfig = this.states.get(fromState);
            if (fromStateConfig?.onExit) {
                fromStateConfig.onExit(toState, data);
            }
            const exitCallbacks = this.exitCallbacks.get(fromState);
            if (exitCallbacks) {
                for (const callback of exitCallbacks) {
                    callback(toState, data);
                }
            }

            // 2. 执行转换回调
            if (transition.onTransition) {
                transition.onTransition(fromState, toState, data);
            }
            const transitionKey = `${String(fromState)}->${String(toState)}`;
            const transitionCallbacks = this.transitionCallbacks.get(transitionKey);
            if (transitionCallbacks) {
                for (const callback of transitionCallbacks) {
                    callback(data);
                }
            }

            // 3. 更新状态
            this._currentState = toState;

            // 4. 记录历史
            if (this.enableHistory) {
                this._history.push(toState);
                if (this._history.length > this.maxHistoryLength) {
                    this._history.shift();
                }
            }

            // 5. 执行进入回调
            const toStateConfig = this.states.get(toState);
            if (toStateConfig?.onEnter) {
                toStateConfig.onEnter(fromState, data);
            }
            const enterCallbacks = this.enterCallbacks.get(toState);
            if (enterCallbacks) {
                for (const callback of enterCallbacks) {
                    callback(fromState, data);
                }
            }

            if (this.debug) {
                console.log(`[FSM] Transition: ${String(fromState)} -> ${String(toState)} (event: '${event}')`);
            }

            return true;
        } catch (error) {
            if (this.debug) {
                console.error(`[FSM] Error during transition:`, error);
            }
            throw error;
        }
    }

    /**
     * 检查是否可以转换
     * @param event 触发事件
     * @param data 转换数据（可选，用于条件检查）
     * @returns 是否可以转换
     */
    canTransition(event: string, data?: any): boolean {
        const possibleTransitions = this.transitions.get(event);
        if (!possibleTransitions || possibleTransitions.length === 0) {
            return false;
        }

        const transition = possibleTransitions.find(t => t.from === this._currentState);
        if (!transition) {
            return false;
        }

        // 检查转换条件
        if (transition.condition && !transition.condition(data)) {
            return false;
        }

        return true;
    }

    /**
     * 获取所有可能的目标状态
     * @param event 触发事件
     * @returns 可能的目标状态列表
     */
    getPossibleStates(event: string): TState[] {
        const possibleTransitions = this.transitions.get(event);
        if (!possibleTransitions || possibleTransitions.length === 0) {
            return [];
        }

        return possibleTransitions
            .filter(t => t.from === this._currentState)
            .map(t => t.to);
    }

    /**
     * 注册状态进入回调
     * @param state 状态
     * @param callback 回调函数
     */
    onEnter(state: TState, callback: (from?: TState, data?: any) => void): void {
        if (!this.enterCallbacks.has(state)) {
            this.enterCallbacks.set(state, []);
        }
        this.enterCallbacks.get(state)!.push(callback);
    }

    /**
     * 注册状态退出回调
     * @param state 状态
     * @param callback 回调函数
     */
    onExit(state: TState, callback: (to?: TState, data?: any) => void): void {
        if (!this.exitCallbacks.has(state)) {
            this.exitCallbacks.set(state, []);
        }
        this.exitCallbacks.get(state)!.push(callback);
    }

    /**
     * 注册转换回调
     * @param from 源状态
     * @param to 目标状态
     * @param callback 回调函数
     */
    onTransition(from: TState, to: TState, callback: (data?: any) => void): void {
        const key = `${String(from)}->${String(to)}`;
        if (!this.transitionCallbacks.has(key)) {
            this.transitionCallbacks.set(key, []);
        }
        this.transitionCallbacks.get(key)!.push(callback);
    }

    /**
     * 重置状态机到初始状态
     */
    reset(): void {
        const initialState = this._history.length > 0 ? this._history[0] : this._currentState;
        this._currentState = initialState;
        this._history = this.enableHistory ? [initialState] : [];
        
        if (this.debug) {
            console.log(`[FSM] Reset to initial state: ${String(initialState)}`);
        }
    }

    /**
     * 检查状态是否存在
     * @param state 状态
     * @returns 是否存在
     */
    hasState(state: TState): boolean {
        return this.states.has(state);
    }

    /**
     * 获取状态配置
     * @param state 状态
     * @returns 状态配置
     */
    getStateConfig(state: TState): StateConfig<TState> | undefined {
        return this.states.get(state);
    }
}

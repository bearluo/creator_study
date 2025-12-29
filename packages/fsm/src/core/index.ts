/**
 * FSM 核心模块
 */

export { StateMachine } from './StateMachine';
export { StateMachineBuilder } from './StateMachineBuilder';
export type {
    State,
    StateConfig,
    TransitionConfig,
    FSMConfig
} from './types';
export { FSMError, InvalidTransitionError } from './types';

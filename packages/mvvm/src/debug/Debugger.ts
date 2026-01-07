import type { Reactive } from '../reactive/Reactive';
import type { ViewModel } from '../core/ViewModel';
import type { DataBinding } from '../binding/DataBinding';
import type { Watcher } from '../reactive/Watcher';
import type {
    ReactiveState,
    ViewModelState,
    BindingState,
    DependencyGraph,
    DebugHook
} from './types';

/**
 * MVVM 调试器
 * 
 * 提供统一的调试 API，用于查询和监控 MVVM 框架内部状态
 * 
 * @example
 * ```typescript
 * // 启用调试
 * Debugger.enable();
 * 
 * // 查询 Reactive 状态
 * const state = Debugger.getReactiveState(reactive);
 * console.log('Current value:', state.value);
 * console.log('Watchers:', state.watchers.length);
 * 
 * // 查询 ViewModel 状态
 * const vmState = Debugger.getViewModelState(viewModel);
 * console.log('Bindings:', vmState.bindings.length);
 * 
 * // 查询依赖关系图
 * const graph = Debugger.getDependencyGraph(reactive);
 * console.log('Dependencies:', graph.paths);
 * ```
 */
export class Debugger {
    private static enabled: boolean = false;
    private static hooks: WeakMap<object, DebugHook> = new WeakMap();
    
    /**
     * 启用调试功能
     */
    static enable(): void {
        this.enabled = true;
    }
    
    /**
     * 禁用调试功能
     */
    static disable(): void {
        this.enabled = false;
        this.hooks = new WeakMap();
    }
    
    /**
     * 检查调试功能是否启用
     */
    static isEnabled(): boolean {
        return this.enabled;
    }
    
    /**
     * 获取 Reactive 状态
     */
    static getReactiveState<T>(reactive: Reactive<T>): ReactiveState<T> {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const hook = this.hooks.get(reactive);
        if (!hook) {
            throw new Error('Reactive instance does not have debug hook. Make sure debug is enabled before creating Reactive.');
        }
        
        return hook.getState() as ReactiveState<T>;
    }
    
    /**
     * 获取 ViewModel 状态
     */
    static getViewModelState<T>(viewModel: ViewModel<T>): ViewModelState<T> {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const hook = this.hooks.get(viewModel);
        if (!hook) {
            throw new Error('ViewModel instance does not have debug hook. Make sure debug is enabled before creating ViewModel.');
        }
        
        return hook.getState() as ViewModelState<T>;
    }
    
    /**
     * 获取 DataBinding 状态
     */
    static getBindingState<T, TV, TView>(
        binding: DataBinding<T, TV, TView>
    ): BindingState {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const hook = this.hooks.get(binding);
        if (!hook) {
            throw new Error('DataBinding instance does not have debug hook. Make sure debug is enabled before creating DataBinding.');
        }
        
        return hook.getState() as BindingState;
    }
    
    /**
     * 获取依赖关系图
     */
    static getDependencyGraph<T>(reactive: Reactive<T>): DependencyGraph {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const hook = this.hooks.get(reactive);
        if (!hook || !hook.getDependencyGraph) {
            throw new Error('Reactive instance does not have debug hook or does not support dependency graph.');
        }
        
        return hook.getDependencyGraph()!;
    }
    
    /**
     * 获取 Watcher 依赖
     */
    static getWatcherDependencies(watcher: Watcher): string[] {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        // Watcher 内部维护依赖列表
        return Array.from(watcher.getDependencies());
    }
    
    /**
     * 获取路径依赖（哪些路径依赖于此路径）
     */
    static getPathDependencies<T>(reactive: Reactive<T>, path: string): string[] {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const graph = this.getDependencyGraph(reactive);
        const pathInfo = graph.paths.get(path);
        return pathInfo ? pathInfo.dependencies : [];
    }
    
    /**
     * 获取路径依赖者（哪些路径依赖于此路径）
     */
    static getPathDependents<T>(reactive: Reactive<T>, path: string): string[] {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const graph = this.getDependencyGraph(reactive);
        const pathInfo = graph.paths.get(path);
        return pathInfo ? pathInfo.dependents : [];
    }
    
    /**
     * 注册调试钩子（内部使用）
     */
    static registerHook(instance: object, hook: DebugHook): void {
        if (this.enabled) {
            this.hooks.set(instance, hook);
        }
    }
    
    /**
     * 注销调试钩子（内部使用）
     */
    static unregisterHook(instance: object): void {
        this.hooks.delete(instance);
    }
}


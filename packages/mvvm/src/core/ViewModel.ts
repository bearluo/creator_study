import type { IViewModel, IModel, IView, BindingOptions, Path, PathValue, BatchBindingItem, BindingConfig, IReactive } from './types';
import { Reactive } from '../reactive/Reactive';
import { DataBinding } from '../binding/DataBinding';
import { Debugger } from '../debug/Debugger';
import { ViewModelDebugHook } from '../debug/hooks/ViewModelDebugHook';
import { Logger, LogCategory } from '../debug/Logger';

/**
 * 视图模型
 * 
 * 连接 Model 和 View，管理数据绑定
 * 
 * @example
 * ```typescript
 * interface PlayerData {
 *     name: string;
 *     level: number;
 *     health: number;
 * }
 * 
 * class PlayerViewModel extends ViewModel<PlayerData> {
 *     constructor() {
 *         super(new PlayerModel<PlayerData>({ name: 'John', health: 100, level: 1 }));
 *         
 *         // 绑定数据到视图（现在有类型提示）
 *         this.bind('name', view, { mode: 'two-way' });
 *         this.bind('health', view, { mode: 'one-way' });
 *         
 *         // 访问数据有类型提示
 *         this.reactive.value.name; // ✅ 类型提示：string
 *         this.reactive.value.health; // ✅ 类型提示：number
 *     }
 * }
 * ```
 */
export class ViewModel<T = any> implements IViewModel<T> {
    protected _model: IModel<T>;
    protected _reactive: IReactive<T>;
    private bindings: DataBinding<T, any, any>[] = [];
    private debugHook?: ViewModelDebugHook;
    
    constructor(model: IModel<T>) {
        this._model = model;
        this._reactive = model.reactive;
        
        // 如果调试已启用，创建调试钩子
        if (Debugger.isEnabled()) {
            this.debugHook = new ViewModelDebugHook(this);
            Debugger.registerHook(this, this.debugHook);
        }
    }
    
    /**
     * 获取数据模型
     */
    get model(): IModel<T> {
        return this._model;
    }
    
    /**
     * 获取响应式数据
     */
    get reactive(): IReactive<T> {
        return this._reactive;
    }
    
    /**
     * 类型安全的绑定方法
     * 
     * @template P 路径类型（从 Path<T> 推断）
     * @param path 数据路径（类型安全）
     * @param view 视图
     * @param options 绑定选项（值类型自动推断）
     * @returns 数据绑定对象
     * 
     * @example
     * ```typescript
     * interface PlayerData {
     *     name: string;
     *     stats: { health: number };
     * }
     * 
     * const viewModel = new ViewModel<PlayerData>(model);
     * 
     * // 类型安全：IDE 自动补全，编译时检查
     * viewModel.bind('name', view);              // ✅
     * viewModel.bind('stats.health', view);      // ✅
     * viewModel.bind('stats.hp', view);          // ❌ TypeScript 错误
     * 
     * // 类型推断的转换器
     * viewModel.bind('stats.health', view, {
     *     converter: (health) => `Health: ${health}` // ✅ health: number
     * });
     * ```
     */
    bind<P extends Path<T> & string>(
        path: P,
        view: IView,
        options?: BindingOptions<PathValue<T, P>>,
    ): DataBinding<T, PathValue<T, P>> {
        Logger.debug(LogCategory.VIEWMODEL, `Creating binding`, {
            path,
            mode: options?.mode || 'one-way'
        });
        
        const binding = new DataBinding<T, PathValue<T, P>>(this._reactive, view, path, options);
        this.bindings.push(binding);
        
        // 注册调试钩子
        if (this.debugHook) {
            this.debugHook.registerBinding(binding);
        }
        
        return binding;
    }
    
    /**
     * 批量绑定方法
     * 
     * @template P 路径类型（从 Path<T> 推断）
     * @param bindings 批量绑定配置对象
     * @returns 绑定映射（路径 -> DataBinding）
     * 
     * @example
     * ```typescript
     * interface PlayerData {
     *     name: string;
     *     stats: { health: number; level: number };
     * }
     * 
     * const viewModel = new ViewModel<PlayerData>(model);
     * const view = new MyView();
     * 
     * // 批量绑定
     * const bindings = viewModel.bindMany({
     *     name: { view, options: { mode: 'two-way' } },
     *     'stats.health': { view, options: { mode: 'one-way' } },
     *     'stats.level': { view, options: { mode: 'one-way' } }
     * });
     * 
     * // 访问特定绑定
     * const nameBinding = bindings.get('name');
     * ```
     */
    bindMany<P extends Path<T> & string>(
        bindings: Record<P, BatchBindingItem<T, P>>
    ): Map<P, DataBinding<T, PathValue<T, P>>> {
        const result = new Map<P, DataBinding<T, PathValue<T, P>>>();
        
        for (const [path, config] of Object.entries(bindings) as [P, BatchBindingItem<T, P>][]) {
            const binding = this.bind(path, config.view, config.options);
            result.set(path, binding);
        }
        
        return result;
    }
    
    /**
     * 声明式绑定配置方法
     * 
     * @param config 绑定配置对象
     * @returns 绑定映射（路径 -> DataBinding）
     * 
     * @example
     * ```typescript
     * interface PlayerData {
     *     name: string;
     *     stats: { health: number; level: number };
     * }
     * 
     * const viewModel = new ViewModel<PlayerData>(model);
     * const view = new MyView();
     * 
     * // 声明式绑定配置
     * const bindings = viewModel.bindConfig({
     *     view,
     *     bindings: {
     *         name: { mode: 'two-way' },
     *         'stats.health': { 
     *             mode: 'one-way', 
     *             converter: (health) => `HP: ${health}` 
     *         },
     *         'stats.level': { mode: 'one-way' }
     *     }
     * });
     * ```
     */
    bindConfig(config: BindingConfig<T>): Map<string, DataBinding<T, any>> {
        const result = new Map<string, DataBinding<T, any>>();
        
        for (const [path, options] of Object.entries(config.bindings)) {
            const binding = this.bind(
                path as Path<T> & string, 
                config.view, 
                options as BindingOptions<any> | undefined
            );
            result.set(path, binding);
        }
        
        return result;
    }
    
    /**
     * 解绑
     * @param binding 数据绑定对象
     */
    unbind(binding: DataBinding<T, any, any>): void {
        const index = this.bindings.indexOf(binding);
        if (index !== -1) {
            this.bindings.splice(index, 1);
            
            // 注销调试钩子
            if (this.debugHook) {
                this.debugHook.unregisterBinding(binding);
            }
            
            binding.destroy();
        }
    }
    
    /**
     * 获取所有绑定（用于调试）
     * @internal
     */
    getBindings(): ReadonlyArray<DataBinding<T, any, any>> {
        return this.bindings;
    }
    
    /**
     * 销毁视图模型
     */
    destroy(): void {
        if (this.debugHook) {
            Debugger.unregisterHook(this);
        }
        this.bindings.forEach(binding => binding.destroy());
        this.bindings = [];
    }
}

import type { IReactive, IView, BindingOptions } from '../core/types';
import type { DataBinding as IDataBinding } from '../core/types';
import { Reactive } from '../reactive/Reactive';
import { Watcher } from '../reactive/Watcher';
import { BindingError, ValidationError } from '../core/types';
import { Debugger } from '../debug/Debugger';
import { BindingDebugHook } from '../debug/hooks/BindingDebugHook';
import { Logger, LogCategory } from '../debug/Logger';
import { PerformanceMonitor } from '../debug/PerformanceMonitor';

/**
 * 数据绑定
 * 
 * 连接响应式数据和视图
 * 
 * @template TData 数据对象的类型
 * @template TValue 数据值的类型（从路径推断）
 * @template TViewValue 视图值的类型
 * 
 * @example
 * ```typescript
 * interface PlayerData {
 *     name: string;
 *     level: number;
 * }
 * 
 * const reactive = new Reactive<PlayerData>({ name: 'John', level: 1 });
 * const view = new MyView();
 * 
 * // 类型安全的绑定
 * const binding = new DataBinding<PlayerData, string, string>(
 *     reactive, 
 *     view, 
 *     'name', 
 *     {
 *         mode: 'two-way',
 *         converter: (value: string) => value.toUpperCase() // ✅ value 是 string
 *     }
 * );
 * 
 * // 修改数据会自动更新视图
 * reactive.value.name = 'Jane'; // 视图自动更新为 'JANE'
 * ```
 */
export class DataBinding<TData = any, TValue = any, TViewValue = any> implements IDataBinding<TData, TValue, TViewValue> {
    private reactive: IReactive<TData>;
    private view: IView;
    private path: string;
    private options: Required<Omit<BindingOptions<TValue, TViewValue>, 'onError'>> & { onError?: BindingOptions<TValue, TViewValue>['onError'] };
    private watcher: Watcher | null = null;
    private unsubscribe?: () => void;
    private viewUnsubscribe?: () => void;
    private syncingToView = false;
    private syncingToSource = false;
    private debugHook?: BindingDebugHook;
    
    constructor(
        reactive: IReactive<TData>,
        view: IView,
        path: string,
        options?: BindingOptions<TValue, TViewValue>,
    ) {
        this.reactive = reactive;
        this.view = view;
        this.path = path;
        this.options = {
            mode: options?.mode || 'one-way',
            converter: options?.converter || ((v: TValue) => v as unknown as TViewValue),
            reverseConverter: options?.reverseConverter || ((v: TViewValue) => v as unknown as TValue),
            validator: options?.validator || (() => true),
            ...(options?.onError && { onError: options.onError }),
        };
        
        // 如果调试已启用，创建调试钩子
        if (Debugger.isEnabled()) {
            this.debugHook = new BindingDebugHook(this);
            Debugger.registerHook(this, this.debugHook);
        }
        
        this._setupBinding();
    }
    
    /**
     * 获取绑定路径（用于调试）
     * @internal
     */
    getPath(): string {
        return this.path;
    }
    
    /**
     * 获取绑定模式（用于调试）
     * @internal
     */
    getMode(): 'one-way' | 'two-way' | 'one-way-to-source' {
        return this.options.mode;
    }
    
    /**
     * 获取视图（用于调试）
     * @internal
     */
    getView(): IView {
        return this.view;
    }
    
    /**
     * 检查绑定是否活跃（用于调试）
     * @internal
     */
    getIsActive(): boolean {
        return this.watcher !== null && this.unsubscribe !== undefined;
    }
    
    /**
     * 设置绑定
     */
    private _setupBinding(): void {
        // 创建观察者
        this.watcher = new Watcher(
            () => {
                // 运行回调：更新视图 不支持 one-way-to-source 模式
                if (this.options.mode !== 'one-way-to-source') {
                    const value = this._getValue(this.reactive.value, this.path);
                    this._updateView(value);
                }
            }
        );
        
        // 监听响应式数据变化
        this.unsubscribe = this.reactive.watch(this.watcher);
        
        // 双向绑定：监听视图变化
        if (this.options.mode === 'two-way' || this.options.mode === 'one-way-to-source') {
            this._setupViewListener();
        }
        
        // 初始更新已经在 watch() 中的 run() 回调中完成了
    }
    
    /**
     * 设置视图监听器（双向绑定）
     */
    private _setupViewListener(): void {
        // 监听视图的 change 事件
        this.viewUnsubscribe = this.view.on('change', (path: string, value: any) => {
            if (path !== this.path) return;
            if (this.syncingToView) return; // 防：view.update 引起的 change
            
            this._updateSource(value);
        });
    }
    
    /**
     * 更新视图
     */
    private _updateView(value: any): void {
        if (this.options.mode === 'one-way-to-source') return;
        
        const startTime = PerformanceMonitor.isTracking() ? performance.now() : 0;
        
        try {
            // 验证
            if (this.options.validator && !this.options.validator(value)) {
                const error = new ValidationError(
                    `Validation failed for path: ${this.path}`,
                    this.path,
                    value
                );
                if (this.options.onError) {
                    this.options.onError(error, this.path, value);
                    return;
                }
                throw error;
            }
            
            // 转换
            const convertedValue = this.options.converter(value);
            
            this.syncingToView = true;

            // 更新视图
            try {
                this.view.update(this.path, convertedValue);
            } finally {
                this.syncingToView = false;
            }
            
            // 记录性能数据
            if (PerformanceMonitor.isTracking() && startTime > 0) {
                const duration = performance.now() - startTime;
                PerformanceMonitor.recordBindingExecution(duration);
            }
            
            Logger.debug(LogCategory.BINDING, `View updated`, {
                path: this.path,
                value: convertedValue
            });
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            
            Logger.error(LogCategory.BINDING, `View update failed`, {
                path: this.path,
                value,
                error: err.message
            });
            
            if (this.debugHook) {
                this.debugHook.recordError(err, { path: this.path, value });
            }
            if (this.options.onError) {
                this.options.onError(err, this.path, value);
            } else {
                throw error;
            }
        }
    }
    
    /**
     * 更新数据源（双向绑定）
     */
    private _updateSource(value: any): void {
        if (this.options.mode === 'one-way') return;

        try {
            // 反向转换
            const convertedValue = this.options.reverseConverter(value);
            
            // 验证
            if (this.options.validator && !this.options.validator(convertedValue)) {
                const error = new ValidationError(
                    `Validation failed for path: ${this.path}`,
                    this.path,
                    convertedValue
                );
                if (this.options.onError) {
                    this.options.onError(error, this.path, value);
                    return;
                }
                throw error;
            }

            this.syncingToSource = true;
            
            // 更新响应式数据
            try {
                this._setValue(this.reactive.value, this.path, convertedValue);
            } finally {
                this.syncingToSource = false;
            }
        } catch (error) {
            if (this.options.onError) {
                this.options.onError(error instanceof Error ? error : new Error(String(error)), this.path, value);
            } else {
                throw error;
            }
        }
    }
    
    /**
     * 获取嵌套路径的值
     */
    private _getValue(obj: any, path: string): any {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[key];
        }
        return value;
    }
    
    /**
     * 设置嵌套路径的值
     */
    private _setValue(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        let target = obj;
        
        for (const key of keys) {
            if (target[key] === null || target[key] === undefined) {
                target[key] = {};
            }
            target = target[key];
        }
        
        target[lastKey] = value;
    }
    
    /**
     * 销毁绑定
     */
    destroy(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
        
        if (this.viewUnsubscribe) {
            this.viewUnsubscribe();
            this.viewUnsubscribe = undefined;
        }
        
        this.watcher = null;
    }
}

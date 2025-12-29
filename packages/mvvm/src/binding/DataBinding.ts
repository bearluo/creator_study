import type { IReactive, IView, BindingOptions } from '../core/types';
import type { DataBinding as IDataBinding } from '../core/types';
import { Reactive } from '../reactive/Reactive';
import { Watcher } from '../reactive/Watcher';
import { BindingError } from '../core/types';

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
    private reactive: Reactive<TData>;
    private view: IView;
    private path: string;
    private options: Required<BindingOptions<TValue, TViewValue>>;
    private watcher: Watcher | null = null;
    private unsubscribe?: () => void;
    private viewUnsubscribe?: () => void;
    private syncingToView = false;
    private syncingToSource = false;
    
    constructor(
        reactive: Reactive<TData>,
        view: IView,
        path: string,
        options?: BindingOptions<TValue, TViewValue>
    ) {
        this.reactive = reactive;
        this.view = view;
        this.path = path;
        this.options = {
            mode: options?.mode || 'one-way',
            converter: options?.converter || ((v: TValue) => v as unknown as TViewValue),
            reverseConverter: options?.reverseConverter || ((v: TViewValue) => v as unknown as TValue),
            validator: options?.validator || (() => true),
        };
        
        this._setupBinding();
    }
    
    /**
     * 设置绑定
     */
    private _setupBinding(): void {
        // 创建观察者
        this.watcher = new Watcher(
            (key, newValue, oldValue) => {
            },
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
        // 验证
        if (this.options.validator && !this.options.validator(value)) {
            throw new BindingError(`Validation failed for path: ${this.path}`);
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
    }
    
    /**
     * 更新数据源（双向绑定）
     */
    private _updateSource(value: any): void {
        if (this.options.mode === 'one-way') return;

        // 反向转换
        const convertedValue = this.options.reverseConverter(value);
        
        // 验证
        if (this.options.validator && !this.options.validator(convertedValue)) {
            throw new BindingError(`Validation failed for path: ${this.path}`);
        }

        
        this.syncingToSource = true;
        
        // 更新响应式数据
        try {
            this._setValue(this.reactive.value, this.path, convertedValue);
        } finally {
            this.syncingToSource = false;
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

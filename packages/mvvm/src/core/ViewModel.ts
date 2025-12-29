import type { IViewModel, IModel, IView, BindingOptions } from './types';
import { Reactive } from '../reactive/Reactive';
import { DataBinding } from '../binding/DataBinding';

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
    protected _reactive: Reactive<T>;
    private bindings: DataBinding<T, any, any>[] = [];
    
    constructor(model: IModel<T>) {
        this._model = model;
        this._reactive = new Reactive(model.data);
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
    get reactive(): Reactive<T> {
        return this._reactive;
    }
    
    /**
     * 绑定数据到视图
     * @param path 数据路径
     * @param view 视图
     * @param options 绑定选项
     * @returns 数据绑定对象
     */
    bind<TValue = any, TViewValue = any>(
        path: string, 
        view: IView, 
        options?: BindingOptions<TValue, TViewValue>
    ): DataBinding<T, TValue, TViewValue> {
        const binding = new DataBinding<T, TValue, TViewValue>(this._reactive, view, path, options);
        this.bindings.push(binding);
        return binding;
    }
    
    /**
     * 解绑
     * @param binding 数据绑定对象
     */
    unbind(binding: DataBinding<T, any, any>): void {
        const index = this.bindings.indexOf(binding);
        if (index !== -1) {
            this.bindings.splice(index, 1);
            binding.destroy();
        }
    }
    
    /**
     * 销毁视图模型
     */
    destroy(): void {
        this.bindings.forEach(binding => binding.destroy());
        this.bindings = [];
    }
}

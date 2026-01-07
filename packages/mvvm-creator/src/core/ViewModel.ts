import { BindingOptions, DataBinding, IView, Model, Path, PathValue, ViewModel as ViewModelBase } from '@bl-framework/mvvm';
import { BindingBuilder } from '../builders';
import { ViewTarget } from '../types';

function isViewTarget(x: unknown): x is ViewTarget<any> {
    // ViewTarget 接口：set (必需), get (可选), onChange (可选), dispose (可选)
    // 关键特征：必须有 set 方法，没有 update/on/destroy 方法
    // 通过检查没有 update 和 on 方法来区分 IView
    return (
        typeof x === 'object' &&
        x !== null &&
        typeof (x as any).set === 'function' &&
        typeof (x as any).update !== 'function' && // IView 有 update，ViewTarget 没有
        typeof (x as any).on !== 'function'        // IView 有 on，ViewTarget 没有
    );
}

function isIView(x: unknown): x is IView {
    // IView 接口：update, get, set, on, destroy (都是必需)
    // 关键特征：必须有 update 和 on 方法，这是 IView 独有的
    return (
        typeof x === 'object' &&
        x !== null &&
        typeof (x as any).update === 'function' && // IView 特有
        typeof (x as any).get === 'function' &&
        typeof (x as any).set === 'function' &&
        typeof (x as any).on === 'function' &&     // IView 特有
        typeof (x as any).destroy === 'function'
    );
}

export class ViewModel<T = any> extends ViewModelBase<T> {
    // protected bindingBuilder!: BindingBuilder<T>;
    constructor(model: Model<T>)  {
        super(model);
        // this.bindingBuilder = new BindingBuilder<T>(this);
    }
    // 1️⃣ 绑定 IView（旧用法，保留）
    override bind<P extends Path<T> & string>(path: P, view: IView, options?: BindingOptions<PathValue<T, P>>): DataBinding<T, PathValue<T, P>>;
    // 2️⃣ 绑定单个 ViewTarget（新用法）
    override bind<P extends Path<T> & string, TV = PathValue<T, P>>(
        path: P,
        target: ViewTarget<TV>,
        options?: BindingOptions<PathValue<T, P>, TV>,
    ): DataBinding<T, PathValue<T, P>>;
    override bind(path: any, viewOrTarget: any, options?: any): DataBinding<T, any> {
        // 调用父类的 bind 方法，实现扩展或兼容
        if (isIView(viewOrTarget)) {
            return super.bind(path, viewOrTarget, options);
        }
        if (isViewTarget(viewOrTarget)) {
            return this._bindViewTarget(path, viewOrTarget, options);
        }
        throw new Error('Invalid view or target');
    }

    /**
     * 将单个 ViewTarget 适配为 IView，然后绑定
     * 
     * @param path 数据路径
     * @param target ViewTarget 实例
     * @param options 绑定选项
     * @returns DataBinding 实例
     */
    private _bindViewTarget<P extends Path<T> & string, TV = PathValue<T, P>>(
        path: P,
        target: ViewTarget<TV>,
        options?: BindingOptions<PathValue<T, P>, TV>,
    ): DataBinding<T, PathValue<T, P>> {
        // 维护 change 事件监听器列表（用于 set 方法触发 change 事件）
        const changeListeners = new Set<(path: string, value: any) => void>();
        
        // 如果 target 支持 onChange，注册监听（用于双向绑定）
        let targetUnsubscribe: (() => void) | undefined;
        if (target.onChange) {
            targetUnsubscribe = target.onChange((value: TV) => {
                // target 的值变化时，通知所有 change 监听器
                for (const listener of changeListeners) {
                    listener(path, value);
                }
            });
        }
        
        // 创建一个简单的 IView 适配器，包装单个 ViewTarget
        const adapter: IView = {
            update: (_path: string, value: any) => {
                // update 方法：只更新值，不触发 change 事件（程序更新）
                target.set(value as TV);
            },
            
            get: (_path: string): any => {
                // ViewTarget.get 是可选的，需要检查
                return target.get?.();
            },
            
            set: (_path: string, value: any) => {
                // set 方法：更新值并触发 change 事件（模拟用户输入）
                target.set(value as TV);
                
                // 手动触发 change 事件（通知所有监听器）
                for (const listener of changeListeners) {
                    listener(path, value);
                }
            },
            
            on: (event: string, callback: (...args: any[]) => void) => {
                if (event === 'change') {
                    const listener = callback as (path: string, value: any) => void;
                    changeListeners.add(listener);
                    
                    return () => {
                        changeListeners.delete(listener);
                    };
                }
                
                // 其他事件不支持
                console.warn(`[ViewModel._bindViewTarget] Unsupported event "${event}" for ViewTarget`);
                return () => {};
            },
            
            destroy: () => {
                // 清理 target 的 onChange 订阅
                targetUnsubscribe?.();
                
                // 清空 change 监听器
                changeListeners.clear();
                
                // 调用 target 的 dispose 方法（如果存在）
                target.dispose?.();
            }
        };
        
        // 调用父类的 bind 方法，传入适配后的 IView
        return super.bind(path, adapter, options);
    }
}

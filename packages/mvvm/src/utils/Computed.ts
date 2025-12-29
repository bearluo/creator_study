import { Reactive } from '../reactive/Reactive';
import { Watcher } from '../reactive/Watcher';
import type { IReactive } from '../core/types';

/**
 * 计算属性
 * 
 * 基于响应式数据计算派生值，自动缓存和更新
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ firstName: 'John', lastName: 'Doe' });
 * 
 * const fullName = new Computed(() => {
 *     return `${reactive.value.firstName} ${reactive.value.lastName}`;
 * }, reactive);
 * 
 * console.log(fullName.value); // 'John Doe'
 * 
 * reactive.value.firstName = 'Jane';
 * console.log(fullName.value); // 'Jane Doe' (自动更新)
 * ```
 */
export class Computed<T> implements IReactive<T> {
    private computeFn: () => T;
    private reactive: Reactive<any>;
    private _value: T;
    private _cached: boolean = false;
    private watcher: Watcher;
    
    constructor(computeFn: () => T, reactive: Reactive<any>) {
        this.computeFn = computeFn;
        this.reactive = reactive;
        this._value = undefined as any;
        
        // 创建观察者，当依赖变化时重新计算
        this.watcher = new Watcher(
            (key, newValue, oldValue) => {
                // 只处理收集到的依赖（精确更新）
                if (this.watcher.getDependencies().has(key)) {
                    this._cached = false;
                }
            },
            () => {
                // 运行回调：在依赖收集期间执行计算函数以收集依赖
                // 这里会访问响应式属性，从而收集依赖
                this._compute();
            }
        );
        
        this.reactive.watch(this.watcher);
        
        // 初始值已经通过 watch() 中的 run() 计算了
    }
    
    /**
     * 获取计算值
     */
    get value(): T {
        if (!this._cached) {
            // 设置当前 watcher 以收集依赖
            const tracker = this.reactive.getDependencyTracker();
            tracker.setCurrentWatcher(this.watcher);
            
            try {
                this._compute();
            } finally {
                // 清除当前 watcher
                tracker.setCurrentWatcher(null);
            }
        }
        return this._value;
    }
    
    /**
     * 计算值
     */
    private _compute(): void {
        this._value = this.computeFn();
        this._cached = true;
    }
    
    /**
     * 添加观察者（实现 IReactive 接口）
     */
    watch(watcher: any): () => void {
        // 计算属性本身不直接支持 watch
        // 可以通过监听依赖的 reactive 来实现
        return this.reactive.watch(watcher);
    }
    
    /**
     * 移除观察者（实现 IReactive 接口）
     */
    unwatch(watcher: any): void {
        this.reactive.unwatch(watcher);
    }
}

import type { IReactive, Watcher } from '../core/types';
import { DependencyTracker } from './DependencyTracker';

/**
 * 响应式数据
 * 
 * 使用 Proxy 实现自动依赖追踪和更新通知
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ name: 'John', age: 30 });
 * 
 * // 创建观察者
 * const watcher = new WatcherImpl((key, newValue, oldValue) => {
 *     console.log(`${key} changed:`, oldValue, '->', newValue);
 * });
 * 
 * // 监听变化
 * reactive.watch(watcher);
 * 
 * // 修改值（自动触发更新）
 * reactive.value.name = 'Jane'; // 输出: name changed: John -> Jane
 * ```
 */
export class Reactive<T> implements IReactive<T> {
    private _value: T;
    private _proxy: T;
    private watchers: Set<Watcher> = new Set();
    
    /** 依赖追踪器 */
    private dependencyTracker: DependencyTracker;
    
    /** 更新队列（用于批量更新和去重） */
    private updateQueue: Set<Watcher> = new Set();
    
    /** 是否已调度批量更新 */
    private flushScheduled: boolean = false;
    
    /** 已创建的 Proxy 映射（用于处理循环引用） */
    private proxyMap: WeakMap<object, any> = new WeakMap();
    
    constructor(value: T) {
        this._value = value;
        this.dependencyTracker = new DependencyTracker();
        this._proxy = this._createProxy(value, '');
    }
    
    /**
     * 获取响应式值
     */
    get value(): T {
        return this._proxy;
    }
    
    /**
     * 获取依赖追踪器（用于 Computed 等需要精确依赖追踪的场景）
     * @internal
     */
    getDependencyTracker(): DependencyTracker {
        return this.dependencyTracker;
    }
    
    /**
     * 添加观察者
     * @param watcher 观察者
     * @returns 取消监听的函数
     */
    watch(watcher: Watcher): () => void {
        this.watchers.add(watcher);
        this._runWithTracking(watcher);
        return () => this.unwatch(watcher);
    }
    
    /**
     * 移除观察者
     * @param watcher 观察者
     */
    unwatch(watcher: Watcher): void {
        this.watchers.delete(watcher);
        // 从依赖追踪器中移除
        this.dependencyTracker.removeWatcher(watcher);
    }
    
    /**
     * 创建 Proxy
     * @param target 目标对象
     * @param parentPath 父路径（用于构建完整路径）
     */
    private _createProxy<U>(target: U, parentPath: string = ''): U {
        if (target === null || typeof target !== 'object') {
            return target;
        }
        
        // 检查是否已经创建过 Proxy（处理循环引用）
        if (this.proxyMap.has(target as object)) {
            return this.proxyMap.get(target as object);
        }
        
        // 如果是数组，特殊处理
        if (Array.isArray(target)) {
            return this._createArrayProxy(target as any, parentPath) as U;
        }
        
        // 对象 Proxy
        const proxy = new Proxy(target, {
            get: (obj, key, receiver) => {
                const value = Reflect.get(obj, key , receiver);
                
                // 构建当前属性的完整路径
                const currentPath = parentPath ? `${parentPath}.${String(key)}` : String(key);
                
                // 依赖收集（只在有当前 watcher 时，使用完整路径）
                this.dependencyTracker.track(currentPath);
                
                // 递归创建 Proxy（传递完整路径）
                // _createProxy 内部会自动判断是否是对象/数组，非对象类型会直接返回原值
                return this._createProxy(value, currentPath);
            },
            set: (obj, key, value) => {
                const oldValue = Reflect.get(obj, key);
                
                // 如果值相同，不触发更新
                if (oldValue === value) {
                    return true;
                }
                
                Reflect.set(obj, key, value);
                
                // 构建完整路径并触发更新
                const fullPath = parentPath ? `${parentPath}.${String(key)}` : String(key);
                this._triggerUpdate(fullPath, value, oldValue);
                
                return true;
            },
            deleteProperty: (obj, key) => {
                const oldValue = Reflect.get(obj, key);
                const result = Reflect.deleteProperty(obj, key);
                
                if (result) {
                    // 构建完整路径并触发更新
                    const fullPath = parentPath ? `${parentPath}.${String(key)}` : String(key);
                    this._triggerUpdate(fullPath, undefined, oldValue);
                }
                
                return result;
            }
        });
        
        // 缓存 Proxy（用于处理循环引用）
        this.proxyMap.set(target as object, proxy);
        
        return proxy;
    }
    
    /**
     * 创建数组 Proxy
     * @param target 目标数组
     * @param parentPath 父路径（用于构建完整路径）
     */
    private _createArrayProxy<U>(target: U[], parentPath: string = ''): U[] {
        // 检查是否已经创建过 Proxy（处理循环引用）
        if (this.proxyMap.has(target)) {
            return this.proxyMap.get(target);
        }
        
        const proxy = new Proxy(target, {
            get: (arr, key, receiver) => {
                const value = Reflect.get(arr, key, receiver);
                
                // 构建当前属性的完整路径
                const currentPath = parentPath ? `${parentPath}.${String(key)}` : String(key);
                
                // 依赖收集（只在有当前 watcher 时，使用完整路径）
                this.dependencyTracker.track(currentPath);
                
                // 递归创建 Proxy（传递完整路径）
                // _createProxy 内部会自动判断是否是对象/数组，非对象类型会直接返回原值
                return this._createProxy(value, currentPath) as any;
            },
            set: (arr, key, value, receiver) => {
                const oldValue = Reflect.get(arr, key, receiver);
                
                // 如果值相同，不触发更新
                if (oldValue === value) {
                    return true;
                }

                const result = Reflect.set(arr, key, value, receiver);
                if (!result) return false;

                // 构建完整路径并触发更新
                // 对于数组，key 可能是数字索引或属性名
                const fullPath = parentPath ? `${parentPath}.${String(key)}` : String(key);
                this._triggerUpdate(fullPath, value, oldValue);

                // ✅ 关键：数组结构/内容变化时，同时触发数组本身
                if (parentPath) {
                    this._triggerUpdate(parentPath, arr, arr);
                    this._triggerUpdate(`${parentPath}.length`, (arr as any).length, (arr as any).length);
                }

                return true;
            },
            deleteProperty: (arr, key) => {
                const oldValue = Reflect.get(arr, key);
                const result = Reflect.deleteProperty(arr, key);
                
                if (result) {
                    // 构建完整路径并触发更新
                    const fullPath = parentPath ? `${parentPath}.${String(key)}` : String(key);
                    this._triggerUpdate(fullPath, undefined, oldValue);
                    // ✅ 同步触发数组整体
                    if (parentPath) {
                        this._triggerUpdate(parentPath, arr, arr);
                        this._triggerUpdate(`${parentPath}.length`, (arr as any).length, (arr as any).length);
                    }
                }
                
                return result;
            }
        });
        
        // 缓存 Proxy（用于处理循环引用）
        this.proxyMap.set(target, proxy);
        
        return proxy;
    }
    
    /**
     * 触发更新
     */
    private _triggerUpdate(path: string, newValue: any, oldValue: any): void {
        // 使用依赖追踪器获取相关的 watcher
        const watchers = this.dependencyTracker.getWatchers(path);
        
        // 添加到更新队列（用于批量更新 run 回调，自动去重）
        watchers.forEach(watcher => {
            this.updateQueue.add(watcher);
        });
        
        // 调度批量更新
        this._scheduleFlush();
    }
    
    /**
     * 调度批量更新
     */
    private _scheduleFlush(): void {
        if (this.flushScheduled) {
            return;
        }
        
        this.flushScheduled = true;
        // 使用 Promise.resolve().then() 实现 nextTick
        Promise.resolve().then(() => {
            this._flushUpdates();
        });
    }
    
    /**
     * 刷新更新队列
     */
    private _flushUpdates(): void {
        this.flushScheduled = false;
        
        // 收集需要更新的 watcher（自动去重）
        const watchersToUpdate = new Set(this.updateQueue);
        this.updateQueue.clear();
        
        // 批量更新 run 回调
        watchersToUpdate.forEach(w => {
            if (!this.watchers.has(w)) return; // watcher 已 unwatch/destroy
            this._runWithTracking(w);
        });
    }

    private _runWithTracking(watcher: Watcher) {
        // 先清理旧依赖（防止依赖累积、过期依赖继续触发）
        this.dependencyTracker.removeWatcher(watcher);

        this.dependencyTracker.setCurrentWatcher(watcher);
        try {
            watcher.run();
        } finally {
            this.dependencyTracker.setCurrentWatcher(null);
        }
    }
}

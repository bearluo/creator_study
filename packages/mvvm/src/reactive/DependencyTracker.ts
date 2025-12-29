import type { Watcher } from '../core/types';

/**
 * 依赖追踪器
 * 
 * 追踪响应式数据的依赖关系
 */
export class DependencyTracker {
    /** 当前观察者 */
    private currentWatcher: Watcher | null = null;
    
    /** 依赖映射 (完整路径 -> Set<Watcher>) */
    private dependencies: Map<string, Set<Watcher>> = new Map();
    
    /** 当前路径栈（用于追踪嵌套属性的完整路径） */
    private pathStack: string[] = [];
    
    /**
     * 追踪依赖
     * @param key 属性键
     * @param fullPath 完整路径（可选，如果不提供则使用当前路径栈构建）
     */
    track(key: string | symbol, fullPath?: string): void {
        if (this.currentWatcher) {
            // 构建完整路径
            const path = fullPath || this._buildPath(key);
            
            let watchers = this.dependencies.get(path);
            if (!watchers) {
                watchers = new Set();
                this.dependencies.set(path, watchers);
            }
            watchers.add(this.currentWatcher);
            this.currentWatcher.addDependency(path);
        }
    }
    
    /**
     * 构建完整路径
     * @param key 当前 key
     * @returns 完整路径
     */
    private _buildPath(key: string | symbol): string {
        if (this.pathStack.length === 0) return String(key);
        return this.pathStack.join('.');
    }
    
    /**
     * 推入路径栈
     * @param key 属性键
     */
    pushPath(key: string | symbol): void {
        this.pathStack.push(String(key));
    }
    
    /**
     * 弹出路径栈
     */
    popPath(): void {
        this.pathStack.pop();
    }
    
    /**
     * 获取当前路径
     */
    getCurrentPath(): string {
        return this.pathStack.join('.');
    }
    
    /**
     * 触发依赖更新
     * @param key 属性键
     * @param newValue 新值
     * @param oldValue 旧值
     */
    trigger(key: string | symbol, newValue: any, oldValue: any): void {
        const k = String(key);
        // 精确命中
        this.dependencies.get(k)?.forEach(w => w.update(k, newValue, oldValue));
    }
    
    /**
     * 获取监听指定 key 的所有 watcher
     * @param key 属性键
     * @returns watcher 集合
     */
    getWatchers(key: string | symbol): Set<Watcher> {
        const k = String(key);
        return this.dependencies.get(k) || new Set();
    }
    
    /**
     * 设置当前观察者
     * @param watcher 观察者
     */
    setCurrentWatcher(watcher: Watcher | null): void {
        this.currentWatcher = watcher;
    }
    
    /**
     * 移除观察者
     * @param watcher 观察者
     */
    removeWatcher(watcher: Watcher): void {
        watcher.getDependencies().forEach(key => {
            const k = String(key);
            const watchers = this.dependencies.get(k);
            if (watchers) {
                watchers.delete(watcher);
                if (watchers.size === 0) {
                    this.dependencies.delete(k);
                }
            }
        });
        watcher.clearDependencies();
    }
    
    /**
     * 清除所有依赖
     */
    clear(): void {
        this.dependencies.clear();
        this.currentWatcher = null;
        this.pathStack.length = 0;
    }
}

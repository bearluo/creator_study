import type { Watcher } from '../core/types';

/**
 * 依赖追踪器
 * 
 * 追踪响应式数据的依赖关系
 * 
 * 职责：
 * - 维护依赖映射（fullPath -> Set<Watcher>）
 * - 管理当前 watcher（用于依赖收集）
 * - fullPath 由 Reactive 构建并传入，不再维护 pathStack
 */
export class DependencyTracker {
    /** 当前观察者 */
    private currentWatcher: Watcher | null = null;
    
    /** 依赖映射 (完整路径 -> Set<Watcher>) */
    private dependencies: Map<string, Set<Watcher>> = new Map();
    
    /**
     * 追踪依赖
     * @param fullPath 完整路径（由 Reactive 构建并传入）
     */
    track(fullPath: string): void {
        if (this.currentWatcher) {
            let watchers = this.dependencies.get(fullPath);
            if (!watchers) {
                watchers = new Set();
                this.dependencies.set(fullPath, watchers);
            }
            watchers.add(this.currentWatcher);
            this.currentWatcher.addDependency(fullPath);
        }
    }
    
    /**
     * 获取监听指定 path 路径 的所有 watcher
     * @param path 路径
     * @returns watcher 集合
     */
    getWatchers(path: string): Set<Watcher> {
        return this.dependencies.get(path) || new Set();
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
        watcher.getDependencies().forEach(path => {
            const watchers = this.dependencies.get(path);
            if (watchers) {
                watchers.delete(watcher);
                if (watchers.size === 0) {
                    this.dependencies.delete(path);
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
    }
}

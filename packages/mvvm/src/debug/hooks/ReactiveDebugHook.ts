import type { Reactive } from '../../reactive/Reactive';
import type { DependencyTracker } from '../../reactive/DependencyTracker';
import type { Watcher as IWatcher } from '../../core/types';
import { Watcher } from '../../reactive/Watcher';
import type { DebugHook, ReactiveState, DependencyGraph, WatcherInfo, PathDependencyInfo, WatcherDependencyInfo } from '../types';
import { Debugger } from '../Debugger';

/**
 * Reactive 调试钩子
 */
export class ReactiveDebugHook implements DebugHook {
    private reactive: Reactive<any>;
    private dependencyTracker: DependencyTracker;
    private updateCount: number = 0;
    private lastUpdateTime: number = 0;
    private totalUpdateTime: number = 0;
    private watcherRunCounts: WeakMap<IWatcher, number> = new WeakMap();
    private watcherLastRunTimes: WeakMap<IWatcher, number> = new WeakMap();
    private watcherTotalRunTimes: WeakMap<IWatcher, number> = new WeakMap();
    
    // 路径更新统计
    private pathUpdateCounts: Map<string, number> = new Map();
    private pathLastUpdateTimes: Map<string, number> = new Map();
    
    constructor(reactive: Reactive<any>, dependencyTracker: DependencyTracker) {
        this.reactive = reactive;
        this.dependencyTracker = dependencyTracker;
    }
    
    getState(): ReactiveState<any> {
        return {
            value: this.reactive.value,
            watchers: this.getWatcherInfos(),
            dependencyGraph: this.getDependencyGraph(),
            stats: {
                updateCount: this.updateCount,
                lastUpdateTime: this.lastUpdateTime,
                averageUpdateTime: this.updateCount > 0 ? this.totalUpdateTime / this.updateCount : 0
            }
        };
    }
    
    getDependencyGraph(): DependencyGraph {
        const paths = new Map<string, PathDependencyInfo>();
        const watchers = new Map<Watcher, WatcherDependencyInfo>();
        
        // 构建路径依赖信息
        const allPaths = new Set<string>();
        
        // 收集所有路径
        for (const watcher of this.getWatchers()) {
            const deps = watcher.getDependencies();
            deps.forEach(path => allPaths.add(path));
        }
        
        // 构建路径依赖关系（路径之间的依赖）
        const pathDependencies = new Map<string, Set<string>>();
        const pathDependents = new Map<string, Set<string>>();
        
        // 初始化依赖关系映射
        for (const path of allPaths) {
            pathDependencies.set(path, new Set());
            pathDependents.set(path, new Set());
        }
        
        // 分析路径之间的依赖关系
        // 如果路径 A 是路径 B 的前缀，则 B 依赖于 A
        for (const path1 of allPaths) {
            for (const path2 of allPaths) {
                if (path1 !== path2) {
                    // 检查 path1 是否是 path2 的前缀（path2 依赖于 path1）
                    if (path2.startsWith(path1 + '.') || path2 === path1) {
                        pathDependencies.get(path2)!.add(path1);
                        pathDependents.get(path1)!.add(path2);
                    }
                }
            }
        }
        
        // 为每个路径构建依赖信息
        for (const path of allPaths) {
            const pathWatchers = this.dependencyTracker.getWatchers(path);
            const pathInfo: PathDependencyInfo = {
                watchers: Array.from(pathWatchers) as Watcher[],
                dependencies: Array.from(pathDependencies.get(path) || []),
                dependents: Array.from(pathDependents.get(path) || []),
                updateCount: this.pathUpdateCounts.get(path) || 0,
                lastUpdateTime: this.pathLastUpdateTimes.get(path) || 0
            };
            paths.set(path, pathInfo);
        }
        
        // 构建 Watcher 依赖信息
        const watcherSet = this.getWatchers();
        for (const watcher of watcherSet) {
            const deps = Array.from(watcher.getDependencies());
            const runCount = this.watcherRunCounts.get(watcher) || 0;
            const lastRunTime = this.watcherLastRunTimes.get(watcher) || 0;
            const totalRunTime = this.watcherTotalRunTimes.get(watcher) || 0;
            
            watchers.set(watcher as Watcher, {
                dependencies: deps,
                runCount,
                lastRunTime,
                averageRunTime: runCount > 0 ? totalRunTime / runCount : 0
            });
        }
        
        return { paths, watchers };
    }
    
    private getWatchers(): ReadonlySet<IWatcher> {
        // 使用 Reactive 的 getWatchers() 方法
        return this.reactive.getWatchers() as ReadonlySet<IWatcher>;
    }
    
    private getWatcherInfos(): WatcherInfo[] {
        const watchers = this.getWatchers();
        return Array.from(watchers).map(watcher => ({
            watcher,
            dependencies: Array.from(watcher.getDependencies()),
            runCount: this.watcherRunCounts.get(watcher) || 0,
            lastRunTime: this.watcherLastRunTimes.get(watcher) || 0,
            isActive: true // 如果 watcher 在集合中，则认为它是活跃的
        }));
    }
    
    /**
     * 记录更新（由 Reactive 调用）
     */
    recordUpdate(duration: number): void {
        this.updateCount++;
        this.lastUpdateTime = Date.now();
        this.totalUpdateTime += duration;
    }
    
    /**
     * 记录路径更新（由 Reactive 调用）
     */
    recordPathUpdate(path: string): void {
        const count = this.pathUpdateCounts.get(path) || 0;
        this.pathUpdateCounts.set(path, count + 1);
        this.pathLastUpdateTimes.set(path, Date.now());
    }
    
    /**
     * 记录 Watcher 运行（由 Reactive 调用）
     */
    recordWatcherRun(watcher: IWatcher, duration?: number): void {
        const count = this.watcherRunCounts.get(watcher) || 0;
        this.watcherRunCounts.set(watcher, count + 1);
        this.watcherLastRunTimes.set(watcher, Date.now());
        
        if (duration !== undefined) {
            const total = this.watcherTotalRunTimes.get(watcher) || 0;
            this.watcherTotalRunTimes.set(watcher, total + duration);
        }
    }
}


import type { Watcher as IWatcher } from '../core/types';

/**
 * Watcher 信息
 */
export interface WatcherInfo {
    watcher: IWatcher;
    dependencies: string[];
    runCount: number;
    lastRunTime: number;
    isActive: boolean;
}

/**
 * 路径依赖信息
 */
export interface PathDependencyInfo {
    /** 依赖此路径的 Watcher 列表 */
    watchers: IWatcher[];
    
    /** 此路径依赖的其他路径 */
    dependencies: string[];
    
    /** 依赖此路径的其他路径 */
    dependents: string[];
    
    /** 更新统计 */
    updateCount: number;
    lastUpdateTime: number;
}

/**
 * Watcher 依赖信息
 */
export interface WatcherDependencyInfo {
    /** 此 Watcher 依赖的路径列表 */
    dependencies: string[];
    
    /** 运行统计 */
    runCount: number;
    lastRunTime: number;
    averageRunTime: number;
}

/**
 * 依赖关系图
 */
export interface DependencyGraph {
    /** 路径到依赖信息的映射 */
    paths: Map<string, PathDependencyInfo>;
    
    /** Watcher 到依赖信息的映射 */
    watchers: Map<IWatcher, WatcherDependencyInfo>;
}

/**
 * Reactive 状态
 */
export interface ReactiveState<T> {
    /** 当前值 */
    value: T;
    
    /** Watcher 信息列表 */
    watchers: WatcherInfo[];
    
    /** 依赖关系图 */
    dependencyGraph: DependencyGraph;
    
    /** 更新统计 */
    stats: {
        updateCount: number;
        lastUpdateTime: number;
        averageUpdateTime: number;
    };
}

/**
 * 模型快照
 */
export interface ModelSnapshot<T> {
    data: T;
    lastUpdateTime: number;
}

/**
 * 绑定信息
 */
export interface BindingInfo {
    path: string;
    mode: 'one-way' | 'two-way' | 'one-way-to-source';
    viewType: string;
    isActive: boolean;
    updateCount: number;
    lastUpdateTime: number;
    error?: ErrorInfo;
}

/**
 * ViewModel 状态
 */
export interface ViewModelState<T> {
    /** 模型快照 */
    model: ModelSnapshot<T>;
    
    /** 绑定信息列表 */
    bindings: BindingInfo[];
    
    /** 绑定统计 */
    stats: {
        bindingCount: number;
        activeBindingCount: number;
        lastBindingTime: number;
    };
}

/**
 * 错误信息
 */
export interface ErrorInfo {
    message: string;
    stack: string[];
    timestamp: number;
    context?: any;
}

/**
 * 绑定状态
 */
export interface BindingState {
    /** 绑定路径 */
    path: string;
    
    /** 绑定模式 */
    mode: 'one-way' | 'two-way' | 'one-way-to-source';
    
    /** 视图类型 */
    viewType: string;
    
    /** 是否活跃 */
    isActive: boolean;
    
    /** 更新统计 */
    stats: {
        updateCount: number;
        lastUpdateTime: number;
        averageUpdateTime: number;
    };
    
    /** 错误信息（如果有） */
    error?: ErrorInfo;
}

/**
 * 调试钩子接口
 * 
 * 核心类实现此接口以支持调试功能
 */
export interface DebugHook {
    /**
     * 获取状态
     */
    getState(): any;
    
    /**
     * 获取依赖关系图（仅 Reactive 需要）
     */
    getDependencyGraph?(): DependencyGraph;
}


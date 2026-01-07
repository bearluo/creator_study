/**
 * MVVM 调试工具使用示例
 * 
 * 展示如何使用 MVVM 调试工具链进行开发和调试
 */

// 注意：示例文件使用相对路径导入，实际使用时请使用 '@bl-framework/mvvm'
import {
    Model,
    ViewModel,
    Reactive,
    Watcher,
    View,
    Debugger,
    Logger,
    LogLevel,
    LogCategory,
    PerformanceMonitor,
    ErrorEnhancer
} from '../src/index';

// ==================== 示例 1: 启用调试功能 ====================

console.log('=== 示例 1: 启用调试功能 ===');

// 启用调试功能（必须在创建 Reactive/ViewModel/DataBinding 之前）
Debugger.enable();

// 创建响应式数据
const reactive = new Reactive({ name: 'John', age: 30 });

// 查询 Reactive 状态
const state = Debugger.getReactiveState(reactive);
console.log('Reactive State:', {
    value: state.value,
    watcherCount: state.watchers.length,
    updateCount: state.stats.updateCount
});

// ==================== 示例 2: 日志系统 ====================

console.log('\n=== 示例 2: 日志系统 ===');

// 启用日志
Logger.enable();

// 设置日志级别
Logger.setLevel(LogLevel.DEBUG);

// 启用特定分类的日志
Logger.setCategoryEnabled(LogCategory.REACTIVE, true);
Logger.setCategoryEnabled(LogCategory.BINDING, true);

// 创建响应式数据（会自动记录日志）
const reactive2 = new Reactive({ count: 0 });

// 手动记录日志
Logger.debug(LogCategory.REACTIVE, 'Reactive created', { value: reactive2.value });
Logger.info(LogCategory.BINDING, 'Binding created', { path: 'count' });

// ==================== 示例 3: 性能监控 ====================

console.log('\n=== 示例 3: 性能监控 ===');

// 启动性能监控
PerformanceMonitor.startTracking();

// 执行一些操作
const reactive3 = new Reactive({ items: Array.from({ length: 1000 }, (_, i) => i) });
const watcher = new Watcher(() => {
    const sum = reactive3.value.items.reduce((acc, item) => acc + item, 0);
});

reactive3.watch(watcher);

// 触发更新
reactive3.value.items.push(1000);

// 等待更新完成
setTimeout(() => {
    // 获取性能统计
    const stats = PerformanceMonitor.getStats();
    console.log('Performance Stats:', {
        reactiveUpdates: {
            count: stats.reactiveUpdates.count,
            averageTime: stats.reactiveUpdates.averageTime.toFixed(2) + 'ms',
            maxTime: stats.reactiveUpdates.maxTime.toFixed(2) + 'ms'
        },
        bindingExecutions: {
            count: stats.bindingExecutions.count,
            averageTime: stats.bindingExecutions.averageTime.toFixed(2) + 'ms'
        }
    });
    
    // 生成性能报告
    const report = PerformanceMonitor.generateReport();
    console.log('\nPerformance Report:');
    console.log(report);
    
    // 停止性能监控
    PerformanceMonitor.stopTracking();
}, 100);

// ==================== 示例 4: 依赖追踪 ====================

console.log('\n=== 示例 4: 依赖追踪 ===');

Debugger.enable();

const reactive4 = new Reactive({
    user: {
        name: 'John',
        profile: {
            age: 30
        }
    }
});

// 创建多个 Watcher
const nameWatcher = new Watcher(() => {
    const _ = reactive4.value.user.name;
});

const ageWatcher = new Watcher(() => {
    const _ = reactive4.value.user.profile.age;
});

reactive4.watch(nameWatcher);
reactive4.watch(ageWatcher);

// 获取依赖关系图
const graph = Debugger.getDependencyGraph(reactive4);

console.log('Dependency Graph:');
graph.paths.forEach((info, path) => {
    console.log(`  Path: ${path}`);
    console.log(`    Watchers: ${info.watchers.length}`);
    console.log(`    Dependencies: ${info.dependencies.join(', ') || 'none'}`);
    console.log(`    Dependents: ${info.dependents.join(', ') || 'none'}`);
    console.log(`    Update Count: ${info.updateCount}`);
});

// 查询特定路径的依赖
const userDependents = Debugger.getPathDependents(reactive4, 'user');
console.log('\nPaths that depend on "user":', userDependents);

// 查询 Watcher 的依赖
const nameWatcherDeps = Debugger.getWatcherDependencies(nameWatcher);
console.log('Name Watcher dependencies:', nameWatcherDeps);

// ==================== 示例 5: ViewModel 调试 ====================

console.log('\n=== 示例 5: ViewModel 调试 ===');

Debugger.enable();

interface PlayerData {
    name: string;
    health: number;
    level: number;
}

class TestView extends View {
    private data: any = {};
    
    update(path: string, value: any): void {
        this.data[path] = value;
    }
    
    get(path: string): any {
        return this.data[path];
    }
    
    set(path: string, value: any): void {
        this.data[path] = value;
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        return () => {};
    }
    
    destroy(): void {}
}

const model = new Model<PlayerData>({
    name: 'Player 1',
    health: 100,
    level: 1
});

const viewModel = new ViewModel(model);
const view = new TestView();

// 创建绑定
viewModel.bind('name', view);
viewModel.bind('health', view);
viewModel.bind('level', view);

// 查询 ViewModel 状态
const vmState = Debugger.getViewModelState(viewModel);
console.log('ViewModel State:', {
    bindingCount: vmState.stats.bindingCount,
    activeBindingCount: vmState.stats.activeBindingCount,
    bindings: vmState.bindings.map(b => ({
        path: b.path,
        mode: b.mode,
        isActive: b.isActive,
        updateCount: b.updateCount
    }))
});

// ==================== 示例 6: 错误增强 ====================

console.log('\n=== 示例 6: 错误增强 ===');

Debugger.enable();

const reactive5 = new Reactive({ value: 42 });
const viewModel2 = new ViewModel(new Model({ count: 0 }));

try {
    // 模拟一个错误
    throw new TypeError('Cannot read property of undefined');
} catch (error) {
    // 增强错误信息
    const enhanced = ErrorEnhancer.enhance(error as Error, {
        reactive: reactive5,
        viewModel: viewModel2,
        customInfo: 'Additional context'
    });
    
    // 格式化并输出错误
    const formatted = ErrorEnhancer.format(enhanced);
    console.log(formatted);
}

// ==================== 示例 7: 完整调试流程 ====================

console.log('\n=== 示例 7: 完整调试流程 ===');

// 1. 启用所有调试功能
Debugger.enable();
Logger.enable();
Logger.setLevel(LogLevel.DEBUG);
PerformanceMonitor.startTracking();

// 2. 创建应用
interface AppData {
    counter: number;
    message: string;
}

const appModel = new Model<AppData>({
    counter: 0,
    message: 'Hello'
});

const appViewModel = new ViewModel(appModel);
const appView = new TestView();

// 3. 创建绑定
const binding1 = appViewModel.bind('counter', appView);
const binding2 = appViewModel.bind('message', appView);

// 4. 查询状态
const appState = Debugger.getViewModelState(appViewModel);
console.log('App State:', {
    bindings: appState.bindings.length,
    activeBindings: appState.stats.activeBindingCount
});

// 5. 执行操作并监控性能
appViewModel.reactive.value.counter = 10;
appViewModel.reactive.value.message = 'World';

// 6. 等待更新完成
setTimeout(() => {
    // 获取性能统计
    const perfStats = PerformanceMonitor.getStats();
    console.log('Performance:', {
        reactiveUpdates: perfStats.reactiveUpdates.count,
        bindingExecutions: perfStats.bindingExecutions.count
    });
    
    // 清理
    PerformanceMonitor.stopTracking();
    Debugger.disable();
    Logger.disable();
}, 100);


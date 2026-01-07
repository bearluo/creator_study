import { Debugger } from '../../src/debug/Debugger';
import { Reactive } from '../../src/reactive/Reactive';
import { ViewModel } from '../../src/core/ViewModel';
import { Model } from '../../src/core/Model';
import { DataBinding } from '../../src/binding/DataBinding';
import { View } from '../../src/core/View';
import { Watcher } from '../../src/reactive/Watcher';

// 创建测试用的 View 实现
class TestView extends View {
    private data: any = {};
    private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
    
    update(path: string, value: any): void {
        this.data[path] = value;
    }
    
    get(path: string): any {
        return this.data[path];
    }
    
    set(path: string, value: any): void {
        this.data[path] = value;
        // 触发 change 事件（用于双向绑定）
        const changeListeners = this.listeners.get('change');
        if (changeListeners) {
            changeListeners.forEach(listener => listener(path, value));
        }
        // 也触发 change:${path} 事件（用于其他场景）
        const pathListeners = this.listeners.get(`change:${path}`);
        if (pathListeners) {
            pathListeners.forEach(listener => listener(value));
        }
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
        
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }
    
    destroy(): void {
        this.listeners.clear();
        this.data = {};
    }
}

describe('Debugger', () => {
    beforeEach(() => {
        Debugger.disable();
    });

    afterEach(() => {
        Debugger.disable();
    });

    describe('enable/disable', () => {
        it('should enable and disable debugger', () => {
            expect(Debugger.isEnabled()).toBe(false);
            
            Debugger.enable();
            expect(Debugger.isEnabled()).toBe(true);
            
            Debugger.disable();
            expect(Debugger.isEnabled()).toBe(false);
        });
    });

    describe('getReactiveState', () => {
        it('should throw error when debugger is not enabled', () => {
            const reactive = new Reactive({ name: 'John' });
            
            expect(() => {
                Debugger.getReactiveState(reactive);
            }).toThrow('Debugger is not enabled');
        });

        it('should get reactive state when enabled', () => {
            Debugger.enable();
            const reactive = new Reactive({ name: 'John', age: 30 });
            
            const state = Debugger.getReactiveState(reactive);
            
            expect(state).toBeDefined();
            expect(state.value).toEqual({ name: 'John', age: 30 });
            expect(Array.isArray(state.watchers)).toBe(true);
            expect(state.dependencyGraph).toBeDefined();
            expect(state.stats).toBeDefined();
        });

        it('should track watchers in reactive state', () => {
            Debugger.enable();
            const reactive = new Reactive({ name: 'John' });
            const watcher = new Watcher(() => {
                // 访问属性以收集依赖
                const _ = reactive.value.name;
            });
            
            reactive.watch(watcher);
            
            const state = Debugger.getReactiveState(reactive);
            expect(state.watchers.length).toBeGreaterThan(0);
        });
    });

    describe('getViewModelState', () => {
        it('should throw error when debugger is not enabled', () => {
            const model = new Model({ name: 'John' });
            const viewModel = new ViewModel(model);
            
            expect(() => {
                Debugger.getViewModelState(viewModel);
            }).toThrow('Debugger is not enabled');
        });

        it('should get viewmodel state when enabled', () => {
            Debugger.enable();
            const model = new Model({ name: 'John', age: 30 });
            const viewModel = new ViewModel(model);
            
            const state = Debugger.getViewModelState(viewModel);
            
            expect(state).toBeDefined();
            expect(state.model.data).toEqual({ name: 'John', age: 30 });
            expect(Array.isArray(state.bindings)).toBe(true);
            expect(state.stats).toBeDefined();
        });

        it('should track bindings in viewmodel state', () => {
            Debugger.enable();
            const model = new Model({ name: 'John' });
            const viewModel = new ViewModel(model);
            const view = new TestView();
            
            viewModel.bind('name', view);
            
            const state = Debugger.getViewModelState(viewModel);
            expect(state.bindings.length).toBe(1);
            expect(state.stats.bindingCount).toBe(1);
        });
    });

    describe('getBindingState', () => {
        it('should throw error when debugger is not enabled', () => {
            const reactive = new Reactive({ name: 'John' });
            const view = new TestView();
            const binding = new DataBinding(reactive, view, 'name');
            
            expect(() => {
                Debugger.getBindingState(binding);
            }).toThrow('Debugger is not enabled');
        });

        it('should get binding state when enabled', () => {
            Debugger.enable();
            const reactive = new Reactive({ name: 'John' });
            const view = new TestView();
            const binding = new DataBinding(reactive, view, 'name');
            
            const state = Debugger.getBindingState(binding);
            
            expect(state).toBeDefined();
            expect(state.path).toBe('name');
            expect(state.mode).toBe('one-way');
            expect(state.isActive).toBe(true);
            expect(state.stats).toBeDefined();
        });
    });

    describe('getDependencyGraph', () => {
        it('should throw error when debugger is not enabled', () => {
            const reactive = new Reactive({ name: 'John' });
            
            expect(() => {
                Debugger.getDependencyGraph(reactive);
            }).toThrow('Debugger is not enabled');
        });

        it('should get dependency graph when enabled', () => {
            Debugger.enable();
            const reactive = new Reactive({ name: 'John', age: 30 });
            const watcher = new Watcher(() => {
                const _ = reactive.value.name;
            });
            
            reactive.watch(watcher);
            
            const graph = Debugger.getDependencyGraph(reactive);
            
            expect(graph).toBeDefined();
            expect(graph.paths).toBeInstanceOf(Map);
            expect(graph.watchers).toBeInstanceOf(Map);
        });
    });

    describe('getWatcherDependencies', () => {
        it('should throw error when debugger is not enabled', () => {
            const watcher = new Watcher(() => {});
            
            expect(() => {
                Debugger.getWatcherDependencies(watcher);
            }).toThrow('Debugger is not enabled');
        });

        it('should get watcher dependencies when enabled', () => {
            Debugger.enable();
            const reactive = new Reactive({ name: 'John', age: 30 });
            const watcher = new Watcher(() => {
                const _ = reactive.value.name;
                const __ = reactive.value.age;
            });
            
            reactive.watch(watcher);
            
            const dependencies = Debugger.getWatcherDependencies(watcher);
            
            expect(Array.isArray(dependencies)).toBe(true);
            expect(dependencies.length).toBeGreaterThan(0);
        });
    });

    describe('getPathDependencies', () => {
        it('should throw error when debugger is not enabled', () => {
            const reactive = new Reactive({ user: { name: 'John' } });
            
            expect(() => {
                Debugger.getPathDependencies(reactive, 'user.name');
            }).toThrow('Debugger is not enabled');
        });

        it('should get path dependencies when enabled', () => {
            Debugger.enable();
            const reactive = new Reactive({ user: { name: 'John', age: 30 } });
            const watcher = new Watcher(() => {
                const _ = reactive.value.user.name;
            });
            
            reactive.watch(watcher);
            
            const dependencies = Debugger.getPathDependencies(reactive, 'user.name');
            expect(Array.isArray(dependencies)).toBe(true);
            // user.name 应该依赖于 user
            expect(dependencies).toContain('user');
        });
    });

    describe('getPathDependents', () => {
        it('should throw error when debugger is not enabled', () => {
            const reactive = new Reactive({ user: { name: 'John' } });
            
            expect(() => {
                Debugger.getPathDependents(reactive, 'user');
            }).toThrow('Debugger is not enabled');
        });

        it('should get path dependents when enabled', () => {
            Debugger.enable();
            const reactive = new Reactive({ user: { name: 'John', age: 30 } });
            const watcher = new Watcher(() => {
                const _ = reactive.value.user.name;
            });
            
            reactive.watch(watcher);
            
            const dependents = Debugger.getPathDependents(reactive, 'user');
            expect(Array.isArray(dependents)).toBe(true);
            // user 应该被 user.name 依赖
            expect(dependents).toContain('user.name');
        });
    });
});


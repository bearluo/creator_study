import { Reactive } from '../../src/reactive/Reactive';
import { Watcher } from '../../src/reactive/Watcher';

describe('Reactive', () => {
    describe('基础功能', () => {
        it('应该创建响应式对象', () => {
            const data = { name: 'John', age: 30 };
            const reactive = new Reactive(data);
            
            expect(reactive.value).toEqual(data);
            expect(reactive.value.name).toBe('John');
            expect(reactive.value.age).toBe(30);
        });
        
        it('应该可以修改值', () => {
            const reactive = new Reactive({ name: 'John' });
            reactive.value.name = 'Jane';
            
            expect(reactive.value.name).toBe('Jane');
        });
        
        it('应该可以添加新属性', () => {
            const reactive = new Reactive({ name: 'John' });
            (reactive.value as any).age = 30;
            
            expect((reactive.value as any).age).toBe(30);
        });
        
        it('应该可以删除属性', () => {
            const reactive = new Reactive<{ name: string; age?: number }>({ name: 'John', age: 30 });
            delete reactive.value.age;
            
            expect((reactive.value as any).age).toBeUndefined();
        });
    });
    
    describe('依赖追踪', () => {
        it('应该追踪属性访问', () => {
            const reactive = new Reactive({ name: 'John', age: 30 });
            let runCount = 0;
            let lastValue: any;
            
            const watcher = new Watcher(() => {
                runCount++;
                // 在 run 回调中访问属性以收集依赖
                lastValue = reactive.value.name;
            });
            
            // 注册 watcher 以收集依赖
            const unsubscribe = reactive.watch(watcher);
            
            // 修改值
            reactive.value.name = 'Jane';
            
            // 等待批量更新
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(runCount).toBeGreaterThan(1); // 至少调用一次（初始）+ 一次（更新）
                    expect(lastValue).toBe('Jane');
                    
                    unsubscribe();
                    resolve();
                }, 10);
            });
        });
        
        it('应该追踪嵌套属性', () => {
            const reactive = new Reactive({
                user: {
                    name: 'John',
                    profile: {
                        age: 30
                    }
                }
            });
            
            let runCount = 0;
            const watcher = new Watcher(() => {
                runCount++;
                // 在 run 回调中访问嵌套属性以收集依赖
                const _ = reactive.value.user.profile.age;
            });
            
            const unsubscribe = reactive.watch(watcher);
            
            // 修改嵌套属性
            reactive.value.user.profile.age = 31;
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(runCount).toBeGreaterThan(1); // 至少调用一次（初始）+ 一次（更新）
                    unsubscribe();
                    resolve();
                }, 10);
            });
        });
        
        it('应该只通知相关的 watcher', () => {
            const reactive = new Reactive({ name: 'John', age: 30 });
            
            let nameRunCount = 0;
            let ageRunCount = 0;
            
            const nameWatcher = new Watcher(() => {
                nameRunCount++;
                // 在 run 回调中访问 name 属性以收集依赖
                const _name = reactive.value.name;
            });
            
            const ageWatcher = new Watcher(() => {
                ageRunCount++;
                // 在 run 回调中访问 age 属性以收集依赖
                const _age = reactive.value.age;
            });
            
            const unsubscribe1 = reactive.watch(nameWatcher);
            const unsubscribe2 = reactive.watch(ageWatcher);
            
            // 重置计数器（watch 时会调用一次 run）
            nameRunCount = 0;
            ageRunCount = 0;
            
            // 只修改 name
            reactive.value.name = 'Jane';
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(nameRunCount).toBeGreaterThan(0);
                    // age 不应该被更新
                    expect(ageRunCount).toBe(0);
                    unsubscribe1();
                    unsubscribe2();
                    resolve();
                }, 10);
            });
        });
    });
    
    describe('数组支持', () => {
        it('应该支持数组', () => {
            const reactive = new Reactive([1, 2, 3]);
            
            expect(reactive.value).toEqual([1, 2, 3]);
            expect(reactive.value[0]).toBe(1);
        });
        
        it('应该可以修改数组元素', () => {
            const reactive = new Reactive([1, 2, 3]);
            reactive.value[0] = 10;
            
            expect(reactive.value[0]).toBe(10);
        });
        
        it('应该追踪数组元素访问', () => {
            const reactive = new Reactive([1, 2, 3]);
            let runCount = 0;
            
            const watcher = new Watcher(() => {
                runCount++;
                // 在 run 回调中访问数组元素以收集依赖
                const _ = reactive.value[0];
            });
            
            const unsubscribe = reactive.watch(watcher);
            
            // 修改数组元素
            reactive.value[0] = 10;
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(runCount).toBeGreaterThan(1); // 至少调用一次（初始）+ 一次（更新）
                    unsubscribe();
                    resolve();
                }, 10);
            });
        });
    });
    
    describe('循环引用处理', () => {
        it('应该处理循环引用', () => {
            const obj: any = { name: 'John' };
            obj.self = obj; // 循环引用
            
            const reactive = new Reactive(obj);
            
            expect(reactive.value.name).toBe('John');
            expect(reactive.value.self).toBe(reactive.value);
            expect(reactive.value.self.self).toBe(reactive.value);
        });
        
        it('应该处理嵌套循环引用', () => {
            const parent: any = { name: 'parent' };
            const child: any = { name: 'child', parent };
            parent.child = child; // 循环引用
            
            const reactive = new Reactive(parent);
            
            expect(reactive.value.name).toBe('parent');
            expect(reactive.value.child.name).toBe('child');
            expect(reactive.value.child.parent).toBe(reactive.value);
        });
    });
    
    describe('批量更新', () => {
        it('应该批量更新', () => {
            const reactive = new Reactive({ a: 1, b: 2 });
            let runCount = 0;
            
            const watcher = new Watcher(() => {
                runCount++;
                // 在 run 回调中访问属性以收集依赖
                const _a = reactive.value.a;
                const _b = reactive.value.b;
            });
            
            const unsubscribe = reactive.watch(watcher);
            // watch() 时 runCallback 会被调用一次，重置计数器以只统计属性改变后的调用
            runCount = 0;
            
            // 快速修改多个属性
            reactive.value.a = 10;
            reactive.value.b = 20;
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    // run 回调应该只被调用一次（批量更新）
                    expect(runCount).toBe(1);
                    unsubscribe();
                    resolve();
                }, 10);
            });
        });
    });
    
    describe('watch/unwatch', () => {
        it('应该可以注册和取消注册 watcher', () => {
            const reactive = new Reactive({ name: 'John' });
            let runCount = 0;
            
            const watcher = new Watcher(() => {
                runCount++;
                // 在 run 回调中访问属性以收集依赖
                const _ = reactive.value.name;
            });
            
            const unsubscribe = reactive.watch(watcher);
            
            // 重置计数器（watch 时会调用一次 run）
            runCount = 0;
            
            // 修改值
            reactive.value.name = 'Jane';
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(runCount).toBeGreaterThan(0);
                    const countBefore = runCount;
                    
                    // 取消注册
                    unsubscribe();
                    
                    // 再次修改
                    reactive.value.name = 'Bob';
                    
                    setTimeout(() => {
                        // 不应该再更新
                        expect(runCount).toBe(countBefore);
                        resolve();
                    }, 10);
                }, 10);
            });
        });
    });

    describe('调试工具集成', () => {
        beforeEach(() => {
            // 确保调试器被禁用
            const { Debugger } = require('../../src/debug/Debugger');
            Debugger.disable();
        });

        it('应该在启用调试时创建调试钩子', () => {
            const { Debugger } = require('../../src/debug/Debugger');
            Debugger.enable();
            
            const reactive = new Reactive({ name: 'John' });
            
            // 应该能够获取状态
            const state = Debugger.getReactiveState(reactive);
            expect(state).toBeDefined();
            expect(state.value).toEqual({ name: 'John' });
            
            Debugger.disable();
        });

        it('应该在禁用调试时不创建调试钩子', () => {
            const { Debugger } = require('../../src/debug/Debugger');
            Debugger.disable();
            
            const reactive = new Reactive({ name: 'John' });
            
            // 应该抛出错误
            expect(() => {
                Debugger.getReactiveState(reactive);
            }).toThrow();
        });

        it('应该记录性能数据', () => {
            const { Debugger } = require('../../src/debug/Debugger');
            const { PerformanceMonitor } = require('../../src/debug/PerformanceMonitor');
            
            Debugger.enable();
            PerformanceMonitor.startTracking();
            
            const reactive = new Reactive({ name: 'John' });
            const watcher = new Watcher(() => {
                const _ = reactive.value.name;
            });
            
            reactive.watch(watcher);
            reactive.value.name = 'Jane';
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    const stats = PerformanceMonitor.getStats();
                    expect(stats.reactiveUpdates.count).toBeGreaterThan(0);
                    
                    PerformanceMonitor.stopTracking();
                    Debugger.disable();
                    resolve();
                }, 10);
            });
        });
    });
});


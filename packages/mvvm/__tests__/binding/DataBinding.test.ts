import { Reactive } from '../../src/reactive/Reactive';
import { DataBinding } from '../../src/binding/DataBinding';
import { View } from '../../src/core/View';

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

describe('DataBinding', () => {
    interface TestData {
        name: string;
        age: number;
    }
    
    describe('基础功能', () => {
        it('应该创建数据绑定', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            
            const binding = new DataBinding(reactive, view, 'name');
            
            expect(binding).toBeDefined();
            expect(view.get('name')).toBe('John');
        });
        
        it('应该支持嵌套路径', () => {
            interface NestedData {
                user: {
                    name: string;
                };
            }
            
            const reactive = new Reactive<NestedData>({
                user: { name: 'John' }
            });
            const view = new TestView();
            
            const binding = new DataBinding(reactive, view, 'user.name');
            
            expect(binding).toBeDefined();
            expect(view.get('user.name')).toBe('John');
        });
    });
    
    describe('绑定模式', () => {
        it('应该支持 one-way 模式（默认）', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            
            new DataBinding(reactive, view, 'name', { mode: 'one-way' });
            
            // 修改数据应该更新视图
            reactive.value.name = 'Jane';
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(view.get('name')).toBe('Jane');
                    resolve();
                }, 10);
            });
        });
        
        it('应该支持 two-way 模式', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            
            new DataBinding(reactive, view, 'name', { mode: 'two-way' });
            
            // 修改视图应该更新数据
            view.set('name', 'Jane');
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(reactive.value.name).toBe('Jane');
                    resolve();
                }, 10);
            });
        });
        
        it('应该支持 one-way-to-source 模式', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            
            new DataBinding(reactive, view, 'name', { mode: 'one-way-to-source' });
            
            // 修改视图应该更新数据
            view.set('name', 'Jane');
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(reactive.value.name).toBe('Jane');
                    resolve();
                }, 10);
            });
        });
    });
    
    describe('转换器', () => {
        it('应该支持 converter', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            
            new DataBinding(reactive, view, 'name', {
                converter: (value: string) => value.toUpperCase()
            });
            
            expect(view.get('name')).toBe('JOHN');
        });
        
        it('应该支持 reverseConverter', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            
            new DataBinding(reactive, view, 'name', {
                mode: 'two-way',
                reverseConverter: (value: string) => value.toLowerCase()
            });
            
            view.set('name', 'JANE');
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(reactive.value.name).toBe('jane');
                    resolve();
                }, 50);
            });
        });
    });
    
    describe('验证器', () => {
        it('应该支持 validator', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            let validationCalled = false;
            
            new DataBinding(reactive, view, 'age', {
                mode: 'two-way',
                validator: (value: number) => {
                    validationCalled = true;
                    return value >= 0 && value <= 120;
                }
            });
            
            view.set('age', 50);
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(validationCalled).toBe(true);
                    resolve();
                }, 10);
            });
        });
        
        it('应该在验证失败时拒绝更新', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            
            const oldAge = reactive.value.age;
            
            // 验证失败时会抛出异常
            expect(() => {
                new DataBinding(reactive, view, 'age', {
                    mode: 'two-way',
                    validator: (value: number) => {
                        // 只在设置无效值时返回 false
                        if (value > 120) {
                            return false;
                        }
                        return true;
                    }
                });
                
                // 尝试设置无效值（会触发验证）
                view.set('age', 150);
            }).toThrow();
            
            // 数据不应该被更新（因为异常被抛出）
            expect(reactive.value.age).toBe(oldAge);
        });
    });
    
    describe('销毁', () => {
        it('应该可以销毁绑定', () => {
            const reactive = new Reactive<TestData>({ name: 'John', age: 30 });
            const view = new TestView();
            
            const binding = new DataBinding(reactive, view, 'name');
            binding.destroy();
            
            // 销毁后修改数据不应该更新视图
            reactive.value.name = 'Jane';
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(view.get('name')).toBe('John');
                    resolve();
                }, 10);
            });
        });
    });
});


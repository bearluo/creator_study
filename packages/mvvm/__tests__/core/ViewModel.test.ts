import { Model } from '../../src/core/Model';
import { ViewModel } from '../../src/core/ViewModel';
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

describe('ViewModel', () => {
    interface TestData {
        name: string;
        age: number;
    }
    
    describe('基础功能', () => {
        it('应该创建 ViewModel', () => {
            const model = new Model<TestData>({ name: 'John', age: 30 });
            const viewModel = new ViewModel(model);
            
            expect(viewModel.model).toBe(model);
            expect(viewModel.reactive).toBeDefined();
            expect(viewModel.reactive.value.name).toBe('John');
            expect(viewModel.reactive.value.age).toBe(30);
        });
        
        it('应该支持泛型类型', () => {
            const model = new Model<TestData>({ name: 'John', age: 30 });
            const viewModel = new ViewModel<TestData>(model);
            
            expect(viewModel.reactive.value.name).toBe('John');
            expect(viewModel.reactive.value.age).toBe(30);
        });
    });
    
    describe('数据绑定', () => {
        it('应该可以绑定数据到视图', () => {
            const model = new Model<TestData>({ name: 'John', age: 30 });
            const viewModel = new ViewModel(model);
            const view = new TestView();
            
            const binding = viewModel.bind('name', view);
            
            expect(binding).toBeDefined();
            expect(view.get('name')).toBe('John');
        });
        
        it('应该可以解绑', () => {
            const model = new Model<TestData>({ name: 'John', age: 30 });
            const viewModel = new ViewModel(model);
            const view = new TestView();
            
            const binding = viewModel.bind('name', view);
            viewModel.unbind(binding);
            
            // 解绑后修改数据不应该更新视图
            viewModel.reactive.value.name = 'Jane';
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    // 视图值应该还是初始值（或未更新）
                    resolve();
                }, 10);
            });
        });
        
        it('应该支持双向绑定', () => {
            const model = new Model<TestData>({ name: 'John', age: 30 });
            const viewModel = new ViewModel(model);
            const view = new TestView();
            
            viewModel.bind('name', view, { mode: 'two-way' });
            
            // 修改视图值
            view.set('name', 'Jane');
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(viewModel.reactive.value.name).toBe('Jane');
                    resolve();
                }, 10);
            });
        });
        
        it('应该支持转换器', () => {
            const model = new Model<TestData>({ name: 'John', age: 30 });
            const viewModel = new ViewModel(model);
            const view = new TestView();
            
            viewModel.bind('name', view, {
                converter: (value: string) => value.toUpperCase()
            });
            
            expect(view.get('name')).toBe('JOHN');
        });
        
        it('应该支持验证器', () => {
            const model = new Model<{ age: number }>({ age: 30 });
            const viewModel = new ViewModel(model);
            const view = new TestView();
            
            let validationCalled = false;
            
            viewModel.bind('age', view, {
                validator: (value: number) => {
                    validationCalled = true;
                    return value >= 0 && value <= 120;
                }
            });
            
            // 设置有效值
            view.set('age', 50);
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(validationCalled).toBe(true);
                    resolve();
                }, 10);
            });
        });
    });
    
    describe('解绑', () => {
        it('应该可以解绑所有绑定', () => {
            const model = new Model<TestData>({ name: 'John', age: 30 });
            const viewModel = new ViewModel(model);
            const view = new TestView();
            
            const binding1 = viewModel.bind('name', view);
            const binding2 = viewModel.bind('age', view);
            
            // 解绑所有绑定
            viewModel.unbind(binding1);
            viewModel.unbind(binding2);
            
            // 修改数据不应该更新视图（因为已解绑）
            viewModel.reactive.value.name = 'Jane';
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    // 视图值应该还是初始值
                    expect(view.get('name')).toBe('John');
                    resolve();
                }, 10);
            });
        });
    });
});


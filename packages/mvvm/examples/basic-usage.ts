/**
 * MVVM 基本使用示例
 * 
 * 展示 MVVM 框架的基本用法
 */

import { Model, ViewModel, Reactive, Watcher, View, Computed, Command } from '@bl-framework/mvvm';

// ==================== 示例 1: 基本数据绑定 ====================

console.log('=== 示例 1: 基本数据绑定 ===');

class PlayerModel extends Model {
    constructor() {
        super({
            name: 'John',
            health: 100,
            level: 1
        });
    }
    
    validate(): boolean {
        return this.data.health >= 0 && this.data.health <= 100;
    }
}

class SimpleView extends View {
    private elements: Map<string, { text: string }> = new Map();
    
    update(path: string, value: any): void {
        const element = this.elements.get(path);
        if (element) {
            element.text = String(value);
            console.log(`[View] ${path} 更新为: ${value}`);
        }
    }
    
    get(path: string): any {
        return this.elements.get(path)?.text;
    }
    
    set(path: string, value: any): void {
        if (!this.elements.has(path)) {
            this.elements.set(path, { text: '' });
        }
        this.elements.get(path)!.text = String(value);
        console.log(`[View] ${path} 设置为: ${value}`);
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        // 简化的事件系统
        return () => {};
    }
    
    destroy(): void {
        this.elements.clear();
    }
}

// 创建模型和视图
const playerModel = new PlayerModel();
const view = new SimpleView();

// 初始化视图元素
view.set('name', playerModel.data.name);
view.set('health', playerModel.data.health);

// 创建 ViewModel 并绑定
const viewModel = new ViewModel(playerModel);
viewModel.bind('name', view, { mode: 'one-way' });
viewModel.bind('health', view, { mode: 'one-way' });

// 修改数据，视图自动更新
console.log('\n修改数据:');
playerModel.data.name = 'Jane';
playerModel.data.health = 80;

// ==================== 示例 2: 响应式数据 ====================

console.log('\n=== 示例 2: 响应式数据 ===');

const reactive = new Reactive({
    firstName: 'John',
    lastName: 'Doe',
    age: 30
});

// 创建观察者
const watcher = new Watcher((key, newValue, oldValue) => {
    console.log(`[Watcher] ${String(key)} 变化: ${oldValue} -> ${newValue}`);
});

// 监听变化
reactive.watch(watcher);

// 修改值会自动触发更新
console.log('\n修改响应式数据:');
reactive.value.firstName = 'Jane';
reactive.value.age = 31;

// ==================== 示例 3: 计算属性 ====================

console.log('\n=== 示例 3: 计算属性 ===');

const personReactive = new Reactive({
    firstName: 'John',
    lastName: 'Doe'
});

// 创建计算属性
const fullName = new Computed(() => {
    return `${personReactive.value.firstName} ${personReactive.value.lastName}`;
}, personReactive);

console.log('初始全名:', fullName.value); // 'John Doe'

personReactive.value.firstName = 'Jane';
console.log('修改 firstName 后的全名:', fullName.value); // 'Jane Doe'

// ==================== 示例 4: 双向绑定 ====================

console.log('\n=== 示例 4: 双向绑定 ===');

class FormModel extends Model {
    constructor() {
        super({
            username: '',
            email: ''
        });
    }
}

class FormView extends View {
    private fields: Map<string, { value: string }> = new Map();
    private changeListeners: Map<string, Array<(value: any) => void>> = new Map();
    
    update(path: string, value: any): void {
        if (!this.fields.has(path)) {
            this.fields.set(path, { value: '' });
        }
        this.fields.get(path)!.value = String(value);
        console.log(`[FormView] ${path} 更新为: ${value}`);
    }
    
    get(path: string): any {
        return this.fields.get(path)?.value;
    }
    
    set(path: string, value: any): void {
        if (!this.fields.has(path)) {
            this.fields.set(path, { value: '' });
        }
        this.fields.get(path)!.value = String(value);
        
        // 触发 change 事件
        const listeners = this.changeListeners.get('change');
        if (listeners) {
            listeners.forEach(listener => listener(value));
        }
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        if (!this.changeListeners.has(event)) {
            this.changeListeners.set(event, []);
        }
        this.changeListeners.get(event)!.push(callback);
        
        return () => {
            const listeners = this.changeListeners.get(event);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
    
    destroy(): void {
        this.fields.clear();
        this.changeListeners.clear();
    }
}

const formModel = new FormModel();
const formView = new FormView();
const formViewModel = new ViewModel(formModel);

// 双向绑定，带转换函数
formViewModel.bind('username', formView, {
    mode: 'two-way',
    converter: (value) => value.toUpperCase(), // 数据 -> 视图：转为大写
    reverseConverter: (value) => value.toLowerCase(), // 视图 -> 数据：转为小写
    validator: (value) => value.length > 0
});

formViewModel.bind('email', formView, {
    mode: 'two-way',
    validator: (value) => value.includes('@')
});

// 修改数据，视图更新
console.log('\n修改数据:');
formModel.data.username = 'john'; // 视图显示 'JOHN'

// 修改视图，数据更新
console.log('\n修改视图:');
formView.set('username', 'JANE'); // 数据变为 'jane'

// ==================== 示例 5: 命令模式 ====================

console.log('\n=== 示例 5: 命令模式 ===');

class CounterModel extends Model {
    constructor() {
        super({ count: 0 });
    }
}

class CounterViewModel extends ViewModel {
    private history: Command[] = [];
    
    increment(): void {
        const command = new Command(
            () => {
                this.model.data.count++;
                console.log(`[Command] 执行增加，count = ${this.model.data.count}`);
            },
            () => {
                this.model.data.count--;
                console.log(`[Command] 撤销增加，count = ${this.model.data.count}`);
            }
        );
        
        command.execute();
        this.history.push(command);
    }
    
    decrement(): void {
        const command = new Command(
            () => {
                this.model.data.count--;
                console.log(`[Command] 执行减少，count = ${this.model.data.count}`);
            },
            () => {
                this.model.data.count++;
                console.log(`[Command] 撤销减少，count = ${this.model.data.count}`);
            }
        );
        
        command.execute();
        this.history.push(command);
    }
    
    undo(): void {
        const command = this.history.pop();
        if (command && command.canUndo()) {
            command.undo();
        } else {
            console.log('[Command] 无法撤销：历史记录为空或命令不支持撤销');
        }
    }
    
    getCurrentCount(): number {
        return this.model.data.count;
    }
}

const counterModel = new CounterModel();
const counterViewModel = new CounterViewModel(counterModel);

console.log('初始 count:', counterViewModel.getCurrentCount()); // 0

counterViewModel.increment(); // count = 1
counterViewModel.increment(); // count = 2
counterViewModel.decrement(); // count = 1

console.log('\n撤销操作:');
counterViewModel.undo(); // count = 2
counterViewModel.undo(); // count = 1

// ==================== 示例 6: 嵌套对象 ====================

console.log('\n=== 示例 6: 嵌套对象 ===');

const nestedReactive = new Reactive({
    user: {
        profile: {
            name: 'John',
            age: 30
        }
    }
});

const nestedWatcher = new Watcher((key, newValue, oldValue) => {
    console.log(`[Nested] ${String(key)} 变化:`, oldValue, '->', newValue);
});

nestedReactive.watch(nestedWatcher);

console.log('\n修改嵌套属性:');
nestedReactive.value.user.profile.name = 'Jane';
nestedReactive.value.user.profile.age = 31;

// ==================== 清理 ====================

console.log('\n=== 清理资源 ===');
viewModel.destroy();
formViewModel.destroy();
counterViewModel.destroy();
view.destroy();
formView.destroy();

console.log('\n所有示例完成！');


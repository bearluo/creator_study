/**
 * MVVM 高级使用示例
 * 
 * 展示 MVVM 框架的高级用法和组合使用
 */

import { Model, ViewModel, Reactive, Computed, BindingManager, Command } from '@bl-framework/mvvm';

// ==================== 示例 1: 复杂计算属性 ====================

console.log('=== 示例 1: 复杂计算属性 ===');

interface ShoppingCartItem {
    name: string;
    price: number;
    quantity: number;
}

class ShoppingCartModel extends Model {
    constructor() {
        super({
            items: [
                { name: 'Apple', price: 10, quantity: 2 },
                { name: 'Banana', price: 5, quantity: 3 },
                { name: 'Orange', price: 8, quantity: 1 }
            ],
            discount: 0.1 // 10% 折扣
        });
    }
}

const cartReactive = new Reactive(new ShoppingCartModel().data);

// 计算总价（不含折扣）
const subtotal = new Computed(() => {
    return cartReactive.value.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);
}, cartReactive);

// 计算折扣金额
const discountAmount = new Computed(() => {
    return subtotal.value * cartReactive.value.discount;
}, cartReactive);

// 计算最终价格
const total = new Computed(() => {
    return subtotal.value - discountAmount.value;
}, cartReactive);

console.log('小计:', subtotal.value); // 43
console.log('折扣:', discountAmount.value); // 4.3
console.log('总计:', total.value); // 38.7

// 修改商品数量
cartReactive.value.items[0].quantity = 5;
console.log('\n修改 Apple 数量为 5 后:');
console.log('小计:', subtotal.value); // 61
console.log('折扣:', discountAmount.value); // 6.1
console.log('总计:', total.value); // 54.9

// ==================== 示例 2: 绑定管理器 ====================

console.log('\n=== 示例 2: 绑定管理器 ===');

class UserModel extends Model {
    constructor() {
        super({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '123-456-7890'
        });
    }
}

class UserView {
    private fields: Map<string, string> = new Map();
    
    update(path: string, value: any): void {
        this.fields.set(path, String(value));
        console.log(`[UserView] ${path} = ${value}`);
    }
    
    get(path: string): any {
        return this.fields.get(path);
    }
    
    set(path: string, value: any): void {
        this.fields.set(path, String(value));
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        return () => {};
    }
    
    destroy(): void {
        this.fields.clear();
    }
}

const userModel = new UserModel();
const userView = new UserView();
const userViewModel = new ViewModel(userModel);
const bindingManager = new BindingManager();

// 批量创建绑定
const fields = ['firstName', 'lastName', 'email', 'phone'];
fields.forEach(field => {
    const binding = userViewModel.bind(field, userView as any, { mode: 'one-way' });
    bindingManager.add(binding);
});

console.log('绑定数量:', bindingManager.size); // 4

// 修改数据
console.log('\n修改用户数据:');
userModel.data.firstName = 'Jane';
userModel.data.email = 'jane@example.com';

// 清除所有绑定
bindingManager.clear();
console.log('\n清除所有绑定后，绑定数量:', bindingManager.size); // 0

// ==================== 示例 3: 命令历史记录 ====================

console.log('\n=== 示例 3: 命令历史记录 ===');

class TextEditorModel extends Model {
    constructor() {
        super({
            content: 'Hello, World!',
            cursorPosition: 0
        });
    }
}

class TextEditorViewModel extends ViewModel {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];
    private maxHistorySize: number = 50;
    
    insertText(text: string, position: number): void {
        const oldContent = this.model.data.content;
        const oldPosition = this.model.data.cursorPosition;
        
        const command = new Command(
            () => {
                const before = this.model.data.content.substring(0, position);
                const after = this.model.data.content.substring(position);
                this.model.data.content = before + text + after;
                this.model.data.cursorPosition = position + text.length;
                console.log(`[Insert] 在位置 ${position} 插入 "${text}"`);
                console.log(`[Insert] 内容: "${this.model.data.content}"`);
            },
            () => {
                this.model.data.content = oldContent;
                this.model.data.cursorPosition = oldPosition;
                console.log(`[Undo] 恢复内容: "${this.model.data.content}"`);
            }
        );
        
        command.execute();
        
        // 添加到撤销栈
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
        
        // 清空重做栈
        this.redoStack = [];
    }
    
    deleteText(start: number, end: number): void {
        const oldContent = this.model.data.content;
        const deletedText = this.model.data.content.substring(start, end);
        
        const command = new Command(
            () => {
                const before = this.model.data.content.substring(0, start);
                const after = this.model.data.content.substring(end);
                this.model.data.content = before + after;
                this.model.data.cursorPosition = start;
                console.log(`[Delete] 删除 "${deletedText}"`);
                console.log(`[Delete] 内容: "${this.model.data.content}"`);
            },
            () => {
                this.model.data.content = oldContent;
                console.log(`[Undo] 恢复内容: "${this.model.data.content}"`);
            }
        );
        
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }
    
    undo(): boolean {
        if (this.undoStack.length === 0) {
            console.log('[Undo] 无法撤销：历史记录为空');
            return false;
        }
        
        const command = this.undoStack.pop()!;
        if (command.canUndo()) {
            command.undo();
            this.redoStack.push(command);
            return true;
        }
        
        return false;
    }
    
    redo(): boolean {
        if (this.redoStack.length === 0) {
            console.log('[Redo] 无法重做：历史记录为空');
            return false;
        }
        
        const command = this.redoStack.pop()!;
        command.execute();
        this.undoStack.push(command);
        return true;
    }
    
    canUndo(): boolean {
        return this.undoStack.length > 0;
    }
    
    canRedo(): boolean {
        return this.redoStack.length > 0;
    }
}

const editorModel = new TextEditorModel();
const editorViewModel = new TextEditorViewModel(editorModel);

console.log('初始内容:', editorModel.data.content);

editorViewModel.insertText('Hi, ', 0);
editorViewModel.insertText('!', editorModel.data.content.length);
editorViewModel.deleteText(0, 3);

console.log('\n撤销操作:');
editorViewModel.undo();
editorViewModel.undo();

console.log('\n重做操作:');
editorViewModel.redo();
editorViewModel.redo();

// ==================== 示例 4: 数据验证 ====================

console.log('\n=== 示例 4: 数据验证 ===');

class FormDataModel extends Model {
    constructor() {
        super({
            username: '',
            email: '',
            age: 0
        });
    }
    
    validate(): boolean {
        const data = this.data;
        return (
            data.username.length >= 3 &&
            data.email.includes('@') &&
            data.age >= 0 && data.age <= 150
        );
    }
}

class FormDataView {
    private fields: Map<string, string> = new Map();
    private errors: Map<string, string> = new Map();
    
    update(path: string, value: any): void {
        this.fields.set(path, String(value));
        console.log(`[FormView] ${path} = ${value}`);
    }
    
    get(path: string): any {
        return this.fields.get(path);
    }
    
    set(path: string, value: any): void {
        this.fields.set(path, String(value));
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        return () => {};
    }
    
    destroy(): void {
        this.fields.clear();
        this.errors.clear();
    }
    
    setError(path: string, error: string): void {
        this.errors.set(path, error);
        console.log(`[FormView] ${path} 错误: ${error}`);
    }
    
    clearError(path: string): void {
        this.errors.delete(path);
    }
}

const formDataModel = new FormDataModel();
const formDataView = new FormDataView();
const formDataViewModel = new ViewModel(formDataModel);

// 带验证的绑定
formDataViewModel.bind('username', formDataView as any, {
    mode: 'two-way',
    validator: (value) => {
        if (value.length < 3) {
            formDataView.setError('username', '用户名至少需要 3 个字符');
            return false;
        }
        formDataView.clearError('username');
        return true;
    }
});

formDataViewModel.bind('email', formDataView as any, {
    mode: 'two-way',
    validator: (value) => {
        if (!value.includes('@')) {
            formDataView.setError('email', '邮箱格式不正确');
            return false;
        }
        formDataView.clearError('email');
        return true;
    }
});

// 测试验证
console.log('\n测试数据验证:');
formDataModel.data.username = 'ab'; // 应该失败
formDataModel.data.email = 'invalid-email'; // 应该失败
formDataModel.data.username = 'john'; // 应该成功
formDataModel.data.email = 'john@example.com'; // 应该成功

console.log('\n模型验证:', formDataModel.validate()); // true

// ==================== 清理 ====================

console.log('\n=== 清理资源 ===');
userViewModel.destroy();
editorViewModel.destroy();
formDataViewModel.destroy();
userView.destroy();
formDataView.destroy();

console.log('\n所有高级示例完成！');


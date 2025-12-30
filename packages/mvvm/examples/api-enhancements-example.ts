/**
 * API 增强功能示例
 * 
 * 此文件演示了批量绑定 API 和错误处理功能
 */

import { ViewModel } from '../src/core/ViewModel';
import { Model } from '../src/core/Model';
import { ValidationError, PathError } from '../src/core/types';
import type { IView } from '../src/core/types';

// 定义数据类型
interface PlayerData {
    name: string;
    level: number;
    stats: {
        health: number;
        mana: number;
    };
    items: Array<{ id: string; name: string }>;
}

// 简单的视图实现（用于测试）
class TestView implements IView {
    private data: Record<string, any> = {};
    
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
    
    destroy(): void {
        this.data = {};
    }
}

// 创建测试数据
const playerData: PlayerData = {
    name: 'John',
    level: 1,
    stats: {
        health: 100,
        mana: 50
    },
    items: [
        { id: '1', name: 'Sword' }
    ]
};

// 创建 ViewModel
const model = new Model<PlayerData>(playerData);
const viewModel = new ViewModel<PlayerData>(model);
const view = new TestView();

// ========== 批量绑定 API 示例 ==========

// ✅ 使用 bindMany() 批量绑定
const bindings = viewModel.bindMany({
    name: { 
        view, 
        options: { mode: 'two-way' } 
    },
    'stats.health': { 
        view, 
        options: { 
            mode: 'one-way',
            converter: (health) => `HP: ${health}`
        } 
    },
    'stats.mana': { 
        view, 
        options: { mode: 'one-way' } 
    }
});

// 访问特定绑定
const nameBinding = bindings.get('name');
const healthBinding = bindings.get('stats.health');

console.log('批量绑定完成，绑定数量:', bindings.size);

// ========== 声明式绑定配置示例 ==========

// ✅ 使用 bindConfig() 声明式绑定
const configBindings = viewModel.bindConfig({
    view,
    bindings: {
        name: { mode: 'two-way' },
        level: { 
            mode: 'one-way',
            converter: (level) => `Level: ${level}`
        },
        'stats.health': { 
            mode: 'one-way',
            converter: (health) => `Health: ${health}`
        }
    }
});

console.log('声明式绑定完成，绑定数量:', configBindings.size);

// ========== 错误处理示例 ==========

// ✅ 使用 onError 回调处理错误
viewModel.bind('stats.health', view, {
    mode: 'one-way',
    validator: (health) => health >= 0 && health <= 100,
    onError: (error, path, value) => {
        if (error instanceof ValidationError) {
            console.error(`验证失败: ${path} = ${value}`, error.message);
            // 可以在这里实现错误恢复逻辑
        } else {
            console.error(`绑定错误: ${path}`, error);
        }
    }
});

// 测试验证错误
try {
    // 设置无效值（会触发验证错误）
    viewModel.reactive.value.stats.health = 150; // 如果验证器存在，会触发 onError
} catch (error) {
    console.log('捕获到错误:', error);
}

// ========== 错误类型使用示例 ==========

// ValidationError
const validationError = new ValidationError(
    'Health value must be between 0 and 100',
    'stats.health',
    150
);
console.log('ValidationError:', validationError.name, validationError.message);

// PathError
const pathError = new PathError(
    'Invalid path: stats.hp',
    'stats.hp',
    ['stats.health', 'stats.mana']
);
console.log('PathError:', pathError.name, pathError.message);

// BindingError
import { BindingError } from '../src/core/types';
const bindingError = new BindingError(
    'Binding failed',
    'stats.health',
    150
);
console.log('BindingError:', bindingError.name, bindingError.message);

console.log('API 增强功能测试完成！');

export { PlayerData, TestView };


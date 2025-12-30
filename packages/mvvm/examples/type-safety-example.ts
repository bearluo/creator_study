/**
 * 类型安全增强功能示例
 * 
 * 此文件演示了类型安全的路径绑定功能
 */

import { ViewModel } from '../src/core/ViewModel';
import { Model } from '../src/core/Model';
import type { IView } from '../src/core/types';

// 定义数据类型
interface PlayerData {
    name: string;
    level: number;
    stats: {
        health: number;
        mana: number;
        position?: { x: number; y: number };
    };
    items: Array<{ id: string; name: string; count: number }>;
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
        // 简单实现
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
        mana: 50,
        position: { x: 0, y: 0 }
    },
    items: [
        { id: '1', name: 'Sword', count: 1 },
        { id: '2', name: 'Shield', count: 1 }
    ]
};

// 创建 ViewModel
const model = new Model<PlayerData>(playerData);
const viewModel = new ViewModel<PlayerData>(model);
const view = new TestView();

// ========== 类型安全绑定示例 ==========

// ✅ 正确：顶层属性
const binding1 = viewModel.bind('name', view);
// binding1 的类型：DataBinding<PlayerData, string>

// ✅ 正确：嵌套属性
const binding2 = viewModel.bind('stats.health', view);
// binding2 的类型：DataBinding<PlayerData, number>

// ✅ 正确：数组路径
const binding3 = viewModel.bind('items.0.name', view);
// binding3 的类型：DataBinding<PlayerData, string>

// ✅ 正确：类型推断的转换器
const binding4 = viewModel.bind('stats.health', view, {
    converter: (health) => `Health: ${health}`,  // ✅ health: number
    validator: (health) => health > 0            // ✅ health: number
});

// 注意：不再支持任意字符串路径，必须使用类型安全的路径

// ========== 类型错误示例（这些应该产生 TypeScript 错误）==========

// ❌ 错误：无效路径（取消注释以测试类型错误）
// const error1 = viewModel.bind('nam', view);              // ❌ 'nam' 不是有效路径
// const error2 = viewModel.bind('stats.hp', view);         // ❌ 'stats.hp' 不是有效路径
// const error3 = viewModel.bind('items.name', view);      // ❌ 'items.name' 不是有效路径（items 是数组）

// ========== 使用示例 ==========

// 访问响应式数据（有类型提示）
const playerName = viewModel.reactive.value.name;        // ✅ string
const playerHealth = viewModel.reactive.value.stats.health; // ✅ number
const firstItemName = viewModel.reactive.value.items[0].name; // ✅ string

// 修改数据会自动更新视图
viewModel.reactive.value.name = 'Jane';                 // 视图自动更新
viewModel.reactive.value.stats.health = 80;              // 视图自动更新

console.log('类型安全增强功能测试完成！');

export { PlayerData, TestView };


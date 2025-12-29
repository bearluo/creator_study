import { _decorator, Component, Label, Button, Node } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent, bind, on } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

interface ListItemData {
    name: string;
    value: number;
}

/**
 * 列表项组件（装饰器方式 - 改进版）
 * 
 * 用于测试列表渲染和数据绑定
 * 现在可以直接在属性上使用装饰器
 */
@ccclass('ListItemComponent')
export class ListItemComponent extends MVVMComponent<ListItemData> {
    // 数据绑定：直接应用到属性上
    @property(Label)
    @bind('name', { property: 'string', converter: (value) => `Item: ${value}` })
    itemNameLabel: Label | null = null;
    
    @property(Label)
    @bind('value', { property: 'string', converter: (value) => `Value: ${value}` })
    itemValueLabel: Label | null = null;
    
    // 事件绑定：直接应用到属性上
    @property(Button)
    @on('click', { handler: 'onDelete' })
    deleteButton: Button | null = null;

    itemData: ListItemData = { name: '', value: 0 };
    
    protected initViewModel(model: Model<ListItemData>): ViewModel<ListItemData> {
        return new ViewModel(model);
    }
    
    protected createModel(): Model<ListItemData> {
        // 列表项的数据会在列表组件中设置
        return new Model<ListItemData>(this.itemData);
    }
    
    /**
     * 删除处理函数
     */
    onDelete(): void {
        const data = this.viewModel.reactive.value;
        if (this.node.parent) {
            this.node.parent.emit('item-delete', data);
        }
        console.log(`[ListItemComponent] Delete item:`, data);
    }
    
    /**
     * 设置列表项数据
     * 由列表组件调用
     */
    setItemData(data: ListItemData): void {
        // 已经初始化好就直接更新
        if (this.viewModel) {
            // 使用 Object.assign 来更新值，因为 reactive.value 是只读的
            Object.assign(this.viewModel.reactive.value, data);
        } else {
            // 未初始化好先保存数据
            this.itemData = data;
        }
    }
}

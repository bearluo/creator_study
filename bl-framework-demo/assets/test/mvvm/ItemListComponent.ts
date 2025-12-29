import { _decorator, Component, Node, Button } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent, CocosForDirective } from '@bl-framework/mvvm-creator';
import { ListItemComponent } from './ListItemComponent';

const { ccclass, property } = _decorator;

interface ItemListData {
    items: Array<{ id: number; name: string; value: number }>;
}

/**
 * 列表组件（使用 MVVMComponent + 手动指令）
 * 
 * 使用 CocosForDirective 进行列表渲染
 */
@ccclass('ItemListComponent')
export class ItemListComponent extends MVVMComponent<ItemListData> {
    @property(Node)
    containerNode: Node | null = null;
    
    @property(Node)
    itemTemplate: Node | null = null;
    
    @property(Button)
    addItemButton: Button | null = null;
    
    private forDirective?: CocosForDirective;
    private itemIdCounter: number = 0;
    
    protected initViewModel(model: Model<ItemListData>): ViewModel<ItemListData> {
        return new ViewModel(model);
    }
    
    protected createModel(): Model<ItemListData> {
        return new Model<ItemListData>({
            items: [
                { id: 1, name: 'Item 1', value: 10 },
                { id: 2, name: 'Item 2', value: 20 },
                { id: 3, name: 'Item 3', value: 30 }
            ]
        });
    }
    
    protected onMVVMLoad(): void {
        // 初始化计数器
        const items = this.viewModel.reactive.value.items || [];
        this.itemIdCounter = items.length > 0 
            ? Math.max(...items.map((item: any) => item.id || 0), 0)
            : 0;
        
        // 设置列表指令
        this.setupListDirective();
        
        // 设置事件
        this.setupEvents();
        
        console.log('[ItemListComponent] MVVM initialized');
    }
    
    /**
     * 设置列表指令
     */
    private setupListDirective(): void {
        if (!this.containerNode || !this.itemTemplate) {
            console.warn('[ItemListComponent] Container node or item template not set');
            return;
        }
        
        const reactive = this.viewModel.reactive;
        this.forDirective = new CocosForDirective(reactive, 'items');
        this.forDirective.execute({
            containerNode: this.containerNode,
            itemTemplate: this.itemTemplate,
            path: 'items',
            itemKey: (item:{ id: number; name: string; value: number }) => item.id,
            onItemDataBind: (node, item:{ id: number; name: string; value: number }) => {
                console.log('[ItemListComponent] Item data bind:', item);
                node.getComponent(ListItemComponent)?.setItemData(item);
            }
        });
        
        console.log('[ItemListComponent] List directive setup completed');
    }
    
    /**
     * 设置事件
     */
    private setupEvents(): void {
        // 添加项目按钮
        if (this.addItemButton) {
            this.addItemButton.node.on(Button.EventType.CLICK, () => {
                this.addItem(`Item ${++this.itemIdCounter}`, Math.floor(Math.random() * 100));
            });
        }
        
        // 监听项目删除事件
        if (this.containerNode) {
            this.containerNode.on('item-delete', (item: any) => {
                this.removeItem(item.id);
            }, this);
        }
    }
    
    /**
     * 添加项目
     */
    addItem(name: string, value: number): void {
        const items = [...(this.viewModel.reactive.value.items || [])];
        items.push({
            id: ++this.itemIdCounter,
            name,
            value
        });
        this.viewModel.reactive.value.items = items;
        console.log(`[ItemListComponent] Added item: ${name}, value: ${value}`);
    }
    
    /**
     * 移除项目
     */
    removeItem(id: number): void {
        const items = (this.viewModel.reactive.value.items || []).filter((item: any) => item.id !== id);
        this.viewModel.reactive.value.items = items;
        console.log(`[ItemListComponent] Removed item: ${id}`);
    }
    
    /**
     * 更新项目
     */
    updateItem(id: number, name?: string, value?: number): void {
        const items = (this.viewModel.reactive.value.items || []).map((item: any) => {
            if (item.id === id) {
                return {
                    ...item,
                    name: name !== undefined ? name : item.name,
                    value: value !== undefined ? value : item.value
                };
            }
            return item;
        });
        this.viewModel.reactive.value.items = items;
    }
    
    onDestroy() {
        if (this.forDirective) {
            this.forDirective.destroy();
        }
        super.onDestroy();
    }
}

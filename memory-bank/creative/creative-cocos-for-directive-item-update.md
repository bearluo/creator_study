# CREATIVE: CocosForDirective 子节点数据更新流程设计

## 📋 问题分析

### 当前问题
1. **创建节点后未绑定数据**：`_createItemNode` 只创建节点，没有将数组项数据传递给子节点
2. **缺少数据更新机制**：当数组项数据变化时，已存在的节点无法自动更新
3. **未监听项内部属性变化**：只能监听到数组本身的增减，无法监听到数组项内部属性的变化

### 期望行为
- 创建节点时，将数组项数据传递给子节点
- 当数组项数据变化时，自动更新对应节点的数据
- 支持深度监听数组项内部属性的变化

## 🎯 设计目标

1. **为每个数组项创建独立的响应式对象**
2. **实现数据到节点的绑定机制**
3. **支持数组项内部属性变化的监听和更新**
4. **保持 API 简洁，向后兼容**

## 🏗️ 架构设计

### 1. 数据结构

```typescript
interface ForDirectiveItemContext {
    node: CocosNode;                    // 节点实例
    reactive: Reactive<any>;            // 数组项的响应式对象
    itemData: any;                      // 原始数据快照（用于对比）
    key: string | number;               // 唯一键
    watcher?: Watcher;                  // 监听数组项内部属性的 Watcher
    unsubscribe?: () => void;           // 取消监听的函数
}
```

### 2. 核心流程

```
数组变化检测
    ↓
遍历数组项
    ↓
[存在] 检查项是否已存在（通过 key）
    ↓
    ├─ [不存在] 创建新节点 + 创建 Reactive + 绑定数据
    └─ [存在] 检查数据是否变化
            ↓
            ├─ [变化] 更新 Reactive 对象 + 更新节点数据
            └─ [未变化] 跳过
    ↓
移除不存在的项
```

### 3. 数据绑定策略

#### 策略 1：MVVMComponent 优先（推荐）
```typescript
// 如果节点有 MVVMComponent，调用 setItemData
const mvvmComponent = node.getComponent(MVVMComponent);
if (mvvmComponent) {
    mvvmComponent.setItemData(itemData);
}
```

#### 策略 2：ViewModelComponent 优先
```typescript
// 如果节点有 ViewModelComponent，调用 setData
const viewModelComponent = node.getComponent(ViewModelComponent);
if (viewModelComponent) {
    viewModelComponent.setData(itemData);
}
```

#### 策略 3：自定义数据提供器
```typescript
// 定义接口，让节点实现
interface IItemDataProvider {
    setItemData(data: any): void;
}

const provider = node.getComponent(IItemDataProvider);
if (provider) {
    provider.setItemData(itemData);
}
```

### 4. 响应式对象管理

```typescript
// 为每个数组项创建独立的 Reactive 对象
private itemReactiveMap: Map<string | number, Reactive<any>> = new Map();

// 创建数组项的 Reactive
private createItemReactive(itemData: any): Reactive<any> {
    // 深拷贝数据，避免直接修改原数组项
    const clonedData = this.deepClone(itemData);
    return new Reactive(clonedData);
}

// 更新数组项的 Reactive
private updateItemReactive(key: string | number, newData: any): void {
    const reactive = this.itemReactiveMap.get(key);
    if (reactive) {
        // 更新响应式对象的值
        Object.assign(reactive.value, newData);
    }
}
```

### 5. 监听数组项内部属性变化

```typescript
// 为每个数组项创建 Watcher，监听内部属性变化
private watchItemProperties(
    reactive: Reactive<any>, 
    context: ForDirectiveItemContext
): void {
    const watcher = new Watcher(
        (key, newValue, oldValue) => {
            // 属性变化时，通知节点更新
            this.onItemPropertyChanged(context, key, newValue, oldValue);
        },
        () => {
            // 运行回调：重新检查数据变化
            this.updateItemNode(context);
        }
    );
    
    context.watcher = watcher;
    context.unsubscribe = reactive.watch(watcher);
}
```

## 🔧 实现细节

### 1. _renderItems 方法重构

```typescript
private _renderItems(items: any[], context: CocosForDirectiveContext): void {
    const newKeys = new Set<string | number>();
    const itemContexts: Map<string | number, ForDirectiveItemContext> = new Map();
    
    // 遍历数组项，创建或更新节点
    items.forEach((item, index) => {
        const key = this._getItemKey(item, index, context);
        newKeys.add(key);
        
        let itemContext = this.itemContexts.get(key);
        
        if (!itemContext) {
            // 创建新节点
            itemContext = this._createItemContext(context, item, index, key);
            if (itemContext) {
                this.itemContexts.set(key, itemContext);
                context.containerNode.addChild(itemContext.node);
            }
        } else {
            // 更新现有节点
            this._updateItemContext(itemContext, item);
        }
    });
    
    // 移除不存在的项
    this._removeObsoleteItems(newKeys);
}
```

### 2. _createItemContext 方法

```typescript
private _createItemContext(
    context: CocosForDirectiveContext,
    item: any,
    index: number,
    key: string | number
): ForDirectiveItemContext | null {
    // 创建节点
    const node = this._createItemNode(context, item, index, key);
    if (!node) {
        return null;
    }
    
    // 创建响应式对象
    const reactive = this.createItemReactive(item);
    this.itemReactiveMap.set(key, reactive);
    
    // 绑定数据到节点
    this._bindItemDataToNode(node, reactive.value);
    
    // 监听数组项内部属性变化
    const itemContext: ForDirectiveItemContext = {
        node,
        reactive,
        itemData: this.deepClone(item),
        key
    };
    this.watchItemProperties(reactive, itemContext);
    
    return itemContext;
}
```

### 3. _updateItemContext 方法

```typescript
private _updateItemContext(
    itemContext: ForDirectiveItemContext,
    newItemData: any
): void {
    // 检查数据是否变化
    if (this.isDataChanged(itemContext.itemData, newItemData)) {
        // 更新响应式对象
        this.updateItemReactive(itemContext.key, newItemData);
        
        // 更新节点数据
        this._bindItemDataToNode(itemContext.node, newItemData);
        
        // 更新快照
        itemContext.itemData = this.deepClone(newItemData);
    }
}
```

### 4. _bindItemDataToNode 方法

```typescript
private _bindItemDataToNode(node: CocosNode, data: any): void {
    // 策略 1: MVVMComponent
    const mvvmComponent = (node as any).getComponent?.('MVVMComponent');
    if (mvvmComponent && typeof mvvmComponent.setItemData === 'function') {
        mvvmComponent.setItemData(data);
        return;
    }
    
    // 策略 2: ViewModelComponent
    const viewModelComponent = (node as any).getComponent?.('ViewModelComponent');
    if (viewModelComponent && typeof viewModelComponent.setData === 'function') {
        viewModelComponent.setData(data);
        return;
    }
    
    // 策略 3: 自定义数据提供器
    const components = (node as any).getComponents?.() || [];
    for (const comp of components) {
        if (comp && typeof comp.setItemData === 'function') {
            comp.setItemData(data);
            return;
        }
    }
    
    // 策略 4: 设置用户数据（降级方案）
    if (typeof (node as any).setUserData === 'function') {
        (node as any).setUserData(data);
    }
}
```

### 5. 数据对比方法

```typescript
private isDataChanged(oldData: any, newData: any): boolean {
    // 简单对比：使用 JSON.stringify（适用于简单对象）
    // 对于复杂对象，可以使用深度对比库
    return JSON.stringify(oldData) !== JSON.stringify(newData);
}

private deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}
```

## 🎨 API 设计

### 保持向后兼容

```typescript
// 现有 API 保持不变
const directive = new CocosForDirective(reactive, 'items');
directive.execute({
    containerNode: this.containerNode,
    itemTemplate: this.itemTemplate,
    path: 'items',
    itemKey: (item) => item.id
});
```

### 新增可选配置

```typescript
export interface CocosForDirectiveContext {
    containerNode: CocosNode;
    itemTemplate?: CocosNode | CocosPrefab | (() => CocosNode);
    path: string;
    itemKey?: string | ((item: any, index: number) => string | number);
    
    // 新增：数据绑定策略
    dataBindingStrategy?: 'auto' | 'mvvm-component' | 'view-model-component' | 'custom';
    
    // 新增：自定义数据绑定函数
    onItemDataBind?: (node: CocosNode, data: any, index: number) => void;
    
    // 新增：是否监听数组项内部属性变化
    watchItemProperties?: boolean;
}
```

## 🔄 更新流程示例

```typescript
// 场景 1: 数组项内部属性变化
reactive.value.items[0].name = 'New Name';
// → 触发 itemReactive[0] 的 Watcher
// → 调用 onItemPropertyChanged
// → 更新节点数据

// 场景 2: 替换整个数组项
reactive.value.items[0] = { id: 1, name: 'New Item', value: 100 };
// → 触发数组的 Watcher
// → 调用 _renderItems
// → 检测到 key 存在，调用 _updateItemContext
// → 更新响应式对象和节点数据

// 场景 3: 添加新项
reactive.value.items.push({ id: 2, name: 'New Item', value: 200 });
// → 触发数组的 Watcher
// → 调用 _renderItems
// → 检测到 key 不存在，调用 _createItemContext
// → 创建新节点并绑定数据
```

## ⚡ 性能优化

1. **批量更新**：使用队列批量处理更新，避免频繁 DOM 操作
2. **浅对比优化**：对于大对象，使用浅对比而不是深对比
3. **节流/防抖**：对高频更新进行节流处理
4. **节点复用**：尽可能复用已存在的节点，减少创建销毁开销

## 🧪 测试场景

1. **创建节点并绑定数据**
2. **更新数组项内部属性**
3. **替换整个数组项**
4. **添加/删除数组项**
5. **嵌套对象属性变化**
6. **数组项数据未变化时跳过更新**

## 📝 注意事项

1. **内存管理**：及时清理不用的 Reactive 对象和 Watcher
2. **循环引用**：避免在 Reactive 对象中创建循环引用
3. **类型安全**：保持 TypeScript 类型检查
4. **错误处理**：添加适当的错误处理和日志


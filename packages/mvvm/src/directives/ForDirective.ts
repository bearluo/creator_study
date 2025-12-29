import { Directive } from './Directive';
import { Reactive } from '../reactive/Reactive';

/**
 * 列表渲染指令上下文
 */
export interface ForDirectiveContext {
    container: {
        clear(): void;
        createItem(index: number, item: any, key?: string | number): any;
        removeItem(item: any): void;
        getItems(): any[];
    };
    path: string;
    itemKey?: string | ((item: any, index: number) => string | number);
    template?: (item: any, index: number) => any;
}

/**
 * 列表渲染指令
 * 
 * 根据数组数据渲染列表
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ items: [{ id: 1, name: 'Item 1' }] });
 * const container = { clear: () => {}, createItem: () => {}, ... };
 * 
 * const directive = new ForDirective(reactive, 'items');
 * directive.execute({ container, path: 'items' });
 * ```
 */
export class ForDirective extends Directive {
    private path: string;
    private items: Map<string | number, any> = new Map(); // key -> item element
    private itemKeys: Map<any, string | number> = new Map(); // item -> key
    
    constructor(reactive: Reactive<any>, path: string) {
        super(reactive);
        this.path = path;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    execute(context: ForDirectiveContext): void {
        const items = this._getValue(this.reactive.value, this.path);
        
        if (!Array.isArray(items)) {
            console.warn(`[ForDirective] Path "${this.path}" is not an array`);
            return;
        }
        
        this._renderItems(items, context);
        
        // 创建观察者，监听数组变化
        this.watcher = this.createWatcher(
            (key, newValue, oldValue, ctx) => {
                // 当数组本身变化时重新渲染
                if (String(key) === this.path) {
                    this._renderItems(newValue || [], ctx);
                }
            },
            (ctx) => {
                // 运行回调：重新渲染
                const items = this._getValue(this.reactive.value, this.path);
                this._renderItems(Array.isArray(items) ? items : [], ctx);
            },
            context
        );
    }
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    update(context: ForDirectiveContext): void {
        const items = this._getValue(this.reactive.value, this.path);
        if (Array.isArray(items)) {
            this._renderItems(items, context);
        }
    }
    
    /**
     * 渲染列表项
     */
    private _renderItems(items: any[], context: ForDirectiveContext): void {
        const newKeys = new Set<string | number>();
        const currentItems = context.container.getItems();
        
        // 创建或更新项
        items.forEach((item, index) => {
            const key = this._getItemKey(item, index, context);
            newKeys.add(key);
            
            if (!this.items.has(key)) {
                // 创建新项
                const element = context.container.createItem(index, item, key);
                this.items.set(key, element);
                this.itemKeys.set(item, key);
            } else {
                // 更新现有项
                const element = this.items.get(key);
                if (context.template) {
                    context.template(item, index);
                }
            }
        });
        
        // 移除不存在的项
        const keysToRemove: (string | number)[] = [];
        this.items.forEach((element, key) => {
            if (!newKeys.has(key)) {
                context.container.removeItem(element);
                keysToRemove.push(key);
            }
        });
        
        keysToRemove.forEach(key => {
            const element = this.items.get(key);
            if (element) {
                this.itemKeys.delete(element);
            }
            this.items.delete(key);
        });
    }
    
    /**
     * 获取项的唯一键
     */
    private _getItemKey(item: any, index: number, context: ForDirectiveContext): string | number {
        if (context.itemKey) {
            if (typeof context.itemKey === 'function') {
                return context.itemKey(item, index);
            } else if (typeof context.itemKey === 'string') {
                return item[context.itemKey] ?? index;
            }
        }
        
        // 默认使用索引
        return index;
    }
    
    /**
     * 获取嵌套路径的值
     */
    private _getValue(obj: any, path: string): any {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[key];
        }
        return value;
    }
    
    /**
     * 销毁指令
     */
    destroy(): void {
        super.destroy();
        this.items.clear();
        this.itemKeys.clear();
    }
}


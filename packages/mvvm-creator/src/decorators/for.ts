/**
 * 列表渲染装饰器
 * 
 * 用于声明式地定义列表渲染
 * 
 * @example
 * ```typescript
 * @ccclass('ItemList')
 * export class ItemList extends MVVMComponent {
 *     // 方式1: 直接应用到属性上（推荐）
 *     @property(Node)
 *     @forDirective('items', { template: 'itemTemplate', key: 'id' })
 *     containerNode: Node | null = null;
 *     
 *     @property(Node)
 *     itemTemplate: Node | null = null;
 *     
 *     // 方式2: 使用占位符（向后兼容）
 *     @forDirective('items', { 
 *         container: 'containerNode', 
 *         template: 'itemTemplate',
 *         key: (item) => item.id
 *     })
 *     private _placeholder!: any;
 * }
 * ```
 */

/**
 * 列表渲染配置
 */
export interface ForOptions {
    /** 容器节点属性名称，如果不指定则使用装饰器所在的属性名 */
    container?: string;
    /** 模板节点属性名称 */
    template: string;
    /** 项的唯一键字段名或函数 */
    key?: string | ((item: any, index: number) => string | number);
}

/**
 * 列表渲染装饰器
 * 
 * @param path 数据路径（如 'items', 'player.inventory'）
 * @param options 列表渲染选项
 */
export function forDirective(path: string, options?: ForOptions) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        // 存储列表渲染配置到类的元数据
        // 如果没有指定 container，则使用当前属性名作为 container
        const lists = target.constructor.__lists__ || [];
        lists.push({
            path,
            container: options?.container || propertyKey, // 自动推断 container
            template: options?.template,
            key: options?.key
        });
        target.constructor.__lists__ = lists;
    };
}

// 导出为 for（但 TypeScript 中 for 是关键字，所以使用 forDirective）
export { forDirective as for };


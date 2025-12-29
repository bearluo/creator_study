/**
 * 条件渲染装饰器
 * 
 * 用于声明式地定义条件渲染
 * 
 * @example
 * ```typescript
 * @ccclass('PlayerInfo')
 * export class PlayerInfo extends MVVMComponent {
 *     // 方式1: 直接应用到属性上（推荐）
 *     @property(Node)
 *     @ifDirective('showInfo')
 *     infoPanel: Node | null = null;
 *     
 *     // 方式2: 使用占位符（向后兼容）
 *     @ifDirective('showInfo', { target: 'infoPanel' })
 *     private _placeholder!: any;
 * }
 * ```
 */

/**
 * 条件渲染配置
 */
export interface IfOptions {
    /** 目标属性名称（组件中的 @property 属性名），如果不指定则使用装饰器所在的属性名 */
    target?: string;
}

/**
 * 条件渲染装饰器
 * 
 * @param path 数据路径（如 'showInfo', 'player.isVisible'）
 * @param options 条件渲染选项
 */
export function ifDirective(path: string, options?: IfOptions) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        // 存储条件渲染配置到类的元数据
        // 如果没有指定 target，则使用当前属性名作为 target
        const conditions = target.constructor.__conditions__ || [];
        conditions.push({
            path,
            target: options?.target || propertyKey // 自动推断 target
        });
        target.constructor.__conditions__ = conditions;
    };
}

// 导出为 if（但 TypeScript 中 if 是关键字，所以使用 ifDirective）
export { ifDirective as if };


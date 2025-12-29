/**
 * 事件绑定装饰器
 * 
 * 用于声明式地定义事件绑定
 * 
 * @example
 * ```typescript
 * @ccclass('PlayerInfo')
 * export class PlayerInfo extends MVVMComponent {
 *     // 方式1: 直接应用到属性上（推荐）
 *     @property(Button)
 *     @on('click', { handler: 'onLevelUp' })
 *     levelUpButton: Button | null = null;
 *     
 *     // 方式2: 使用占位符（向后兼容）
 *     @on('click', { target: 'levelUpButton', handler: 'onLevelUp' })
 *     private _placeholder!: any;
 *     
 *     onLevelUp() {
 *         // 处理升级逻辑
 *     }
 * }
 * ```
 */

/**
 * 事件绑定配置
 */
export interface OnOptions {
    /** 目标属性名称（组件中的 @property 属性名），如果不指定则使用装饰器所在的属性名 */
    target?: string;
    /** 事件处理函数名称或路径，如果不指定则尝试从属性名推断（如 levelUpButton -> onLevelUp） */
    handler?: string | Function;
    /** 是否使用捕获阶段 */
    useCapture?: boolean;
}

/**
 * 事件绑定装饰器
 * 
 * @param event 事件名称（如 'click', 'touchstart'）
 * @param options 事件绑定选项
 */
export function on(event: string, options?: OnOptions) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        // 存储事件绑定配置到类的元数据
        // 如果没有指定 target，则使用当前属性名作为 target
        // 如果没有指定 handler，尝试从属性名推断（如 levelUpButton -> onLevelUp）
        let handler = options?.handler;
        if (!handler && propertyKey.endsWith('Button')) {
            // 尝试自动推断：levelUpButton -> onLevelUp
            const baseName = propertyKey.replace(/Button$/, '');
            const inferredHandler = 'on' + baseName.charAt(0).toUpperCase() + baseName.slice(1);
            handler = inferredHandler;
        }
        
        const events = target.constructor.__events__ || [];
        events.push({
            event,
            target: options?.target || propertyKey, // 自动推断 target
            handler: handler,
            useCapture: options?.useCapture || false
        });
        target.constructor.__events__ = events;
    };
}


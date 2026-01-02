import { Directive } from './Directive';
import { Reactive } from '../reactive/Reactive';

/**
 * 事件绑定指令上下文
 */
export interface OnDirectiveContext {
    element: {
        on(event: string, handler: (...args: any[]) => void): () => void;
        off(event: string, handler: (...args: any[]) => void): void;
    };
    eventName: string;
    handler?: (...args: any[]) => void;
    handlerPath?: string; // 响应式数据中的方法路径
}

/**
 * 事件绑定指令
 * 
 * 绑定事件处理器到元素
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ 
 *     onClick: () => console.log('clicked'),
 *     onHover: () => console.log('hovered')
 * });
 * 
 * const directive = new OnDirective(reactive, 'onClick');
 * directive.execute({ element, eventName: 'click', handlerPath: 'onClick' });
 * ```
 */
export class OnDirective extends Directive {
    private eventName: string;
    private handlerPath?: string;
    private eventUnsubscribe?: () => void;
    private currentHandler?: (...args: any[]) => void;
    
    constructor(reactive: Reactive<any>, eventName: string, handlerPath?: string) {
        super(reactive);
        this.eventName = eventName;
        this.handlerPath = handlerPath;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    execute(context: OnDirectiveContext): void {
        this._bindEvent(context);
        
        // 如果 handlerPath 存在，监听变化
        if (this.handlerPath) {
            this.watcher = this.createWatcher(
                (ctx) => {
                    // 运行回调：重新绑定
                    this._unbindEvent(ctx);
                    this._bindEvent(ctx);
                },
                context
            );
        }
    }
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    update(context: OnDirectiveContext): void {
        this._unbindEvent(context);
        this._bindEvent(context);
    }
    
    /**
     * 绑定事件
     */
    private _bindEvent(context: OnDirectiveContext): void {
        let handler: ((...args: any[]) => void) | undefined;
        
        if (context.handler) {
            // 使用提供的处理器
            handler = context.handler;
        } else if (this.handlerPath) {
            // 从响应式数据中获取处理器
            handler = this._getValue(this.reactive.value, this.handlerPath);
        } else if (context.handlerPath) {
            // 使用上下文中的处理器路径
            handler = this._getValue(this.reactive.value, context.handlerPath);
        }
        
        if (handler && typeof handler === 'function') {
            this.currentHandler = handler;
            const eventName = context.eventName || this.eventName;
            this.eventUnsubscribe = context.element.on(eventName, handler);
        } else {
            console.warn(`[OnDirective] Handler not found for event "${context.eventName || this.eventName}"`);
        }
    }
    
    /**
     * 解绑事件
     */
    private _unbindEvent(context: OnDirectiveContext): void {
        if (this.eventUnsubscribe) {
            this.eventUnsubscribe();
            this.eventUnsubscribe = undefined;
        }
        if (this.currentHandler) {
            const eventName = context.eventName || this.eventName;
            context.element.off(eventName, this.currentHandler);
            this.currentHandler = undefined;
        }
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
        if (this.eventUnsubscribe) {
            this.eventUnsubscribe();
            this.eventUnsubscribe = undefined;
        }
        super.destroy();
    }
}


import { Directive } from './Directive';
import { Reactive } from '../reactive/Reactive';
import { Watcher } from '../reactive/Watcher';

/**
 * 条件渲染指令上下文
 */
export interface IfDirectiveContext {
    element: {
        show(): void;
        hide(): void;
        visible: boolean;
    };
    path: string;
}

/**
 * 条件渲染指令
 * 
 * 根据条件显示或隐藏元素
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ isVisible: true });
 * const element = { show: () => {}, hide: () => {}, visible: true };
 * 
 * const directive = new IfDirective(reactive, 'isVisible');
 * directive.execute({ element, path: 'isVisible' });
 * ```
 */
export class IfDirective extends Directive {
    private path: string;
    
    constructor(reactive: Reactive<any>, path: string) {
        super(reactive);
        this.path = path;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    execute(context: IfDirectiveContext): void {
        const value = this._getValue(this.reactive.value, this.path);
        this._updateVisibility(context.element, Boolean(value));
        
        // 创建观察者，监听变化
        this.watcher = this.createWatcher(
            (ctx) => {
                // 运行回调：重新计算并更新
                const value = this._getValue(this.reactive.value, this.path);
                this._updateVisibility(ctx.element, Boolean(value));
            },
            context
        );
    }
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    update(context: IfDirectiveContext): void {
        const value = this._getValue(this.reactive.value, this.path);
        this._updateVisibility(context.element, Boolean(value));
    }
    
    /**
     * 更新可见性
     */
    private _updateVisibility(element: IfDirectiveContext['element'], visible: boolean): void {
        if (visible && !element.visible) {
            element.show();
        } else if (!visible && element.visible) {
            element.hide();
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
}


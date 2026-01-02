import { Directive } from './Directive';
import { Reactive } from '../reactive/Reactive';

/**
 * 属性绑定指令上下文
 */
export interface BindDirectiveContext {
    element: {
        setProperty(name: string, value: any): void;
        getProperty(name: string): any;
    };
    propertyName: string;
    path: string;
    mode?: 'one-way' | 'two-way';
    converter?: (value: any) => any;
    reverseConverter?: (value: any) => any;
}

/**
 * 属性绑定指令
 * 
 * 绑定属性到元素
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ title: 'Hello', count: 10 });
 * const element = { setProperty: (name, value) => {}, getProperty: (name) => {} };
 * 
 * const directive = new BindDirective(reactive, 'title');
 * directive.execute({ element, propertyName: 'text', path: 'title' });
 * ```
 */
export class BindDirective extends Directive {
    private path: string;
    private propertyName: string;
    private mode: 'one-way' | 'two-way' = 'one-way';
    private converter?: (value: any) => any;
    private reverseConverter?: (value: any) => any;
    private changeUnsubscribe?: () => void;
    
    constructor(
        reactive: Reactive<any>, 
        path: string, 
        propertyName: string,
        options?: {
            mode?: 'one-way' | 'two-way';
            converter?: (value: any) => any;
            reverseConverter?: (value: any) => any;
        }
    ) {
        super(reactive);
        this.path = path;
        this.propertyName = propertyName;
        this.mode = options?.mode || 'one-way';
        this.converter = options?.converter;
        this.reverseConverter = options?.reverseConverter;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    execute(context: BindDirectiveContext): void {
        const value = this._getValue(this.reactive.value, this.path);
        const convertedValue = this.converter ? this.converter(value) : value;
        
        context.element.setProperty(
            context.propertyName || this.propertyName,
            convertedValue
        );
        
        // 双向绑定：监听元素变化
        if ((context.mode || this.mode) === 'two-way') {
            this._setupElementListener(context);
        }
        
        // 创建观察者，监听数据变化
        this.watcher = this.createWatcher(
            (ctx) => {
                // 运行回调：重新绑定
                const value = this._getValue(this.reactive.value, this.path);
                const convertedValue = this.converter ? this.converter(value) : value;
                ctx.element.setProperty(ctx.propertyName || this.propertyName, convertedValue);
            },
            context
        );
    }
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    update(context: BindDirectiveContext): void {
        const value = this._getValue(this.reactive.value, this.path);
        const convertedValue = this.converter ? this.converter(value) : value;
        context.element.setProperty(context.propertyName || this.propertyName, convertedValue);
    }
    
    /**
     * 设置元素监听器（双向绑定）
     */
    private _setupElementListener(context: BindDirectiveContext): void {
        // 假设元素支持 change 事件
        // 实际实现需要根据具体的元素类型来适配
        if (context.element && typeof (context.element as any).on === 'function') {
            this.changeUnsubscribe = (context.element as any).on('change', (propertyName: string, value: any) => {
                if (propertyName === (context.propertyName || this.propertyName)) {
                    const convertedValue = this.reverseConverter 
                        ? this.reverseConverter(value) 
                        : value;
                    this._setValue(this.reactive.value, this.path, convertedValue);
                }
            });
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
     * 设置嵌套路径的值
     */
    private _setValue(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        let target = obj;
        
        for (const key of keys) {
            if (target[key] === null || target[key] === undefined) {
                target[key] = {};
            }
            target = target[key];
        }
        
        target[lastKey] = value;
    }
    
    /**
     * 销毁指令
     */
    destroy(): void {
        if (this.changeUnsubscribe) {
            this.changeUnsubscribe();
            this.changeUnsubscribe = undefined;
        }
        super.destroy();
    }
}


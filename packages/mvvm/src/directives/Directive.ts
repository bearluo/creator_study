import type { IReactive, Watcher } from '../core/types';
import { Reactive } from '../reactive/Reactive';
import { Watcher as WatcherImpl } from '../reactive/Watcher';

/**
 * 指令基类
 * 
 * 所有指令都应继承此类
 */
export abstract class Directive {
    protected reactive: Reactive<any>;
    protected watcher: WatcherImpl | null = null;
    protected unsubscribe?: () => void;
    
    constructor(reactive: Reactive<any>) {
        this.reactive = reactive;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    abstract execute(context: any): void;
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    abstract update(context: any): void;
    
    /**
     * 销毁指令
     */
    destroy(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
        this.watcher = null;
    }
    
    /**
     * 创建观察者
     * @param updateCallback 更新回调函数
     * @param runCallback 运行回调函数
     * @param context 上下文
     */
    protected createWatcher(
        updateCallback: (key: string | symbol, newValue: any, oldValue: any, context: any) => void,
        runCallback: (context: any) => void,
        context: any
    ): WatcherImpl {
        const watcher = new WatcherImpl(
            (key, newValue, oldValue) => {
                updateCallback(key, newValue, oldValue, context);
            },
            () => {
                runCallback(context);
            }
        );
        
        this.watcher = watcher;
        this.unsubscribe = this.reactive.watch(watcher);
        return watcher;
    }
}


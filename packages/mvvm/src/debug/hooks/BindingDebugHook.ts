import type { DataBinding } from '../../binding/DataBinding';
import type { DebugHook, BindingState, ErrorInfo } from '../types';

/**
 * DataBinding 调试钩子
 */
export class BindingDebugHook implements DebugHook {
    private binding: DataBinding<any, any, any>;
    private updateCount: number = 0;
    private lastUpdateTime: number = 0;
    private totalUpdateTime: number = 0;
    private errorInfo?: ErrorInfo;
    
    constructor(binding: DataBinding<any, any, any>) {
        this.binding = binding;
    }
    
    getState(): BindingState {
        return {
            path: (this.binding as any).getPath?.() || (this.binding as any).path,
            mode: (this.binding as any).getMode?.() || (this.binding as any).options?.mode || 'one-way',
            viewType: this.getViewType(),
            isActive: (this.binding as any).getIsActive?.() ?? true,
            stats: {
                updateCount: this.updateCount,
                lastUpdateTime: this.lastUpdateTime,
                averageUpdateTime: this.updateCount > 0 ? this.totalUpdateTime / this.updateCount : 0
            },
            error: this.errorInfo
        };
    }
    
    private getViewType(): string {
        // 尝试获取视图类型
        const view = (this.binding as any).getView?.() || (this.binding as any).view;
        return view?.constructor?.name || 'Unknown';
    }
    
    /**
     * 记录更新（由 DataBinding 调用）
     */
    recordUpdate(duration: number): void {
        this.updateCount++;
        this.lastUpdateTime = Date.now();
        this.totalUpdateTime += duration;
    }
    
    /**
     * 记录错误（由 DataBinding 调用）
     */
    recordError(error: Error, context?: any): void {
        this.errorInfo = {
            message: error.message,
            stack: error.stack?.split('\n') || [],
            timestamp: Date.now(),
            context
        };
    }
}


import type { ViewModel } from '../../core/ViewModel';
import type { DataBinding } from '../../binding/DataBinding';
import type { DebugHook, ViewModelState, ModelSnapshot, BindingInfo } from '../types';
import { Debugger } from '../Debugger';

/**
 * ViewModel 调试钩子
 */
export class ViewModelDebugHook implements DebugHook {
    private viewModel: ViewModel<any>;
    private bindingInfos: WeakMap<DataBinding<any, any, any>, BindingInfo> = new WeakMap();
    
    constructor(viewModel: ViewModel<any>) {
        this.viewModel = viewModel;
    }
    
    getState(): ViewModelState<any> {
        const bindings = this.getBindings();
        const activeBindings = bindings.filter(b => b.isActive);
        
        return {
            model: this.getModelSnapshot(),
            bindings,
            stats: {
                bindingCount: bindings.length,
                activeBindingCount: activeBindings.length,
                lastBindingTime: this.getLastBindingTime(bindings)
            }
        };
    }
    
    private getModelSnapshot(): ModelSnapshot<any> {
        return {
            data: this.viewModel.model.data,
            lastUpdateTime: Date.now() // 需要额外的追踪
        };
    }
    
    private getBindings(): BindingInfo[] {
        // 通过 ViewModel 的 getBindings() 方法获取
        const bindings = (this.viewModel as any).getBindings?.() || [];
        return bindings.map((binding: any) => {
            const info = this.bindingInfos.get(binding);
            if (info) {
                return info;
            }
            // 如果没有注册信息，创建默认信息
            return {
                path: binding.path || 'unknown',
                mode: binding.options?.mode || 'one-way',
                viewType: binding.view?.constructor?.name || 'Unknown',
                isActive: true,
                updateCount: 0,
                lastUpdateTime: Date.now()
            };
        });
    }
    
    private getLastBindingTime(bindings: BindingInfo[]): number {
        if (bindings.length === 0) return 0;
        return Math.max(...bindings.map(b => b.lastUpdateTime));
    }
    
    /**
     * 注册绑定（由 ViewModel 调用）
     */
    registerBinding(binding: DataBinding<any, any, any>): void {
        // 创建绑定信息
        const info: BindingInfo = {
            path: binding.getPath(),
            mode: binding.getMode(),
            viewType: this.getViewType(binding),
            isActive: true,
            updateCount: 0,
            lastUpdateTime: Date.now()
        };
        this.bindingInfos.set(binding, info);
    }
    
    /**
     * 注销绑定（由 ViewModel 调用）
     */
    unregisterBinding(binding: DataBinding<any, any, any>): void {
        const info = this.bindingInfos.get(binding);
        if (info) {
            info.isActive = false;
        }
    }
    
    private getViewType(binding: DataBinding<any, any, any>): string {
        // 尝试获取视图类型
        return binding.getView()?.constructor?.name || 'Unknown';
    }
}


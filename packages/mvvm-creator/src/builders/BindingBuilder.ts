/**
 * BindingBuilder - 类型安全的绑定构建器
 * 
 * 方案 2.1 最终版：延迟构建方案（ViewTarget + TargetViewAdapter）
 */
import type { ViewModel, Path, PathValue, BindingOptions, BatchBindingItem, DataBinding } from '@bl-framework/mvvm';
import type { ViewTarget } from '../types/view-target';
import { TargetViewAdapter } from '../adapters/TargetViewAdapter';

/**
 * 绑定项配置
 */
type AnyPath<T> = Path<T> & string;

interface BindingItem<T, P extends AnyPath<T>> {
    path: P;
    target: ViewTarget<any>;
    options?: BindingOptions<PathValue<T, P>, any>;
    targetId?: string; // 由 addTarget 返回的 targetId
}

/**
 * 绑定构建器（方案 2.1 - 最终推荐版）
 */
export class BindingBuilder<T> {
    private viewModel: ViewModel<T>;
    private items: BindingItem<T, AnyPath<T>>[] = [];
    
    constructor(viewModel: ViewModel<T>) {
        this.viewModel = viewModel;
    }
    
    /**
     * 类型安全的数据绑定方法
     * 
     * @template P 路径类型（从 Path<T> 推断）
     * @template TV 视图值类型（从 ViewTarget 推断）
     * @param path 数据路径（类型安全）
     * @param target 视图目标适配器（ViewTarget）
     * @param options 绑定选项（可选，TViewValue 类型从 target 推断）
     * @returns this（支持链式调用）
     */
    bind<P extends AnyPath<T>, TV>(
        path: P,
        target: ViewTarget<TV>,
        options?: BindingOptions<PathValue<T, P>, TV>
    ): this {
        this.items.push({ path, target, options } as any);
        return this;
    }
    
    /**
     * 构建所有绑定
     * 
     * @returns { bindings: DataBinding 数组; view: TargetViewAdapter }
     * 
     * 注意：build() 只允许调用一次
     * 如果要重新 build：新建 builder 或 builder.clear() 重新配置
     * 
     * ⚠️ **重要变更**：
     * - ✅ 允许同 path 多个 target（不再检测重复 path）
     * - ✅ 每个 binding 都有 sourceId（用于多 input 防回环）
     * - ⚠️ two-way 绑定必须带 sourceId guard（否则禁止多 input）
     */
    build(): { bindings: DataBinding<T, any, any>[]; view: TargetViewAdapter } {

        // ✅ **规则变更**：不再禁止同 path 多个 target
        // 允许同 path 绑定多个 ViewTarget（display/input 都可）
        
        // 创建共享的 TargetViewAdapter
        const view = new TargetViewAdapter();
        
        // 先把所有 target 注册进 adapter，获取 targetId
        for (const item of this.items) {
            const targetId = view.addTarget(item.path, item.target);
            item.targetId = targetId;
        }
        
        // ⚠️ **风险控制**：如果 build 中途 throw，需要确保不会残留 UI 事件监听或 watcher
        // 策略：先创建所有 bindings，再标记 built，确保原子性
        let createdBindings: DataBinding<T, any, any>[] = [];
        
        try {
            // ⚠️ **重要**：由于需要传递 sourceId，不能使用 bindMany（bindMany 不支持 sourceId）
            // 改用逐个 bind，并为每个 binding 传递对应的 targetId 作为 sourceId
            for (const item of this.items) {
                const binding = this.viewModel.bind(
                    item.path,
                    view,
                    item.options,
                    item.targetId // 传递 targetId 作为 sourceId
                );
                createdBindings.push(binding);
            }
            
            return { bindings: createdBindings, view };
        } catch (error) {
            // build 失败时的半成品清理策略
            // 1. 销毁已创建的 bindings（如果有）
            for (const binding of createdBindings) {
                binding.destroy();
            }
            
            // 2. 销毁已创建的 view（会解绑所有已注册的 onChange）
            view.destroy();
            
            // 4. 重新抛出错误
            throw error;
        }
    }
    
    /**
     * 清空配置（不自动 destroy 外部资源）
     * 
     * ⚠️ **重要**：clear() 只清空配置，不负责销毁外部资源（bindings/view 的销毁交给 MVVMComponent）
     * 
     * **使用场景**：
     * - 推荐：builder 只用于 MVVMComponent 管理场景
     * - 独立使用：如需独立使用 builder，必须在 clear() 前手动销毁当前 bindings 和 view
     * 
     * 重新 enable：builder.clear(); 重新 bind...; build()
     */
    clear(): void {
        this.items.length = 0;
    }
}

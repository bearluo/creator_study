/**
 * ViewHost - Cocos Creator Component 基类
 * 
 * 方案 C：View Contract 强类型方案
 * 
 * 职责：
 * - 管理 ViewModel 和 View 的生命周期
 * - 提供抽象方法供子类实现
 * - 支持泛型（ViewModel 类型和 View Contract 类型）
 * 
 * @template TData ViewModel 的数据类型
 * @template TContract View Contract 接口类型
 * 
 * @example
 * ```typescript
 * @ccclass('HUDViewHost')
 * export class HUDViewHost extends ViewHost<PlayerData, IHUDView> {
 *     protected createViewModel(): ViewModel<PlayerData> {
 *         const model = new PlayerModel();
 *         return new HUDViewModel(model);
 *     }
 *     
 *     protected createView(): IHUDView {
 *         return new HUDView();
 *     }
 *     
 *     protected setupViewTargets(view: IHUDView): void {
 *         view.nameText = toLabelText(this.nameLabel);
 *         // ...
 *     }
 * }
 * ```
 */
import { Component } from 'cc';
import type { ViewModel } from '@bl-framework/mvvm';

export abstract class ViewHost<TData, TContract> extends Component {
    protected viewModel!: ViewModel<TData>;
    protected view!: TContract;
    
    /**
     * 创建 ViewModel
     * 
     * 子类必须实现此方法
     */
    protected abstract createViewModel(): ViewModel<TData>;
    
    /**
     * 创建 View 实例
     * 
     * 子类必须实现此方法
     */
    protected abstract createView(): TContract;
    
    /**
     * 设置 ViewTarget（控件 → ViewTarget 转换和注入）
     * 
     * 子类必须实现此方法
     * 
     * @param view View 实例
     */
    protected abstract setupViewTargets(view: TContract): void;
    
    /**
     * 绑定 View（默认调用 VM 的 bindView）
     * 
     * 子类可以重写此方法以支持特殊情况
     * 
     * @param viewModel ViewModel 实例
     * @param view View 实例
     */
    protected bindView(viewModel: ViewModel<TData>, view: TContract): void {
        if ('bindView' in viewModel && typeof viewModel.bindView === 'function') {
            (viewModel as any).bindView(view);
        } else {
            throw new Error(
                'ViewModel must implement bindView method, ' +
                'or override bindView in ViewHost'
            );
        }
    }
    
    /**
     * onLoad：只做一次性的"结构准备"
     * - 创建 ViewModel 和 View 实例
     * - 不做绑定（避免禁用/启用导致重复）
     */
    override onLoad(): void {
        this.viewModel = this.createViewModel();
        this.view = this.createView();
    }
    
    /**
     * onEnable：开始"激活绑定/订阅"
     * - 设置 ViewTarget（控件 → ViewTarget 转换和注入）
     * - 调用 VM 的 bindView 建立绑定
     */
    override onEnable(): void {
        this.setupViewTargets(this.view);
        this.bindView(this.viewModel, this.view);
    }
    
    /**
     * onDisable：暂停"绑定/订阅"（非常推荐）
     * - 调用 VM 的 dispose() 解绑所有绑定
     * - Cocos 里节点 disable 可能频繁发生；不暂停会导致隐藏 UI 仍在跑 watcher.run
     */
    override onDisable(): void {
        if (this.viewModel && 'dispose' in this.viewModel && typeof this.viewModel.dispose === 'function') {
            (this.viewModel as any).dispose();
        }
    }
    
    /**
     * onDestroy：彻底释放
     * - 确保 onDisable 已做的事情都做过（幂等）
     * - 清理引用
     */
    override onDestroy(): void {
        this.onDisable();
        // 清理引用
        (this as any).viewModel = undefined;
        (this as any).view = undefined;
    }
}


/**
 * View Contract 使用示例（方案 C）
 * 
 * 展示完整的四层架构：
 * Model → ViewModel → View Contract → ViewHost
 */

import { _decorator, Label, EditBox, ProgressBar } from 'cc';
import { Model } from '@bl-framework/mvvm';
import { ViewHost, View, ViewModel } from '@bl-framework/mvvm-creator';
import { toLabelText, toProgress, toEditBox } from '@bl-framework/mvvm-creator';
import type { ViewTarget } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

// ========== 1. Model（公共业务数据）==========
// @bl-framework/mvvm

interface PlayerData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
}

class PlayerModel extends Model<PlayerData> {
    constructor() {
        super({
            name: 'Player',
            level: 1,
            health: 100,
            maxHealth: 100
        });
    }
}

// ========== 2. View Contract（强类型契约）==========
// 业务工程：src/contracts/IHUDView.ts

/**
 * HUD View Contract
 * 
 * ⚠️ **字段约定**：
 * - 必需字段：VM 一定会 bind（如 nameText, levelText, hpBar）
 * - 可选字段：VM 需判空再 bind（如 nameInput?）
 */
export interface IHUDView {
    // 必需字段：VM 一定会 bind
    nameText: ViewTarget<string>;
    levelText: ViewTarget<string>;
    hpBar: ViewTarget<number>;
    
    // 可选字段：VM 需判空再 bind
    nameInput?: ViewTarget<string>; // 如果支持双向，使用 TwoWayViewTarget<string>
}

// ========== 3. View（实现 Contract，但不碰 Cocos）==========
// 业务工程：src/contracts/HUDView.ts

export class HUDView extends View implements IHUDView {
    nameText!: ViewTarget<string>;
    levelText!: ViewTarget<string>;
    hpBar!: ViewTarget<number>;
    nameInput?: ViewTarget<string>;
}

// ========== 4. ViewModel（公共 VM，不 import cocos）==========
// 业务工程：src/viewmodels/HUDViewModel.ts

class HUDViewModel extends ViewModel<PlayerData> {
    private isViewBound = false;
    
    /**
     * 绑定 View
     * 
     * ⚠️ **幂等保证**：
     * - bindView 只能被调用一次（推荐）
     * - 或者内部先 unbindAll() 再 bind（支持重复调用）
     */
    bindView(view: IHUDView): void {
        // 方案 1：只允许调用一次（推荐）
        if (this.isViewBound) {
            console.warn('[HUDViewModel] bindView already called, ignoring');
            return;
        }
        
        // 方案 2：支持重复调用（先解绑再绑定）
        // this.unbindAll(); // 如果支持重复调用
        
        // 绑定语义在 VM，不写 Label/ProgressBar
        this.bind('name', view.nameText);
        this.bind('level', view.levelText, { 
            converter: (v: number) => `Lv.${v}` 
        });
        this.bind('health', view.hpBar, { 
            converter: (v: number) => v / this.reactive.value.maxHealth 
        });
        
        // 可选字段：需判空再 bind
        if (view.nameInput) {
            this.bind('name', view.nameInput, { mode: 'two-way' });
        }
        
        this.isViewBound = true;
    }
    
    /**
     * 解绑所有绑定
     */
    unbindAll(): void {
        // 使用 ViewModel 的 destroy() 或手动解绑
        this.destroy(); // 这会销毁所有 bindings
        this.isViewBound = false;
    }
    
    /**
     * 统一销毁方法
     */
    dispose(): void {
        this.unbindAll();
    }
}

// ========== 5. ViewHost（Cocos Component，真正的 UI 脚本）==========
// 业务工程：src/components/HUDViewHost.ts

@ccclass('HUDViewHost')
export class HUDViewHost extends ViewHost<PlayerData, IHUDView> {
    @property(Label)
    nameLabel!: Label;
    
    @property(Label)
    levelLabel!: Label;
    
    @property(ProgressBar)
    hpProgressBar!: ProgressBar;
    
    @property(EditBox)
    nameEditBox?: EditBox;
    
    /**
     * 创建 ViewModel
     */
    protected createViewModel(): ViewModel<PlayerData> {
        const model = new PlayerModel();
        return new HUDViewModel(model);
    }
    
    /**
     * 创建 View 实例
     */
    protected createView(): IHUDView {
        return new HUDView();
    }
    
    /**
     * 设置 ViewTarget（控件 → ViewTarget 转换和注入）
     * 
     * ViewHost 只做"控件→ViewTarget"，不写 path
     */
    protected setupViewTargets(view: IHUDView): void {
        view.nameText = toLabelText(this.nameLabel);
        view.levelText = toLabelText(this.levelLabel);
        view.hpBar = toProgress(this.hpProgressBar);
        
        // 可选字段：如果控件存在，注入 ViewTarget
        if (this.nameEditBox) {
            view.nameInput = toEditBox(this.nameEditBox);
        }
    }
    
    // 生命周期由 ViewHost 基类管理：
    // - onLoad: 创建 ViewModel 和 View
    // - onEnable: setupViewTargets + bindView
    // - onDisable: dispose
    // - onDestroy: 清理资源
}


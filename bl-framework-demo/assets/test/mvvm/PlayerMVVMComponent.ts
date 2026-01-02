/**
 * Player MVVM 组件示例
 * 用于演示 MVVMComponent 的使用
 */
import { _decorator, Label, EditBox, ProgressBar, Node } from 'cc';
import { MVVMComponent } from '@bl-framework/mvvm-creator';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { toLabelText, toLabelFmt, toEditBox, toProgress, toActive } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 玩家数据接口
 */
interface PlayerData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    playerName: string;
    isDead: boolean;
}

/**
 * 玩家 MVVM 组件
 */
@ccclass('PlayerMVVMComponent')
export class PlayerMVVMComponent extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel!: Label;
    
    @property(Label)
    levelLabel!: Label;
    
    @property(Label)
    healthLabel!: Label;
    
    @property(ProgressBar)
    healthBar!: ProgressBar;
    
    @property(EditBox)
    nameInput!: EditBox;
    
    @property(EditBox)
    nameInput2!: EditBox; // 第二个输入框，用于演示同 path 多个 input
    
    @property(Node)
    deadMask!: Node;

    protected createModel(): Model<PlayerData> {
        return new Model<PlayerData>({
            name: 'Player',
            level: 1,
            health: 100,
            maxHealth: 100,
            playerName: 'New Player',
            isDead: false
        });
    }

    protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
        return new ViewModel(model);
    }

    protected onMVVMCreate(): void {
        // 只声明绑定规则，不调用 build()
        // ✅ 演示同 path 多个 target：
        // - 'name' 绑定到 nameLabel（display）
        // - 'health' 绑定到 healthLabel 和 healthBar（两个 display）
        // - 'playerName' 绑定到 nameInput 和 nameInput2（两个 input，two-way）
        this.bindingBuilder
            .bind('name', toLabelText(this.nameLabel))
            .bind('level', toLabelFmt(this.levelLabel, (v: number) => `Lv.${v}`))
            .bind('health', toLabelFmt(this.healthLabel, (v: number) => `${v}/${this.viewModel.reactive.value.maxHealth}`))
            .bind('health', toProgress(this.healthBar, (v: number) => v / this.viewModel.reactive.value.maxHealth)) // 同 path，多个 display
            .bind('playerName', toEditBox(this.nameInput), { mode: 'two-way' })
            .bind('playerName', toEditBox(this.nameInput2), { mode: 'two-way' }) // 同 path，多个 input（sourceId 防回环）
            .bind('isDead', toActive(this.deadMask));
    }

    /**
     * 测试方法：更新玩家数据
     */
    testUpdateData(): void {
        this.viewModel.reactive.value.name = 'Updated Player';
        this.viewModel.reactive.value.level = 10;
        this.viewModel.reactive.value.health = 50;
        this.viewModel.reactive.value.playerName = 'Updated Name';
        this.viewModel.reactive.value.isDead = false;
    }
}


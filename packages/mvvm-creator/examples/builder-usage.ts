/**
 * 构建器使用示例
 * 
 * 展示如何使用类型安全的 BindingBuilder 和 ViewTarget 构建数据绑定
 */

import { _decorator, Label, EditBox, ProgressBar, Node, Button } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent } from '@bl-framework/mvvm-creator';
import { toLabelText, toEditBox, toProgress, toActive } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 玩家数据类型
 */
interface PlayerData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    playerName: string;
    showInfo: boolean;
}

/**
 * 使用构建器的玩家信息组件（类型安全版本）
 */
@ccclass('PlayerInfoBuilder')
export class PlayerInfoBuilder extends MVVMComponent<PlayerData> {
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
    
    @property(Node)
    infoPanel!: Node;

    protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
        return new ViewModel(model);
    }

    protected createModel(): Model<PlayerData> {
        return new Model<PlayerData>({
            name: 'Player 1',
            level: 1,
            health: 100,
            maxHealth: 100,
            playerName: 'New Player',
            showInfo: true
        });
    }

    protected onMVVMCreate(): void {
        // 方式 1: 使用 bind() 方法（原有方式，仍然支持）
        // this.bindingBuilder
        //     .bind('name', toLabelText(this.nameLabel))
        //     .bind('level', toLabelText(this.levelLabel), { converter: (v: number) => `Lv.${v}` })
        //     ...

        // 方式 2: 使用 bindConfig() 方法（新语法糖，推荐）
        this.bindingBuilder.bindConfig([
            // 数据绑定（类型安全：IDE 自动补全，编译时检查）
            { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
            {
                path: 'level',
                target: this.levelLabel,
                helper: 'toLabelText',
                converter: (v) => `Lv.${v}` // ✅ v: number（自动推断，不要手写类型）
            },
            {
                path: 'health',
                target: this.healthLabel,
                helper: 'toLabelText',
                converter: (v) => {
                    // ✅ v: number（自动推断）
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return `Health: ${v}/${maxHealth}`;
                }
            },
            {
                path: 'health',
                target: this.healthBar,
                helper: 'toProgress',
                converter: (v) => {
                    // ✅ 同 path 多个 target：health 绑定到 healthLabel 和 healthBar
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return v / maxHealth;
                }
            },
            // 双向绑定（two-way）
            {
                path: 'playerName',
                target: this.nameInput,
                helper: 'toEditBox',
                mode: 'two-way'
            },
            // 条件渲染
            { path: 'showInfo', target: this.infoPanel, helper: 'toActive' }
        ] as const); // 使用 as const 保持字面量类型
        
        // ❌ 类型错误示例（编译时检查）
        // this.bindingBuilder.bindConfig([
        //     { path: 'nam', target: this.nameLabel, helper: 'toLabelText' },        // ❌ TypeScript 错误
        //     { path: 'level.name', target: this.nameLabel, helper: 'toLabelText' }  // ❌ TypeScript 错误
        // ]);
    }
}

/**
 * 同 path 多个 target 示例
 */
@ccclass('MultiTargetExample')
export class MultiTargetExample extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel!: Label;
    
    @property(EditBox)
    nameInput1!: EditBox;
    
    @property(EditBox)
    nameInput2!: EditBox;

    protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
        return new ViewModel(model);
    }

    protected createModel(): Model<PlayerData> {
        return new Model<PlayerData>({
            name: 'Player 1',
            level: 1,
            health: 100,
            maxHealth: 100,
            playerName: 'New Player',
            showInfo: true
        });
    }

    protected onMVVMCreate(): void {
        // ✅ 同 path 多个 target：
        // - 'playerName' 绑定到 nameLabel（display）
        // - 'playerName' 绑定到 nameInput1 和 nameInput2（两个 input，two-way）
        // silentDepth 机制自动防止回环
        this.bindingBuilder.bindConfig([
            { path: 'playerName', target: this.nameLabel, helper: 'toLabelText' },
            {
                path: 'playerName',
                target: this.nameInput1,
                helper: 'toEditBox',
                mode: 'two-way'
            },
            {
                path: 'playerName',
                target: this.nameInput2,
                helper: 'toEditBox',
                mode: 'two-way'
            }
        ] as const);
    }
}

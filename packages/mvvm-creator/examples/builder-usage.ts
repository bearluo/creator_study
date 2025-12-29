/**
 * 构建器使用示例
 * 
 * 展示如何使用 BindingBuilder 构建数据绑定
 */

import { _decorator, Component, Label, Button, Node } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 使用构建器的玩家信息组件
 */
@ccclass('PlayerInfoBuilder')
export class PlayerInfoBuilder extends MVVMComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    @property(Label)
    healthLabel: Label | null = null;
    
    @property(Button)
    levelUpButton: Button | null = null;
    
    @property(Button)
    takeDamageButton: Button | null = null;
    
    @property(Node)
    infoPanel: Node | null = null;
    
    protected initViewModel(model: Model): ViewModel {
        return new ViewModel(model);
    }
    
    protected createModel(): Model {
        return new Model({
            name: 'Player 1',
            level: 1,
            health: 100,
            maxHealth: 100,
            showInfo: true
        });
    }
    
    protected onMVVMLoad(): void {
        // 使用构建器模式构建所有绑定
        this.bindingBuilder
            // 数据绑定
            .bind('name', this.nameLabel, 'string', { 
                converter: (v) => `Name: ${v}` 
            })
            .bind('level', this.levelLabel, 'string', { 
                converter: (v) => `Level: ${v}` 
            })
            .bind('health', this.healthLabel, 'string', { 
                converter: (v) => {
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return `Health: ${v}/${maxHealth}`;
                }
            })
            // 事件绑定
            .on('click', this.levelUpButton, this.onLevelUp.bind(this))
            .on('click', this.takeDamageButton, this.onTakeDamage.bind(this))
            // 条件渲染
            .if('showInfo', this.infoPanel!)
            // 构建所有绑定
            .build();
    }
    
    /**
     * 升级处理函数
     */
    onLevelUp(): void {
        const level = this.viewModel.reactive.value.level || 1;
        this.viewModel.reactive.value.level = level + 1;
        console.log(`[PlayerInfoBuilder] Level up to ${level + 1}`);
    }
    
    /**
     * 受到伤害处理函数
     */
    onTakeDamage(): void {
        const health = this.viewModel.reactive.value.health || 100;
        const damage = 10;
        this.viewModel.reactive.value.health = Math.max(0, health - damage);
        console.log(`[PlayerInfoBuilder] Take damage: ${damage}, Health: ${this.viewModel.reactive.value.health}`);
    }
}


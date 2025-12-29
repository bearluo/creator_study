import { _decorator, Component, Label, Button, Node } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 玩家信息组件（构建器方式）
 * 
 * 使用 BindingBuilder 构建数据绑定
 */
@ccclass('PlayerInfoBuilderComponent')
export class PlayerInfoBuilderComponent extends MVVMComponent {
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
    
    @property(Button)
    healButton: Button | null = null;
    
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
            experience: 0,
            showInfo: true
        });
    }
    
    protected onMVVMLoad(): void {
        // 使用构建器模式
        this.bindingBuilder
            .bind('name', this.nameLabel, 'string', { 
                converter: (value) => `Name: ${value}` 
            })
            .bind('level', this.levelLabel, 'string', { 
                converter: (value) => `Level: ${value}` 
            })
            .bind('health', this.healthLabel, 'string', { 
                converter: (value) => {
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return `Health: ${value}/${maxHealth}`;
                }
            })
            .on('click', this.levelUpButton, this.onLevelUp.bind(this))
            .on('click', this.takeDamageButton, this.onTakeDamage.bind(this))
            .on('click', this.healButton, this.onHeal.bind(this))
            .if('showInfo', this.infoPanel!)
            .build();
        
        console.log('[PlayerInfoBuilderComponent] MVVM initialized with builder');
    }
    
    /**
     * 升级处理函数
     */
    private onLevelUp(): void {
        const level = this.viewModel.reactive.value.level || 1;
        this.viewModel.reactive.value.level = level + 1;
        this.viewModel.reactive.value.experience = 0;
        console.log(`[PlayerInfoBuilderComponent] Level up to ${level + 1}`);
    }
    
    /**
     * 受到伤害处理函数
     */
    private onTakeDamage(): void {
        const currentHealth = this.viewModel.reactive.value.health || 100;
        const damage = 10;
        this.viewModel.reactive.value.health = Math.max(0, currentHealth - damage);
        console.log(`[PlayerInfoBuilderComponent] Take damage: ${damage}, Health: ${this.viewModel.reactive.value.health}`);
    }
    
    /**
     * 治疗处理函数
     */
    private onHeal(): void {
        const currentHealth = this.viewModel.reactive.value.health || 0;
        const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
        const healAmount = 20;
        this.viewModel.reactive.value.health = Math.min(maxHealth, currentHealth + healAmount);
        console.log(`[PlayerInfoBuilderComponent] Heal: ${healAmount}, Health: ${this.viewModel.reactive.value.health}`);
    }
}


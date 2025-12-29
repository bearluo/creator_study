import { _decorator, Component, Label, Button, Node } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent, bind, on, ifDirective } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 玩家数据接口（类型定义）
 */
interface PlayerData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    experience: number;
    showInfo: boolean;
}

/**
 * 玩家信息组件（装饰器方式 - 改进版）
 * 
 * 使用装饰器简化 MVVM 使用
 * 现在可以直接在属性上使用装饰器，无需手动指定 target
 * 使用泛型 Model 和 ViewModel 获得类型安全
 */
@ccclass('PlayerInfoComponent')
export class PlayerInfoComponent extends MVVMComponent<PlayerData> {
    // 方式1: 直接应用到属性上（推荐，更简洁）
    @property(Label)
    @bind('name', { property: 'string', converter: (value) => `Name: ${value}` })
    nameLabel: Label | null = null;
    
    @property(Label)
    @bind('level', { property: 'string', converter: (value) => `Level: ${value}` })
    levelLabel: Label | null = null;
    
    @property(Label)
    @bind('health', { property: 'string' })
    healthLabel: Label | null = null;
    
    // 事件绑定：直接应用到属性上
    @property(Button)
    @on('click', { handler: 'onLevelUp' })
    levelUpButton: Button | null = null;
    
    @property(Button)
    @on('click', { handler: 'onTakeDamage' })
    takeDamageButton: Button | null = null;
    
    @property(Button)
    @on('click', { handler: 'onHeal' })
    healButton: Button | null = null;
    
    // 条件渲染：直接应用到属性上
    @property(Node)
    @ifDirective('showInfo')
    infoPanel: Node | null = null;
    
    protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
        return new ViewModel(model);
    }
    
    protected createModel(): Model<PlayerData> {
        return new Model<PlayerData>({
            name: 'Player 1',
            level: 1,
            health: 100,
            maxHealth: 100,
            experience: 0,
            showInfo: true
        });
    }
    
    protected onMVVMLoad(): void {
        // 更新 health 转换器，使其能够访问 maxHealth
        // 现在有类型提示：this.viewModel.reactive.value.maxHealth ✅
        if (this.healthLabel) {
            this.viewModel.bind('health', this.viewAdapter, {
                mode: 'one-way',
                converter: (value) => {
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return `Health: ${value}/${maxHealth}`;
                }
            });
        }
        
        console.log('[PlayerInfoComponent] MVVM initialized with decorators');
    }
    
    /**
     * 升级处理函数
     */
    onLevelUp(): void {
        // 现在有类型提示：this.viewModel.reactive.value.level 是 number ✅
        const level = this.viewModel.reactive.value.level || 1;
        this.viewModel.reactive.value.level = level + 1;
        this.viewModel.reactive.value.experience = 0;
        console.log(`[PlayerInfoComponent] Level up to ${level + 1}`);
    }
    
    /**
     * 受到伤害处理函数
     */
    onTakeDamage(): void {
        // 类型提示：health 是 number ✅
        const currentHealth = this.viewModel.reactive.value.health || 100;
        const damage = 10;
        this.viewModel.reactive.value.health = Math.max(0, currentHealth - damage);
        console.log(`[PlayerInfoComponent] Take damage: ${damage}, Health: ${this.viewModel.reactive.value.health}`);
    }
    
    /**
     * 治疗处理函数
     */
    onHeal(): void {
        // 类型提示：health 和 maxHealth 都是 number ✅
        const currentHealth = this.viewModel.reactive.value.health || 0;
        const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
        const healAmount = 20;
        this.viewModel.reactive.value.health = Math.min(maxHealth, currentHealth + healAmount);
        console.log(`[PlayerInfoComponent] Heal: ${healAmount}, Health: ${this.viewModel.reactive.value.health}`);
    }
    
    /**
     * 升级
     */
    levelUp(): void {
        const level = this.viewModel.reactive.value.level || 1;
        this.viewModel.reactive.value.level = level + 1;
        this.viewModel.reactive.value.experience = 0;
    }
    
    /**
     * 受到伤害
     */
    takeDamage(damage: number): void {
        const currentHealth = this.viewModel.reactive.value.health || 100;
        const newHealth = Math.max(0, currentHealth - damage);
        this.viewModel.reactive.value.health = newHealth;
    }
    
    /**
     * 治疗
     */
    heal(amount: number): void {
        const currentHealth = this.viewModel.reactive.value.health || 0;
        const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
        const newHealth = Math.min(maxHealth, currentHealth + amount);
        this.viewModel.reactive.value.health = newHealth;
    }
    
    /**
     * 添加经验
     */
    addExperience(amount: number): void {
        const currentExp = this.viewModel.reactive.value.experience || 0;
        const newExp = currentExp + amount;
        const level = this.viewModel.reactive.value.level || 1;
        const expNeeded = level * 100;
        
        if (newExp >= expNeeded) {
            this.levelUp();
            this.viewModel.reactive.value.experience = newExp - expNeeded;
        } else {
            this.viewModel.reactive.value.experience = newExp;
        }
    }
}

import { _decorator, Component, Node, Label, Button } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent, CocosViewAdapter } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

interface PlayerData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    experience: number;
    showInfo: boolean;
}

/**
 * MVVM 框架使用示例（构建器方式）
 * 
 * 展示如何使用 BindingBuilder 构建数据绑定
 */
@ccclass('MVVMExample')
export class MVVMExample extends MVVMComponent<PlayerData> {
    @property(Node)
    containerNode: Node | null = null;
    
    @property(Label)
    playerNameLabel: Label | null = null;
    
    @property(Label)
    playerLevelLabel: Label | null = null;
    
    @property(Label)
    playerHealthLabel: Label | null = null;
    
    @property(Button)
    levelUpButton: Button | null = null;
    
    @property(Button)
    takeDamageButton: Button | null = null;
    
    @property(Button)
    healButton: Button | null = null;
    
    @property(Node)
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
    
    protected createViewAdapter(): CocosViewAdapter {
        return new CocosViewAdapter({
            rootNode: this.containerNode || this.node,
            mappings: [
                {
                    path: 'playerNameLabel',
                    viewPath: 'name',
                    componentType: 'Label',
                    propertyName: 'string'
                },
                {
                    path: 'playerLevelLabel',
                    viewPath: 'level',
                    componentType: 'Label',
                    propertyName: 'string'
                },
                {
                    path: 'playerHealthLabel',
                    viewPath: 'health',
                    componentType: 'Label',
                    propertyName: 'string'
                }
            ]
        });
    }
    
    protected onMVVMLoad(): void {
        // 使用构建器模式构建所有绑定
        this.bindingBuilder
            // 数据绑定
            .bind('name', this.playerNameLabel, 'string', {
                converter: (value) => `Name: ${value}`
            })
            .bind('level', this.playerLevelLabel, 'string', {
                converter: (value) => `Level: ${value}`
            })
            .bind('health', this.playerHealthLabel, 'string', {
                converter: (value) => {
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return `Health: ${value}/${maxHealth}`;
                }
            })
            // 事件绑定
            .on('click', this.levelUpButton, this.onLevelUp.bind(this))
            .on('click', this.takeDamageButton, this.onTakeDamage.bind(this))
            .on('click', this.healButton, this.onHeal.bind(this))
            // 条件渲染
            .if('showInfo', this.infoPanel!)
            // 构建所有绑定
            .build();
        
        console.log('[MVVMExample] MVVM initialized with builder');
    }
    
    /**
     * 升级处理函数
     */
    private onLevelUp(): void {
        const currentLevel = this.viewModel.reactive.value.level || 1;
        this.viewModel.reactive.value.level = currentLevel + 1;
        this.viewModel.reactive.value.experience = 0;
        console.log(`[MVVMExample] Level up to ${currentLevel + 1}`);
    }
    
    /**
     * 受到伤害处理函数
     */
    private onTakeDamage(): void {
        const currentHealth = this.viewModel.reactive.value.health || 100;
        const damage = 10;
        this.viewModel.reactive.value.health = Math.max(0, currentHealth - damage);
        console.log(`[MVVMExample] Take damage: ${damage}, Health: ${this.viewModel.reactive.value.health}`);
    }
    
    /**
     * 治疗处理函数
     */
    private onHeal(): void {
        const currentHealth = this.viewModel.reactive.value.health || 0;
        const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
        const healAmount = 20;
        this.viewModel.reactive.value.health = Math.min(maxHealth, currentHealth + healAmount);
        console.log(`[MVVMExample] Heal: ${healAmount}, Health: ${this.viewModel.reactive.value.health}`);
    }
    
    /**
     * 添加经验值
     */
    addExperience(amount: number): void {
        const currentExp = this.viewModel.reactive.value.experience || 0;
        const newExp = currentExp + amount;
        const expNeeded = this.getExpNeededForNextLevel();
        
        if (newExp >= expNeeded) {
            // 升级
            const currentLevel = this.viewModel.reactive.value.level || 1;
            this.viewModel.reactive.value.level = currentLevel + 1;
            this.viewModel.reactive.value.experience = newExp - expNeeded;
            console.log(`[MVVMExample] Level up! New level: ${currentLevel + 1}`);
        } else {
            this.viewModel.reactive.value.experience = newExp;
        }
    }
    
    /**
     * 获取下一级所需经验
     */
    private getExpNeededForNextLevel(): number {
        const level = this.viewModel.reactive.value.level || 1;
        return level * 100; // 简单的经验计算公式
    }
    
    /**
     * 切换信息面板显示
     */
    toggleInfoPanel(): void {
        const currentShowInfo = this.viewModel.reactive.value.showInfo || false;
        this.viewModel.reactive.value.showInfo = !currentShowInfo;
        console.log(`[MVVMExample] Toggle info panel: ${!currentShowInfo}`);
    }
}

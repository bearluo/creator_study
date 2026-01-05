/**
 * 完整示例
 * 
 * 展示 MVVM-Creator 的完整功能，包括：
 * - 基础数据绑定
 * - 格式化显示
 * - 双向绑定
 * - 同 path 多个 target
 * - 条件渲染
 */

import { _decorator, Label, EditBox, ProgressBar, Toggle, Slider, Node } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent } from '@bl-framework/mvvm-creator';
import { 
    toLabelText, 
    toEditBox, 
    toProgress, 
    toActive, 
    toToggle, 
    toSlider 
} from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 游戏玩家数据接口
 */
interface GamePlayerData {
    // 基础信息
    name: string;
    level: number;
    experience: number;
    maxExperience: number;
    
    // 生命值
    health: number;
    maxHealth: number;
    
    // 设置
    volume: number;        // 音量（0-1）
    isMuted: boolean;      // 是否静音
    playerName: string;    // 玩家名称（可编辑）
    
    // UI 状态
    showStats: boolean;     // 是否显示统计信息
    showSettings: boolean;  // 是否显示设置面板
}

/**
 * 游戏玩家组件 - 完整示例
 */
@ccclass('GamePlayerComponent')
export class GamePlayerComponent extends MVVMComponent<GamePlayerData> {
    // ==================== 基础信息 ====================
    @property(Label)
    nameLabel!: Label;
    
    @property(Label)
    levelLabel!: Label;
    
    @property(Label)
    experienceLabel!: Label;
    
    @property(ProgressBar)
    experienceBar!: ProgressBar;
    
    // ==================== 生命值 ====================
    @property(Label)
    healthLabel!: Label;
    
    @property(ProgressBar)
    healthBar!: ProgressBar;
    
    // ==================== 设置 ====================
    @property(EditBox)
    playerNameInput!: EditBox;
    
    @property(Slider)
    volumeSlider!: Slider;
    
    @property(Toggle)
    muteToggle!: Toggle;
    
    // ==================== UI 状态 ====================
    @property(Node)
    statsPanel!: Node;
    
    @property(Node)
    settingsPanel!: Node;

    protected createModel(): Model<GamePlayerData> {
        return new Model<GamePlayerData>({
            name: 'Player',
            level: 1,
            experience: 0,
            maxExperience: 100,
            health: 100,
            maxHealth: 100,
            volume: 0.5,
            isMuted: false,
            playerName: 'New Player',
            showStats: true,
            showSettings: false
        });
    }

    protected initViewModel(model: Model<GamePlayerData>): ViewModel<GamePlayerData> {
        return new ViewModel(model);
    }

    protected onMVVMCreate(): void {
        // ==================== 基础信息绑定 ====================
        this.bindingBuilder
            // 名称（简单文本）
            .bind('name', toLabelText(this.nameLabel))
            
            // 等级（格式化显示）
            .bind('level', toLabelText(this.levelLabel), { 
                converter: (v: number) => `Lv.${v}` 
            })
            
            // 经验值（格式化显示 + 进度条）
            .bind('experience', toLabelText(this.experienceLabel), {
                converter: (v: number) => {
                    const maxExp = this.viewModel.reactive.value.maxExperience || 100;
                    return `${v}/${maxExp}`;
                }
            })
            .bind('experience', toProgress(this.experienceBar), {
                converter: (v: number) => {
                    // ✅ 同 path 多个 target：experience 绑定到 experienceLabel 和 experienceBar
                    const maxExp = this.viewModel.reactive.value.maxExperience || 100;
                    return v / maxExp;
                }
            })
            
            // ==================== 生命值绑定 ====================
            .bind('health', toLabelText(this.healthLabel), {
                converter: (v: number) => {
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return `${v}/${maxHealth}`;
                }
            })
            .bind('health', toProgress(this.healthBar), {
                converter: (v: number) => {
                    // ✅ 同 path 多个 target：health 绑定到 healthLabel 和 healthBar
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return v / maxHealth;
                }
            })
            
            // ==================== 设置绑定（双向绑定） ====================
            .bind('playerName', toEditBox(this.playerNameInput), { mode: 'two-way' })
            .bind('volume', toSlider(this.volumeSlider), { mode: 'two-way' })
            .bind('isMuted', toToggle(this.muteToggle), { mode: 'two-way' })
            
            // ==================== UI 状态绑定 ====================
            .bind('showStats', toActive(this.statsPanel))
            .bind('showSettings', toActive(this.settingsPanel));
    }

    /**
     * 测试方法：更新玩家数据
     */
    testUpdateData(): void {
        this.viewModel.reactive.value.name = 'Updated Player';
        this.viewModel.reactive.value.level = 10;
        this.viewModel.reactive.value.experience = 500;
        this.viewModel.reactive.value.maxExperience = 1000;
        this.viewModel.reactive.value.health = 50;
        this.viewModel.reactive.value.maxHealth = 150;
        this.viewModel.reactive.value.volume = 0.8;
        this.viewModel.reactive.value.isMuted = true;
        this.viewModel.reactive.value.playerName = 'Updated Name';
        this.viewModel.reactive.value.showStats = false;
        this.viewModel.reactive.value.showSettings = true;
    }

    /**
     * 测试方法：模拟升级
     */
    testLevelUp(): void {
        const currentLevel = this.viewModel.reactive.value.level || 1;
        const currentExp = this.viewModel.reactive.value.experience || 0;
        const maxExp = this.viewModel.reactive.value.maxExperience || 100;
        
        if (currentExp >= maxExp) {
            // 升级
            this.viewModel.reactive.value.level = currentLevel + 1;
            this.viewModel.reactive.value.experience = 0;
            this.viewModel.reactive.value.maxExperience = maxExp * 1.5;
            console.log(`[GamePlayerComponent] Level up to ${currentLevel + 1}`);
        } else {
            // 增加经验
            this.viewModel.reactive.value.experience = Math.min(currentExp + 20, maxExp);
        }
    }

    /**
     * 测试方法：模拟受到伤害
     */
    testTakeDamage(damage: number = 10): void {
        const currentHealth = this.viewModel.reactive.value.health || 100;
        this.viewModel.reactive.value.health = Math.max(0, currentHealth - damage);
        console.log(`[GamePlayerComponent] Take damage: ${damage}, Health: ${this.viewModel.reactive.value.health}`);
    }
}


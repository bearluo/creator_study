/**
 * 构建器使用示例
 * 
 * 展示如何使用类型安全的 BindingBuilder 构建数据绑定
 */

import { _decorator, Component, Label, Button, Node } from 'cc';
import { Model, ViewModel, ValidationError } from '@bl-framework/mvvm';
import { MVVMComponent } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 玩家数据类型
 */
interface PlayerData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    showInfo: boolean;
}

/**
 * 使用构建器的玩家信息组件（类型安全版本）
 */
@ccclass('PlayerInfoBuilder')
export class PlayerInfoBuilder extends MVVMComponent<PlayerData> {
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
    
    protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
        return new ViewModel(model);
    }
    
    protected createModel(): Model<PlayerData> {
        return new Model<PlayerData>({
            name: 'Player 1',
            level: 1,
            health: 100,
            maxHealth: 100,
            showInfo: true
        });
    }
    
    protected onMVVMLoad(): void {
        // 使用类型安全的构建器模式构建所有绑定
        this.bindingBuilder
            // 数据绑定（类型安全：IDE 自动补全，编译时检查）
            .bind('name', this.nameLabel, 'string', { 
                converter: (v) => `Name: ${v}`  // ✅ v: string（自动推断）
            })
            .bind('level', this.levelLabel, 'string', { 
                converter: (v) => `Level: ${v}`  // ✅ v: number（自动推断）
            })
            .bind('health', this.healthLabel, 'string', { 
                converter: (v) => {  // ✅ v: number（自动推断）
                    const maxHealth = this.viewModel.reactive.value.maxHealth || 100;
                    return `Health: ${v}/${maxHealth}`;
                },
                validator: (v) => v >= 0 && v <= this.viewModel.reactive.value.maxHealth,  // ✅ v: number（自动推断）
                onError: (error, path, value) => {
                    if (error instanceof ValidationError) {
                        console.error(`验证失败: ${path} = ${value}`, error.message);
                        // 错误恢复逻辑
                    }
                }
            })
            // 事件绑定
            .on('click', this.levelUpButton, this.onLevelUp.bind(this))
            .on('click', this.takeDamageButton, this.onTakeDamage.bind(this))
            // 条件渲染
            .if('showInfo', this.infoPanel!)
            // 构建所有绑定（使用批量绑定 API）
            .build();
        
        // ❌ 类型错误示例（编译时检查）
        // this.bindingBuilder.bind('nam', this.nameLabel);        // ❌ TypeScript 错误
        // this.bindingBuilder.bind('level.name', this.nameLabel); // ❌ TypeScript 错误
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


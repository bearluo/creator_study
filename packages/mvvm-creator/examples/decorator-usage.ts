/**
 * 装饰器使用示例
 * 
 * 展示如何使用装饰器简化 MVVM 组件开发
 */

import { _decorator, Component, Label, Button, Node } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent, bind, on, ifDirective, forDirective } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 使用装饰器的玩家信息组件
 */
@ccclass('PlayerInfoDecorator')
export class PlayerInfoDecorator extends MVVMComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    @property(Label)
    healthLabel: Label | null = null;
    
    @property(Button)
    levelUpButton: Button | null = null;
    
    @property(Node)
    infoPanel: Node | null = null;
    
    // 使用装饰器声明绑定
    @bind('name', { target: 'nameLabel', property: 'string', converter: (v) => `Name: ${v}` })
    @bind('level', { target: 'levelLabel', property: 'string', converter: (v) => `Level: ${v}` })
    @bind('health', { target: 'healthLabel', property: 'string', converter: (v) => `Health: ${v}` })
    private _viewModelPlaceholder!: any; // 占位符，实际 viewModel 由基类提供
    
    // 使用装饰器声明事件
    @on('click', { target: 'levelUpButton', handler: 'onLevelUp' })
    private _eventsPlaceholder!: any; // 占位符
    
    // 使用装饰器声明条件渲染
    @ifDirective('showInfo', { target: 'infoPanel' })
    private _conditionsPlaceholder!: any; // 占位符
    
    protected initViewModel(model: Model): any {
        return new ViewModel(model);
    }
    
    protected createModel(): Model {
        return new Model({
            name: 'Player 1',
            level: 1,
            health: 100,
            showInfo: true
        });
    }
    
    /**
     * 升级处理函数
     */
    onLevelUp(): void {
        const level = this.viewModel.reactive.value.level || 1;
        this.viewModel.reactive.value.level = level + 1;
        console.log(`[PlayerInfoDecorator] Level up to ${level + 1}`);
    }
}

/**
 * 使用构建器的玩家信息组件
 */
@ccclass('PlayerInfoBuilder')
export class PlayerInfoBuilder extends MVVMComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    @property(Button)
    levelUpButton: Button | null = null;
    
    protected initViewModel(model: Model): any {
        return new ViewModel(model);
    }
    
    protected createModel(): Model {
        return new Model({
            name: 'Player 1',
            level: 1
        });
    }
    
    protected onMVVMLoad(): void {
        // 使用构建器模式
        this.bindingBuilder
            .bind('name', this.nameLabel, 'string', { converter: (v) => `Name: ${v}` })
            .bind('level', this.levelLabel, 'string', { converter: (v) => `Level: ${v}` })
            .on('click', this.levelUpButton, this.onLevelUp.bind(this))
            .build();
    }
    
    onLevelUp(): void {
        const level = this.viewModel.reactive.value.level || 1;
        this.viewModel.reactive.value.level = level + 1;
        console.log(`[PlayerInfoBuilder] Level up to ${level + 1}`);
    }
}


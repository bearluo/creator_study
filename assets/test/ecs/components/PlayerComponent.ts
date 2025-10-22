import { Component } from 'db://bl-framework/ecs';

/**
 * 玩家组件
 * 标记实体为玩家控制的角色
 */
export class PlayerComponent extends Component {
    /** 玩家名称 */
    playerName: string = 'Player';

    /** 玩家等级 */
    level: number = 1;

    /** 经验值 */
    experience: number = 0;

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.playerName = 'Player';
        this.level = 1;
        this.experience = 0;
    }
}


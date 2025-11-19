import { Component } from '@bl-framework/ecs';

/**
 * 生命值组件
 * 存储实体的生命值信息
 */
export class HealthComponent extends Component {
    /** 当前生命值 */
    current: number = 100;

    /** 最大生命值 */
    max: number = 100;

    /** 是否无敌 */
    invincible: boolean = false;

    /** 获取生命值百分比 */
    getHealthPercent(): number {
        return this.max > 0 ? this.current / this.max : 0;
    }

    /** 是否存活 */
    isAlive(): boolean {
        return this.current > 0;
    }

    /** 受伤 */
    takeDamage(damage: number): void {
        if (this.invincible) return;
        this.current = Math.max(0, this.current - damage);
    }

    /** 治疗 */
    heal(amount: number): void {
        this.current = Math.min(this.max, this.current + amount);
    }

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.current = 100;
        this.max = 100;
        this.invincible = false;
    }
}


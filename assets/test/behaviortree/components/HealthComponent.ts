/**
 * 健康组件（测试用）
 * 用于测试 Entity 数据绑定
 */

import { Component } from 'db://bl-framework/ecs';
import { component } from 'db://bl-framework/ecs/decorators/component';

/**
 * 健康组件
 */
@component({
    name: 'Health',
    pooled: false
})
export class HealthComponent extends Component {
    /** 当前生命值 */
    health: number = 100;

    /** 最大生命值 */
    maxHealth: number = 100;

    /** 是否死亡 */
    isDead: boolean = false;

    /**
     * 组件初始化
     */
    onInit(): void {
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
    }

    /**
     * 受到伤害
     * @param damage 伤害值
     */
    takeDamage(damage: number): void {
        this.health = Math.max(0, this.health - damage);
        if (this.health <= 0) {
            this.isDead = true;
        }
    }

    /**
     * 恢复生命值
     * @param amount 恢复量
     */
    heal(amount: number): void {
        this.health = Math.min(this.maxHealth, this.health + amount);
        if (this.health > 0) {
            this.isDead = false;
        }
    }

    /**
     * 获取生命值百分比
     */
    getHealthPercent(): number {
        return this.maxHealth > 0 ? this.health / this.maxHealth : 0;
    }
}


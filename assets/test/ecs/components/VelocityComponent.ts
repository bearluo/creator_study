import { Component } from 'db://bl-framework/ecs';
import { Vec3 } from 'cc';

/**
 * 速度组件
 * 存储实体的移动速度
 */
export class VelocityComponent extends Component {
    /** 速度向量 */
    velocity: Vec3 = new Vec3();

    /** 最大速度 */
    maxSpeed: number = 10;

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.velocity.set(0, 0, 0);
        this.maxSpeed = 10;
    }
}


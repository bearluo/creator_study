import { System, Query } from '@bl-framework/ecs';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';

/**
 * 移动系统
 * 处理所有具有位置和速度组件的实体移动
 */
export class MovementSystem extends System {
    /** 查询器 */
    private query!: Query;

    /** 系统优先级 */
    priority = 0;

    /** 系统初始化 */
    onInit(): void {
        // 创建查询：查找所有同时拥有 Transform 和 Velocity 组件的实体
        this.query = this.world.createQuery({
            all: [TransformComponent, VelocityComponent],
        });

        console.log('[MovementSystem] Initialized');
    }

    /** 系统更新 */
    onUpdate(dt: number): void {
        // 遍历所有符合条件的实体
        this.query.forEach((entity) => {
            // 获取组件
            const transform = this.world.getComponent(
                entity.id,
                TransformComponent
            )!;
            const velocity = this.world.getComponent(
                entity.id,
                VelocityComponent
            )!;

            // 如果组件未启用，跳过
            if (!transform.enabled || !velocity.enabled) return;

            // 限制速度
            const speed = velocity.velocity.length();
            if (speed > velocity.maxSpeed) {
                velocity.velocity.normalize().multiplyScalar(velocity.maxSpeed);
            }

            // 更新位置
            transform.position.x += velocity.velocity.x * dt;
            transform.position.y += velocity.velocity.y * dt;
            transform.position.z += velocity.velocity.z * dt;
        });
    }

    /** 系统销毁 */
    onDestroy(): void {
        console.log('[MovementSystem] Destroyed');
    }
}


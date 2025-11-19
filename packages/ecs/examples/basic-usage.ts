/**
 * @bl-framework/ecs 基本使用示例
 */

import {
    World,
    Component,
    System,
    Entity,
    component,
    system,
} from '@bl-framework/ecs';

// ========== 定义组件 ==========

/**
 * 位置组件
 */
@component({
    name: 'Position',
    pooled: true,
    poolSize: 100,
})
class PositionComponent extends Component {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    onInit(): void {
        console.log('PositionComponent initialized');
    }

    onDestroy(): void {
        console.log('PositionComponent destroyed');
    }
}

/**
 * 速度组件
 */
@component({
    name: 'Velocity',
    pooled: true,
})
class VelocityComponent extends Component {
    vx: number = 0;
    vy: number = 0;
    vz: number = 0;
}

/**
 * 生命值组件
 */
@component({
    name: 'Health',
})
class HealthComponent extends Component {
    max: number = 100;
    current: number = 100;

    get percentage(): number {
        return this.current / this.max;
    }
}

// ========== 定义系统 ==========

/**
 * 移动系统
 */
@system({
    priority: 0, // 高优先级，先执行
})
class MovementSystem extends System {
    onInit(): void {
        console.log('MovementSystem initialized');
    }

    onUpdate(dt: number): void {
        // 查询所有具有 Position 和 Velocity 组件的实体
        const query = this.world.query({
            all: [PositionComponent, VelocityComponent],
        });

        for (const entity of query) {
            const position = entity.getComponent(PositionComponent)!;
            const velocity = entity.getComponent(VelocityComponent)!;

            // 更新位置
            position.x += velocity.vx * dt;
            position.y += velocity.vy * dt;
            position.z += velocity.vz * dt;

            console.log(
                `Entity ${entity.id} moved to (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`
            );
        }
    }
}

/**
 * 生命值系统
 */
@system({
    priority: 1, // 低优先级，后执行
})
class HealthSystem extends System {
    onUpdate(dt: number): void {
        const query = this.world.query({
            all: [HealthComponent],
        });

        for (const entity of query) {
            const health = entity.getComponent(HealthComponent)!;
            if (health.current <= 0) {
                console.log(`Entity ${entity.id} is dead`);
                // 可以在这里处理死亡逻辑
            }
        }
    }
}

// ========== 使用示例 ==========

export function basicUsageExample(): void {
    console.log('=== ECS 基本使用示例 ===\n');

    // 创建世界
    const world = new World();

    // 添加系统
    world.addSystem(new MovementSystem());
    world.addSystem(new HealthSystem());

    // 创建实体
    const player = world.createEntity('Player');
    console.log(`Created entity: ${player.name} (ID: ${player.id})\n`);

    // 添加组件
    const position = player.addComponent(PositionComponent);
    position.x = 0;
    position.y = 0;
    position.z = 0;

    const velocity = player.addComponent(VelocityComponent);
    velocity.vx = 10;
    velocity.vy = 5;
    velocity.vz = 0;

    const health = player.addComponent(HealthComponent);
    health.max = 100;
    health.current = 80;

    console.log(`Player health: ${health.current}/${health.max} (${(health.percentage * 100).toFixed(0)}%)\n`);

    // 更新世界
    console.log('--- 更新世界 (dt = 0.016s) ---');
    world.update(0.016);

    console.log('\n--- 更新世界 (dt = 0.016s) ---');
    world.update(0.016);

    // 修改速度
    console.log('\n--- 修改速度 ---');
    velocity.vx = 20;
    velocity.vy = 10;

    console.log('\n--- 更新世界 (dt = 0.016s) ---');
    world.update(0.016);

    // 查询实体
    console.log('\n--- 查询所有实体 ---');
    const allEntities = world.getAllEntities();
    console.log(`Total entities: ${allEntities.length}`);

    // 使用 Query 查询
    console.log('\n--- 使用 Query 查询 ---');
    const query = world.query({
        all: [PositionComponent, HealthComponent],
    });
    console.log(`Found ${query.length} entities with Position and Health`);

    // 销毁实体
    console.log('\n--- 销毁实体 ---');
    world.destroyEntity(player.id);
    console.log(`Entity ${player.id} destroyed`);

    console.log('\n=== 示例完成 ===');
}

// 如果直接运行此文件
if (require.main === module) {
    basicUsageExample();
}


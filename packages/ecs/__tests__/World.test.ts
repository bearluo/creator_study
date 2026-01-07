/**
 * ECS World 单元测试
 */
import { World, Component, System, Entity } from '../src/index';

// 测试用的组件
class PositionComponent extends Component {
    x: number = 0;
    y: number = 0;
    z: number = 0;
}

class VelocityComponent extends Component {
    vx: number = 0;
    vy: number = 0;
    vz: number = 0;
}

class HealthComponent extends Component {
    max: number = 100;
    current: number = 100;
}

// 测试用的系统
class MovementSystem extends System {
    onUpdate(dt: number): void {
        const query = this.world.createQuery({
            all: [PositionComponent, VelocityComponent],
        });

        query.forEach((entity) => {
            const position = entity.getComponent(PositionComponent)!;
            const velocity = entity.getComponent(VelocityComponent)!;

            position.x += velocity.vx * dt;
            position.y += velocity.vy * dt;
            position.z += velocity.vz * dt;
        });
    }
}

describe('ECS World', () => {
    let world: World;

    beforeEach(() => {
        world = new World({ debug: false });
    });

    afterEach(() => {
        // 清理
        if (world) {
            // 可以添加清理逻辑
        }
    });

    describe('World 创建和管理', () => {
        test('应该能够创建 World 实例', () => {
            expect(world).toBeDefined();
            expect(world).toBeInstanceOf(World);
        });

        test('应该能够创建实体', () => {
            const entity = world.createEntity();
            expect(entity).toBeDefined();
            expect(entity).toBeInstanceOf(Entity);
            expect(entity.id).toBeDefined();
        });

        test('应该能够删除实体', () => {
            const entity = world.createEntity();
            const entityId = entity.id;

            world.destroyEntity(entityId);
            
            // 验证实体已被删除
            const found = world.getEntity(entityId);
            expect(found).toBeUndefined();
        });

        test('应该能够获取实体', () => {
            const entity = world.createEntity();
            const found = world.getEntity(entity.id);

            expect(found).toBe(entity);
        });
    });

    describe('组件管理', () => {
        test('应该能够添加组件到实体', () => {
            const entity = world.createEntity();
            const position = world.addComponent(entity.id, PositionComponent);

            expect(position).toBeDefined();
            expect(position).toBeInstanceOf(PositionComponent);
            expect(world.hasComponent(entity.id, PositionComponent)).toBe(true);
        });

        test('应该能够从实体获取组件', () => {
            const entity = world.createEntity();
            const position = world.addComponent(entity.id, PositionComponent);

            const found = entity.getComponent(PositionComponent);
            expect(found).toBe(position);
        });

        test('应该能够移除组件', () => {
            const entity = world.createEntity();
            world.addComponent(entity.id, PositionComponent);

            world.removeComponent(entity.id, PositionComponent);

            expect(world.hasComponent(entity.id, PositionComponent)).toBe(false);
        });

        test('应该能够检查实体是否有组件', () => {
            const entity = world.createEntity();
            
            expect(world.hasComponent(entity.id, PositionComponent)).toBe(false);

            world.addComponent(entity.id, PositionComponent);
            
            expect(world.hasComponent(entity.id, PositionComponent)).toBe(true);
        });
    });

    describe('查询功能', () => {
        test('应该能够查询具有特定组件的实体', () => {
            const entity1 = world.createEntity();
            const entity2 = world.createEntity();
            const entity3 = world.createEntity();

            world.addComponent(entity1.id, PositionComponent);
            world.addComponent(entity2.id, PositionComponent);
            world.addComponent(entity3.id, VelocityComponent);

            const query = world.createQuery({
                all: [PositionComponent],
            });

            const results = query.getEntities();
            expect(results.length).toBe(2);
            expect(results).toContain(entity1);
            expect(results).toContain(entity2);
            expect(results).not.toContain(entity3);
        });

        test('应该能够查询具有多个组件的实体', () => {
            const entity1 = world.createEntity();
            const entity2 = world.createEntity();

            world.addComponent(entity1.id, PositionComponent);
            world.addComponent(entity1.id, VelocityComponent);
            world.addComponent(entity2.id, PositionComponent);

            const query = world.createQuery({
                all: [PositionComponent, VelocityComponent],
            });

            const results = query.getEntities();
            expect(results.length).toBe(1);
            expect(results).toContain(entity1);
        });

        test('查询应该能够遍历实体', () => {
            const entity1 = world.createEntity();
            const entity2 = world.createEntity();

            world.addComponent(entity1.id, PositionComponent);
            world.addComponent(entity2.id, PositionComponent);

            const query = world.createQuery({
                all: [PositionComponent],
            });

            let count = 0;
            query.forEach((entity) => {
                count++;
                expect(entity).toBeInstanceOf(Entity);
            });

            expect(count).toBe(2);
        });
    });

    describe('系统管理', () => {
        test('应该能够添加系统', () => {
            const system = world.registerSystem(MovementSystem);

            expect(world.getSystem(MovementSystem)).toBe(system);
        });

        test('应该能够移除系统', () => {
            world.registerSystem(MovementSystem);

            world.removeSystem(MovementSystem);

            expect(world.getSystem(MovementSystem)).toBeUndefined();
        });

        test('应该能够更新所有系统', () => {
            let updateCalled = false;

            class TestSystem extends System {
                onUpdate(dt: number): void {
                    updateCalled = true;
                }
            }

            world.registerSystem(TestSystem);

            world.update(0.016); // 模拟 16ms 的 deltaTime

            expect(updateCalled).toBe(true);
        });

        test('系统应该能够正常更新', () => {
            const system = world.registerSystem(MovementSystem);

            const entity = world.createEntity();
            const position = world.addComponent(entity.id, PositionComponent);
            const velocity = world.addComponent(entity.id, VelocityComponent);
            position.x = 0;
            velocity.vx = 1;

            world.update(1.0);

            expect(position.x).toBe(1);
        });
    });

    describe('集成测试', () => {
        test('应该能够创建完整的 ECS 场景', () => {
            // 创建实体
            const entity = world.createEntity();

            // 添加组件
            const position = world.addComponent(entity.id, PositionComponent);
            position.x = 10;
            position.y = 20;
            position.z = 30;

            const velocity = world.addComponent(entity.id, VelocityComponent);
            velocity.vx = 1;
            velocity.vy = 2;
            velocity.vz = 3;

            // 添加系统
            world.registerSystem(MovementSystem);

            // 更新系统
            world.update(1.0); // deltaTime = 1秒

            // 验证位置已更新
            expect(position.x).toBe(11); // 10 + 1*1
            expect(position.y).toBe(22); // 20 + 2*1
            expect(position.z).toBe(33); // 30 + 3*1
        });

        test('应该能够处理多个实体和系统', () => {
            // 创建多个实体
            const entity1 = world.createEntity();
            const entity2 = world.createEntity();

            // 为实体1添加组件
            const pos1 = world.addComponent(entity1.id, PositionComponent);
            const vel1 = world.addComponent(entity1.id, VelocityComponent);
            pos1.x = 0;
            vel1.vx = 1;

            // 为实体2添加组件
            const pos2 = world.addComponent(entity2.id, PositionComponent);
            const vel2 = world.addComponent(entity2.id, VelocityComponent);
            pos2.x = 10;
            vel2.vx = 2;

            // 添加系统
            world.registerSystem(MovementSystem);

            // 更新
            world.update(1.0);

            // 验证两个实体都更新了
            expect(pos1.x).toBe(1);
            expect(pos2.x).toBe(12);
        });
    });
});


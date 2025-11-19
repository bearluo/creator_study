/**
 * ECS 集成测试
 * 测试行为树与 ECS 系统的集成
 */

import { World } from '@bl-framework/ecs';  
import { BehaviorTreeComponent } from '@bl-framework/behaviortree-ecs';
import { BehaviorTreeSystem } from '@bl-framework/behaviortree-ecs';
import { BehaviorTreeBuilder } from '@bl-framework/behaviortree';
import { NodeStatus } from '@bl-framework/behaviortree';
import { HealthComponent } from './components/HealthComponent';
import { PositionComponent } from './components/PositionComponent';
import { Vec3 } from 'cc';

/**
 * ECS 集成测试示例
 */
export class ECSIntegrationTest {
    /**
     * 测试基本集成
     */
    static testBasicIntegration(): void {
        console.log('=== 测试基本 ECS 集成 ===');
        
        // 创建 World
        const world = new World();
        
        // 注册系统
        world.registerSystem(BehaviorTreeSystem);
        
        // 创建 Entity
        const entity = world.createEntity('TestEntity');
        
        // 创建行为树
        const builder = new BehaviorTreeBuilder();
        const tree = builder
            .action('testAction', (bb) => {
                console.log('执行测试动作');
                return NodeStatus.SUCCESS;
            })
            .build();
        
        // 添加 BehaviorTreeComponent
        const btComponent = entity.addComponent(BehaviorTreeComponent);
        btComponent.setBehaviorTree(tree);
        
        // 更新系统
        world.update(0.016); // 模拟 60 FPS
        
        console.log('行为树状态:', btComponent.behaviorTree?.getStatus());
        console.log('是否完成:', btComponent.behaviorTree?.isComplete());
    }

    /**
     * 测试 Entity 数据绑定
     */
    static testEntityDataBinding(): void {
        try {
            console.log('=== 测试 Entity 数据绑定 ===');
            
            const world = new World();
            world.registerSystem(BehaviorTreeSystem);
            
            const entity = world.createEntity('TestEntity');
            
            // 添加测试组件
            const healthComp = entity.addComponent(HealthComponent);
            healthComp.health = 80;
            healthComp.maxHealth = 100;
            
            const positionComp = entity.addComponent(PositionComponent);
            positionComp.setPosition(10, 20, 30);
            
            // 创建行为树 - 检查生命值
            const builder = new BehaviorTreeBuilder();
            const tree = builder
                .selector('root')
                    .sequence('checkHealth')
                        .condition('hasHealth', (bb) => {
                            // 从 Entity 的 Component 获取数据
                            const health = bb.get<number>('health', 0);
                            console.log(`从黑板获取生命值: ${health}`);
                            return health > 50;
                        })
                        .action('logHealth', (bb) => {
                            const health = bb.get<number>('health', 0);
                            const maxHealth = bb.get<number>('maxHealth', 0);
                            console.log(`生命值: ${health}/${maxHealth}`);
                            return NodeStatus.SUCCESS;
                        })
                    .end()
                    .action('lowHealth', (bb) => {
                        console.log('生命值过低！');
                        return NodeStatus.SUCCESS;
                    })
                .end()
                .build();
            
            const btComponent = entity.addComponent(BehaviorTreeComponent);
            btComponent.setBehaviorTree(tree);
            
            // 绑定 Entity 数据
            if (btComponent.blackboard) {
                btComponent.blackboard.bindEntityProperty(
                    entity.id,
                    HealthComponent,
                    'health',
                    'health'
                );
                
                btComponent.blackboard.bindEntityProperty(
                    entity.id,
                    HealthComponent,
                    'maxHealth',
                    'maxHealth'
                );
                
                btComponent.blackboard.bindEntityProperty(
                    entity.id,
                    PositionComponent,
                    'position',
                    'position'
                );
            }
            
            // 更新系统（设置访问器）
            world.update(0.016);
            
            // 执行行为树
            const status1 = tree.execute();
            console.log('第一次执行结果:', status1 === NodeStatus.SUCCESS ? '成功' : '失败');
            
            // 修改生命值，测试数据同步
            console.log('\n修改生命值为 30...');
            healthComp.health = 30;
            healthComp.takeDamage(10); // 受到伤害
            
            // 清除黑板缓存，强制重新获取
            btComponent.blackboard?.clearCache();
            
            // 再次更新系统，确保访问器已设置
            world.update(0.016);
            
            // 再次执行
            const status2 = tree.execute();
            console.log('第二次执行结果:', status2 === NodeStatus.SUCCESS ? '成功' : '失败');
            
            // 测试位置数据
            console.log('\n测试位置数据绑定...');
            const position = btComponent.blackboard?.get('position');
            console.log('从黑板获取位置:', position);
            
            console.log('行为树状态:', btComponent.behaviorTree?.getStatus());
        } catch (error) {
            console.error('Entity 数据绑定测试失败:', error);
        }
    }

    /**
     * 测试多 Entity 并发
     */
    static testMultipleEntities(): void {
        console.log('=== 测试多 Entity 并发 ===');
        
        const world = new World();
        world.registerSystem(BehaviorTreeSystem);
        
        // 创建多个 Entity
        const entityCount = 5;
        const entities = [];
        
        for (let i = 0; i < entityCount; i++) {
            const entity = world.createEntity(`Entity_${i}`);
            const builder = new BehaviorTreeBuilder();
            const tree = builder
                .action(`action_${i}`, (bb) => {
                    console.log(`Entity ${i} 执行动作`);
                    return NodeStatus.SUCCESS;
                })
                .build();
            
            const btComponent = entity.addComponent(BehaviorTreeComponent);
            btComponent.setBehaviorTree(tree);
            btComponent.priority = i; // 设置优先级
            
            entities.push(entity);
        }
        
        // 更新系统
        console.log(`更新 ${entityCount} 个 Entity...`);
        world.update(0.016);
        
        // 检查状态
        entities.forEach((entity, index) => {
            const btComponent = entity.getComponent(BehaviorTreeComponent);
            if (btComponent) {
                console.log(`Entity ${index} 状态:`, btComponent.behaviorTree?.getStatus());
            }
        });
    }

    /**
     * 测试执行间隔控制
     */
    static testExecuteInterval(): void {
        console.log('=== 测试执行间隔控制 ===');
        
        const world = new World();
        world.registerSystem(BehaviorTreeSystem);
        
        const entity = world.createEntity('TestEntity');
        
        let executeCount = 0;
        const builder = new BehaviorTreeBuilder();
        const tree = builder
            .action('countAction', (bb) => {
                executeCount++;
                console.log(`执行次数: ${executeCount}`);
                return NodeStatus.SUCCESS;
            })
            .build();
        
        const btComponent = entity.addComponent(BehaviorTreeComponent);
        btComponent.setBehaviorTree(tree);
        btComponent.updateInterval = 0.1; // 0.1 秒（100ms）执行一次
        
        // 快速更新多次（每次 0.016 秒，总共约 0.16 秒）
        for (let i = 0; i < 10; i++) {
            world.update(0.016);
        }
        
        console.log(`总执行次数: ${executeCount} (应该为 1-2 次，因为 0.16 秒 / 0.1 秒 ≈ 1.6)`);
    }

    /**
     * 测试 Entity 数据绑定完整功能
     */
    static testEntityDataBindingComplete(): void {
        try {
            console.log('=== 测试 Entity 数据绑定完整功能 ===');
            
            const world = new World();
            world.registerSystem(BehaviorTreeSystem);
            
            const entity = world.createEntity('TestEntity');
        
            // 添加组件
            const healthComp = entity.addComponent(HealthComponent);
            healthComp.health = 100;
            healthComp.maxHealth = 100;
            
            const positionComp = entity.addComponent(PositionComponent);
            positionComp.setPosition(0, 0, 0);
            
            // 创建复杂行为树
            const builder = new BehaviorTreeBuilder();
            const tree = builder
                .selector('ai')
                    .sequence('combat')
                        .condition('hasHealth', (bb) => {
                            const health = bb.get<number>('health', 0);
                            return health > 50;
                        })
                        .condition('inRange', (bb) => {
                            const pos = bb.get<Vec3>('position');
                            if (!pos) return false;
                            // 简单的距离检查（假设目标在 (10, 0, 0)）
                            const distance = Math.sqrt(
                                Math.pow(pos.x - 10, 2) + 
                                Math.pow(pos.y - 0, 2) + 
                                Math.pow(pos.z - 0, 2)
                            );
                            return distance < 15;
                        })
                        .action('attack', (bb) => {
                            console.log('执行攻击！');
                            // 模拟攻击后移动
                            const pos = bb.get<Vec3>('position');
                            if (pos) {
                                pos.x += 1;
                                console.log(`新位置: (${pos.x}, ${pos.y}, ${pos.z})`);
                            }
                            return NodeStatus.SUCCESS;
                        })
                    .end()
                    .sequence('move')
                        .condition('lowHealth', (bb) => {
                            const health = bb.get<number>('health', 0);
                            return health <= 50;
                        })
                        .action('retreat', (bb) => {
                            console.log('生命值低，撤退！');
                            const pos = bb.get<Vec3>('position');
                            if (pos) {
                                pos.x -= 5;
                                console.log(`撤退后位置: (${pos.x}, ${pos.y}, ${pos.z})`);
                            }
                            return NodeStatus.SUCCESS;
                        })
                    .end()
                    .action('idle', (bb) => {
                        console.log('待机');
                        return NodeStatus.SUCCESS;
                    })
                .end()
                .build();
            
            const btComponent = entity.addComponent(BehaviorTreeComponent);
            btComponent.setBehaviorTree(tree);
            
            // 绑定所有需要的 Entity 数据
            if (btComponent.blackboard) {
                btComponent.blackboard.bindEntityProperty(
                    entity.id,
                    HealthComponent,
                    'health',
                    'health'
                );
                
                btComponent.blackboard.bindEntityProperty(
                    entity.id,
                    PositionComponent,
                    'position',
                    'position'
                );
            }
            
            // 第一次执行：生命值高，在范围内，应该攻击
            console.log('\n--- 第一次执行（生命值 100，位置 (0,0,0)）---');
            world.update(0.016);
            const status1 = tree.execute();
            console.log('执行结果:', status1 === NodeStatus.SUCCESS ? '成功' : '失败');
            console.log('位置:', positionComp.position);
            
            // 第二次执行：生命值降低，应该撤退
            console.log('\n--- 第二次执行（生命值降低到 30）---');
            healthComp.health = 30;
            btComponent.blackboard?.clearCache(); // 清除缓存，强制重新获取
            world.update(0.016);
            const status2 = tree.execute();
            console.log('执行结果:', status2 === NodeStatus.SUCCESS ? '成功' : '失败');
            console.log('位置:', positionComp.position);
            
            // 第三次执行：生命值低，但不在范围内，应该待机
            console.log('\n--- 第三次执行（位置远离目标）---');
            positionComp.setPosition(100, 0, 0);
            btComponent.blackboard?.clearCache();
            world.update(0.016);
            const status3 = tree.execute();
            console.log('执行结果:', status3 === NodeStatus.SUCCESS ? '成功' : '失败');
            
            console.log('\n最终状态:');
            console.log('生命值:', healthComp.health);
            console.log('位置:', positionComp.position);
        } catch (error) {
            console.error('Entity 数据绑定完整测试失败:', error);
        }
    }

    /**
     * 运行所有测试
     */
    static runAll(): void {
        console.log('开始运行 ECS 集成测试...\n');
        
        this.testBasicIntegration();
        console.log('');
        
        this.testEntityDataBinding();
        console.log('');
        
        this.testEntityDataBindingComplete();
        console.log('');
        
        this.testMultipleEntities();
        console.log('');
        
        this.testExecuteInterval();
        console.log('\n所有测试完成！');
    }
}


import { _decorator, Component, Node } from 'cc';
import { World } from '@bl-framework/ecs';
import { TransformComponent } from './components/TransformComponent';
import { VelocityComponent } from './components/VelocityComponent';
import { PlayerComponent } from './components/PlayerComponent';
import { HealthComponent } from './components/HealthComponent';
import { MovementSystem } from './systems/MovementSystem';
import { RenderSystem } from './systems/RenderSystem';

const { ccclass, property } = _decorator;

/**
 * ECS 框架使用示例
 */
@ccclass('ECSExample')
export class ECSExample extends Component {
    @property(Node)
    playerNode: Node | null = null;

    @property(Node)
    enemyNode: Node | null = null;

    /** ECS World */
    private world!: World;

    /** 渲染系统引用 */
    private renderSystem!: RenderSystem;

    onLoad() {
        this.initWorld();
        this.createEntities();
    }

    /**
     * 初始化 ECS World
     */
    private initWorld(): void {
        // 创建 World，启用调试模式
        this.world = new World({
            initialEntityPoolSize: 1000,
            componentPoolSize: 100,
            debug: true,
        });

        // 注册系统
        this.world.registerSystem(MovementSystem);
        this.renderSystem = this.world.registerSystem(RenderSystem);

        console.log('[ECSExample] World initialized');
    }

    /**
     * 创建示例实体
     */
    private createEntities(): void {
        // 创建玩家实体
        this.createPlayer();

        // 创建敌人实体
        this.createEnemy();

        // 打印统计信息
        console.log('[ECSExample] Stats:', this.world.getStats());
    }

    /**
     * 创建玩家实体
     */
    private createPlayer(): void {
        // 创建实体
        const playerEntity = this.world.createEntity('Player');

        // 添加组件
        const transform = this.world.addComponent(
            playerEntity.id,
            TransformComponent
        );
        transform.position.set(0, 0, 0);

        const velocity = this.world.addComponent(
            playerEntity.id,
            VelocityComponent
        );
        velocity.velocity.set(1, 0, 0); // 向右移动
        velocity.maxSpeed = 5;

        const player = this.world.addComponent(
            playerEntity.id,
            PlayerComponent
        );
        player.playerName = 'Hero';
        player.level = 10;

        const health = this.world.addComponent(
            playerEntity.id,
            HealthComponent
        );
        health.max = 150;
        health.current = 150;

        // 如果有节点，绑定到渲染系统
        if (this.playerNode) {
            this.renderSystem.bindNode(playerEntity.id, this.playerNode);
        }

        console.log('[ECSExample] Player entity created:', playerEntity.id);
    }

    /**
     * 创建敌人实体
     */
    private createEnemy(): void {
        const enemyEntity = this.world.createEntity('Enemy');

        const transform = this.world.addComponent(
            enemyEntity.id,
            TransformComponent
        );
        transform.position.set(5, 0, 0);

        const velocity = this.world.addComponent(
            enemyEntity.id,
            VelocityComponent
        );
        velocity.velocity.set(-0.5, 0, 0); // 向左移动
        velocity.maxSpeed = 3;

        const health = this.world.addComponent(
            enemyEntity.id,
            HealthComponent
        );
        health.max = 100;
        health.current = 100;

        // 如果有节点，绑定到渲染系统
        if (this.enemyNode) {
            this.renderSystem.bindNode(enemyEntity.id, this.enemyNode);
        }

        console.log('[ECSExample] Enemy entity created:', enemyEntity.id);
    }

    /**
     * 演示查询功能
     */
    private demoQuery(): void {
        // 查询所有玩家
        const playerQuery = this.world.createQuery({
            all: [PlayerComponent, HealthComponent],
        });

        console.log('[ECSExample] Players found:', playerQuery.getCount());

        playerQuery.forEach((entity) => {
            const player = this.world.getComponent(
                entity.id,
                PlayerComponent
            )!;
            const health = this.world.getComponent(
                entity.id,
                HealthComponent
            )!;

            console.log(
                `[ECSExample] Player: ${player.playerName}, Level: ${player.level}, HP: ${health.current}/${health.max}`
            );
        });
    }

    update(deltaTime: number) {
        // 更新 World（会自动调用所有系统的 update）
        this.world.update(deltaTime);
    }

    onDestroy() {
        // 销毁 World
        if (this.world) {
            this.world.destroy();
            console.log('[ECSExample] World destroyed');
        }
    }
}


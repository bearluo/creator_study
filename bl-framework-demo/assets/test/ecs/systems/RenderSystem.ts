import { System, Query } from '@bl-framework/ecs';
import { Node } from 'cc';
import { TransformComponent } from '../components/TransformComponent';

/**
 * 渲染系统
 * 同步 ECS 实体的位置到 Cocos Creator 节点
 */
export class RenderSystem extends System {
    /** 查询器 */
    private query!: Query;

    /** 实体到节点的映射 */
    private entityNodeMap: Map<number, Node> = new Map();

    /** 系统优先级（渲染系统通常最后执行） */
    priority = 1000;

    /** 系统初始化 */
    onInit(): void {
        this.query = this.world.createQuery({
            all: [TransformComponent],
        });

        console.log('[RenderSystem] Initialized');
    }

    /** 绑定实体到节点 */
    bindNode(entityId: number, node: Node): void {
        this.entityNodeMap.set(entityId, node);
    }

    /** 解绑实体和节点 */
    unbindNode(entityId: number): void {
        this.entityNodeMap.delete(entityId);
    }

    /** 系统更新 */
    onUpdate(dt: number): void {
        this.query.forEach((entity) => {
            const node = this.entityNodeMap.get(entity.id);
            if (!node || !node.isValid) return;

            const transform = this.world.getComponent(
                entity.id,
                TransformComponent
            )!;

            if (!transform.enabled) return;

            // 同步位置、旋转、缩放到节点
            node.setPosition(transform.position);
            node.setRotationFromEuler(transform.rotation);
            node.setScale(transform.scale);
        });
    }

    /** 系统销毁 */
    onDestroy(): void {
        this.entityNodeMap.clear();
        console.log('[RenderSystem] Destroyed');
    }
}


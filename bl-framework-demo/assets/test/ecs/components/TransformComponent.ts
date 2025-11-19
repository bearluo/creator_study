import { Component } from '@bl-framework/ecs';
import { Vec3 } from 'cc';

/**
 * 变换组件
 * 存储实体的位置、旋转和缩放信息
 */
export class TransformComponent extends Component {
    /** 位置 */
    position: Vec3 = new Vec3();

    /** 旋转（欧拉角） */
    rotation: Vec3 = new Vec3();

    /** 缩放 */
    scale: Vec3 = new Vec3(1, 1, 1);

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.position.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.scale.set(1, 1, 1);
    }
}


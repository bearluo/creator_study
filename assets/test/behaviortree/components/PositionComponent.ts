/**
 * 位置组件（测试用）
 * 用于测试 Entity 数据绑定
 */

import { Component } from 'db://bl-framework/ecs';
import { component } from 'db://bl-framework/ecs/decorators/component';
import { Vec3 } from 'cc';

/**
 * 位置组件
 */
@component({
    name: 'Position',
    pooled: false
})
export class PositionComponent extends Component {
    /** 位置 */
    position: Vec3 = new Vec3(0, 0, 0);

    /** 旋转 */
    rotation: Vec3 = new Vec3(0, 0, 0);

    /** 缩放 */
    scale: Vec3 = new Vec3(1, 1, 1);

    /**
     * 组件初始化
     */
    onInit(): void {
        this.position = new Vec3(0, 0, 0);
        this.rotation = new Vec3(0, 0, 0);
        this.scale = new Vec3(1, 1, 1);
    }

    /**
     * 设置位置
     * @param x X 坐标
     * @param y Y 坐标
     * @param z Z 坐标
     */
    setPosition(x: number, y: number, z: number): void {
        this.position.set(x, y, z);
    }

    /**
     * 移动
     * @param dx X 偏移
     * @param dy Y 偏移
     * @param dz Z 偏移
     */
    move(dx: number, dy: number, dz: number): void {
        this.position.x += dx;
        this.position.y += dy;
        this.position.z += dz;
    }
}


/**
 * 示例 View Contract（模板）
 * 
 * ⚠️ **注意**：这是示例模板，业务专用的 Contract 应该放在业务工程
 * 
 * 字段约定：
 * - 必需字段：VM 一定会 bind（不使用 `?`）
 * - 可选字段：VM 需判空再 bind（使用 `?` 标记）
 * 
 * @example
 * ```typescript
 * // 业务工程中的 Contract（推荐）
 * export interface IHUDView {
 *     nameText: ViewTarget<string>;
 *     levelText: ViewTarget<string>;
 *     hpBar: ViewTarget<number>;
 *     nameInput?: TwoWayViewTarget<string>;
 * }
 * ```
 */
import type { ViewTarget } from '../types/view-target';

/**
 * 示例数据接口
 */
export interface ExampleData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
}

/**
 * 示例 View Contract
 * 
 * 只包含 ViewTarget 类型字段，不出现 Label/EditBox
 */
export interface IExampleView {
    // 必需字段：VM 一定会 bind
    nameText: ViewTarget<string>;
    levelText: ViewTarget<string>;
    hpBar: ViewTarget<number>;
    
    // 可选字段：VM 需判空再 bind
    // nameInput?: TwoWayViewTarget<string>;
}

/**
 * 示例 View 实现
 * 
 * 只持有 ViewTarget，不 import cocos
 */
import { View } from '../core/View';

export class ExampleView extends View implements IExampleView {
    nameText!: ViewTarget<string>;
    levelText!: ViewTarget<string>;
    hpBar!: ViewTarget<number>;
}


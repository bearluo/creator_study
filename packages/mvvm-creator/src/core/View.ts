/**
 * View 基类（可选）
 * 
 * 如果 View 只需要持有 ViewTarget，可以直接实现接口
 * 如果需要通用功能，可以继承此类
 * 
 * @example
 * ```typescript
 * export class HUDView extends View implements IHUDView {
 *     nameText!: ViewTarget<string>;
 *     levelText!: ViewTarget<string>;
 *     // ...
 * }
 * ```
 */
export class View {
    /**
     * 销毁 View
     * 
     * 子类可以重写此方法以清理资源
     */
    destroy(): void {
        // 默认实现：空
    }
}


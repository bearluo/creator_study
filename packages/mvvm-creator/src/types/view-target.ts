/**
 * 视图目标适配器接口
 * 
 * 用于将 Cocos Creator 的组件/节点适配为统一的视图目标
 */
export interface ViewTarget<TViewValue = any> {
    /** 设置视图值 */
    set(value: TViewValue): void;
    
    /** 获取视图值（可选，two-way 绑定需要） */
    get?(): TViewValue;
    
    /** 
     * 订阅视图变化（two-way 才实现）
     * @returns 取消订阅函数
     */
    onChange?(callback: (value: TViewValue) => void): () => void;
    
    /** 
     * 只做解绑，不销毁节点/组件
     * 统一生命周期方法名为 dispose()（只做解绑，不销毁节点/组件）
     */
    dispose?(): void;
}


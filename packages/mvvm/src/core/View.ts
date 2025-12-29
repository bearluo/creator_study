import type { IView } from './types';

/**
 * 视图基类（抽象）
 * 
 * 提供框架无关的视图接口
 * 具体实现需要继承此类或实现 IView 接口
 */
export abstract class View implements IView {
    /**
     * 更新视图路径的值
     */
    abstract update(path: string, value: any): void;
    
    /**
     * 获取视图路径的值
     */
    abstract get(path: string): any;
    
    /**
     * 设置视图路径的值
     */
    abstract set(path: string, value: any): void;
    
    /**
     * 监听视图事件
     */
    abstract on(event: string, callback: (...args: any[]) => void): () => void;
    
    /**
     * 销毁视图
     */
    abstract destroy(): void;
}

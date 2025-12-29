/**
 * ViewModel 组件
 * 
 * 简化版的 MVVM 组件，自动创建 ViewModel 和适配器
 */

import { _decorator } from 'cc';
import { MVVMComponent } from './MVVMComponent';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { CocosViewAdapter } from '../adapters/CocosViewAdapter';
import type { CocosViewAdapterConfig } from '../types/adapters';

const { ccclass } = _decorator;

/**
 * ViewModel 组件配置
 */
export interface ViewModelComponentConfig {
    /** 初始数据 */
    data?: any;
    /** 视图适配器配置 */
    viewAdapterConfig?: CocosViewAdapterConfig;
}

/**
 * ViewModel 组件
 * 
 * 简化版的 MVVM 组件，自动创建 ViewModel 和视图适配器
 * 适合简单的数据绑定场景
 * 
 * @example
 * ```typescript
 * // 方式1: 基础用法（无类型约束）
 * @ccclass('MyViewModelComponent')
 * export class MyViewModelComponent extends ViewModelComponent {
 *     onLoad() {
 *         super.onLoad();
 *         this.setData({ title: 'Hello World' });
 *     }
 * }
 * 
 * // 方式2: 类型安全用法（推荐）
 * interface PlayerData {
 *     name: string;
 *     level: number;
 * }
 * 
 * @ccclass('PlayerComponent')
 * export class PlayerComponent extends ViewModelComponent<PlayerData> {
 *     @property(Label)
 *     titleLabel: Label | null = null;
 *     
 *     onLoad() {
 *         super.onLoad();
 *         
 *         // 配置视图适配器
 *         this.viewAdapter = new CocosViewAdapter({
 *             rootNode: this.node,
 *             mappings: [
 *                 { path: 'titleLabel', viewPath: 'name', componentType: 'Label', propertyName: 'string' }
 *             ]
 *         });
 *         
 *         // 绑定数据（现在有类型提示）
 *         this.viewModel.bind('name', this.viewAdapter, { mode: 'one-way' });
 *         
 *         // 设置数据（类型安全）
 *         this.setData({ name: 'Player 1', level: 1 });
 *     }
 * }
 * ```
 */
@ccclass('ViewModelComponent')
export class ViewModelComponent<T = any> extends MVVMComponent<T> {
    protected initViewModel(model: Model<T>): ViewModel<T> {
        return new ViewModel(model);
    }
    
    /**
     * 设置数据
     * @param data 数据对象
     */
    setData(data: Partial<T>): void {
        if (this.viewModel) {
            // 更新模型数据
            Object.assign(this.viewModel.model.data as any, data);
            // 触发响应式更新
            Object.assign(this.viewModel.reactive.value as any, data);
        }
    }
    
    /**
     * 获取数据
     * @returns 当前数据
     */
    getData(): T | undefined {
        return this.viewModel?.reactive.value;
    }
    
    /**
     * 更新数据路径的值
     * @param path 数据路径
     * @param value 新值
     */
    updateData(path: string, value: any): void {
        if (this.viewModel) {
            const keys = path.split('.');
            const lastKey = keys.pop()!;
            let target: any = this.viewModel.reactive.value;
            
            for (const key of keys) {
                if (target[key] === null || target[key] === undefined) {
                    target[key] = {};
                }
                target = target[key];
            }
            
            target[lastKey] = value;
        }
    }
    
    /**
     * 获取数据路径的值
     * @param path 数据路径
     * @returns 值
     */
    getDataValue(path: string): any {
        if (!this.viewModel) {
            return undefined;
        }
        
        const keys = path.split('.');
        let value: any = this.viewModel.reactive.value;
        
        for (const key of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[key];
        }
        
        return value;
    }
}


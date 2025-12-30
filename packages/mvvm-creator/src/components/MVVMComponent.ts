/**
 * MVVM 组件基类
 * 
 * Cocos Creator Component 与 MVVM ViewModel 的集成基类
 */

import { _decorator, Component } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { CocosViewAdapter } from '../adapters/CocosViewAdapter';
import { CocosComponentAdapter } from '../adapters/CocosComponentAdapter';
import { BindingBuilder } from '../builders/BindingBuilder';
import type { CocosViewAdapterConfig } from '../types/adapters';
import type { CocosComponentAdapterConfig } from '../adapters/CocosComponentAdapter';

const { ccclass } = _decorator;

/**
 * 装饰器绑定配置
 */
export interface DecoratorBinding {
    /** 数据路径（如 'name', 'player.level'） */
    path: string;
    /** 目标属性名称（组件中的 @property 属性名） */
    target: string;
    /** 组件属性名称（如 'string', 'spriteFrame'） */
    property?: string;
    /** 组件类型名称（如 'Label', 'Button'） */
    componentType?: string;
    /** 绑定模式 */
    mode?: 'one-way' | 'two-way' | 'one-way-to-source';
    /** 值转换函数 */
    converter?: (value: any) => any;
    /** 反向转换函数（用于双向绑定） */
    reverseConverter?: (value: any) => any;
    /** 验证函数 */
    validator?: (value: any) => boolean;
}

/**
 * MVVM 组件配置
 */
export interface MVVMComponentConfig {
    /** 数据模型 */
    model?: Model;
    /** 视图适配器配置 */
    viewAdapterConfig?: CocosViewAdapterConfig;
    /** 组件适配器配置 */
    componentAdapterConfig?: Omit<CocosComponentAdapterConfig, 'component'>;
}

/**
 * MVVM 组件基类
 * 
 * 提供 ViewModel 集成和自动数据绑定功能
 * 
 * @example
 * ```typescript
 * // 方式1: 基础用法（无类型约束）
 * @ccclass('MyMVVMComponent')
 * export class MyMVVMComponent extends MVVMComponent {
 *     protected initViewModel(model: Model<any>): ViewModel<any> {
 *         return new ViewModel(model);
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
 * export class PlayerComponent extends MVVMComponent<PlayerData> {
 *     @property(Label)
 *     titleLabel: Label | null = null;
 *     
 *     protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
 *         const viewModel = new ViewModel(model);
 *         
 *         // 配置视图适配器
 *         this.viewAdapter = new CocosViewAdapter({
 *             rootNode: this.node,
 *             mappings: [
 *                 { path: 'titleLabel', viewPath: 'name', componentType: 'Label', propertyName: 'string' }
 *             ]
 *         });
 *         
 *         // 绑定数据
 *         viewModel.bind('name', this.viewAdapter, { mode: 'one-way' });
 *         
 *         return viewModel;
 *     }
 *     
 *     protected createModel(): Model<PlayerData> {
 *         return new Model<PlayerData>({ name: '', level: 1 });
 *     }
 *     
 *     onLoad() {
 *         super.onLoad();
 *         // 现在有类型提示
 *         this.viewModel.reactive.value.name; // ✅ string
 *         this.viewModel.reactive.value.level; // ✅ number
 *     }
 * }
 * ```
 */
@ccclass('MVVMComponent')
export abstract class MVVMComponent<T = any> extends Component {
    /** ViewModel 实例 */
    protected viewModel!: ViewModel<T>;
    
    /** 视图适配器 */
    protected viewAdapter!: CocosViewAdapter;
    
    /** 组件适配器 */
    protected componentAdapter?: CocosComponentAdapter;
    
    /** 绑定构建器 */
    protected bindingBuilder!: BindingBuilder<T>;
    
    /**
     * 初始化 ViewModel
     * 子类需要实现此方法来创建和配置 ViewModel
     * 
     * @param model 数据模型
     * @returns ViewModel 实例
     * 
     * @example
     * ```typescript
     * interface PlayerData {
     *     name: string;
     *     level: number;
     * }
     * 
     * protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
     *     return new ViewModel(model);
     * }
     * ```
     */
    protected abstract initViewModel(model: Model<T>): ViewModel<T>;
    
    /**
     * 创建数据模型
     * 子类可以重写此方法来创建自定义模型
     * 
     * @returns 数据模型实例
     * 
     * @example
     * ```typescript
     * interface PlayerData {
     *     name: string;
     *     level: number;
     * }
     * 
     * protected createModel(): Model<PlayerData> {
     *     return new Model<PlayerData>({ name: '', level: 1 });
     * }
     * ```
     */
    protected createModel(): Model<T> {
        // 默认返回一个空模型
        return new Model({} as T);
    }
    
    /**
     * 组件加载时调用
     */
    onLoad(): void {
        // 创建模型
        const model = this.createModel();
        
        // 初始化 ViewModel
        this.viewModel = this.initViewModel(model);
        
        // 创建视图适配器
        this.viewAdapter = this.createViewAdapter();
        
        // 创建绑定构建器（传入组件实例用于解析属性，传递类型信息）
        this.bindingBuilder = new BindingBuilder<T>(this.viewModel, this.node, this.viewAdapter, this);
        
        // 处理装饰器绑定（统一使用 BindingBuilder）
        this.processDecoratorBindings();
        
        // 调用子类初始化
        this.onMVVMLoad();
    }
    
    /**
     * 创建视图适配器
     * 子类可以重写此方法来自定义适配器配置
     */
    protected createViewAdapter(): CocosViewAdapter {
        return new CocosViewAdapter({
            rootNode: this.node
        });
    }
    
    /**
     * 处理装饰器绑定
     * 统一使用 BindingBuilder 处理，避免代码重复
     */
    private processDecoratorBindings(): void {
        const constructor = this.constructor as any;
        const bindings: DecoratorBinding[] = constructor.__bindings__ || [];
        const events = constructor.__events__ || [];
        const conditions = constructor.__conditions__ || [];
        const lists = constructor.__lists__ || [];
        
        // 使用 BindingBuilder 统一处理所有装饰器绑定
        this.bindingBuilder.fromDecorators(bindings, events, conditions, lists);
        
        // 构建所有绑定
        this.bindingBuilder.build();
    }
    
    /**
     * 设置列表项数据
     * 用于列表渲染指令（CocosForDirective）绑定数据
     * 子类可以重写此方法来自定义数据绑定逻辑
     * 
     * @param data 列表项数据
     * 
     * @example
     * ```typescript
     * // 默认实现会更新 reactive.value
     * component.setItemData({ name: 'Item 1', value: 100 });
     * 
     * // 子类可以重写
     * setItemData(data: any): void {
     *     // 自定义逻辑
     *     Object.assign(this.viewModel.reactive.value, data);
     * }
     * ```
     */
    setItemData(data: Partial<T>): void {
        if (this.viewModel) {
            // 更新响应式对象的值
            Object.assign(this.viewModel.reactive.value as any, data);
        }
    }
    
    /**
     * 子类可以重写此方法进行额外初始化
     * 在装饰器绑定处理完成后调用
     */
    protected onMVVMLoad(): void {
        // 子类实现
    }
    
    /**
     * 组件销毁时调用
     */
    onDestroy(): void {
        // 销毁 ViewModel
        if (this.viewModel) {
            this.viewModel.destroy();
        }
        
        // 销毁适配器
        if (this.viewAdapter) {
            this.viewAdapter.destroy();
        }
        
        if (this.componentAdapter) {
            this.componentAdapter.destroy();
        }
        
        super.onDestroy?.();
    }
}


/**
 * 绑定构建器
 * 
 * 提供流畅的 API 来构建数据绑定、事件绑定等
 * 
 * @example
 * ```typescript
 * onLoad() {
 *     super.onLoad();
 *     
 *     this.bindingBuilder
 *         .bind('name', this.nameLabel, 'string')
 *         .bind('level', this.levelLabel, 'string', { converter: (v) => `Lv.${v}` })
 *         .on('click', this.levelUpButton, this.onLevelUp)
 *         .if('showInfo', this.infoPanel)
 *         .build();
 * }
 * ```
 */

import type { Node, Component } from 'cc';
import type { BindingOptions } from '@bl-framework/mvvm';
import type { CocosNode, CocosComponent } from '../types';
import { CocosViewAdapter } from '../adapters/CocosViewAdapter';
import { CocosIfDirective } from '../directives/CocosIfDirective';
import { CocosOnDirective } from '../directives/CocosOnDirective';
import { CocosForDirective } from '../directives/CocosForDirective';
import type { ViewModel } from '@bl-framework/mvvm';
import type { DecoratorBinding } from '../components/MVVMComponent';

/**
 * 绑定构建器选项
 */
export interface BindingBuilderOptions {
    /** 是否自动创建视图适配器 */
    autoCreateAdapter?: boolean;
}

/**
 * 绑定构建器
 */
export class BindingBuilder {
    private viewModel: ViewModel;
    private viewAdapter?: CocosViewAdapter;
    private bindings: Array<{
        path: string;
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions;
    }> = [];
    private events: Array<{
        event: string;
        target: CocosNode | CocosComponent | string;
        handler: string | Function;
    }> = [];
    private conditions: Array<{
        path: string;
        target: CocosNode | string; // 支持字符串属性名
    }> = [];
    private lists: Array<{
        path: string;
        container: CocosNode | string; // 支持节点或属性名
        template: CocosNode | string; // 支持节点或属性名
        key?: string | ((item: any, index: number) => string | number);
    }> = [];
    private rootNode: CocosNode;
    private componentInstance?: any; // 组件实例，用于解析属性名
    
    constructor(viewModel: ViewModel, rootNode: CocosNode, viewAdapter?: CocosViewAdapter, componentInstance?: any) {
        this.viewModel = viewModel;
        this.rootNode = rootNode;
        this.viewAdapter = viewAdapter;
        this.componentInstance = componentInstance;
    }
    
    /**
     * 添加数据绑定
     * 
     * @param path 数据路径
     * @param target 目标节点、组件或属性名
     * @param property 属性名称（可选）
     * @param options 绑定选项（可选）
     */
    bind(
        path: string,
        target: CocosNode | CocosComponent | string,
        property?: string,
        options?: BindingOptions
    ): this {
        this.bindings.push({
            path,
            target,
            property,
            componentType: property ? this._inferComponentType(target) : undefined,
            options
        });
        return this;
    }
    
    /**
     * 添加事件绑定
     * 
     * @param event 事件名称
     * @param target 目标节点、组件或属性名
     * @param handler 处理函数或方法名
     */
    on(
        event: string,
        target: CocosNode | CocosComponent | string,
        handler: string | Function
    ): this {
        this.events.push({ event, target, handler });
        return this;
    }
    
    /**
     * 添加条件渲染
     * 
     * @param path 数据路径
     * @param target 目标节点
     */
    if(path: string, target: CocosNode): this {
        this.conditions.push({ path, target });
        return this;
    }
    
    /**
     * 添加列表渲染
     * 
     * @param path 数据路径
     * @param container 容器节点或属性名
     * @param template 模板节点或属性名
     * @param key 项的唯一键字段名或函数
     */
    for(
        path: string,
        container: CocosNode | string,
        template: CocosNode | string,
        key?: string | ((item: any, index: number) => string | number)
    ): this {
        this.lists.push({ 
            path, 
            container, 
            template, 
            key 
        });
        return this;
    }
    
    /**
     * 从装饰器元数据构建绑定
     * 
     * @param bindings 装饰器绑定配置
     * @param events 装饰器事件配置
     * @param conditions 装饰器条件配置
     * @param lists 装饰器列表配置
     */
    fromDecorators(
        bindings: DecoratorBinding[],
        events: Array<{
            event: string;
            target: string;
            handler?: string | Function;
            useCapture?: boolean;
        }>,
        conditions: Array<{
            path: string;
            target: string;
        }>,
        lists: Array<{
            path: string;
            container: string;
            template: string;
            key?: string | ((item: any, index: number) => string | number);
        }>
    ): this {
        // 处理数据绑定
        bindings.forEach(binding => {
            this.bind(
                binding.path,
                binding.target, // 属性名，会在 build 时解析
                binding.property,
                {
                    mode: binding.mode,
                    converter: binding.converter,
                    reverseConverter: binding.reverseConverter,
                    validator: binding.validator
                }
            );
            // 更新 componentType（如果提供了）
            const lastBinding = this.bindings[this.bindings.length - 1];
            if (lastBinding && binding.componentType) {
                lastBinding.componentType = binding.componentType;
            }
        });
        
        // 处理事件绑定
        events.forEach(event => {
            this.on(event.event, event.target, event.handler || '');
        });
        
        // 处理条件渲染
        conditions.forEach(condition => {
            this.conditions.push({
                path: condition.path,
                target: condition.target as any // 属性名，会在 build 时解析
            });
        });
        
        // 处理列表渲染
        this.lists.push(...lists);
        
        return this;
    }
    
    /**
     * 构建所有绑定
     */
    build(): void {
        // 确保视图适配器存在
        if (!this.viewAdapter) {
            this.viewAdapter = new CocosViewAdapter({
                rootNode: this.rootNode
            });
        }
        
        // 处理数据绑定
        this.bindings.forEach(binding => {
            this._processBinding(binding);
        });
        
        // 处理事件绑定
        this.events.forEach(event => {
            this._processEvent(event);
        });
        
        // 处理条件渲染
        this.conditions.forEach(condition => {
            this._processCondition(condition);
        });
        
        // 处理列表渲染
        this.lists.forEach(list => {
            this._processList(list);
        });
    }
    
    /**
     * 处理数据绑定
     */
    private _processBinding(binding: {
        path: string;
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions;
    }): void {
        const target = this._resolveTarget(binding.target);
        if (!target) {
            console.warn(`[BindingBuilder] Target not found for binding: ${binding.path}`);
            return;
        }
        
        // 如果是字符串，需要添加到适配器映射
        if (typeof binding.target === 'string') {
            // 添加到适配器映射
            this.viewAdapter!.addMapping({
                path: binding.target,
                viewPath: binding.path,
                componentType: binding.componentType,
                propertyName: binding.property
            });
        }
        
        // 创建绑定
        this.viewModel.bind(binding.path, this.viewAdapter!, binding.options);
    }
    
    /**
     * 处理事件绑定
     */
    private _processEvent(event: {
        event: string;
        target: CocosNode | CocosComponent | string;
        handler: string | Function;
    }): void {
        const target = this._resolveTarget(event.target);
        if (!target) {
            console.warn(`[BindingBuilder] Target not found for event: ${event.event}`);
            return;
        }
        
        // 创建事件指令
        const reactive = this.viewModel.reactive;
        const directive = new CocosOnDirective(reactive, event.event);
        
        // 解析处理函数
        let handler: Function | undefined;
        if (typeof event.handler === 'string') {
            if (this.componentInstance) {
                handler = this.componentInstance[event.handler];
                if (handler && typeof handler === 'function') {
                    handler = handler.bind(this.componentInstance);
                }
            } else {
                handler = (this as any)[event.handler]?.bind(this);
            }
        } else if (typeof event.handler === 'function') {
            handler = this.componentInstance 
                ? event.handler.bind(this.componentInstance)
                : event.handler;
        }
        
        if (!handler || typeof handler !== 'function') {
            console.warn(`[BindingBuilder] Event handler not found: ${event.handler}`);
            return;
        }
        
        // 判断 target 是 Node 还是 Component
        // Component 有 node 属性，Node 没有
        const isComponent = (target as any).node !== undefined;
        const node = isComponent ? (target as any).node : target;
        const component = isComponent ? (target as CocosComponent) : undefined;
        
        directive.execute({
            node: node as CocosNode,
            component: component,
            eventName: event.event,
            handler: handler as (...args: any[]) => void
        });
    }
    
    /**
     * 处理条件渲染
     */
    private _processCondition(condition: {
        path: string;
        target: CocosNode | string;
    }): void {
        const target = this._resolveTarget(condition.target);
        if (!target) {
            console.warn(`[BindingBuilder] Target not found for condition: ${condition.path}`);
            return;
        }
        
        const reactive = this.viewModel.reactive;
        const directive = new CocosIfDirective(reactive, condition.path);
        directive.execute({
            node: target as CocosNode,
            path: condition.path
        });
    }
    
    /**
     * 处理列表渲染
     */
    private _processList(list: {
        path: string;
        container: CocosNode | string;
        template: CocosNode | string;
        key?: string | ((item: any, index: number) => string | number);
    }): void {
        const container = this._resolveTarget(list.container);
        const template = this._resolveTarget(list.template);
        
        if (!container || !template) {
            console.warn(`[BindingBuilder] Container or template not found for list: ${list.path}`);
            return;
        }
        
        const reactive = this.viewModel.reactive;
        const directive = new CocosForDirective(reactive, list.path);
        
        const itemKey = typeof list.key === 'string' 
            ? (item: any) => item[list.key as string]
            : list.key;
        
        directive.execute({
            containerNode: container as CocosNode,
            itemTemplate: template as CocosNode,
            path: list.path,
            itemKey: itemKey
        });
    }
    
    /**
     * 解析目标（从字符串属性名解析为实际对象）
     */
    private _resolveTarget(target: CocosNode | CocosComponent | string): CocosNode | CocosComponent | null {
        if (typeof target === 'string') {
            // 从组件实例中获取属性
            if (this.componentInstance) {
                return this.componentInstance[target] || null;
            }
            // 如果没有组件实例，尝试从 this 获取（向后兼容）
            return (this as any)[target] || null;
        }
        return target;
    }
    
    /**
     * 推断组件类型
     */
    private _inferComponentType(target: CocosNode | CocosComponent | string): string | undefined {
        // 这里可以根据实际情况推断组件类型
        // 暂时返回 undefined，由用户指定
        return undefined;
    }
    
    /**
     * 获取视图适配器
     */
    getViewAdapter(): CocosViewAdapter | undefined {
        return this.viewAdapter;
    }
}


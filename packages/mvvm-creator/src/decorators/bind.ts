/**
 * 数据绑定装饰器
 * 
 * 用于声明式地定义数据绑定
 * 
 * @example
 * ```typescript
 * @ccclass('PlayerInfo')
 * export class PlayerInfo extends MVVMComponent {
 *     // 方式1: 直接应用到属性上（推荐）
 *     @property(Label)
 *     @bind('name', { property: 'string' })
 *     nameLabel: Label | null = null;
 *     
 *     // 方式2: 使用占位符（向后兼容）
 *     @bind('level', { target: 'levelLabel', property: 'string' })
 *     private _placeholder!: any;
 * }
 * ```
 */

import type { BindingOptions } from '@bl-framework/mvvm';

/**
 * 绑定配置
 */
export interface BindOptions {
    /** 目标属性名称（组件中的 @property 属性名），如果不指定则使用装饰器所在的属性名 */
    target?: string;
    /** 组件属性名称（如 'string', 'spriteFrame'），如果不指定则尝试自动推断 */
    property?: string;
    /** 组件类型名称（如 'Label', 'Button'），如果不指定则尝试自动推断 */
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
 * 数据绑定装饰器
 * 
 * @param path 数据路径（如 'name', 'player.level'）
 * @param options 绑定选项
 */
export function bind(path: string, options?: BindOptions) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        // 存储绑定配置到类的元数据
        // 如果没有指定 target，则使用当前属性名作为 target
        const bindings = target.constructor.__bindings__ || [];
        bindings.push({
            path,
            target: options?.target || propertyKey, // 自动推断 target
            property: options?.property,
            componentType: options?.componentType,
            mode: options?.mode || 'one-way',
            converter: options?.converter,
            reverseConverter: options?.reverseConverter,
            validator: options?.validator
        });
        target.constructor.__bindings__ = bindings;
    };
}


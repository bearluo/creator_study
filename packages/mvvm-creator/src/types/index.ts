/**
 * Cocos Creator MVVM 集成类型定义
 * 
 * 使用 @cocos/creator-types 提供的官方类型定义
 */

// 导入 Cocos Creator 官方类型
import type { Node, Component, Label, Button, Sprite, Prefab } from 'cc';

// 重新导出类型以便外部使用
export type CocosNode = Node;
export type CocosPrefab = Prefab;
export type CocosComponent = Component;
export type CocosLabel = Label;
export type CocosButton = Button;
export type CocosSprite = Sprite;

// 导出常用的 Cocos Creator 类型
export type { Node, Component, Label, Button, Sprite, Prefab } from 'cc';

/**
 * Cocos Creator 组件属性路径映射
 */
export interface ComponentPropertyPath {
    /** 组件类型名称（如 'Label', 'Button'） */
    componentType: string;
    /** 属性名称（如 'string', 'spriteFrame'） */
    propertyName: string;
}


/**
 * @bl-framework/mvvm-creator
 * 
 * MVVM framework integration for Cocos Creator
 * 
 * 所有导出打包成一个对象 MVVMCreator
 */

// ==================== 适配器 ====================

export { CocosViewAdapter } from './adapters/CocosViewAdapter';
export { CocosComponentAdapter } from './adapters/CocosComponentAdapter';
export type {
    NodeViewMapping,
    ComponentPropertyAccessor,
    CocosViewAdapterConfig
} from './types/adapters';
export type {
    ComponentPropertyBinding,
    ComponentEventBinding,
    CocosComponentAdapterConfig
} from './adapters/CocosComponentAdapter';

// ==================== 组件 ====================

export { MVVMComponent } from './components/MVVMComponent';
export { ViewModelComponent } from './components/ViewModelComponent';

export type {
    MVVMComponentConfig,
    ViewModelComponentConfig
} from './components';

// ==================== 指令 ====================

export { CocosIfDirective } from './directives/CocosIfDirective';
export { CocosForDirective } from './directives/CocosForDirective';
export { CocosOnDirective } from './directives/CocosOnDirective';
export { CocosBindDirective } from './directives/CocosBindDirective';

export type {
    CocosIfDirectiveContext,
    CocosForDirectiveContext,
    CocosOnDirectiveContext,
    CocosBindDirectiveContext
} from './directives';

// ==================== 装饰器 ====================

export { bind, on, ifDirective, if, forDirective, for } from './decorators';

export type {
    BindOptions,
    OnOptions,
    IfOptions,
    ForOptions
} from './decorators';

// ==================== 构建器 ====================

export { BindingBuilder } from './builders';

export type { BindingBuilderOptions } from './builders';

// ==================== 命名空间导出 ====================

import { CocosViewAdapter } from './adapters/CocosViewAdapter';
import { CocosComponentAdapter } from './adapters/CocosComponentAdapter';
import { CocosIfDirective } from './directives/CocosIfDirective';
import { CocosForDirective } from './directives/CocosForDirective';
import { CocosOnDirective } from './directives/CocosOnDirective';
import { CocosBindDirective } from './directives/CocosBindDirective';
import { MVVMComponent } from './components/MVVMComponent';
import { ViewModelComponent } from './components/ViewModelComponent';
import { BindingBuilder } from './builders/BindingBuilder';

/**
 * MVVM Creator 命名空间对象
 * 包含所有 Cocos Creator MVVM 集成相关的类、接口和工具
 */
export const MVVMCreator = {
    // 适配器
    CocosViewAdapter,
    CocosComponentAdapter,
    
    // 组件
    MVVMComponent,
    ViewModelComponent,
    
    // 指令
    CocosIfDirective,
    CocosForDirective,
    CocosOnDirective,
    CocosBindDirective,
    
    // 构建器
    BindingBuilder,
} as const;

// 默认导出 MVVMCreator 对象
export default MVVMCreator;


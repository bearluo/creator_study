/**
 * @bl-framework/mvvm
 * 
 * MVVM framework for bl-framework
 * 
 * 所有导出打包成一个对象 MVVM
 */

// ==================== 核心模块 ====================

export { Model } from './core/Model';
export { View } from './core/View';
export { ViewModel } from './core/ViewModel';

export type {
    IReactive,
    IView,
    IModel,
    IViewModel,
    BindingOptions,
    Path,
    PathValue,
    BatchBindingItem,
    BindingConfig
} from './core/types';

export type { Watcher as IWatcher } from './core/types';
export type { DataBinding as IDataBinding } from './core/types';

export {
    MVVMError,
    BindingError,
    ReactiveError,
    ValidationError,
    PathError
} from './core/types';

// ==================== 响应式模块 ====================

export { Reactive } from './reactive/Reactive';
export { Watcher } from './reactive/Watcher';
export { DependencyTracker } from './reactive/DependencyTracker';

// ==================== 绑定模块 ====================

export { DataBinding } from './binding/DataBinding';
export { BindingManager } from './binding/BindingManager';

// ==================== 工具模块 ====================
// (已移除)

// ==================== 指令模块 ====================

export { Directive } from './directives/Directive';
export { IfDirective } from './directives/IfDirective';
export type { IfDirectiveContext } from './directives/IfDirective';
export { ForDirective } from './directives/ForDirective';
export type { ForDirectiveContext } from './directives/ForDirective';
export { OnDirective } from './directives/OnDirective';
export type { OnDirectiveContext } from './directives/OnDirective';
export { BindDirective } from './directives/BindDirective';
export type { BindDirectiveContext } from './directives/BindDirective';

// ==================== 命名空间导出 ====================

import { Model } from './core/Model';
import { View } from './core/View';
import { ViewModel } from './core/ViewModel';
import { Reactive } from './reactive/Reactive';
import { Watcher } from './reactive/Watcher';
import { DependencyTracker } from './reactive/DependencyTracker';
import { DataBinding } from './binding/DataBinding';
import { BindingManager } from './binding/BindingManager';
import { Directive } from './directives/Directive';
import { IfDirective } from './directives/IfDirective';
import { ForDirective } from './directives/ForDirective';
import { OnDirective } from './directives/OnDirective';
import { BindDirective } from './directives/BindDirective';

/**
 * MVVM 命名空间对象
 * 包含所有 MVVM 相关的类、接口和工具
 */
export const MVVM = {
    // 核心类
    Model,
    View,
    ViewModel,
    
    // 响应式
    Reactive,
    Watcher,
    DependencyTracker,
    
    // 绑定
    DataBinding,
    BindingManager,
    
    // 指令
    Directive,
    IfDirective,
    ForDirective,
    OnDirective,
    BindDirective,
} as const;

// 默认导出 MVVM 对象
export default MVVM;

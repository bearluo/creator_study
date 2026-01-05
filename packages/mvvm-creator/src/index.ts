/**
 * @bl-framework/mvvm-creator
 * 
 * MVVM framework integration for Cocos Creator
 */

// ==================== 类型定义 ====================
export type { ViewTarget } from './types/view-target';
export type { ComponentCtor, BaseMapping, DisplayMapping, InputMapping, ViewMapping } from './types/cocos';
export type { BindingConfigItem, BindingConfigEntry } from './types/binding-config';

// ==================== 适配器 ====================
export { CocosViewAdapter } from './adapters/CocosViewAdapter';
export type { CocosViewAdapterConfig } from './adapters/CocosViewAdapter';
export { TargetViewAdapter } from './adapters/TargetViewAdapter';

// ==================== 组件 ====================
export { MVVMComponent } from './components/MVVMComponent';

// ==================== 构建器 ====================
export { BindingBuilder } from './builders/BindingBuilder';

// ==================== 辅助函数 ====================
export {
    toLabelText,
    toProgress,
    toActive,
    toEditBox,
    toToggle,
    toSlider
} from './helpers/view-targets';

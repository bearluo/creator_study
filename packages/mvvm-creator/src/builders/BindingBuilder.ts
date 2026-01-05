/**
 * BindingBuilder - 类型安全的绑定构建器
 * 
 * 方案 2.1 最终版：延迟构建方案（ViewTarget + TargetViewAdapter）
 */
import type { ViewModel, Path, PathValue, BindingOptions, BatchBindingItem, DataBinding } from '@bl-framework/mvvm';
import type { ViewTarget } from '../types/view-target';
import type { BindingConfigEntry, BindingConfigItem } from '../types/binding-config';
import { TargetViewAdapter } from '../adapters/TargetViewAdapter';
import { DEBUG } from 'cc/env';
import { Label, EditBox, ProgressBar, Toggle, Slider, Node } from 'cc';
import {
    toLabelText,
    toProgress,
    toActive,
    toEditBox,
    toToggle,
    toSlider
} from '../helpers/view-targets';

/**
 * 绑定项配置
 */
type AnyPath<T> = Path<T> & string;

interface BindingItem<T, P extends AnyPath<T>> {
    path: P;
    target: ViewTarget<any>;
    options?: BindingOptions<PathValue<T, P>, any>;
}

/**
 * 绑定构建器（方案 2.1 - 最终推荐版）
 */
export class BindingBuilder<T> {
    private viewModel: ViewModel<T>;
    private items: BindingItem<T, AnyPath<T>>[] = [];
    
    constructor(viewModel: ViewModel<T>) {
        this.viewModel = viewModel;
    }
    
    /**
     * 类型安全的数据绑定方法
     * 
     * @template P 路径类型（从 Path<T> 推断）
     * @template TV 视图值类型（从 ViewTarget 推断）
     * @param path 数据路径（类型安全）
     * @param target 视图目标适配器（ViewTarget）
     * @param options 绑定选项（可选，TViewValue 类型从 target 推断）
     * @returns this（支持链式调用）
     */
    bind<P extends AnyPath<T>, TV>(
        path: P,
        target: ViewTarget<TV>,
        options?: BindingOptions<PathValue<T, P>, TV>
    ): this {
        this.items.push({ path, target, options } as any);
        return this;
    }
    
    /**
     * 构建所有绑定
     * 
     * @returns { bindings: DataBinding 数组; view: TargetViewAdapter }
     * 
     * 注意：build() 只允许调用一次
     * 如果要重新 build：新建 builder 或 builder.clear() 重新配置
     * 
     * ⚠️ **重要变更**：
     * - ✅ 允许同 path 多个 target（不再检测重复 path）
     */
    build(): { bindings: DataBinding<T, any, any>[]; view: TargetViewAdapter } {
        // ✅ **规则变更**：不再禁止同 path 多个 target
        // 允许同 path 绑定多个 ViewTarget（display/input 都可）
        
        // 创建共享的 TargetViewAdapter
        const view = new TargetViewAdapter();
        
        // 先把所有 target 注册进 adapter
        for (const item of this.items) {
            view.addTarget(item.path, item.target);
        }
        
        // ⚠️ **风险控制**：如果 build 中途 throw，需要确保不会残留 UI 事件监听或 watcher
        // 策略：先创建所有 bindings，再标记 built，确保原子性
        let createdBindings: DataBinding<T, any, any>[] = [];
        
        try {
            // 逐个 bind
            for (const item of this.items) {
                const binding = this.viewModel.bind(
                    item.path,
                    view,
                    item.options
                );
                createdBindings.push(binding);
            }
            
            return { bindings: createdBindings, view };
        } catch (error) {
            // build 失败时的半成品清理策略
            // 1. 销毁已创建的 bindings（如果有）
            for (const binding of createdBindings) {
                binding.destroy();
            }
            
            // 2. 销毁已创建的 view（会解绑所有已注册的 onChange）
            view.destroy();
            
            // 4. 重新抛出错误
            throw error;
        }
    }
    
    /**
     * 批量绑定配置（类型安全，支持同 path 多个 target）
     * 
     * ⚠️ **类型推断关键**：使用泛型保持推断，让 path 的字面量类型（'level'）能传进 P
     * 
     * @param config 绑定配置数组（路径类型自动推断）
     * @returns this（支持链式调用）
     * 
     * @example
     * ```typescript
     * this.bindingBuilder.bindConfig([
     *     { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
     *     { 
     *         path: 'level', 
     *         target: this.levelLabel, 
     *         helper: 'toLabelText',
     *         converter: (v) => `Lv.${v}`  // ✅ v 自动推断为 number（不要手写类型）
     *     }
     * ] as const);  // 使用 as const 保持字面量类型
     * ```
     */
    bindConfig<const C extends readonly BindingConfigEntry<T, Path<T> & string>[]>(
        config: C
    ): this {
        for (const item of config) {
            const { path, ...rest } = item;
            
            // 判断是内置 helper 还是直接传递 ViewTarget
            if ('viewTarget' in rest) {
                // 直接传递 ViewTarget（自定义 helper）
                // ⚠️ **责任边界**：
                // 1. viewTarget 是已经构造完成的 ViewTarget，不做 null 校验（校验应在 helper 函数内完成）
                // 2. mode 的正确性由 ViewTarget 作者自行保证（框架不会检查 ViewTarget 是否支持 two-way）
                const viewTarget = rest.viewTarget;
                
                // 构建 BindingOptions
                const options: BindingOptions<PathValue<T, any>, any> = {
                    mode: rest.mode || 'one-way',
                    validator: 'validator' in rest ? rest.validator : undefined,
                    onError: 'onError' in rest ? ((error: Error, p: string, v: any) => {
                        const onErrorFn = rest.onError;
                        if (onErrorFn) {
                            onErrorFn(error, path as any, v);
                        }
                    }) : undefined
                };
                
                // 调用现有的 bind 方法（类型安全）
                this.bind(path as any, viewTarget, options);
            } else {
                // 内置 helper（现有逻辑，保持不变）
                const target = (rest as any).target;
                const helper = (rest as any).helper;
                
                // ⚠️ 工程约束：target === null 处理
                if (target === null) {
                    // 使用 Cocos Creator 的 DEBUG 标志（而不是 process.env.NODE_ENV）
                    if (typeof DEBUG !== 'undefined' && DEBUG) {
                        throw new Error(`[bindConfig] target is null for path "${path}", helper "${helper}". Please check @property binding.`);
                    } else {
                        console.warn(`[bindConfig] target is null for path "${path}", helper "${helper}". Skipping binding.`);
                        continue;
                    }
                }
                
                // ⚠️ 工程约束：mode 与 helper 的合法组合校验（仅用于运行时兜底，防 any/JS）
                this._validateModeHelper(helper, rest.mode);
                
                // 根据 helper 创建 ViewTarget（discriminated union 确保类型安全）
                // ⚠️ 注意：此时 target 已确保非 null，TypeScript 会根据 helper 分支自动收窄 target 类型
                const viewTarget = this._createViewTarget(item as BindingConfigEntry<T, Path<T> & string>);
                
                // 构建 BindingOptions
                // ⚠️ **重要**：
                // - toProgress 的 ViewTarget.set 只负责 clamp 到 0..1，不处理数据转换
                const options: BindingOptions<PathValue<T, any>, any> = {
                    mode: rest.mode || (this._isInputHelper(helper) ? 'two-way' : 'one-way'),
                    converter: 'converter' in rest ? (rest as any).converter : undefined,
                    reverseConverter: 'reverseConverter' in rest ? (rest as any).reverseConverter : undefined,
                    validator: 'validator' in rest ? (rest as any).validator : undefined,
                    onError: 'onError' in rest ? (rest as any).onError : undefined
                };
                
                // 调用现有的 bind 方法（类型安全）
                this.bind(path as any, viewTarget, options);
            }
        }
        return this;
    }

    /**
     * 根据 helper 创建 ViewTarget（discriminated union 确保类型安全）
     * 
     * @private
     * @param item 绑定配置项（target 已确保非 null）
     */
    private _createViewTarget<P extends Path<T> & string>(
        item: BindingConfigEntry<T, P>
    ): ViewTarget<any> {
        // ⚠️ 注意：item.target 在此方法被调用前已确保非 null
        // 使用类型断言，因为 discriminated union 的类型收窄在 switch 中不够完美
        const config = item as any;
        
        switch (config.helper) {
            case 'toLabelText':
                return toLabelText(config.target as Label);
            case 'toEditBox':
                return toEditBox(config.target as EditBox, config.event ? { event: config.event } : undefined);
            case 'toProgress':
                // item.target 自动收窄为 ProgressBar
                return toProgress(config.target as ProgressBar);
            case 'toActive':
                return toActive(config.target as Node);
            case 'toToggle':
                return toToggle(config.target as Toggle);
            case 'toSlider':
                return toSlider(config.target as Slider);
            default:
                // 理论上不会走到这里，因为 ViewTargetHelper 是字面量联合类型
                throw new Error(`[BindingBuilder] Unknown helper: ${config.helper}`);
        }
    }

    /**
     * 校验 mode 与 helper 的合法组合
     * 
     * @private
     * @param helper ViewTarget 辅助函数名称
     * @param mode 绑定模式
     * 
     * **定位**：仅用于运行时兜底（防 any/JS），主要防线是 discriminated union
     */
    private _validateModeHelper(helper: string, mode?: BindingOptions['mode']): void {
        if (typeof DEBUG !== 'undefined' && DEBUG) {
            const displayHelpers = ['toLabelText', 'toProgress', 'toActive'];
            const isDisplayHelper = displayHelpers.indexOf(helper) !== -1;
            const isInputHelper = this._isInputHelper(helper);

            if (isDisplayHelper && (mode === 'two-way' || mode === 'one-way-to-source')) {
                throw new Error(`[BindingBuilder] Display helper "${helper}" does not support "${mode}" mode. Only "one-way" is allowed.`);
            }
            if (isInputHelper && mode === 'one-way') {
                // Input helpers can be one-way if explicitly set, but default is two-way
                // This check is more about preventing illogical combinations
            }
        }
    }

    /**
     * 判断是否为 Input Helper
     * @private
     */
    private _isInputHelper(helper: string): boolean {
        const inputHelpers = ['toEditBox', 'toToggle', 'toSlider'];
        return inputHelpers.indexOf(helper) !== -1;
    }

    /**
     * 清空配置（不自动 destroy 外部资源）
     * 
     * ⚠️ **重要**：clear() 只清空配置，不负责销毁外部资源（bindings/view 的销毁交给 MVVMComponent）
     * 
     * **使用场景**：
     * - 推荐：builder 只用于 MVVMComponent 管理场景
     * - 独立使用：如需独立使用 builder，必须在 clear() 前手动销毁当前 bindings 和 view
     * 
     * 重新 enable：builder.clear(); 重新 bind...; build()
     */
    clear(): void {
        this.items.length = 0;
    }
}

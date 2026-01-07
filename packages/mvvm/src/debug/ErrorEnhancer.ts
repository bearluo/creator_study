import type { ReactiveState, ViewModelState, BindingState } from './types';
import { Debugger } from './Debugger';
import type { Reactive } from '../reactive/Reactive';
import type { ViewModel } from '../core/ViewModel';
import type { DataBinding } from '../binding/DataBinding';

/**
 * 增强的错误信息
 */
export interface EnhancedError {
    /** 原始错误 */
    originalError: Error;
    
    /** 错误上下文 */
    context: {
        /** Reactive 状态（如果相关） */
        reactive?: ReactiveState<any>;
        
        /** ViewModel 状态（如果相关） */
        viewModel?: ViewModelState<any>;
        
        /** Binding 状态（如果相关） */
        binding?: BindingState;
        
        /** 调用栈 */
        stack: string[];
        
        /** 额外上下文信息 */
        extra?: Record<string, any>;
    };
    
    /** 错误恢复建议 */
    suggestions: string[];
    
    /** 错误时间戳 */
    timestamp: number;
}

/**
 * 错误增强器
 * 
 * 用于增强错误信息，提供上下文和恢复建议
 * 
 * @example
 * ```typescript
 * try {
 *     // 某些 MVVM 操作
 * } catch (error) {
 *     const enhanced = ErrorEnhancer.enhance(error, { reactive, viewModel });
 *     console.error(ErrorEnhancer.format(enhanced));
 * }
 * ```
 */
export class ErrorEnhancer {
    /**
     * 增强错误信息
     * 
     * @param error 原始错误
     * @param context 上下文对象（可包含 reactive, viewModel, binding 等）
     * @returns 增强的错误信息
     */
    static enhance(error: Error, context?: {
        reactive?: Reactive<any>;
        viewModel?: ViewModel<any>;
        binding?: DataBinding<any, any, any>;
        [key: string]: any;
    }): EnhancedError {
        const enhanced: EnhancedError = {
            originalError: error,
            context: {
                stack: this._extractStack(error),
                extra: {}
            },
            suggestions: [],
            timestamp: Date.now()
        };
        
        // 收集上下文信息
        if (context) {
            if (context.reactive && Debugger.isEnabled()) {
                try {
                    enhanced.context.reactive = Debugger.getReactiveState(context.reactive);
                } catch (e) {
                    // 忽略获取状态时的错误
                }
            }
            
            if (context.viewModel && Debugger.isEnabled()) {
                try {
                    enhanced.context.viewModel = Debugger.getViewModelState(context.viewModel);
                } catch (e) {
                    // 忽略获取状态时的错误
                }
            }
            
            if (context.binding && Debugger.isEnabled()) {
                try {
                    enhanced.context.binding = Debugger.getBindingState(context.binding);
                } catch (e) {
                    // 忽略获取状态时的错误
                }
            }
            
            // 收集其他上下文信息
            for (const key in context) {
                if (key !== 'reactive' && key !== 'viewModel' && key !== 'binding') {
                    enhanced.context.extra![key] = context[key];
                }
            }
        }
        
        // 生成错误恢复建议
        enhanced.suggestions = this._generateSuggestions(error, enhanced.context);
        
        return enhanced;
    }
    
    /**
     * 格式化错误信息
     * 
     * @param enhanced 增强的错误信息
     * @returns 格式化后的错误字符串
     */
    static format(enhanced: EnhancedError): string {
        const lines: string[] = [];
        
        // 错误标题
        lines.push('═══════════════════════════════════════════════════════════');
        lines.push(`MVVM Error: ${enhanced.originalError.name}`);
        lines.push('═══════════════════════════════════════════════════════════');
        lines.push('');
        
        // 错误消息
        lines.push(`Message: ${enhanced.originalError.message}`);
        lines.push('');
        
        // 调用栈
        if (enhanced.context.stack.length > 0) {
            lines.push('Stack Trace:');
            enhanced.context.stack.forEach((frame, index) => {
                lines.push(`  ${index + 1}. ${frame}`);
            });
            lines.push('');
        }
        
        // 上下文信息
        if (enhanced.context.reactive) {
            lines.push('Reactive Context:');
            lines.push(`  Value: ${JSON.stringify(enhanced.context.reactive.value, null, 2)}`);
            lines.push(`  Watchers: ${enhanced.context.reactive.watchers.length}`);
            lines.push(`  Update Count: ${enhanced.context.reactive.stats.updateCount}`);
            lines.push('');
        }
        
        if (enhanced.context.viewModel) {
            lines.push('ViewModel Context:');
            lines.push(`  Bindings: ${enhanced.context.viewModel.bindings.length}`);
            lines.push(`  Binding Count: ${enhanced.context.viewModel.stats.bindingCount}`);
            lines.push('');
        }
        
        if (enhanced.context.binding) {
            lines.push('Binding Context:');
            lines.push(`  Path: ${enhanced.context.binding.path}`);
            lines.push(`  Mode: ${enhanced.context.binding.mode}`);
            lines.push(`  Active: ${enhanced.context.binding.isActive}`);
            lines.push('');
        }
        
        // 额外上下文
        if (enhanced.context.extra && Object.keys(enhanced.context.extra).length > 0) {
            lines.push('Additional Context:');
            for (const key in enhanced.context.extra) {
                lines.push(`  ${key}: ${JSON.stringify(enhanced.context.extra[key])}`);
            }
            lines.push('');
        }
        
        // 错误恢复建议
        if (enhanced.suggestions.length > 0) {
            lines.push('Suggestions:');
            enhanced.suggestions.forEach((suggestion, index) => {
                lines.push(`  ${index + 1}. ${suggestion}`);
            });
            lines.push('');
        }
        
        // 时间戳
        lines.push(`Timestamp: ${new Date(enhanced.timestamp).toISOString()}`);
        lines.push('═══════════════════════════════════════════════════════════');
        
        return lines.join('\n');
    }
    
    /**
     * 提取调用栈
     */
    private static _extractStack(error: Error): string[] {
        if (!error.stack) {
            return [];
        }
        
        return error.stack
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('Error:'))
            .slice(0, 10); // 限制栈深度
    }
    
    /**
     * 生成错误恢复建议
     */
    private static _generateSuggestions(error: Error, context: EnhancedError['context']): string[] {
        const suggestions: string[] = [];
        const errorMessage = error.message.toLowerCase();
        const errorName = error.name.toLowerCase();
        
        // 根据错误类型生成建议
        if (errorName.includes('type') || errorMessage.includes('type')) {
            suggestions.push('检查数据类型是否匹配');
            suggestions.push('确认转换器（converter）返回正确的类型');
        }
        
        if (errorName.includes('undefined') || errorMessage.includes('undefined')) {
            suggestions.push('检查路径是否正确，确保数据已初始化（避免访问 undefined 属性）');
            suggestions.push('使用可选链操作符（?.）访问嵌套属性，防止 undefined 错误');
            suggestions.push('在访问属性前检查值是否为 undefined');
        }
        
        if (errorName.includes('null') || errorMessage.includes('null')) {
            suggestions.push('检查数据是否为 null，添加空值检查');
        }
        
        if (errorMessage.includes('path') || errorMessage.includes('binding')) {
            suggestions.push('检查绑定路径是否正确');
            suggestions.push('确认 ViewModel 中的数据路径存在');
        }
        
        if (errorMessage.includes('watcher') || errorMessage.includes('dependency')) {
            suggestions.push('检查依赖关系是否正确');
            suggestions.push('确认 Watcher 已正确注册和清理');
        }
        
        // 根据上下文生成建议
        if (context.binding && !context.binding.isActive) {
            suggestions.push('绑定可能已被销毁，检查绑定生命周期');
        }
        
        if (context.reactive && context.reactive.watchers.length === 0) {
            suggestions.push('没有活跃的 Watcher，检查是否正确注册了观察者');
        }
        
        if (context.viewModel && context.viewModel.bindings.length === 0) {
            suggestions.push('没有活跃的绑定，检查是否正确创建了数据绑定');
        }
        
        // 通用建议
        if (suggestions.length === 0) {
            suggestions.push('启用调试模式以获取更多信息：Debugger.enable()');
            suggestions.push('检查控制台日志以获取详细错误信息');
        }
        
        return suggestions;
    }
}


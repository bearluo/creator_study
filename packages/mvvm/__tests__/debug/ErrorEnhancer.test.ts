import { ErrorEnhancer, type EnhancedError } from '../../src/debug/ErrorEnhancer';
import { Debugger } from '../../src/debug/Debugger';
import { Reactive } from '../../src/reactive/Reactive';
import { Model } from '../../src/core/Model';
import { ViewModel } from '../../src/core/ViewModel';
import { DataBinding } from '../../src/binding/DataBinding';
import { View } from '../../src/core/View';

// 创建测试用的 View 实现
class TestView extends View {
    private data: any = {};
    private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
    
    update(path: string, value: any): void {
        this.data[path] = value;
    }
    
    get(path: string): any {
        return this.data[path];
    }
    
    set(path: string, value: any): void {
        this.data[path] = value;
        const changeListeners = this.listeners.get('change');
        if (changeListeners) {
            changeListeners.forEach(listener => listener(path, value));
        }
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
        
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }
    
    destroy(): void {
        this.listeners.clear();
        this.data = {};
    }
}

describe('ErrorEnhancer', () => {
    beforeEach(() => {
        Debugger.disable();
    });

    afterEach(() => {
        Debugger.disable();
    });

    describe('enhance', () => {
        it('should enhance error with basic information', () => {
            const error = new Error('Test error');
            const enhanced = ErrorEnhancer.enhance(error);
            
            expect(enhanced).toBeDefined();
            expect(enhanced.originalError).toBe(error);
            expect(enhanced.context.stack).toBeInstanceOf(Array);
            expect(enhanced.suggestions).toBeInstanceOf(Array);
            expect(enhanced.timestamp).toBeGreaterThan(0);
        });

        it('should collect reactive context when debugger is enabled', () => {
            Debugger.enable();
            const reactive = new Reactive({ name: 'John' });
            const error = new Error('Test error');
            
            const enhanced = ErrorEnhancer.enhance(error, { reactive });
            
            expect(enhanced.context.reactive).toBeDefined();
            expect(enhanced.context.reactive!.value).toEqual({ name: 'John' });
        });

        it('should collect viewmodel context when debugger is enabled', () => {
            Debugger.enable();
            const model = new Model({ name: 'John' });
            const viewModel = new ViewModel(model);
            const error = new Error('Test error');
            
            const enhanced = ErrorEnhancer.enhance(error, { viewModel });
            
            expect(enhanced.context.viewModel).toBeDefined();
            expect(enhanced.context.viewModel!.model.data).toEqual({ name: 'John' });
        });

        it('should collect binding context when debugger is enabled', () => {
            Debugger.enable();
            const reactive = new Reactive({ name: 'John' });
            const view = new TestView();
            const binding = new DataBinding(reactive, view, 'name');
            const error = new Error('Test error');
            
            const enhanced = ErrorEnhancer.enhance(error, { binding });
            
            expect(enhanced.context.binding).toBeDefined();
            expect(enhanced.context.binding!.path).toBe('name');
        });

        it('should collect extra context', () => {
            const error = new Error('Test error');
            const enhanced = ErrorEnhancer.enhance(error, {
                customField: 'customValue',
                number: 123
            });
            
            expect(enhanced.context.extra).toBeDefined();
            expect(enhanced.context.extra!.customField).toBe('customValue');
            expect(enhanced.context.extra!.number).toBe(123);
        });

        it('should not collect context when debugger is disabled', () => {
            Debugger.disable();
            const reactive = new Reactive({ name: 'John' });
            const error = new Error('Test error');
            
            const enhanced = ErrorEnhancer.enhance(error, { reactive });
            
            expect(enhanced.context.reactive).toBeUndefined();
        });

        it('should generate suggestions based on error type', () => {
            const typeError = new TypeError('Type mismatch');
            const enhanced = ErrorEnhancer.enhance(typeError);
            
            expect(enhanced.suggestions.length).toBeGreaterThan(0);
            expect(enhanced.suggestions.some(s => s.includes('类型'))).toBe(true);
        });

        it('should generate suggestions for undefined errors', () => {
            const error = new Error('Cannot read property of undefined');
            const enhanced = ErrorEnhancer.enhance(error);
            
            expect(enhanced.suggestions.length).toBeGreaterThan(0);
            expect(enhanced.suggestions.some(s => s.includes('undefined'))).toBe(true);
        });
    });

    describe('format', () => {
        it('should format error with all information', () => {
            Debugger.enable();
            const reactive = new Reactive({ name: 'John' });
            const error = new Error('Test error message');
            const enhanced = ErrorEnhancer.enhance(error, { reactive });
            
            const formatted = ErrorEnhancer.format(enhanced);
            
            expect(formatted).toContain('MVVM Error');
            expect(formatted).toContain('Test error message');
            expect(formatted).toContain('Stack Trace');
            expect(formatted).toContain('Reactive Context');
            expect(formatted).toContain('Suggestions');
            expect(formatted).toContain('Timestamp');
        });

        it('should format error without context when not available', () => {
            const error = new Error('Test error');
            const enhanced = ErrorEnhancer.enhance(error);
            
            const formatted = ErrorEnhancer.format(enhanced);
            
            expect(formatted).toContain('MVVM Error');
            expect(formatted).toContain('Test error');
            expect(formatted).not.toContain('Reactive Context');
            expect(formatted).not.toContain('ViewModel Context');
            expect(formatted).not.toContain('Binding Context');
        });

        it('should include suggestions in formatted output', () => {
            const error = new TypeError('Type error');
            const enhanced = ErrorEnhancer.enhance(error);
            
            const formatted = ErrorEnhancer.format(enhanced);
            
            expect(formatted).toContain('Suggestions:');
            expect(enhanced.suggestions.length).toBeGreaterThan(0);
        });
    });
});


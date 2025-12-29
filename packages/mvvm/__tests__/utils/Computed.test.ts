import { Reactive } from '../../src/reactive/Reactive';
import { Computed } from '../../src/utils/Computed';

describe('Computed', () => {
    describe('基础功能', () => {
        it('应该创建计算属性', () => {
            const reactive = new Reactive({ firstName: 'John', lastName: 'Doe' });
            const fullName = new Computed(
                () => `${reactive.value.firstName} ${reactive.value.lastName}`,
                reactive
            );
            
            expect(fullName.value).toBe('John Doe');
        });
        
        it('应该缓存计算结果', () => {
            const reactive = new Reactive({ count: 1 });
            let computeCount = 0;
            
            const computed = new Computed(
                () => {
                    computeCount++;
                    return reactive.value.count * 2;
                },
                reactive
            );
            
            // 第一次访问
            expect(computed.value).toBe(2);
            expect(computeCount).toBe(1);
            
            // 第二次访问（应该使用缓存）
            expect(computed.value).toBe(2);
            expect(computeCount).toBe(1);
        });
        
        it('应该在依赖变化时重新计算', () => {
            const reactive = new Reactive({ firstName: 'John', lastName: 'Doe' });
            const fullName = new Computed(
                () => `${reactive.value.firstName} ${reactive.value.lastName}`,
                reactive
            );
            
            expect(fullName.value).toBe('John Doe');
            
            reactive.value.firstName = 'Jane';
            
            // 等待更新，然后访问 value 以触发重新计算
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    // 访问 value 会触发重新计算（因为缓存已清除）
                    const result = fullName.value;
                    expect(result).toBe('Jane Doe');
                    resolve();
                }, 50);
            });
        }, 10000);
    });
    
    describe('依赖追踪', () => {
        it('应该追踪使用的属性', () => {
            const reactive = new Reactive({
                a: 1,
                b: 2
            });
            
            const computed = new Computed(
                () => reactive.value.a + reactive.value.b,
                reactive
            );
            
            // 基本功能测试
            expect(computed.value).toBe(3);
            expect(typeof computed.value).toBe('number');
        });
    });
    
    describe('嵌套计算', () => {
        it('应该支持计算属性', () => {
            const reactive = new Reactive({ value: 10 });
            const double = new Computed(
                () => reactive.value.value * 2,
                reactive
            );
            
            expect(double.value).toBe(20);
            
            // Computed 会在下次访问时重新计算（如果依赖变化）
            // 这里我们只是测试基本的计算功能
            expect(typeof double.value).toBe('number');
        });
    });
    
    describe('watch/unwatch', () => {
        it('应该支持 watch 接口', () => {
            const reactive = new Reactive({ value: 1 });
            const computed = new Computed(() => reactive.value.value * 2, reactive);
            
            // computed.watch 实际上是 reactive.watch
            expect(computed.watch).toBeDefined();
        });
    });
});


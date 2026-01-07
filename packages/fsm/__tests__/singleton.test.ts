/**
 * FSM 单例模式单元测试
 */
import { StateMachine } from '../src/core/StateMachine';

// 测试用的状态枚举
enum TestState {
    StateA = 'stateA',
    StateB = 'stateB',
    StateC = 'stateC'
}

/**
 * FSM 单例管理器（用于测试）
 */
class TestStateManager {
    private static instance: StateMachine<TestState> | null = null;
    
    static getInstance(): StateMachine<TestState> {
        if (!TestStateManager.instance) {
            TestStateManager.instance = new StateMachine<TestState>({
                initialState: TestState.StateA,
                states: [
                    { state: TestState.StateA, name: '状态A' },
                    { state: TestState.StateB, name: '状态B' },
                    { state: TestState.StateC, name: '状态C' }
                ],
                transitions: [
                    { from: TestState.StateA, to: TestState.StateB, event: 'toB' },
                    { from: TestState.StateB, to: TestState.StateC, event: 'toC' },
                    { from: TestState.StateC, to: TestState.StateA, event: 'toA' }
                ],
                debug: false
            });
        }
        return TestStateManager.instance;
    }
    
    static resetInstance(): void {
        TestStateManager.instance = null;
    }
}

describe('FSM Singleton Pattern', () => {
    beforeEach(() => {
        // 每个测试前重置单例
        TestStateManager.resetInstance();
    });

    describe('单例基本功能', () => {
        test('应该返回同一个实例', () => {
            const instance1 = TestStateManager.getInstance();
            const instance2 = TestStateManager.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance1 === instance2).toBe(true);
        });

        test('应该共享相同的状态', () => {
            const instance1 = TestStateManager.getInstance();
            const instance2 = TestStateManager.getInstance();

            expect(instance1.currentState).toBe(TestState.StateA);
            expect(instance2.currentState).toBe(TestState.StateA);

            // 通过 instance1 改变状态
            instance1.transition('toB');
            
            // instance2 的状态也应该改变
            expect(instance1.currentState).toBe(TestState.StateB);
            expect(instance2.currentState).toBe(TestState.StateB);
        });
    });

    describe('多模块共享', () => {
        test('不同模块应该共享同一个实例', () => {
            // 模拟模块 A
            const moduleA = {
                getState: () => TestStateManager.getInstance().currentState,
                transition: (event: string) => TestStateManager.getInstance().transition(event)
            };

            // 模拟模块 B
            const moduleB = {
                getState: () => TestStateManager.getInstance().currentState,
                transition: (event: string) => TestStateManager.getInstance().transition(event)
            };

            // 初始状态应该相同
            expect(moduleA.getState()).toBe(TestState.StateA);
            expect(moduleB.getState()).toBe(TestState.StateA);

            // 模块 A 触发转换
            moduleA.transition('toB');
            
            // 两个模块应该看到相同的状态
            expect(moduleA.getState()).toBe(TestState.StateB);
            expect(moduleB.getState()).toBe(TestState.StateB);

            // 模块 B 触发转换
            moduleB.transition('toC');
            
            // 两个模块应该看到相同的状态
            expect(moduleA.getState()).toBe(TestState.StateC);
            expect(moduleB.getState()).toBe(TestState.StateC);
        });

        test('状态转换应该在所有引用间同步', () => {
            const instance1 = TestStateManager.getInstance();
            const instance2 = TestStateManager.getInstance();
            const instance3 = TestStateManager.getInstance();

            // 执行一系列转换
            instance1.transition('toB');
            expect(instance2.currentState).toBe(TestState.StateB);
            expect(instance3.currentState).toBe(TestState.StateB);

            instance2.transition('toC');
            expect(instance1.currentState).toBe(TestState.StateC);
            expect(instance3.currentState).toBe(TestState.StateC);

            instance3.transition('toA');
            expect(instance1.currentState).toBe(TestState.StateA);
            expect(instance2.currentState).toBe(TestState.StateA);
        });
    });

    describe('回调函数共享', () => {
        test('在一个实例上注册的回调应该在所有引用上生效', () => {
            const instance1 = TestStateManager.getInstance();
            const instance2 = TestStateManager.getInstance();

            const callbacks: string[] = [];

            // 在 instance1 上注册回调
            instance1.onEnter(TestState.StateB, () => {
                callbacks.push('onEnter-StateB');
            });

            instance1.onExit(TestState.StateA, () => {
                callbacks.push('onExit-StateA');
            });

            // 通过 instance2 触发转换
            instance2.transition('toB');

            // 回调应该被触发
            expect(callbacks).toContain('onExit-StateA');
            expect(callbacks).toContain('onEnter-StateB');
        });

        test('动态注册的回调应该在所有引用上共享', () => {
            const instance1 = TestStateManager.getInstance();
            const instance2 = TestStateManager.getInstance();

            const enterCallbacks: string[] = [];

            // 在 instance1 上注册回调
            instance1.onEnter(TestState.StateC, () => {
                enterCallbacks.push('callback-1');
            });

            // 在 instance2 上注册另一个回调
            instance2.onEnter(TestState.StateC, () => {
                enterCallbacks.push('callback-2');
            });

            // 通过 instance1 触发转换
            instance1.transition('toB');
            instance1.transition('toC');

            // 两个回调都应该被触发
            expect(enterCallbacks).toContain('callback-1');
            expect(enterCallbacks).toContain('callback-2');
        });
    });

    describe('单例重置', () => {
        test('重置后应该创建新的实例', () => {
            const instance1 = TestStateManager.getInstance();
            instance1.transition('toB');

            expect(instance1.currentState).toBe(TestState.StateB);

            // 重置单例
            TestStateManager.resetInstance();

            // 获取新实例
            const instance2 = TestStateManager.getInstance();

            // 应该是不同的实例
            expect(instance1).not.toBe(instance2);
            
            // 新实例应该回到初始状态
            expect(instance2.currentState).toBe(TestState.StateA);
        });

        test('重置后旧实例的状态不会改变', () => {
            const instance1 = TestStateManager.getInstance();
            instance1.transition('toB');

            // 重置单例
            TestStateManager.resetInstance();

            // 旧实例的状态应该保持不变
            expect(instance1.currentState).toBe(TestState.StateB);

            // 但新实例应该是初始状态
            const instance2 = TestStateManager.getInstance();
            expect(instance2.currentState).toBe(TestState.StateA);
        });
    });

    describe('并发获取实例', () => {
        test('多次获取应该返回同一个实例', () => {
            const instances: StateMachine<TestState>[] = [];

            // 模拟多次获取实例
            for (let i = 0; i < 10; i++) {
                instances.push(TestStateManager.getInstance());
            }

            // 验证所有实例都是同一个对象
            const firstInstance = instances[0];
            instances.forEach(instance => {
                expect(instance).toBe(firstInstance);
            });
        });

        test('并发转换应该正确处理', () => {
            const instances = Array.from({ length: 5 }, () => TestStateManager.getInstance());

            // 所有实例同时执行转换（虽然是同一个实例的多个引用）
            instances[0].transition('toB');
            instances[1].transition('toC');

            // 所有引用应该看到最终状态
            instances.forEach(instance => {
                expect(instance.currentState).toBe(TestState.StateC);
            });
        });
    });

    describe('状态历史共享', () => {
        test('状态历史应该在所有引用间共享', () => {
            const instance1 = TestStateManager.getInstance();
            const instance2 = TestStateManager.getInstance();

            // 启用历史记录（需要通过类型断言访问私有属性）
            (instance1 as any).enableHistory = true;
            (instance1 as any)._history = [TestState.StateA];

            // 执行转换
            instance1.transition('toB');
            instance1.transition('toC');

            // 两个实例应该共享同一个历史数组
            const history1 = (instance1 as any)._history;
            const history2 = (instance2 as any)._history;

            expect(history1).toBe(history2);
            expect(history1).toEqual([TestState.StateA, TestState.StateB, TestState.StateC]);
        });
    });

    describe('单例与状态持久化', () => {
        test('应该能够在状态变化时保存状态', () => {
            const instance = TestStateManager.getInstance();
            const savedStates: TestState[] = [];

            // 注册状态变化监听
            instance.onEnter(TestState.StateB, () => {
                savedStates.push(TestState.StateB);
            });

            instance.onEnter(TestState.StateC, () => {
                savedStates.push(TestState.StateC);
            });

            // 执行转换
            instance.transition('toB');
            instance.transition('toC');

            // 验证状态被保存
            expect(savedStates).toContain(TestState.StateB);
            expect(savedStates).toContain(TestState.StateC);
        });
    });

    describe('边界情况', () => {
        test('重置后立即获取实例应该正常工作', () => {
            const instance1 = TestStateManager.getInstance();
            instance1.transition('toB');

            TestStateManager.resetInstance();

            // 立即获取新实例
            const instance2 = TestStateManager.getInstance();
            expect(instance2.currentState).toBe(TestState.StateA);

            // 新实例应该能正常转换
            const result = instance2.transition('toB');
            expect(result).toBe(true);
            expect(instance2.currentState).toBe(TestState.StateB);
        });

        test('在单例上注册的回调应该在重置后失效', () => {
            const instance1 = TestStateManager.getInstance();
            const callbacks: string[] = [];

            instance1.onEnter(TestState.StateB, () => {
                callbacks.push('callback');
            });

            // 重置单例
            TestStateManager.resetInstance();

            // 获取新实例并触发转换
            const instance2 = TestStateManager.getInstance();
            instance2.transition('toB');

            // 旧回调不应该被触发（因为实例不同）
            // 注意：这里测试的是实例隔离，而不是回调共享
            // 在实际场景中，如果需要在重置后保留回调，需要额外的机制
            expect(callbacks.length).toBe(0);
        });
    });
});


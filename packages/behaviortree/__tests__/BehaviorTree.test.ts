/**
 * BehaviorTree 单元测试
 */
import {
    BehaviorTree,
    BehaviorTreeBuilder,
    NodeStatus,
    Selector,
    Sequence,
    Condition,
    Action,
    Inverter,
    Repeater,
    UntilSuccess,
    UntilFailure,
    Blackboard
} from '../src/index';

describe('BehaviorTree', () => {
    describe('BehaviorTree 创建', () => {
        test('应该能够创建 BehaviorTree 实例', () => {
            const root = new Action('test', () => NodeStatus.SUCCESS);
            const tree = new BehaviorTree(root);

            expect(tree).toBeDefined();
            expect(tree.root).toBe(root);
            expect(tree.blackboard).toBeInstanceOf(Blackboard);
        });

        test('应该能够使用自定义 Blackboard', () => {
            const root = new Action('test', () => NodeStatus.SUCCESS);
            const blackboard = new Blackboard();
            const tree = new BehaviorTree(root, blackboard);

            expect(tree.blackboard).toBe(blackboard);
        });

        test('如果没有提供 root，应该抛出错误', () => {
            expect(() => {
                new BehaviorTree(null as any);
            }).toThrow('BehaviorTree: root node is required');
        });
    });

    describe('BehaviorTree 执行', () => {
        test('应该能够执行简单的 Action 节点', () => {
            let executed = false;

            const action = new Action('test', () => {
                executed = true;
                return NodeStatus.SUCCESS;
            });

            const tree = new BehaviorTree(action);
            const status = tree.execute();

            expect(executed).toBe(true);
            expect(status).toBe(NodeStatus.SUCCESS);
        });

        test('应该能够执行 Sequence 节点', () => {
            const sequence = new Sequence('sequence');
            
            let action1Executed = false;
            let action2Executed = false;

            const action1 = new Action('action1', () => {
                action1Executed = true;
                return NodeStatus.SUCCESS;
            });

            const action2 = new Action('action2', () => {
                action2Executed = true;
                return NodeStatus.SUCCESS;
            });

            sequence.addChild(action1);
            sequence.addChild(action2);

            const tree = new BehaviorTree(sequence);
            const status = tree.execute();

            expect(action1Executed).toBe(true);
            expect(action2Executed).toBe(true);
            expect(status).toBe(NodeStatus.SUCCESS);
        });

        test('Sequence 应该在任何子节点失败时返回 FAILURE', () => {
            const sequence = new Sequence('sequence');
            
            const action1 = new Action('action1', () => NodeStatus.SUCCESS);
            const action2 = new Action('action2', () => NodeStatus.FAILURE);
            const action3 = new Action('action3', () => NodeStatus.SUCCESS);

            sequence.addChild(action1);
            sequence.addChild(action2);
            sequence.addChild(action3);

            const tree = new BehaviorTree(sequence);
            const status = tree.execute();

            expect(status).toBe(NodeStatus.FAILURE);
        });

        test('应该能够执行 Selector 节点', () => {
            const selector = new Selector('selector');
            
            const action1 = new Action('action1', () => NodeStatus.FAILURE);
            const action2 = new Action('action2', () => NodeStatus.SUCCESS);
            const action3 = new Action('action3', () => NodeStatus.SUCCESS);

            selector.addChild(action1);
            selector.addChild(action2);
            selector.addChild(action3);

            const tree = new BehaviorTree(selector);
            const status = tree.execute();

            expect(status).toBe(NodeStatus.SUCCESS);
        });

        test('Selector 应该在所有子节点失败时返回 FAILURE', () => {
            const selector = new Selector('selector');
            
            const action1 = new Action('action1', () => NodeStatus.FAILURE);
            const action2 = new Action('action2', () => NodeStatus.FAILURE);

            selector.addChild(action1);
            selector.addChild(action2);

            const tree = new BehaviorTree(selector);
            const status = tree.execute();

            expect(status).toBe(NodeStatus.FAILURE);
        });
    });

    describe('Condition 节点', () => {
        test('应该能够执行 Condition 节点', () => {
            const blackboard = new Blackboard();
            blackboard.set('health', 100);

            const condition = new Condition('checkHealth', (bb) => {
                return bb.get('health', 0) > 50;
            });

            const tree = new BehaviorTree(condition, blackboard);
            const status = tree.execute();

            expect(status).toBe(NodeStatus.SUCCESS);
        });

        test('Condition 在条件为假时应该返回 FAILURE', () => {
            const blackboard = new Blackboard();
            blackboard.set('health', 30);

            const condition = new Condition('checkHealth', (bb) => {
                return bb.get('health', 0) > 50;
            });

            const tree = new BehaviorTree(condition, blackboard);
            const status = tree.execute();

            expect(status).toBe(NodeStatus.FAILURE);
        });
    });

    describe('装饰器节点', () => {
        test('Inverter 应该反转结果', () => {
            const action = new Action('action', () => NodeStatus.SUCCESS);
            const inverter = new Inverter('inverter');
            inverter.addChild(action);

            const tree = new BehaviorTree(inverter);
            const status = tree.execute();

            expect(status).toBe(NodeStatus.FAILURE);
        });

        test('Repeater 应该重复执行子节点', () => {
            let executionCount = 0;

            const action = new Action('action', () => {
                executionCount++;
                return NodeStatus.SUCCESS;
            });

            const repeater = new Repeater('repeater', 3);
            repeater.addChild(action);

            const tree = new BehaviorTree(repeater);
            tree.execute();

            expect(executionCount).toBe(3);
        });

        test('UntilSuccess 应该重复执行直到成功', () => {
            let executionCount = 0;

            const action = new Action('action', () => {
                executionCount++;
                return executionCount >= 3 ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
            });

            const untilSuccess = new UntilSuccess('untilSuccess');
            untilSuccess.addChild(action);

            const tree = new BehaviorTree(untilSuccess);
            const status = tree.execute();

            expect(executionCount).toBe(3);
            expect(status).toBe(NodeStatus.SUCCESS);
        });

        test('UntilFailure 应该重复执行直到失败', () => {
            let executionCount = 0;

            const action = new Action('action', () => {
                executionCount++;
                return executionCount < 3 ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
            });

            const untilFailure = new UntilFailure('untilFailure');
            untilFailure.addChild(action);

            const tree = new BehaviorTree(untilFailure);
            const status = tree.execute();

            expect(executionCount).toBe(3);
            expect(status).toBe(NodeStatus.FAILURE);
        });
    });

    describe('BehaviorTreeBuilder', () => {
        test('应该能够使用 Builder 创建简单行为树', () => {
            const builder = new BehaviorTreeBuilder();

            const tree = builder
                .sequence('root')
                    .action('action1', () => NodeStatus.SUCCESS)
                    .action('action2', () => NodeStatus.SUCCESS)
                .end()
                .build();

            expect(tree).toBeInstanceOf(BehaviorTree);
            expect(tree.root).toBeInstanceOf(Sequence);

            const status = tree.execute();
            expect(status).toBe(NodeStatus.SUCCESS);
        });

        test('应该能够使用 Builder 创建复杂行为树', () => {
            const blackboard = new Blackboard();
            blackboard.set('hasTarget', true);
            blackboard.set('health', 80);

            const builder = new BehaviorTreeBuilder();

            const tree = builder
                .selector('root')
                    .sequence('combat')
                        .condition('hasTarget', (bb) => bb.get('hasTarget', false))
                        .condition('healthy', (bb) => bb.get('health', 0) > 50)
                        .action('attack', () => NodeStatus.SUCCESS)
                    .end()
                    .action('flee', () => NodeStatus.SUCCESS)
                .end()
                .build(blackboard);

            const status = tree.execute();
            expect(status).toBe(NodeStatus.SUCCESS);
        });
    });

    describe('Blackboard 集成', () => {
        test('节点应该能够访问 Blackboard', () => {
            const blackboard = new Blackboard();
            blackboard.set('value', 42);

            let retrievedValue = 0;

            const action = new Action('action', (bb) => {
                retrievedValue = bb.get('value', 0);
                return NodeStatus.SUCCESS;
            });

            const tree = new BehaviorTree(action, blackboard);
            tree.execute();

            expect(retrievedValue).toBe(42);
        });

        test('节点应该能够修改 Blackboard', () => {
            const blackboard = new Blackboard();
            blackboard.set('counter', 0);

            const action = new Action('action', (bb) => {
                const current = bb.get('counter', 0);
                bb.set('counter', current + 1);
                return NodeStatus.SUCCESS;
            });

            const tree = new BehaviorTree(action, blackboard);

            tree.execute();
            expect(blackboard.get('counter', 0)).toBe(1);

            tree.execute();
            expect(blackboard.get('counter', 0)).toBe(2);
        });
    });

    describe('重置功能', () => {
        test('应该能够重置行为树', () => {
            let executionCount = 0;

            const action = new Action('action', () => {
                executionCount++;
                return NodeStatus.SUCCESS;
            });

            const tree = new BehaviorTree(action);

            tree.execute();
            expect(executionCount).toBe(1);

            tree.reset();
            tree.execute();
            expect(executionCount).toBe(2);
        });
    });
});


/**
 * 行为树基础测试
 * 测试行为树的核心功能
 */

import { BehaviorTree } from '@bl-framework/behaviortree';
import { BehaviorTreeBuilder } from '@bl-framework/behaviortree';
import { Blackboard } from '@bl-framework/behaviortree';
import { NodeStatus } from '@bl-framework/behaviortree';
import { DecoratorType, ParallelPolicy } from '@bl-framework/behaviortree';

/**
 * 基础测试示例
 */
export class BehaviorTreeBasicTest {
    /**
     * 测试简单条件节点
     */
    static testSimpleCondition(): void {
        console.log('=== 测试简单条件节点 ===');
        
        const blackboard = new Blackboard();
        blackboard.set('health', 100);
        blackboard.set('hasWeapon', true);

        const builder = new BehaviorTreeBuilder();
        const tree = builder
            .condition('checkHealth', (bb) => bb.get('health', 0) > 50)
            .build(blackboard);

        const status = tree.execute();
        console.log('执行结果:', status === NodeStatus.SUCCESS ? '成功' : '失败');
    }

    /**
     * 测试选择器节点
     */
    static testSelector(): void {
        console.log('=== 测试选择器节点 ===');
        
        const blackboard = new Blackboard();
        blackboard.set('canAttack', false);
        blackboard.set('canMove', true);

        const builder = new BehaviorTreeBuilder();
        const tree = builder
            .selector('root')
                .condition('canAttack', (bb) => bb.get('canAttack', false))
                .condition('canMove', (bb) => bb.get('canMove', false))
            .end()
            .build(blackboard);

        const status = tree.execute();
        console.log('执行结果:', status === NodeStatus.SUCCESS ? '成功' : '失败');
    }

    /**
     * 测试序列节点
     */
    static testSequence(): void {
        console.log('=== 测试序列节点 ===');
        
        const blackboard = new Blackboard();
        blackboard.set('hasTarget', true);
        blackboard.set('inRange', true);
        blackboard.set('hasAmmo', true);

        const builder = new BehaviorTreeBuilder();
        const tree = builder
            .sequence('attack')
                .condition('hasTarget', (bb) => bb.get('hasTarget', false))
                .condition('inRange', (bb) => bb.get('inRange', false))
                .condition('hasAmmo', (bb) => bb.get('hasAmmo', false))
            .end()
            .build(blackboard);

        const status = tree.execute();
        console.log('执行结果:', status === NodeStatus.SUCCESS ? '成功' : '失败');
    }

    /**
     * 测试装饰器节点
     */
    static testDecorator(): void {
        console.log('=== 测试装饰器节点 ===');
        
        const blackboard = new Blackboard();
        blackboard.set('value', 10);

        const builder = new BehaviorTreeBuilder();
        const tree = builder
            .condition('checkValue', (bb) => bb.get('value', 0) > 5)
            .decorator(DecoratorType.INVERTER)
            .build(blackboard);

        const status = tree.execute();
        console.log('执行结果（取反后）:', status === NodeStatus.SUCCESS ? '成功' : '失败');
    }

    /**
     * 测试复杂行为树
     */
    static testComplexTree(): void {
        console.log('=== 测试复杂行为树 ===');
        
        const blackboard = new Blackboard();
        blackboard.set('health', 80);
        blackboard.set('hasTarget', true);
        blackboard.set('inRange', true);
        blackboard.set('hasAmmo', false);

        const builder = new BehaviorTreeBuilder();
        const tree = builder
            .selector('root')
                .sequence('attack')
                    .condition('hasHealth', (bb) => bb.get('health', 0) > 50)
                    .condition('hasTarget', (bb) => bb.get('hasTarget', false))
                    .condition('inRange', (bb) => bb.get('inRange', false))
                    .condition('hasAmmo', (bb) => bb.get('hasAmmo', false))
                    .action('attack', (bb) => {
                        console.log('执行攻击');
                        return NodeStatus.SUCCESS;
                    })
                .end()
                .sequence('reload')
                    .condition('hasAmmo', (bb) => !bb.get('hasAmmo', true))
                    .action('reload', (bb) => {
                        console.log('执行装弹');
                        bb.set('hasAmmo', true);
                        return NodeStatus.SUCCESS;
                    })
                .end()
                .action('idle', (bb) => {
                    console.log('待机');
                    return NodeStatus.SUCCESS;
                })
            .end()
            .build(blackboard);

        // 执行多次
        for (let i = 0; i < 3; i++) {
            console.log(`\n--- 第 ${i + 1} 次执行 ---`);
            const status = tree.execute();
            console.log('执行结果:', status === NodeStatus.SUCCESS ? '成功' : '失败');
        }
    }

    /**
     * 测试并行节点
     */
    static testParallel(): void {
        try {
            console.log('=== 测试并行节点 ===');
            
            const blackboard = new Blackboard();
            blackboard.set('value1', 10);
            blackboard.set('value2', 20);
            blackboard.set('value3', 30);

            // 测试 ALL_SUCCESS 策略（所有子节点必须成功）
            const builder1 = new BehaviorTreeBuilder();
            const tree1 = builder1
                .parallel('parallel_all', ParallelPolicy.ALL_SUCCESS)
                    .condition('check1', (bb) => bb.get('value1', 0) > 5)
                    .condition('check2', (bb) => bb.get('value2', 0) > 15)
                    .condition('check3', (bb) => bb.get('value3', 0) > 25)
                .end()
                .build(blackboard);

            const status1 = tree1.execute();
            console.log('ALL_SUCCESS 策略结果:', status1 === NodeStatus.SUCCESS ? '成功' : '失败');

            // 测试 ANY_SUCCESS 策略（至少一个子节点成功）
            const builder2 = new BehaviorTreeBuilder();
            const tree2 = builder2
                .parallel('parallel_one', ParallelPolicy.ANY_SUCCESS)
                    .condition('check1', (bb) => bb.get('value1', 0) < 5) // 失败
                    .condition('check2', (bb) => bb.get('value2', 0) > 15) // 成功
                    .condition('check3', (bb) => bb.get('value3', 0) < 25) // 失败
                .end()
                .build(blackboard);

            const status2 = tree2.execute();
            console.log('ANY_SUCCESS 策略结果:', status2 === NodeStatus.SUCCESS ? '成功' : '失败');
        } catch (error) {
            console.error('并行节点测试失败:', error);
        }
    }

    /**
     * 测试 Repeater 装饰器
     */
    static testRepeater(): void {
        try {
            console.log('=== 测试 Repeater 装饰器 ===');
            
            const blackboard = new Blackboard();
            let count = 0;

            // 测试固定次数重复
            const builder = new BehaviorTreeBuilder();
            const tree = builder
                .action('countAction', (bb) => {
                    count++;
                    console.log(`执行第 ${count} 次`);
                    return NodeStatus.SUCCESS;
                })
                .decorator(DecoratorType.REPEATER, { count: 3 })
                .build(blackboard);

            const status = tree.execute();
            console.log(`执行结果: ${status === NodeStatus.SUCCESS ? '成功' : '失败'}, 总执行次数: ${count}`);
        } catch (error) {
            console.error('Repeater 装饰器测试失败:', error);
        }
    }

    /**
     * 测试 UntilSuccess 装饰器
     */
    static testUntilSuccess(): void {
        try {
            console.log('=== 测试 UntilSuccess 装饰器 ===');
            
            const blackboard = new Blackboard();
            let attemptCount = 0;
            blackboard.set('attempts', 0);

            const builder = new BehaviorTreeBuilder();
            const tree = builder
                .action('tryAction', (bb) => {
                    attemptCount++;
                    bb.set('attempts', attemptCount);
                    console.log(`尝试第 ${attemptCount} 次`);
                    // 第3次才成功
                    if (attemptCount >= 3) {
                        return NodeStatus.SUCCESS;
                    }
                    return NodeStatus.FAILURE;
                })
                .decorator(DecoratorType.UNTIL_SUCCESS)
                .build(blackboard);

            const status = tree.execute();
            console.log(`执行结果: ${status === NodeStatus.SUCCESS ? '成功' : '失败'}, 尝试次数: ${attemptCount}`);
        } catch (error) {
            console.error('UntilSuccess 装饰器测试失败:', error);
        }
    }

    /**
     * 测试 UntilFailure 装饰器
     */
    static testUntilFailure(): void {
        try {
            console.log('=== 测试 UntilFailure 装饰器 ===');
            
            const blackboard = new Blackboard();
            let attemptCount = 0;
            blackboard.set('attempts', 0);

            const builder = new BehaviorTreeBuilder();
            const tree = builder
                .action('tryAction', (bb) => {
                    attemptCount++;
                    bb.set('attempts', attemptCount);
                    console.log(`尝试第 ${attemptCount} 次`);
                    // 第3次才失败
                    if (attemptCount >= 3) {
                        return NodeStatus.FAILURE;
                    }
                    return NodeStatus.SUCCESS;
                })
                .decorator(DecoratorType.UNTIL_FAILURE)
                .build(blackboard);

            const status = tree.execute();
            console.log(`执行结果: ${status === NodeStatus.SUCCESS ? '成功' : '失败'}, 尝试次数: ${attemptCount}`);
        } catch (error) {
            console.error('UntilFailure 装饰器测试失败:', error);
        }
    }

    /**
     * 运行所有测试
     */
    static runAll(): void {
        console.log('开始运行行为树基础测试...\n');
        
        this.testSimpleCondition();
        console.log('');
        
        this.testSelector();
        console.log('');
        
        this.testSequence();
        console.log('');
        
        this.testDecorator();
        console.log('');
        
        this.testParallel();
        console.log('');
        
        this.testRepeater();
        console.log('');
        
        this.testUntilSuccess();
        console.log('');
        
        this.testUntilFailure();
        console.log('');
        
        this.testComplexTree();
        console.log('\n所有测试完成！');
    }
}


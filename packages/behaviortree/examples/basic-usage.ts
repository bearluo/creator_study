/**
 * @bl-framework/behaviortree 基本使用示例
 */

import {
    BehaviorTree,
    BehaviorTreeBuilder,
    NodeStatus,
    Selector,
    Sequence,
    Condition,
    Action,
    Parallel,
    ParallelPolicy,
    Inverter,
    Repeater,
    UntilSuccess,
    UntilFailure
} from '@bl-framework/behaviortree';

// ========== 示例 1: 使用 Builder 创建简单行为树 ==========

export function basicBuilderExample(): void {
    console.log('=== 示例 1: 使用 Builder 创建简单行为树 ===\n');

    const builder = new BehaviorTreeBuilder();

    const tree = builder
        .sequence('root')
            .condition('hasTarget', (blackboard) => {
                return blackboard.get('hasTarget', false);
            })
            .action('attack', (blackboard) => {
                console.log('  执行攻击');
                return NodeStatus.SUCCESS;
            })
        .end()
        .build();

    const blackboard = tree.getBlackboard();
    blackboard.set('hasTarget', true);

    console.log('执行行为树...');
    const status = tree.execute();
    console.log(`执行状态: ${status}\n`);
}

// ========== 示例 2: 手动创建行为树 ==========

export function manualTreeExample(): void {
    console.log('=== 示例 2: 手动创建行为树 ===\n');

    // 创建节点
    const checkHealth = new Condition('checkHealth', (blackboard) => {
        const health = blackboard.get('health', 0);
        console.log(`  检查生命值: ${health}`);
        return health > 50;
    });

    const attack = new Action('attack', (blackboard) => {
        console.log('  执行攻击');
        return NodeStatus.SUCCESS;
    });

    const flee = new Action('flee', (blackboard) => {
        console.log('  执行逃跑');
        return NodeStatus.SUCCESS;
    });

    // 创建行为树
    const root = new Selector('root');
    root.addChild(checkHealth);
    root.addChild(attack);
    root.addChild(flee);

    const tree = new BehaviorTree(root);

    // 执行
    const blackboard = tree.getBlackboard();
    blackboard.set('health', 30);

    console.log('执行行为树（生命值 30）...');
    const status1 = tree.execute();
    console.log(`执行状态: ${status1}\n`);

    // 重置并重新执行
    tree.reset();
    blackboard.set('health', 80);

    console.log('执行行为树（生命值 80）...');
    const status2 = tree.execute();
    console.log(`执行状态: ${status2}\n`);
}

// ========== 示例 3: 复杂行为树（战斗系统） ==========

export function combatTreeExample(): void {
    console.log('=== 示例 3: 复杂行为树（战斗系统） ===\n');

    const builder = new BehaviorTreeBuilder();

    const tree = builder
        .selector('root')
            .sequence('combat')
                .condition('hasEnemy', (bb) => {
                    const hasEnemy = bb.get('enemy') !== null;
                    console.log(`  检查是否有敌人: ${hasEnemy}`);
                    return hasEnemy;
                })
                .condition('hasAmmo', (bb) => {
                    const ammo = bb.get('ammo', 0);
                    console.log(`  检查弹药: ${ammo}`);
                    return ammo > 0;
                })
                .action('shoot', (bb) => {
                    console.log('  执行射击');
                    bb.set('ammo', bb.get('ammo', 0) - 1);
                    return NodeStatus.SUCCESS;
                })
            .end()
            .sequence('reload')
                .condition('needsReload', (bb) => {
                    const ammo = bb.get('ammo', 0);
                    console.log(`  检查是否需要装弹: ${ammo === 0}`);
                    return ammo === 0;
                })
                .action('reload', (bb) => {
                    console.log('  执行装弹');
                    bb.set('ammo', 30);
                    return NodeStatus.SUCCESS;
                })
            .end()
        .end()
        .build();

    const blackboard = tree.getBlackboard();
    blackboard.set('enemy', { id: 1 });
    blackboard.set('ammo', 0);

    console.log('--- 第 1 次执行（弹药为 0）---');
    tree.execute();

    console.log('\n--- 第 2 次执行（弹药已装满）---');
    tree.execute();

    console.log('\n--- 第 3 次执行（射击）---');
    tree.execute();
    console.log();
}

// ========== 示例 4: 装饰器节点 ==========

export function decoratorExample(): void {
    console.log('=== 示例 4: 装饰器节点 ===\n');

    // Repeater 示例
    console.log('--- Repeater 装饰器 ---');
    const action = new Action('action', (bb) => {
        const count = bb.get('count', 0);
        console.log(`  执行第 ${count + 1} 次`);
        bb.set('count', count + 1);
        return NodeStatus.SUCCESS;
    });

    const repeater = new Repeater('repeater', 3, action);
    const tree1 = new BehaviorTree(repeater);
    const bb1 = tree1.getBlackboard();
    bb1.set('count', 0);

    tree1.execute();
    console.log(`执行状态: ${tree1.getStatus()}\n`);

    // Inverter 示例
    console.log('--- Inverter 装饰器 ---');
    const condition = new Condition('condition', (bb) => {
        return bb.get('value', false);
    });

    const inverter = new Inverter('inverter', condition);
    const tree2 = new BehaviorTree(inverter);
    const bb2 = tree2.getBlackboard();
    bb2.set('value', true);

    tree2.execute();
    console.log(`执行状态: ${tree2.getStatus()} (取反后)\n`);

    // UntilSuccess 示例
    console.log('--- UntilSuccess 装饰器 ---');
    let attemptCount = 0;
    const action2 = new Action('action', (bb) => {
        attemptCount++;
        console.log(`  尝试第 ${attemptCount} 次`);
        // 第 3 次才成功
        if (attemptCount >= 3) {
            return NodeStatus.SUCCESS;
        }
        return NodeStatus.FAILURE;
    });

    const untilSuccess = new UntilSuccess('untilSuccess', action2);
    const tree3 = new BehaviorTree(untilSuccess);

    tree3.execute();
    console.log(`执行状态: ${tree3.getStatus()}, 尝试次数: ${attemptCount}\n`);
}

// ========== 示例 5: 并行节点 ==========

export function parallelExample(): void {
    console.log('=== 示例 5: 并行节点 ===\n');

    const action1 = new Action('action1', (bb) => {
        console.log('  执行动作 1');
        return NodeStatus.SUCCESS;
    });

    const action2 = new Action('action2', (bb) => {
        console.log('  执行动作 2');
        return NodeStatus.SUCCESS;
    });

    const action3 = new Action('action3', (bb) => {
        console.log('  执行动作 3');
        return NodeStatus.FAILURE;
    });

    // ALL_SUCCESS 策略
    console.log('--- Parallel (ALL_SUCCESS) ---');
    const parallel1 = new Parallel('parallel', ParallelPolicy.ALL_SUCCESS);
    parallel1.addChild(action1);
    parallel1.addChild(action2);
    parallel1.addChild(action3);

    const tree1 = new BehaviorTree(parallel1);
    const status1 = tree1.execute();
    console.log(`执行状态: ${status1}\n`);

    // ANY_SUCCESS 策略
    console.log('--- Parallel (ANY_SUCCESS) ---');
    const parallel2 = new Parallel('parallel', ParallelPolicy.ANY_SUCCESS);
    parallel2.addChild(action1);
    parallel2.addChild(action2);
    parallel2.addChild(action3);

    const tree2 = new BehaviorTree(parallel2);
    const status2 = tree2.execute();
    console.log(`执行状态: ${status2}\n`);
}

// ========== 主函数 ==========

export function runAllExamples(): void {
    console.log('========================================');
    console.log('BehaviorTree 基本使用示例');
    console.log('========================================\n');

    basicBuilderExample();
    manualTreeExample();
    combatTreeExample();
    decoratorExample();
    parallelExample();

    console.log('========================================');
    console.log('所有示例完成！');
    console.log('========================================');
}

// 如果直接运行此文件
if (require.main === module) {
    runAllExamples();
}


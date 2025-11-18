import { _decorator, Component, Node } from 'cc';
import { BehaviorTreeBasicTest } from './BasicTest';
import { ECSIntegrationTest } from './ECSIntegrationTest';

const { ccclass, property } = _decorator;

/**
 * 行为树场景测试
 * 在 Cocos Creator 场景中运行行为树测试
 */
@ccclass('SceneBehaviortreeTest')
export class SceneBehaviortreeTest extends Component {
    /** 是否运行基础测试 */
    @property({ tooltip: '是否运行基础测试' })
    runBasicTest: boolean = true;

    /** 是否运行 ECS 集成测试 */
    @property({ tooltip: '是否运行 ECS 集成测试' })
    runECSIntegrationTest: boolean = true;

    /** 是否在 start 时自动运行 */
    @property({ tooltip: '是否在 start 时自动运行测试' })
    autoRun: boolean = true;

    /** 测试延迟时间（秒） */
    @property({ tooltip: '测试延迟时间（秒）' })
    testDelay: number = 1;

    private hasRun: boolean = false;

    start() {
        if (this.autoRun && !this.hasRun) {
            // 延迟执行测试，确保场景完全加载
            this.scheduleOnce(() => {
                this.runTests();
            }, this.testDelay);
        }
    }

    update(deltaTime: number) {
        // 可以在这里添加持续更新的测试逻辑
    }

    /**
     * 运行所有测试
     */
    runTests(): void {
        if (this.hasRun) {
            console.warn('测试已经运行过，跳过');
            return;
        }

        console.log('========================================');
        console.log('开始运行行为树场景测试');
        console.log('========================================\n');

        if (this.runBasicTest) {
            console.log('>>> 运行基础测试 <<<');
            BehaviorTreeBasicTest.runAll();
            console.log('\n');
        }

        if (this.runECSIntegrationTest) {
            console.log('>>> 运行 ECS 集成测试 <<<');
            ECSIntegrationTest.runAll();
            console.log('\n');
        }

        console.log('========================================');
        console.log('所有测试完成！');
        console.log('========================================');

        this.hasRun = true;
    }

    /**
     * 手动运行基础测试
     */
    runBasicTests(): void {
        console.log('>>> 手动运行基础测试 <<<');
        BehaviorTreeBasicTest.runAll();
    }

    /**
     * 手动运行 ECS 集成测试
     */
    runECSIntegrationTests(): void {
        console.log('>>> 手动运行 ECS 集成测试 <<<');
        ECSIntegrationTest.runAll();
    }

    /**
     * 运行单个基础测试
     */
    runSingleBasicTest(testName: string): void {
        switch (testName) {
            case 'simpleCondition':
                BehaviorTreeBasicTest.testSimpleCondition();
                break;
            case 'selector':
                BehaviorTreeBasicTest.testSelector();
                break;
            case 'sequence':
                BehaviorTreeBasicTest.testSequence();
                break;
            case 'decorator':
                BehaviorTreeBasicTest.testDecorator();
                break;
            case 'parallel':
                BehaviorTreeBasicTest.testParallel();
                break;
            case 'repeater':
                BehaviorTreeBasicTest.testRepeater();
                break;
            case 'untilSuccess':
                BehaviorTreeBasicTest.testUntilSuccess();
                break;
            case 'untilFailure':
                BehaviorTreeBasicTest.testUntilFailure();
                break;
            case 'complexTree':
                BehaviorTreeBasicTest.testComplexTree();
                break;
            default:
                console.warn(`未知的测试名称: ${testName}`);
        }
    }

    /**
     * 运行单个 ECS 集成测试
     */
    runSingleECSIntegrationTest(testName: string): void {
        switch (testName) {
            case 'basicIntegration':
                ECSIntegrationTest.testBasicIntegration();
                break;
            case 'entityDataBinding':
                ECSIntegrationTest.testEntityDataBinding();
                break;
            case 'entityDataBindingComplete':
                ECSIntegrationTest.testEntityDataBindingComplete();
                break;
            case 'multipleEntities':
                ECSIntegrationTest.testMultipleEntities();
                break;
            case 'executeInterval':
                ECSIntegrationTest.testExecuteInterval();
                break;
            default:
                console.warn(`未知的测试名称: ${testName}`);
        }
    }
}



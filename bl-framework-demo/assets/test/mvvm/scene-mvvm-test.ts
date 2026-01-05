/**
 * MVVM 场景测试
 * 在 Cocos Creator 场景中运行 MVVM 测试
 */
import { _decorator, Component, Node, Label, EditBox, ProgressBar } from 'cc';
import { PlayerMVVMComponent } from './PlayerMVVMComponent';

const { ccclass, property } = _decorator;

/**
 * MVVM 场景测试组件
 */
@ccclass('SceneMVVMTest')
export class SceneMVVMTest extends Component {
    /** 是否运行组件测试 */
    @property({ tooltip: '是否运行组件测试' })
    runComponentTest: boolean = true;

    /** 是否在 start 时自动运行 */
    @property({ tooltip: '是否在 start 时自动运行测试' })
    autoRun: boolean = true;

    /** 测试延迟时间（秒） */
    @property({ tooltip: '测试延迟时间（秒）' })
    testDelay: number = 1;

    /** 测试节点（用于添加 PlayerMVVMComponent） */
    @property(Node)
    testNode: Node = null;

    private hasRun: boolean = false;

    start() {
        if (this.autoRun && !this.hasRun) {
            // 延迟执行测试，确保场景完全加载
            this.scheduleOnce(async () => {
                await this.runTests();
            }, this.testDelay);
        }
    }

    /**
     * 运行所有测试
     */
    async runTests(): Promise<void> {
        if (this.hasRun) {
            console.warn('测试已经运行过，跳过');
            return;
        }

        console.log('========================================');
        console.log('开始运行 MVVM 场景测试');
        console.log('========================================\n');

        if (this.runComponentTest && this.testNode) {
            console.log('>>> 运行组件测试 <<<');
            await this.runComponentTests();
            console.log('\n');
        }

        console.log('========================================');
        console.log('所有测试完成！');
        console.log('========================================');

        this.hasRun = true;
    }

    /**
     * 运行组件测试
     */
    private async runComponentTests(): Promise<void> {
        try {
            // 添加 PlayerMVVMComponent 到测试节点
            let playerComponent = this.testNode.getComponent(PlayerMVVMComponent);
            if (!playerComponent) {
                console.log('❌ PlayerMVVMComponent 未找到，添加组件');
                playerComponent = this.testNode.addComponent(PlayerMVVMComponent);
                console.log('✅ PlayerMVVMComponent 已添加');
                // 动态查找并绑定子节点（因为 @property 不会自动绑定）
                this.bindPlayerComponentNodes(playerComponent);
                console.log('✅ 节点绑定完成');
            }

            // 等待一帧，确保组件初始化完成
            this.scheduleOnce(() => {
                // 测试数据更新
                console.log('>>> 测试数据更新 <<<');
                playerComponent.testUpdateData();
                console.log('✅ 数据更新测试完成');

                // 测试 disable/enable
                console.log('>>> 测试 disable/enable 循环 <<<');
                for (let i = 0; i < 10; i++) {
                    this.testNode.active = false;
                    this.testNode.active = true;
                }
                console.log('✅ disable/enable 循环测试完成（10 次）');
            }, 0.1);
        } catch (error: any) {
            console.error(`❌ 组件测试失败: ${error.message}`);
        }
    }

    /**
     * 动态查找并绑定 PlayerMVVMComponent 的节点
     * 
     * 因为通过 addComponent 添加的组件，@property 装饰的属性不会自动绑定
     * 需要手动查找子节点并赋值
     */
    private bindPlayerComponentNodes(component: PlayerMVVMComponent): void {
        // 查找子节点并绑定
        // 假设子节点命名规则：nameLabel, levelLabel, healthLabel, healthBar, nameInput, deadMask
        const findChild = (name: string): Node | null => {
            // 先尝试通过路径查找（支持 'child/grandchild' 格式）
            const child = this.testNode.getChildByPath(name);
            if (child) return child;
            // 再尝试直接查找
            return this.testNode.getChildByName(name);
        };

        const findComponent = <T extends Component>(node: Node | null, ctor: typeof Component): T | null => {
            return node ? (node.getComponent(ctor) as T) : null;
        };

        // 绑定 Label 组件
        const nameLabelNode = findChild('nameLabel');
        if (nameLabelNode) {
            component.nameLabel = findComponent(nameLabelNode, Label);
        }

        const levelLabelNode = findChild('levelLabel');
        if (levelLabelNode) {
            component.levelLabel = findComponent(levelLabelNode, Label);
        }

        const healthLabelNode = findChild('healthLabel');
        if (healthLabelNode) {
            component.healthLabel = findComponent(healthLabelNode, Label);
        }

        // 绑定 ProgressBar 组件
        const healthBarNode = findChild('healthBar');
        if (healthBarNode) {
            component.healthBar = findComponent(healthBarNode, ProgressBar);
        }

        // 绑定 EditBox 组件
        const nameInputNode = findChild('nameInput');
        if (nameInputNode) {
            component.nameInput = findComponent(nameInputNode, EditBox);
        }

        // 绑定 Node
        const deadMaskNode = findChild('deadMask');
        if (deadMaskNode) {
            component.deadMask = deadMaskNode;
        }

        // 验证绑定结果
        const missing: string[] = [];
        if (!component.nameLabel) missing.push('nameLabel');
        if (!component.levelLabel) missing.push('levelLabel');
        if (!component.healthLabel) missing.push('healthLabel');
        if (!component.healthBar) missing.push('healthBar');
        if (!component.nameInput) missing.push('nameInput');
        if (!component.deadMask) missing.push('deadMask');

        if (missing.length > 0) {
            console.warn(`⚠️  以下节点未找到: ${missing.join(', ')}`);
            console.warn('提示: 请在场景中创建对应的子节点，或修改节点名称');
        } else {
            console.log('✅ 所有节点绑定成功');
        }
    }
}


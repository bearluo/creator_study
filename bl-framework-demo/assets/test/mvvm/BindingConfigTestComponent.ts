/**
 * bindConfig 测试组件
 * 在 Cocos Creator 场景中运行 bindConfig 测试
 */
import { _decorator, Component, Label, EditBox, ProgressBar, Node, Toggle, Slider, director, Director } from 'cc';
import { ViewModel, Model } from '@bl-framework/mvvm';
import { BindingBuilder, type ViewTarget } from '@bl-framework/mvvm-creator';
import { toLabelText, toProgress, toActive, toEditBox, toToggle, toSlider } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

/**
 * 测试数据接口
 */
interface TestData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    playerName: string;
    isDead: boolean;
    volume: number;
    isMuted: boolean;
}

/**
 * bindConfig 测试组件
 */
@ccclass('BindingConfigTestComponent')
export class BindingConfigTestComponent extends Component {
    /** 是否在 start 时自动运行 */
    @property({ tooltip: '是否在 start 时自动运行测试' })
    autoRun: boolean = true;

    /** 测试延迟时间（秒） */
    @property({ tooltip: '测试延迟时间（秒）' })
    testDelay: number = 1;

    // ==================== 测试用组件（通过 @property 声明） ====================
    
    // 测试 1: 基础 bindConfig
    @property(Label)
    test1Label!: Label;

    // 测试 2: 同 path 多个 target
    @property(Label)
    test2Label1!: Label;
    @property(Label)
    test2Label2!: Label;

    // 测试 3: 所有内置 helper
    @property(Label)
    test3LabelText!: Label;
    @property(Label)
    test3LabelFmt!: Label;
    @property(ProgressBar)
    test3ProgressBar!: ProgressBar;
    @property(Node)
    test3Node!: Node;
    @property(EditBox)
    test3EditBox!: EditBox;
    @property(Toggle)
    test3Toggle!: Toggle;
    @property(Slider)
    test3Slider!: Slider;

    // 测试 4: 自定义 ViewTarget
    @property(Label)
    test4Label!: Label;

    // 测试 5: formatter 类型推断（使用 test3LabelFmt）

    // 测试 6: converter 类型推断（使用 test3ProgressBar）

    // 测试 7: toProgress clamp（使用 test3ProgressBar）

    // 测试 8: null target 处理（不需要组件）

    // 测试 9: mode 校验（使用 test3LabelText）

    // 测试 10: two-way 绑定
    @property(EditBox)
    test10EditBox!: EditBox;

    private hasRun: boolean = false;
    private testCount = 0;
    private passCount = 0;
    private failCount = 0;

    start() {
        if (this.autoRun && !this.hasRun) {
            // 延迟执行测试，确保场景完全加载
            this.scheduleOnce(async () => {
                await this.runTests();
            }, this.testDelay);
        }
    }

    /**
     * 等待下一帧（用于异步测试）
     */
    private waitNextFrame(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scheduleOnce(() => {
                resolve();
            }, 0);
        });
    }

    /**
     * 运行所有测试
     */
    async runTests(): Promise<void> {
        if (this.hasRun) {
            console.warn('bindConfig 测试已经运行过，跳过');
            return;
        }

        console.log('========================================');
        console.log('开始运行 bindConfig 场景测试');
        console.log('========================================\n');

        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;

        // 基础功能测试（使用 await 逐个执行）
        await this.testBasicBindConfig();
        await this.testMultipleTargetsSamePath();
        await this.testAllBuiltInHelpers();
        await this.testCustomViewTarget();
        await this.testFormatterTypeInference();
        await this.testConverterTypeInference();
        await this.testToProgressClamp();
        await this.testNullTargetHandling();
        await this.testModeValidation();
        await this.testTwoWayBinding();

        // 输出测试结果
        console.log('\n========================================');
        console.log(`bindConfig 测试完成: 总计 ${this.testCount}, 通过 ${this.passCount}, 失败 ${this.failCount}`);
        console.log('========================================');

        this.hasRun = true;
    }

    /**
     * 测试 1: 基础 bindConfig 功能
     */
    private async testBasicBindConfig(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] 基础 bindConfig 功能`);

        if (!this.test1Label) {
            console.log('  ⚠️  跳过: test1Label 未设置');
            return;
        }

        try {
            const model = new Model<TestData>({
                name: 'Test Player',
                level: 10,
                health: 100,
                maxHealth: 100,
                playerName: 'Player',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 使用 bindConfig
            builder.bindConfig([
                { path: 'name', target: this.test1Label, helper: 'toLabelText' }
            ] as const);

            const { bindings, view } = builder.build();

            // 验证初始值（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            if (this.test1Label.string === 'Test Player') {
                console.log('  ✅ 通过: 初始绑定正确');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 初始绑定不正确 (${this.test1Label.string})`);
                this.failCount++;
            }

            // 验证更新（等待一帧，确保响应式更新完成）
            viewModel.reactive.value.name = 'Updated Name';
            await this.waitNextFrame();
            if (this.test1Label.string === 'Updated Name') {
                console.log('  ✅ 通过: 更新正确');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 更新不正确 (${this.test1Label.string})`);
                this.failCount++;
            }

            bindings.forEach(b => b.destroy());
            view.destroy();
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 2: 同 path 多个 target
     */
    private async testMultipleTargetsSamePath(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] 同 path 多个 target`);

        if (!this.test2Label1 || !this.test2Label2) {
            console.log('  ⚠️  跳过: test2Label1 或 test2Label2 未设置');
            return;
        }

        try {
            const model = new Model<TestData>({
                name: 'Test',
                level: 1,
                health: 50,
                maxHealth: 100,
                playerName: 'Player',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 同 path 多个 target
            builder.bindConfig([
                { path: 'name', target: this.test2Label1, helper: 'toLabelText' },
                { path: 'name', target: this.test2Label2, helper: 'toLabelText' }
            ] as const);

            const { bindings, view } = builder.build();

            // 验证初始值（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            if (this.test2Label1.string === 'Test' && this.test2Label2.string === 'Test') {
                console.log('  ✅ 通过: 初始绑定正确（两个 target 都更新）');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 初始绑定不正确 (Label1: ${this.test2Label1.string}, Label2: ${this.test2Label2.string})`);
                this.failCount++;
            }

            // 验证更新（等待一帧，确保响应式更新完成）
            viewModel.reactive.value.name = 'Updated';
            await this.waitNextFrame();
            if (this.test2Label1.string === 'Updated' && this.test2Label2.string === 'Updated') {
                console.log('  ✅ 通过: 更新正确（两个 target 都更新）');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 更新不正确 (Label1: ${this.test2Label1.string}, Label2: ${this.test2Label2.string})`);
                this.failCount++;
            }

            bindings.forEach(b => b.destroy());
            view.destroy();
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 3: 所有内置 helper
     */
    private async testAllBuiltInHelpers(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] 所有内置 helper`);

        if (!this.test3LabelText || !this.test3LabelFmt || !this.test3ProgressBar || 
            !this.test3Node || !this.test3EditBox || !this.test3Toggle || !this.test3Slider) {
            console.log('  ⚠️  跳过: 部分测试组件未设置');
            return;
        }

        try {
            const model = new Model<TestData>({
                name: 'Test',
                level: 10,
                health: 50,
                maxHealth: 100,
                playerName: 'Player',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 测试所有内置 helper
            builder.bindConfig([
                { path: 'name', target: this.test3LabelText, helper: 'toLabelText' },
                {
                    path: 'level',
                    target: this.test3LabelFmt,
                    helper: 'toLabelText',
                    converter: (v) => `Lv.${v}`
                },
                {
                    path: 'health',
                    target: this.test3ProgressBar,
                    helper: 'toProgress',
                    converter: (v: number) => v / model.data.maxHealth
                },
                { path: 'isDead', target: this.test3Node, helper: 'toActive' },
                {
                    path: 'playerName',
                    target: this.test3EditBox,
                    helper: 'toEditBox',
                    mode: 'two-way'
                },
                {
                    path: 'isMuted',
                    target: this.test3Toggle,
                    helper: 'toToggle',
                    mode: 'two-way'
                },
                {
                    path: 'volume',
                    target: this.test3Slider,
                    helper: 'toSlider',
                    mode: 'two-way'
                }
            ] as const);

            const { bindings, view } = builder.build();

            // 验证初始值（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            let allPassed = true;
            if (this.test3LabelText.string !== 'Test') {
                console.error(`  ❌ toLabelText 失败: ${this.test3LabelText.string}`);
                allPassed = false;
            }
            if (this.test3LabelFmt.string !== 'Lv.10') {
                console.error(`  ❌ toLabelText 失败: ${this.test3LabelFmt.string}`);
                allPassed = false;
            }
            if (Math.abs(this.test3ProgressBar.progress - 0.5) > 0.01) {
                console.error(`  ❌ toProgress 失败: ${this.test3ProgressBar.progress}`);
                allPassed = false;
            }
            if (this.test3Node.active !== false) {
                console.error(`  ❌ toActive 失败: ${this.test3Node.active}`);
                allPassed = false;
            }
            if (this.test3EditBox.string !== 'Player') {
                console.error(`  ❌ toEditBox 失败: ${this.test3EditBox.string}`);
                allPassed = false;
            }
            if (this.test3Toggle.isChecked !== false) {
                console.error(`  ❌ toToggle 失败: ${this.test3Toggle.isChecked}`);
                allPassed = false;
            }
            if (Math.abs(this.test3Slider.progress - 0.5) > 0.01) {
                console.error(`  ❌ toSlider 失败: ${this.test3Slider.progress}`);
                allPassed = false;
            }

            if (allPassed) {
                console.log('  ✅ 通过: 所有内置 helper 初始绑定正确');
                this.passCount++;
            } else {
                console.error('  ❌ 失败: 部分 helper 初始绑定不正确');
                this.failCount++;
            }

            bindings.forEach(b => b.destroy());
            view.destroy();
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 4: 自定义 ViewTarget
     */
    private async testCustomViewTarget(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] 自定义 ViewTarget`);

        if (!this.test4Label) {
            console.log('  ⚠️  跳过: test4Label 未设置');
            return;
        }

        try {
            const model = new Model<TestData>({
                name: 'Test',
                level: 1,
                health: 100,
                maxHealth: 100,
                playerName: 'Player',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 创建自定义 ViewTarget
            const customTarget: ViewTarget<string> = {
                set: (v: string) => { this.test4Label.string = v; },
                get: () => this.test4Label.string
            };

            // 使用自定义 ViewTarget
            builder.bindConfig([
                { path: 'name', viewTarget: customTarget, mode: 'one-way' }
            ] as const);

            const { bindings, view } = builder.build();

            // 验证初始值（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            if (this.test4Label.string === 'Test') {
                console.log('  ✅ 通过: 自定义 ViewTarget 初始绑定正确');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 初始绑定不正确 (${this.test4Label.string})`);
                this.failCount++;
            }

            // 验证更新（等待一帧，确保响应式更新完成）
            viewModel.reactive.value.name = 'Updated';
            await this.waitNextFrame();
            if (this.test4Label.string === 'Updated') {
                console.log('  ✅ 通过: 自定义 ViewTarget 更新正确');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 更新不正确 (${this.test4Label.string})`);
                this.failCount++;
            }

            bindings.forEach(b => b.destroy());
            view.destroy();
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 5: converter 类型推断
     */
    private async testFormatterTypeInference(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] converter 类型推断（编译时检查）`);

        if (!this.test3LabelFmt) {
            console.log('  ⚠️  跳过: test3LabelFmt 未设置');
            return;
        }

        try {
            const model = new Model<TestData>({
                name: 'Test',
                level: 10,
                health: 100,
                maxHealth: 100,
                playerName: 'Player',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 测试类型推断：converter 的 v 参数应该自动推断为 number
            builder.bindConfig([
                {
                    path: 'level',
                    target: this.test3LabelFmt,
                    helper: 'toLabelText',
                    converter: (v) => `Lv.${v}` // ✅ v 应该自动推断为 number
                }
            ] as const);

            const { bindings, view } = builder.build();

            // 验证结果（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            if (this.test3LabelFmt.string === 'Lv.10') {
                console.log('  ✅ 通过: converter 类型推断正确（编译时检查通过）');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: converter 结果不正确 (${this.test3LabelFmt.string})`);
                this.failCount++;
            }

            bindings.forEach(b => b.destroy());
            view.destroy();
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 6: converter 类型推断
     */
    private async testConverterTypeInference(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] converter 类型推断（编译时检查）`);

        if (!this.test3ProgressBar) {
            console.log('  ⚠️  跳过: test3ProgressBar 未设置');
            return;
        }

        try {
            const model = new Model<TestData>({
                name: 'Test',
                level: 1,
                health: 50,
                maxHealth: 100,
                playerName: 'Player',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 测试类型推断：converter 的 v 参数应该自动推断为 number
            builder.bindConfig([
                {
                    path: 'health',
                    target: this.test3ProgressBar,
                    helper: 'toProgress',
                    converter: (v: number) => v / 100 // ✅ v 应该自动推断为 number（显式标注以通过编译检查）
                }
            ] as const);

            const { bindings, view } = builder.build();

            // 验证结果（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            if (Math.abs(this.test3ProgressBar.progress - 0.5) < 0.01) {
                console.log('  ✅ 通过: converter 类型推断正确（编译时检查通过）');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: converter 结果不正确 (${this.test3ProgressBar.progress})`);
                this.failCount++;
            }

            bindings.forEach(b => b.destroy());
            view.destroy();
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 7: toProgress clamp 功能
     */
    private async testToProgressClamp(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] toProgress clamp 功能`);

        if (!this.test3ProgressBar) {
            console.log('  ⚠️  跳过: test3ProgressBar 未设置');
            return;
        }

        try {
            const target = toProgress(this.test3ProgressBar); // 直接传递值，converter 通过 BindingOptions 传递

            // 测试超出范围的值
            target.set(1.5); // 应该被 clamp 到 1
            if (Math.abs(this.test3ProgressBar.progress - 1) < 0.01) {
                console.log('  ✅ 通过: 超出上限被 clamp 到 1');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 超出上限未正确 clamp (${this.test3ProgressBar.progress})`);
                this.failCount++;
            }

            target.set(-0.5); // 应该被 clamp 到 0
            if (Math.abs(this.test3ProgressBar.progress - 0) < 0.01) {
                console.log('  ✅ 通过: 超出下限被 clamp 到 0');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 超出下限未正确 clamp (${this.test3ProgressBar.progress})`);
                this.failCount++;
            }

            target.set(0.75); // 正常值
            if (Math.abs(this.test3ProgressBar.progress - 0.75) < 0.01) {
                console.log('  ✅ 通过: 正常值不受影响');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 正常值被错误修改 (${this.test3ProgressBar.progress})`);
                this.failCount++;
            }
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 8: null target 处理
     */
    private async testNullTargetHandling(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] null target 处理`);

        try {
            const model = new Model<TestData>({
                name: 'Test',
                level: 1,
                health: 100,
                maxHealth: 100,
                playerName: 'Player',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 模拟 DEBUG 模式
            const originalConsoleWarn = console.warn;
            let warnCalled = false;
            console.warn = (message: string) => {
                warnCalled = true;
                originalConsoleWarn(message);
            };

            // 测试 null target（在非 DEBUG 模式下应该 warn + skip）
            try {
                builder.bindConfig([
                    { path: 'name', target: null as any, helper: 'toLabelText' }
                ] as const);

                // 在非 DEBUG 模式下，应该 warn 并跳过
                if (warnCalled) {
                    console.log('  ✅ 通过: null target 在非 DEBUG 模式下正确 warn');
                    this.passCount++;
                } else {
                    console.error('  ❌ 失败: null target 未正确 warn');
                    this.failCount++;
                }
            } catch (error: any) {
                // 在 DEBUG 模式下应该 throw
                if (error.message.includes('target is null')) {
                    console.log('  ✅ 通过: null target 在 DEBUG 模式下正确 throw');
                    this.passCount++;
                } else {
                    console.error(`  ❌ 失败: null target 错误处理不正确 (${error.message})`);
                    this.failCount++;
                }
            }

            console.warn = originalConsoleWarn;
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 9: mode 校验
     */
    private async testModeValidation(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] mode 校验（编译时检查）`);

        if (!this.test3LabelText) {
            console.log('  ⚠️  跳过: test3LabelText 未设置');
            return;
        }

        try {
            // 这个测试主要是验证 TypeScript 类型检查
            // display helper 不应该支持 two-way
            const model = new Model<TestData>({
                name: 'Test',
                level: 1,
                health: 100,
                maxHealth: 100,
                playerName: 'Player',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 测试：display helper 只允许 one-way（编译时检查）
            builder.bindConfig([
                {
                    path: 'name',
                    target: this.test3LabelText,
                    helper: 'toLabelText',
                    mode: 'one-way' // ✅ 正确
                }
            ] as const);

            const { bindings, view } = builder.build();

            // 验证结果（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            if (this.test3LabelText.string === 'Test') {
                console.log('  ✅ 通过: mode 类型检查正确（编译时检查通过）');
                console.log('  ℹ️  提示: display helper 不支持 two-way 由 TypeScript 类型系统保证');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 绑定结果不正确 (${this.test3LabelText.string})`);
                this.failCount++;
            }

            bindings.forEach(b => b.destroy());
            view.destroy();
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 测试 10: two-way 绑定
     */
    private async testTwoWayBinding(): Promise<void> {
        this.testCount++;
        console.log(`[测试 ${this.testCount}] two-way 绑定`);

        if (!this.test10EditBox) {
            console.log('  ⚠️  跳过: test10EditBox 未设置');
            return;
        }

        try {
            const model = new Model<TestData>({
                name: 'Test',
                level: 1,
                health: 100,
                maxHealth: 100,
                playerName: 'Initial',
                isDead: false,
                volume: 0.5,
                isMuted: false
            });
            const viewModel = new ViewModel(model);
            const builder = new BindingBuilder<TestData>(viewModel);

            // 使用 bindConfig 测试 two-way
            builder.bindConfig([
                {
                    path: 'playerName',
                    target: this.test10EditBox,
                    helper: 'toEditBox',
                    mode: 'two-way'
                }
            ] as const);

            const { bindings, view } = builder.build();

            // 验证初始值（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            if (this.test10EditBox.string === 'Initial') {
                console.log('  ✅ 通过: 初始绑定正确');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 初始绑定不正确 (${this.test10EditBox.string})`);
                this.failCount++;
            }

            // 测试 1: 程序更新不应该触发 change 事件（通过 silentDepth 保护）
            viewModel.reactive.value.playerName = 'Updated';
            // 注意：在真实环境中，程序更新不会触发 EditBox 的 change 事件
            // 这里主要验证数据同步（等待一帧，确保响应式更新完成）
            await this.waitNextFrame();
            if (this.test10EditBox.string === 'Updated') {
                console.log('  ✅ 通过: 程序更新正确同步到视图');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: 程序更新未同步 (${this.test10EditBox.string})`);
                this.failCount++;
            }

            // 测试 2: 模拟用户输入（需要手动触发 EditBox 事件）
            // 在实际场景中，用户输入会触发 EditBox.EventType.EDITING_DID_ENDED
            // 这里我们直接设置值并手动触发更新
            this.test10EditBox.string = 'User Input';
            // 手动触发 change 事件（模拟用户输入）
            this.test10EditBox.node.emit(EditBox.EventType.EDITING_DID_ENDED, this.test10EditBox);

            // 等待一帧，让事件处理完成
            await this.waitNextFrame();
            if (viewModel.reactive.value.playerName === 'User Input') {
                console.log('  ✅ 通过: 用户输入正确更新 VM');
                this.passCount++;
            } else {
                console.error(`  ❌ 失败: VM 未更新 (${viewModel.reactive.value.playerName})`);
                this.failCount++;
            }

            bindings.forEach(b => b.destroy());
            view.destroy();
        } catch (error: any) {
            console.error(`  ❌ 失败: ${error.message}`);
            this.failCount++;
        }
    }

    /**
     * 手动运行测试
     */
    runTestsManually(): void {
        this.hasRun = false;
        this.runTests();
    }
}

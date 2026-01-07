/**
 * ViewHost 测试
 * 
 * 测试 ViewHost 基类的生命周期管理和抽象方法
 */
import { ViewHost } from '../../src/components/ViewHost';
import { ViewModel, Model } from '@bl-framework/mvvm';
import { TargetViewAdapter } from '../../src/adapters/TargetViewAdapter';
import type { ViewTarget } from '../../src/types/view-target';

// Mock View Contract
interface ITestView {
    nameText: ViewTarget<string>;
}

// Mock View
class TestView implements ITestView {
    nameText!: ViewTarget<string>;
}

// Mock ViewModel
interface TestData {
    name: string;
}

class TestViewModel extends ViewModel<TestData> {
    bindViewCalled = false;
    bindViewArg?: ITestView;
    private viewAdapter?: TargetViewAdapter;
    
    bindView(view: ITestView): void {
        this.bindViewCalled = true;
        this.bindViewArg = view;
        // 模拟绑定：需要将 ViewTarget 包装成 IView（通过 TargetViewAdapter）
        this.viewAdapter = new TargetViewAdapter();
        this.viewAdapter.addTarget('name', view.nameText);
        this.bind('name', this.viewAdapter);
    }
    
    dispose(): void {
        this.destroy();
        if (this.viewAdapter) {
            this.viewAdapter.destroy();
        }
    }
}

// Mock ViewHost 实现
class TestViewHost extends ViewHost<TestData, ITestView> {
    createViewModelCalled = false;
    createViewCalled = false;
    setupViewTargetsCalled = false;
    setupViewTargetsArg?: ITestView;
    
    protected createViewModel(): ViewModel<TestData> {
        this.createViewModelCalled = true;
        const model = new Model<TestData>({ name: 'Test' });
        return new TestViewModel(model);
    }
    
    protected createView(): ITestView {
        this.createViewCalled = true;
        return new TestView();
    }
    
    protected setupViewTargets(view: ITestView): void {
        this.setupViewTargetsCalled = true;
        this.setupViewTargetsArg = view;
        // 模拟注入 ViewTarget
        view.nameText = {
            set: (value: string) => {},
            get: () => 'Test'
        };
    }
}

describe('ViewHost', () => {
    let viewHost: TestViewHost;
    
    beforeEach(() => {
        viewHost = new TestViewHost();
    });
    
    describe('生命周期管理', () => {
        it('应该在 onLoad 时创建 ViewModel 和 View', () => {
            viewHost.onLoad();
            
            expect(viewHost.createViewModelCalled).toBe(true);
            expect(viewHost.createViewCalled).toBe(true);
            // 通过公共方法访问 protected 属性
            expect((viewHost as any).viewModel).toBeDefined();
            expect((viewHost as any).view).toBeDefined();
        });
        
        it('应该在 onEnable 时设置 ViewTarget 并触发绑定', () => {
            viewHost.onLoad();
            viewHost.onEnable();
            
            expect(viewHost.setupViewTargetsCalled).toBe(true);
            expect(viewHost.setupViewTargetsArg).toBe((viewHost as any).view);
            
            const vm = (viewHost as any).viewModel as TestViewModel;
            expect(vm.bindViewCalled).toBe(true);
            expect(vm.bindViewArg).toBe((viewHost as any).view);
        });
        
        it('应该在 onDisable 时调用 dispose', () => {
            viewHost.onLoad();
            viewHost.onEnable();
            
            const vm = (viewHost as any).viewModel as TestViewModel;
            const destroySpy = jest.spyOn(vm, 'destroy');
            
            viewHost.onDisable();
            
            expect(destroySpy).toHaveBeenCalled();
        });
        
        it('应该在 onDestroy 时清理资源', () => {
            viewHost.onLoad();
            viewHost.onEnable();
            viewHost.onDisable();
            
            const vm = (viewHost as any).viewModel as TestViewModel;
            const disposeSpy = jest.spyOn(vm, 'dispose');
            
            viewHost.onDestroy();
            
            expect(disposeSpy).toHaveBeenCalled();
            expect((viewHost as any).viewModel).toBeUndefined();
            expect((viewHost as any).view).toBeUndefined();
        });
    });
    
    describe('抽象方法', () => {
        it('应该要求子类实现 createViewModel', () => {
            class IncompleteViewHost extends ViewHost<TestData, ITestView> {
                protected createViewModel(): ViewModel<TestData> {
                    throw new Error('Not implemented');
                }
                
                protected createView(): ITestView {
                    throw new Error('Not implemented');
                }
                
                protected setupViewTargets(): void {
                    throw new Error('Not implemented');
                }
            }
            
            const host = new IncompleteViewHost();
            expect(() => host.onLoad()).toThrow();
        });
        
        it('应该要求子类实现 createView', () => {
            class IncompleteViewHost extends ViewHost<TestData, ITestView> {
                protected createViewModel(): ViewModel<TestData> {
                    return new TestViewModel(new Model({ name: 'Test' }));
                }
                
                protected createView(): ITestView {
                    throw new Error('Not implemented');
                }
                
                protected setupViewTargets(): void {
                    throw new Error('Not implemented');
                }
            }
            
            const host = new IncompleteViewHost();
            expect(() => host.onLoad()).toThrow();
        });
        
        it('应该要求子类实现 setupViewTargets', () => {
            class IncompleteViewHost extends ViewHost<TestData, ITestView> {
                protected createViewModel(): ViewModel<TestData> {
                    return new TestViewModel(new Model({ name: 'Test' }));
                }
                
                protected createView(): ITestView {
                    return new TestView();
                }
                
                protected setupViewTargets(): void {
                    throw new Error('Not implemented');
                }
            }
            
            const host = new IncompleteViewHost();
            host.onLoad();
            expect(() => host.onEnable()).toThrow();
        });
    });
    
    describe('bindView 方法', () => {
        it('应该默认调用 VM 的 bindView', () => {
            viewHost.onLoad();
            
            const vm = (viewHost as any).viewModel as TestViewModel;
            expect(vm.bindViewCalled).toBe(false);
            
            viewHost.onEnable();
            
            expect(vm.bindViewCalled).toBe(true);
            expect(vm.bindViewArg).toBe((viewHost as any).view);
        });
        
        it('如果 VM 没有 bindView，应该抛出错误', () => {
            class ViewModelWithoutBindView extends ViewModel<TestData> {
                // 没有 bindView 方法
            }
            
            class ViewHostWithoutBindView extends ViewHost<TestData, ITestView> {
                protected createViewModel(): ViewModel<TestData> {
                    return new ViewModelWithoutBindView(new Model({ name: 'Test' }));
                }
                
                protected createView(): ITestView {
                    return new TestView();
                }
                
                protected setupViewTargets(): void {
                    // 空实现
                }
            }
            
            const host = new ViewHostWithoutBindView();
            host.onLoad();
            
            expect(() => host.onEnable()).toThrow('ViewModel must implement bindView method');
        });
        
        it('子类可以重写 bindView', () => {
            class CustomViewHost extends TestViewHost {
                customBindViewCalled = false;
                
                protected bindView(viewModel: ViewModel<TestData>, view: ITestView): void {
                    this.customBindViewCalled = true;
                    // 自定义绑定逻辑
                }
            }
            
            const host = new CustomViewHost();
            host.onLoad();
            host.onEnable();
            
            expect(host.customBindViewCalled).toBe(true);
            const vm = (host as any).viewModel as TestViewModel;
            expect(vm.bindViewCalled).toBe(false); // 没有调用 VM 的 bindView
        });
    });
});


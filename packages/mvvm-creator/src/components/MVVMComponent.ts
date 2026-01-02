/**
 * MVVMComponent - Cocos Creator 组件的 MVVM 基类
 * 
 * 方案 2.1 最终版：创建/绑定分离的生命周期管理
 */
import { Component } from 'cc';
import type { ViewModel, Model, DataBinding } from '@bl-framework/mvvm';
import { BindingBuilder } from '../builders/BindingBuilder';
import { TargetViewAdapter } from '../adapters/TargetViewAdapter';

/**
 * MVVM 组件基类
 * 
 * 职责：
 * - 管生命周期（enable/build，disable/destroy）
 * - 统一管理 bindings 和 view 的销毁
 */
export abstract class MVVMComponent<T = any> extends Component {
    protected viewModel!: ViewModel<T>;
    protected bindingBuilder!: BindingBuilder<T>;
    protected view?: TargetViewAdapter; // 现在 holds the shared adapter

    private isCreated = false;
    private isBound = false;
    private bindings: DataBinding<T, any, any>[] = [];

    /**
     * onLoad：只做一次性的"结构准备"
     * - 缓存组件引用 / 找节点（最好都 @property）
     * - 创建 viewAdapter（如果它只是映射，不挂事件）
     * - 不做 watch、不做绑定订阅（避免禁用/启用导致重复）
     */
    override onLoad(): void {
        this._createIfNeeded(); // 只创建，不绑定
    }

    /**
     * onEnable：开始"激活绑定/订阅"
     * - 建立 reactive.watch（watcher 依赖收集）
     * - 注册 view change（two-way）
     * - 执行一次 run（初始渲染）
     */
    override onEnable(): void {
        this._createIfNeeded();
        this._bindIfNeeded();   // 建立订阅/事件
    }

    /**
     * onDisable：暂停"绑定/订阅"（非常推荐）
     * - destroy/unwatch 所有 DataBinding（或统一暂停）
     * - 解绑 view change 监听
     * - Cocos 里节点 disable 可能频繁发生；不暂停会导致隐藏 UI 仍在跑 watcher.run，浪费且可能改到无效组件。
     */
    override onDisable(): void {
        this._unbindIfNeeded(); // 暂停订阅/事件（强烈建议）
    }

    /**
     * onDestroy：彻底释放
     * - 确保 onDisable 已做的事情都做过（幂等）
     * - 释放 adapter 映射、清空引用
     */
    override onDestroy(): void {
        this._unbindIfNeeded();
        this._destroyAll();
    }

    /**
     * 创建 MVVM 对象（只一次）
     */
    private _createIfNeeded(): void {
        if (this.isCreated) return;

        const model = this.createModel();
        this.viewModel = this.initViewModel(model);

        this.bindingBuilder = new BindingBuilder<T>(this.viewModel);

        this.onMVVMCreate(); // 子类声明绑定规则/注册命令等（不做 build）
        this.isCreated = true;
    }

    /**
     * 建立绑定和订阅（可反复执行）
     * 
     * ⚠️ **风险控制**：build 失败时的半成品清理策略
     * - BindingBuilder.build() 内部已处理半成品清理（见 BindingBuilder 设计）
     * - 这里只需要确保 isBound 标志正确
     */
    private _bindIfNeeded(): void {
        if (this.isBound) return;

        try {
            // build returns bindings and the shared view adapter
            // ⚠️ 如果 build 中途 throw，BindingBuilder 会清理已创建的 bindings 和 view
            const { bindings, view } = this.bindingBuilder.build();
            this.bindings = bindings;
            this.view = view; // Store the shared adapter

            this.isBound = true;
        } catch (error) {
            console.error(`[MVVMComponent] Binding failed:`, error);
            // BindingBuilder 已清理半成品，这里只需要重置标志
            this.isBound = false;
            throw error;
        }
    }

    /**
     * 断开绑定和订阅（可反复执行，幂等）
     */
    private _unbindIfNeeded(): void {
        if (!this.isBound) return;

        // 销毁所有 DataBinding（解绑 reactive.watch）
        for (const binding of this.bindings) {
            binding.destroy();
        }
        this.bindings.length = 0;

        // 销毁 view（解绑所有已注册的 onChange）
        if (this.view) {
            this.view.destroy();
            this.view = undefined;
        }

        this.isBound = false;
    }

    /**
     * 销毁所有 MVVM 对象（只一次）
     */
    private _destroyAll(): void {
        if (!this.isCreated) return;

        // 确保已解绑
        this._unbindIfNeeded();

        // 清空引用（可选）
        // @ts-ignore
        this.viewModel = undefined;
        // @ts-ignore
        this.bindingBuilder = undefined;

        this.isCreated = false;
    }

    // 抽象方法
    protected abstract createModel(): Model<T>;
    protected abstract initViewModel(model: Model<T>): ViewModel<T>;
    
    /**
     * 只做一次：声明绑定、准备命令、缓存组件引用等
     * 注意：这里不应该调用 build()，build() 由基类在 onEnable 时统一调用
     */
    protected abstract onMVVMCreate(): void;
}

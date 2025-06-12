import { _decorator, assert, AudioClip, AudioSource, BlockInputEvents, color, Component, director, EventTouch, instantiate, log, Node, Pool, RenderRoot2D, Sprite, SpriteFrame, UITransform, Widget } from 'cc';
import { FWBaseManager } from './base/FWBaseManager';
import { func, uiFunc } from '../../common/FWFunction';
import { FWUIDialog } from '../../ui/FWUIDialog';
import { FWUIMask } from '../../ui/FWUIMask';
import { FWUIDialogLoading } from '../../ui/FWUIDialogLoading';
import { IAssetConfig } from '../../declare/FWInterface';
const { ccclass, property } = _decorator;

export class FWUIDialogManager extends FWBaseManager {
    // 重写静态实例类型
    protected static _instance: FWUIDialogManager | null = null;
    
    // 重写静态访问器返回类型
    public static get instance(): FWUIDialogManager {
        if (!FWUIDialogManager._instance) {
            FWUIDialogManager._instance = new FWUIDialogManager();
        }
        return FWUIDialogManager._instance;
    }
    private _maskName = "_mask";
    private _queue:FWUIDialog[] = [];
    private _queueDirty = false;
    private _root:Node;
    private _mask:Node;
    private _cur:FWUIDialog;
    private _loadPool:Pool<FWUIDialogLoading>

    __preload(): void {
        this._loadPool = new Pool<FWUIDialogLoading>(()=>{
            let node = new Node();
            let loading = node.addComponent(FWUIDialogLoading);
            return loading;
        },5,(loading)=>{
            loading.node.destroy();
        });
    }

    set root(node:Node) {
        this._root = node;
        this._mask = this._root.getChildByName(this._maskName) ?? this.createMask()
    }

    private createMask() {
        assert(this._root != null,"root is null")
        //遮罩节点
        let maskNode = uiFunc.newNodeWidget(this._maskName);
        //添加触摸吞噬
        maskNode.addComponent(FWUIMask);
        maskNode.parent = this._root;
        maskNode.active = false;
        return maskNode
    }

    closeDialog() {
        this.curDialog?.hide()
    }

    get curDialog() {
        let length = this._queue.length;
        if(length==0) {
            return;
        }
        return this._queue[length-1];
    }
    /**
     * 加载并显示弹窗
     * @param config 资源配置 {@link IAssetConfig}
     * @param data 
     * @returns 
     */
    loadAndShowDialog(config: IAssetConfig,data?:any) {
        let loading = this._loadPool.alloc();
        loading.show(data);
        return loading.loadPrefab(config).then((prefab)=>{
            let index = this._queue.indexOf(loading);
            if(index!=-1) {
                let node = instantiate(prefab);
                node.parent = this._root;
                let newDialog = node.getComponent(FWUIDialog) ?? node.addComponent(FWUIDialog);
                newDialog.show(loading.showData);
                // 调整顺序
                this._queue.pop();
                this._queue.splice(index, 1,newDialog);
                loading.node.parent = null;
                this._loadPool.free(loading)
                return Promise.resolve(newDialog);
            } else {
                return Promise.reject(new Error("dialog is not loading"));
            }
        })
    }
    /**
     * 添加弹窗管理
     * @param dialog 
     */
    addDialog(dialog: FWUIDialog) {
        assert(this._root != null, "root is null");
        dialog.node.parent = this._root;
        this._queue.push(dialog);
        this._queueDirty = true;
    }
    /**
     * 移除弹窗管理
     * @param dialog 
     */
    removeDialog(dialog: FWUIDialog) {
        assert(this._root != null, "root is null");
        let index = this._queue.indexOf(dialog);
        if(index!=-1) {
            this._queue.splice(index, 1);
            this._queueDirty = true;
        }
    }
    /**
     * 关闭全部弹窗
     */
    closeAllDialog() {
        let oldQueue = this._queue;
        this._queue = [];
        oldQueue.forEach(dialog => {
            dialog.hide();
        });
        this._queueDirty = true;
    }

    update(deltaTime: number) {
        if (this._queueDirty) {
            this._queueDirty = false;
            this.updateDialogQueue();
        }
    }

    updateDialogQueue() {
        let length = this._queue.length;
        if(length==0) {
            this._mask.active = false;
            this._cur = null;
            return;
        }
        this._mask.active = true;
        for (let index = 0; index < length-1; index++) {
            const element = this._queue[index];
            element._hide();
        }
        let curDialog = this._queue[length-1];
        if(this._cur != curDialog) {
            curDialog.playShowAnim();
            this._cur = curDialog;
        }
        let siblingIndex = this._cur.node.getSiblingIndex()
        this._mask.setSiblingIndex(siblingIndex == 0 ? siblingIndex : siblingIndex - 1)
    }
    
    onDestroy(): void {
        super.onDestroy();
        this._loadPool?.destroy();
    }
}
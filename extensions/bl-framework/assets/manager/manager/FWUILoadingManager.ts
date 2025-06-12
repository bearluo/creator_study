import { _decorator, assert, AudioClip, AudioSource, BlockInputEvents, color, Component, director, EventTouch, log, Node, Pool, RenderRoot2D, Sprite, SpriteFrame, UITransform, Widget } from 'cc';
import { FWBaseManager } from './base/FWBaseManager';
import { Events } from '../../events/FWEvents';
import { UIRoot } from '../../ui/FWUIRoot';
import { func, uiFunc } from '../../common/FWFunction';
import { FWUILoading } from '../../ui/FWUILoading';
import { FWUIMask } from '../../ui/FWUIMask';
const { ccclass, property } = _decorator;

export class FWUILoadingManager extends FWBaseManager {
    // 静态实例类型
    protected static _instance: FWUILoadingManager | null = null;
    
    // 静态访问器返回类型
    public static get instance(): FWUILoadingManager {
        if (!FWUILoadingManager._instance) {
            FWUILoadingManager._instance = new FWUILoadingManager();
        }
        return FWUILoadingManager._instance;
    }
    private _maskName = "_mask";
    private _queue:FWUILoading[] = [];
    private _queueDirty = false;
    private _root:Node;
    private _mask:Node;
    private _cur:FWUILoading;

    set root(node:Node) {
        this._root = node;
        this._mask = this._root.getChildByName(this._maskName) ?? this.createMask()
    }

    private createMask() {
        assert(this._root != null,"dialogRoot is null")
        //遮罩节点
        let maskNode = uiFunc.newNodeWidget(this._maskName);
        //添加触摸吞噬
        maskNode.addComponent(FWUIMask);
        maskNode.parent = this._root;
        maskNode.active = false;
        return maskNode
    }

    add(dialog: FWUILoading) {
        assert(this._root != null, "dialogRoot is null");
        dialog.node.parent = this._root;
        this._queue.push(dialog);
        this._queueDirty = true;
    }

    remove(dialog: FWUILoading) {
        assert(this._root != null, "dialogRoot is null");
        let index = this._queue.indexOf(dialog);
        if(index!=-1) {
            this._queue.splice(index, 1);
            this._queueDirty = true;
        }
    }

    closeAll() {
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
            this.updateQueue();
        }
    }

    updateQueue() {
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
        let cur = this._queue[length-1];
        if(this._cur != cur) {
            cur.playShowAnim();
            this._cur = cur;
        }
        let siblingIndex = this._cur.node.getSiblingIndex()
        this._mask.setSiblingIndex(siblingIndex == 0 ? siblingIndex : siblingIndex - 1)
    }
}
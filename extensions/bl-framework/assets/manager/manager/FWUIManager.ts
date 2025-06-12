import { _decorator, assert, AudioClip, AudioSource, BlockInputEvents, color, Component, director, EventTouch, log, Node, Pool, RenderRoot2D, Sprite, SpriteFrame, UITransform, Widget } from 'cc';
import { FWBaseManager, register } from './base/FWBaseManager';
import { Events } from '../../events/FWEvents';
import { UIRoot } from '../../ui/FWUIRoot';
import { func, uiFunc } from '../../common/FWFunction';
import { FWUIDialog, IHideData } from '../../ui/FWUIDialog';
import { FWUILoadingManager } from './FWUILoadingManager';
import { FWUIDialogManager } from './FWUIDialogManager';
import { FWUILoading } from '../../ui/FWUILoading';
import { IAssetConfig } from '../../declare/FWInterface';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

register("ui", () => FWUIManager.instance);
@ccclass('FWUIManager')
export class FWUIManager extends FWBaseManager {
    // 重写静态实例类型
    protected static _instance: FWUIManager | null = null;
    
    // 重写静态访问器返回类型
    public static get instance(): FWUIManager {
        if (!FWUIManager._instance) {
            FWUIManager._instance = new FWUIManager();
        }
        return FWUIManager._instance;
    }
    uiRoot:UIRoot;
    private _dialogManager: FWUIDialogManager = FWUIDialogManager.instance;
    private _loadingManager: FWUILoadingManager = FWUILoadingManager.instance;

    start() {
        app.manager.event.on(Events.MANAGER_INIT_END, this.onMangerInitEnd, this);
    }

    onMangerInitEnd() {
        if(EDITOR && globalThis.isPreviewProcess) {
            this.changeUIRoot(this.createUIRoot());
        }else if(!EDITOR) {
            this.changeUIRoot(this.createUIRoot());
        }
    }

    changeUIRoot(uiRoot:UIRoot): void {
        app.manager.event.emit(Events.onUIRootChanged, uiRoot);
        let oldUIRoot = this.uiRoot;
        if(oldUIRoot) {
            oldUIRoot.bindApp = false;
            oldUIRoot.node.destroy();
        }
        uiRoot.bindApp = true;
        this.uiRoot = uiRoot;
        this._dialogManager.root = this.uiRoot.staticNode.dialog;
        this._loadingManager.root = this.uiRoot.staticNode.loading;
        //设置常驻节点
        director.addPersistRootNode(this.uiRoot.node);
    }

    private createUIRoot() {
        let node = uiFunc.newNodeWidget("_UIRoot");
        let root2D = node.addComponent(RenderRoot2D);
        let uiRoot = node.addComponent(UIRoot);
        uiRoot.init();
        return uiRoot;
    }

    async showDialog(config: IAssetConfig,data?:any) {
        return await this._dialogManager.loadAndShowDialog(config,data);
    }

    closeDialog(dialog: FWUIDialog,data?:IHideData) {
        dialog.hide(data);
    }

    closeAllDialog() {
        this._dialogManager.closeAllDialog();
    }

    get dialog() {
        return this._dialogManager;
    }

    showLoading(view:FWUILoading) {
        this._loadingManager.add(view);
    }

    closeLoading(view: FWUILoading) {
        view.hide();
    }

    closeAllLoading() {
        this._loadingManager.closeAll();
    }

    get loading() {
        return this._loadingManager;
    }
}



declare global {
    namespace globalThis {
        interface IFWManager {
            ui : FWUIManager
        }
    }
}
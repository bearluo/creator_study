import { _decorator, assetManager, Component, EventTarget, director, Node, UITransform, Widget, Prefab, instantiate, AssetManager, RenderRoot2D, System, ISchedulable, Director, Scene } from 'cc';

import { Events } from './events/FWEvents';
import { FWTimer } from './common/FWTimer';
import { BUILD, EDITOR, PREVIEW } from 'cc/env';
import { FWManager } from './manager';
const { ccclass, property } = _decorator;

@ccclass('FWApplication')
export class FWApplication implements ISchedulable {
    id?: string;
    uuid?: string;

    private static _instance: FWApplication;
    static get instance(): FWApplication {
        return this._instance;
    }
    manager: FWManager;
    

    constructor() {
        this.id = this.uuid = "FWApplication"
        if(FWApplication._instance) FWApplication._instance.dectroy();
        globalThis.app = this as any;
        FWApplication._instance = this;
        FWTimer.scheduleUpdate(this, System.Priority.HIGH, false);
        this.initManager();
        this.__preload();
        this.start();
        app.manager.event.emit(Events.MANAGER_INIT_END);
    }

    protected initManager() {
        this.manager = new FWManager();
        this.manager.initManager();
    }

    __preload() {
        this.manager.__preload();
    }

    start() {
        this.manager.start();
    }

    update(deltaTime: number) {
        this.manager.update(deltaTime);
    }

    dectroy() {
        FWTimer.unscheduleUpdate(this);
        this.manager.dectroy();
        globalThis.app = null;
        FWApplication._instance = null;
    }
}

export type ApplicationType = InstanceType<typeof FWApplication>



// if (!EDITOR || PREVIEW || globalThis.isPreviewProcess) {
if (!BUILD) {
    if(EDITOR && globalThis.isPreviewProcess) {
        let callback
        callback = (scene:Scene) => {
            if( scene.name != "" ) {
                new FWApplication();
            } else {
                director.once(Director.EVENT_AFTER_SCENE_LAUNCH, callback)
            }
        }
        director.once(Director.EVENT_AFTER_SCENE_LAUNCH, callback)
    }else if(!EDITOR) {
        director.once(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
            new FWApplication();
        })
    } else {
        // console.log("重新初始化Application");
        // console.log(typeof(app) == "undefined");
        new FWApplication();
        // console.log(typeof(app) == "undefined");
    }
} else {
    new FWApplication();
}


declare global {
    interface IFWApp {
        dectroy():void;
    }
}
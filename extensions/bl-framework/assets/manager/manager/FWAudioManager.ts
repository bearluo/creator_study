import { _decorator, AudioClip, AudioSource, Component, director, log, Node, Pool } from 'cc';
import { FWBaseManager, register } from './base/FWBaseManager';
import { Events } from '../../events/FWEvents';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

register("audio", () => FWAudioManager.instance);
@ccclass('FWAudioManager')
export class FWAudioManager extends FWBaseManager {
    // 重写静态实例类型
    protected static _instance: FWAudioManager | null = null;
    
    // 重写静态访问器返回类型
    public static get instance(): FWAudioManager {
        if (!FWAudioManager._instance) {
            FWAudioManager._instance = new FWAudioManager();
        }
        return FWAudioManager._instance;
    }
    private _bgmNode: Node;
    private _sfxNode: Node;
    private _bgm: AudioSource;
    private _sfx: Map<AudioClip, AudioSource> = new Map();
    private _sfxPool:Pool<AudioSource>

    __preload(): void {
        if(EDITOR && globalThis.isPreviewProcess) {
            this.createAudioNode();
        }else if(!EDITOR) {
            this.createAudioNode();
        }
    }


    start() {
        // Application.instance.on(Events.onUIRootChanged, this.onUIRootChanged, this);
        app.manager.event.on(Events.onBgmVolumeChanged, this.onBgmVolumeChanged, this);
    }

    createAudioNode() {
        if(!this._bgmNode) {
            this._bgmNode = new Node("_bgmNode");
            //音乐AudioSource
            this._bgm = this._bgmNode.addComponent(AudioSource);
            this._bgm.loop = true;
        }
        if(!this._sfxNode) {
            this._sfxNode = new Node("_sfxNode");
            this._sfxPool = new Pool(()=>{
                return this._sfxNode.addComponent(AudioSource)
            }, 10, (obj: AudioSource)=>{
                obj.destroy();
            })
        }
        //设置常驻节点
        director.addPersistRootNode(this._bgmNode);
        //设置常驻节点
        director.addPersistRootNode(this._sfxNode);
    }

    onBgmVolumeChanged() {
        if (this._bgm) {
            this._bgm.volume = app.manager.data.setting.bgmVolume;
        }
    }
    /**
     * 播放背景音乐
     * @param clip 
     */
    playBgm(clip: AudioClip) {
        this._bgm.clip = clip;
        this._bgm.play();
        this._bgm.volume = app.manager.data.setting.bgmVolume
    }
    /**
     * 停止背景音乐
     */
    stopBgm() {
        this._bgm.stop();
    }
    /**
     * 播放音效
     * @param clip 
     * @returns 
     */
    playSfx(clip: AudioClip) {
        if (!this._sfx.has(clip)) {
            return;
        }
        let as = this._sfx.get(clip);
        as.volume = app.manager.data.setting.sfxVolume;        
        as.play();
    }
    /**
     * 初始化音效
     * @param clip 
     * @returns 
     */
    initSfx(clip: AudioClip) {
        if (this._sfx.has(clip)) {
            return;
        }
        let as = this._sfxPool.alloc();
        as.clip = clip;
        this._sfx.set(clip,as);
    }

    freeSfx(clip: AudioClip) {
        if (!this._sfx.has(clip)) {
            return;
        }
        let as = this._sfx.get(clip);
        this._sfx.delete(clip);
        this._sfxPool.free(as);
    }

    onDestroy(): void {
        super.onDestroy();
        this._sfx.forEach(as=>{
            as.destroy();
        })
        this._sfxPool?.destroy();
    }
}



declare global {
    namespace globalThis {
        interface IFWManager {
            audio : FWAudioManager
        }
    }
}



import { __private, _decorator, assert, Asset, assetManager, AssetManager, Component, Constructor, director, Eventify, EventTarget, instantiate, js, JsonAsset, Node, Prefab, Scene, SceneAsset } from 'cc';
import { FWBaseManager, register } from './base/FWBaseManager';
import { func, qAsset, uiFunc } from '../../common/FWFunction';
import { NATIVE } from 'cc/env';
import { log } from '../../common/FWLog';
import { Events } from '../../events/FWEvents';
import { FWBundle } from './FWAssetManager';
import { constant } from '../../common/FWConstant';
import { FWUILoading } from '../../ui/FWUILoading';
const { ccclass, property } = _decorator;

interface IPreloadJson {
    url:string;
}

interface ISceneData {
    bundleName?: string;
    sceneName?: string;
    loadPrefab?: string;
    preloadDirsList?: IPreloadJson[];
    preloadList?: IPreloadJson[];
    [key:string] : any;
}

interface ISceneQueueData {
    bundleName: string;
    sceneName: string;
}

register("scene", () => FWSceneManager.instance);
@ccclass('FWSceneManager')
export class FWSceneManager extends FWBaseManager {
    // 重写静态实例类型
    protected static _instance: FWSceneManager | null = null;
    
    // 重写静态访问器返回类型
    public static get instance(): FWSceneManager {
        if (!FWSceneManager._instance) {
            FWSceneManager._instance = new FWSceneManager();
        }
        return FWSceneManager._instance;
    }
    private _queue:ISceneQueueData[] = [];
    private _bLoading:boolean = false;

    changeScene(bundleName: string, sceneName: string) {
        this._queue.push({
            bundleName: bundleName,
            sceneName: sceneName,
        });
    }

    update(deltaTime: number) {
        if(!this._bLoading) {
            this._autoLoadScene()
        }
    }

    private async _autoLoadScene() {
        let data = this._queue.shift();
        if(data) {
            this._bLoading = true;
            let scene = await this._LoadScene(data);
            director.runScene(scene);
            this._bLoading = false;
        }
    }

    private async _LoadScene(data:ISceneQueueData) {
        let {bundleName,sceneName} = data;
        let bundle = await func.doPromise<FWBundle>((resolve,reject) => {
            app.manager.asset.loadBundle({
                name:bundleName,
                onComplete:(err: Error, bundle:FWBundle)=>{
                    if(err) {
                        reject(err)
                    }else {
                        resolve(bundle)
                    }
                }
            });
        })
        let sceneData = await func.doPromise<ISceneData>((resolve,reject) => {
            if(bundle.bundle.getInfoWithPath(sceneName,JsonAsset)) {
                bundle.load({
                    paths:sceneName,
                    assetType:JsonAsset,
                    onComplete:(err: Error,data:JsonAsset)=>{
                        if(err) {
                            reject(err)
                        }else {
                            resolve(data.json)
                        }
                    }
                });
            } else {
                resolve({})
            }
        })
        sceneData.bundleName = bundleName;
        sceneData.sceneName = sceneName;
        let {loadPrefab,preloadDirsList=[],preloadList=[]} = sceneData;
        let prefab = constant.default_loadPrefab;
        if (loadPrefab) {
            prefab = await func.doPromise<Prefab>((resolve,reject) => {
                bundle.load({
                    paths:loadPrefab,
                    assetType:Prefab,
                    onComplete:(err: Error,data:Prefab)=>{
                        if(err) {
                            reject(err)
                        }else {
                            resolve(data)
                        }
                    }
                });
            })
        }
        
        let uiLoading:FWUILoading
        if(prefab) {
            let obj = instantiate(prefab);
            uiLoading = obj.getComponent(FWUILoading) ?? obj.addComponent(FWUILoading);
            uiFunc.showLoading(uiLoading);
        }

        let input:Map<string,{
            uuid: string,
            __isNative__: boolean, 
            ext: string, 
            bundle: string
        }> = new Map();

        let assetInfos
        preloadList.forEach(data=>{
            //@ts-ignore 这里是有这个config 的 只是没声明
            assetInfos = bundle.bundle.config.paths.get(data.url);
            assetInfos.forEach(assetInfo=>{
                let {uuid,extension} = assetInfo;
                if(!input.has(uuid)) {
                    input.set(assetInfo.uuid,{ uuid: uuid, __isNative__: false, ext: extension || '.json', bundle: bundleName })
                }
            })
        })

        preloadDirsList.forEach(data=>{
            assetInfos = bundle.bundle.getDirWithPath(data.url)
            assetInfos.forEach(assetInfo=>{
                let {uuid,extension} = assetInfo;
                if(!input.has(uuid)) {
                    input.set(assetInfo.uuid,{ uuid: uuid, __isNative__: false, ext: extension || '.json', bundle: bundleName })
                }
            })
        })

        let assets = await func.doPromise<any>((resolve,reject) => {
            assetManager.loadAny(
                Array.from(input.values()),
                (finished, total, item: AssetManager.RequestItem) => {
                    //加载过程中total会增加因为预设一些资源有依赖项需要加载
                    let newProgress = finished / total;
                    uiLoading?.updateProgress({
                        progress: newProgress,
                        finished: finished,
                        total: total,
                    })
                },
                (err:Error, res) => {
                    if(err) {
                        reject(err);
                    }else {
                        resolve(res);
                    }
                }
            );
        })
        assert(assets,"load asset fail");

        let scene = await func.doPromise<SceneAsset>((resolve,reject) => {
                bundle.bundle.loadScene(sceneName,(err: Error, data: SceneAsset)=>{
                if(err) {
                    reject(err)
                }else {
                    resolve(data)
                }
            });
        })

        uiLoading?.hide();
        return scene;
    }
}


declare global {
    namespace globalThis {
        interface IFWManager {
            scene : FWSceneManager
        }
    }
}
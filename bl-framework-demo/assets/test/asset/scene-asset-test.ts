import { _decorator, assetManager, CCString, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('scene_asset_test')
export class scene_asset_test extends Component {
    @property({type: CCString})
    bundleName: string;

    start() {

    }

    update(deltaTime: number) {
        
    }

    onClickLoad() {
        console.log("onClickLoad");
        app.manager.asset.loadBundle({
            name: this.bundleName,
            onComplete: (err,bundle) => {
                console.log(err,bundle);
            }
        })
    }

    onClickUnload() {
        console.log("onClickUnload");
        app.manager.asset.unloadBundle(this.bundleName);
    }

    
    onClickPrintBundle(target) {
        console.log("onClickPrintBundle");
        console.log(app.manager.asset.bundles);
        console.log(assetManager.bundles);
    }

    onClickLoadAsset(target,path:string) {
        console.log("onClickLoadAsset");
        /** 检测多次调用 */
        for (let index = 0; index < 2; index++) {
            app.manager.asset.getBundle(this.bundleName)?.load({
                paths: path,
                assetType: Prefab,
                onComplete: (err,node:Prefab) => {
                    console.log(err,node,node?.refCount);
                    console.log(app.manager.asset.bundles);
                    console.log(assetManager.bundles);
                }
            })
        }
    }

    onClickUnloadAsset(target,path:string) {
        console.log("onClickUnloadAsset");
        let res = app.manager.asset.getBundle(this.bundleName)?.get(path)
        app.manager.asset.getBundle(this.bundleName)?.release(path,Prefab);
        console.log(res,res?.refCount);
        console.log(app.manager.asset.bundles);
        console.log(assetManager.bundles);
    }

    onClickPrintAssetRefCount(target,path:string) {
        console.log("onClickPrintAssetRefCount");
        let res = app.manager.asset.getBundle(this.bundleName)?.get(path)
        console.log(res,res?.refCount);
    }

    onClickLoadRemote() {
        assetManager.loadBundle('http://192.168.121.31/web-mobile26/assets/AB', {
            version:"900fa"
        }, (err, bundle) => {
            if (err) {
                // reject(err);
            } else {
                console.log(bundle);
                // if (this.bundles.has(bundleName)) {
                //     resolve(this.bundles.get(bundleName));
                // } else {
                //     let fwBundle = new FWBundle(bundle);
                //     this.bundles.set(bundleName,fwBundle);
                //     resolve(fwBundle)
                // }
            }
        });
    }
}



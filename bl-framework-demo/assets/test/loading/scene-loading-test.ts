import { _decorator, Component, instantiate, Node, Pool, Prefab } from 'cc';
import { FWUILoading, FWUILoadingPoolNode } from 'db://bl-framework/ui/FWUILoading';
import { uiFunc } from 'db://bl-framework/common/FWFunction';
import { timer } from 'db://bl-framework/common/FWTimer';
const { ccclass, property } = _decorator;

@ccclass('scene_loading_test')
export class scene_loading_test extends Component {
    private loadPool:Pool<FWUILoading>;
    @property(Prefab)
    loadPrefab:Prefab;

    protected __preload(): void {
        this.loadPool = new Pool(()=>{
            let node = instantiate(this.loadPrefab);
            return node.addComponent(FWUILoadingPoolNode);
        },5,(loading:FWUILoading)=>{
            loading.node.destroy();
        });
    }

    start() {
    }

    update(deltaTime: number) {
        
    }
    /**
     * console调试 cc.find("Canvas")._components[3].onClickShowLoading()
     */
    onClickShowLoading() {
        let loading = this.loadPool.alloc();
        uiFunc.showLoading(loading);
        timer.scheduleOnce(()=>{
            loading.hide({
                bRemove:false
            });
            this.loadPool.free(loading);
        },this,5)
    }

    onDestroy(): void {
        this.loadPool.destroy();
    }
}



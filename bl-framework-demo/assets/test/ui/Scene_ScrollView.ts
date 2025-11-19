import { _decorator, CCString, Component, instantiate, JsonAsset, Label, Node, Prefab } from 'cc';
import { Scene_Items } from './Scene_Items';
const { ccclass, property } = _decorator;

@ccclass('Scene_ScrollView')
export class Scene_ScrollView extends Component {

    @property(Prefab)
    scene_item: Prefab;

    @property(Node)
    content: Node;

    @property(JsonAsset)
    data:JsonAsset

    protected __preload(): void {
        this.setJson(this.data?.json)
    }

    setJson(json: Record<string, any>) {
        this.content.destroyAllChildren()
        if (!json) return;
        json.sceneInfo.forEach((element:string[]) => {
            let node = instantiate(this.scene_item);
            node.getComponent(Scene_Items).setSceneInfo(element[0],element[1]);
            this.content.addChild(node);
        });
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}



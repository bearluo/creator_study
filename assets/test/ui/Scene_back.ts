import { _decorator, CCString, Color, Component, Label, Node, path, Sprite } from 'cc';
import { uiFunc } from 'db://bl-framework/common/FWFunction';
const { ccclass, property } = _decorator;

@ccclass('Scene_back')
export class Scene_back extends Component {

    protected onLoad(): void {
        uiFunc.onClick(this.node,()=>{
            app.manager.scene.changeScene("test", "scene-test");
        })
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

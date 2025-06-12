import { _decorator, CCString, Color, Component, Label, Node, path, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Scene_Items')
export class Scene_Items extends Component {

    @property(Label)
    label_name: Label;

    private _bundle_name: string = "";
    private _scene_name: string = "";

    start() {

    }

    update(deltaTime: number) {
        
    }
    
    setSceneInfo(name: string,scene:string) {
        this._bundle_name = name;
        this._scene_name = path._normalize(scene);
        this.updateLabel();
    }

    onClick() {
        app.manager.scene.changeScene(this._bundle_name,this._scene_name)
    }

    updateLabel() {
        let str = path.join(this._bundle_name,this._scene_name)
        if(this.label_name) {
            this.label_name.string = str
        }
        // this.node.getComponent(Sprite).color = new Color(func.stringToColor(str))
    }
}

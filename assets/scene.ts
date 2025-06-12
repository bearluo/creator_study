import { _decorator, Component, Node } from 'cc';
import { BUILD } from 'cc/env';
import { FWApplication } from 'db://bl-framework/FWApplication';
const { ccclass, property } = _decorator;

@ccclass('scene')
export class scene extends Component {
    start() {
        // if (BUILD) {
        //     new FWApplication();
        // }
        app.manager.scene.changeScene("test", "scene-test");
    }

    update(deltaTime: number) {
        
    }
}



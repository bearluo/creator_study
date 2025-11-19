import { _decorator, Component, Node } from 'cc';
import { BUILD } from 'cc/env';
import { FWApplication } from 'db://bl-framework/FWApplication';
import { initApplication } from 'db://bl-framework/FWDebug';
const { ccclass, property } = _decorator;

@ccclass('scene')
export class scene extends Component {
    start() {
        if (BUILD) {
            initApplication();
        }
        app.manager.scene.changeScene("test", "scene-test");
    }

    update(deltaTime: number) {
        
    }
}



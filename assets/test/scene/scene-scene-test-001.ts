import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('scene_scene_test_001')
export class scene_scene_test_001 extends Component {
    start() {
    }

    update(deltaTime: number) {
        
    }

    onClickChangeScene() {
        app.manager.scene.changeScene("test","scene/scene-scene-test")
    }
}



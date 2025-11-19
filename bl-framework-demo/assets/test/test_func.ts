import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class test_func {
    static gotoTestScene() {
        app.manager.scene.changeScene("test", "scene-test");
    }
}
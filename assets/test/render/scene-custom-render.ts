import { _decorator, Component, Node } from 'cc';
import { ScrollViewContent } from './ScrollViewContent';
const { ccclass, property,type } = _decorator;

@ccclass('scene_custom_render')
export class scene_custom_render extends Component {

    @type(ScrollViewContent)
    content:ScrollViewContent = null;
    // 目前只能通过改孩子节点去实现drawcall 优化
    start() {
        this.content.updateList(new Array(100))
    }

    update(deltaTime: number) {
        
    }
}



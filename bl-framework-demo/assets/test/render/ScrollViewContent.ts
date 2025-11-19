import { _decorator, CCInteger, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property ,type, executeInEditMode} = _decorator;

@ccclass('ScrollViewContent')
export class ScrollViewContent extends Component {

    @type(Prefab)
    prefab: Prefab = null;
    @type(Node)
    item: Node = null;

    initListener:(index: number, node: Node, data: any) => void

    protected onLoad(): void {
        this.item ??= instantiate(this.prefab);
        this.item.parent = null;
    }

    start() {

    }

    updateList(list: any[]) {
        this.node.destroyAllChildren();
        for (let i = 0; i < list.length; i++) {
            const data = list[i];
            const node = instantiate(this.item);
            node.parent = this.node;
            node.active= true;
            this.initListener?.(i,node,data)
        }
    }

    addItem(data:any) {
        let index = this.node.children.length;
        const node = instantiate(this.item);
        node.parent = this.node;
        node.active= true;
        this.initListener?.(index,node,data)
    }

    update(deltaTime: number) {
        
    }

    onDestroy() {
        this.item?.destroy();
    }
}



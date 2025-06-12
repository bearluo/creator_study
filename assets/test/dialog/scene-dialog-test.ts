import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { FWUIDialog } from 'db://bl-framework/ui/FWUIDialog';
import { qAsset } from 'db://bl-framework/common/FWFunction';
import { static_dialog } from './dialog';
const { ccclass, property } = _decorator;

@ccclass('scene_dialog_test')
export class scene_dialog_test extends Component {
    start() {
        app.manager.asset.loadBundle({
            name: "test",
        })
    }

    update(deltaTime: number) {
        
    }

    async showDialog1(){
        // qAsset.getAsset("test","dialog/Dialog1",Prefab).then((res)=>{
        //     let node = instantiate(res);
        //     let uiDialog = node.getComponent(FWUIDialog) ?? node.addComponent(FWUIDialog);
        //     static_dialog.uiDialog1 = uiDialog;
        //     app.manager.ui.showDialog(uiDialog);
        // })
        static_dialog.uiDialog1 = await app.manager.ui.showDialog({
            bundleName:"test",
            path:"dialog/Dialog1",
        })
    }

    showDialog2(){
        qAsset.loadAsset("test","dialog/Dialog2",Prefab).then((res)=>{
            let node = instantiate(res);
            let uiDialog = node.getComponent(FWUIDialog) ?? node.addComponent(FWUIDialog);
            static_dialog.uiDialog2 = uiDialog;
            uiDialog.show();
            // app.manager.ui.showDialog(uiDialog);
        })
    }
}



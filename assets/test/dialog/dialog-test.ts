import { _decorator, assert, Component, Node } from 'cc';
import { FWUIDialog } from 'db://bl-framework/ui/FWUIDialog';
import { static_dialog } from './dialog';
const { ccclass, property } = _decorator;

@ccclass('dialog_test')
export class dialog_test extends Component {
    uiDialog: FWUIDialog;

    start() {
        this.uiDialog = this.node.getComponent(FWUIDialog);
    }

    onCloseClick() {
        assert(this.uiDialog != null,"uiDialog is null");
        this.uiDialog.onClickClose();
    }

    onCloseDialog1() {
        let dialog = static_dialog.uiDialog1;
        dialog?.isValid && dialog.hide();
    }

    update(deltaTime: number) {
        
    }
}



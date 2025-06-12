import { _decorator, Component, Label, Node, ProgressBar, tween } from 'cc';
import { FWUILoading, FWUILoadingAnim, IProgressData } from 'db://bl-framework/ui/FWUILoading';
const { ccclass, property } = _decorator;

@ccclass('custiomLoading')
export class custiomLoading extends FWUILoading {
    @property(Label)
    lable:Label

    @property(ProgressBar)
    progressBar:ProgressBar

    start() {
        super.start();
    }

    update(deltaTime: number) {
        
    }

    updateProgress(data:IProgressData) {
        let {progress,finished,total} = data
        if (this.lable)
            this.lable.string = `${finished}/${total}`
        if (this.progressBar)
            this.progressBar.progress = progress;
    }
}


import { _decorator, Asset } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 自定义 JSON 配置资源
 */
@ccclass('MyConfigAsset')
export class MyConfigAsset extends Asset {

    @property({ multiline: true })
    text: string = '';

    get json() {
        try {
            return JSON.parse(this.text);
        } catch {
            return null;
        }
    }
}

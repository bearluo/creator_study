
import { join } from 'path';
import myConfig  from './my-config';
module.paths.push(join(Editor.App.path, 'node_modules'));

const { Asset, Importer } = require('@editor/asset-db');


export class MyConfig380 extends Importer {

    // 引擎内对应的类型
    get assetType() {
        return myConfig.assetType;
    }

    get version() {
        return myConfig.version;
    }

    get name() {
        return myConfig.name;
    }

    get migrations() {
        return myConfig.migrations;
    }

    /**
     * 返回是否导入成功的标记
     * 如果返回 false，则 imported 标记不会变成 true
     * 后续的一系列操作都不会执行
     * @param asset
     */
    // @ts-expect-error
    public async import(asset: Asset) {
        // try {
        //     await generateEffectAsset(asset, await shaderGraph.generateEffectByAsset(asset));
        //     return true;
        // } catch (e) {
        //     console.error(e);
        //     return false;
        // }
    }
}

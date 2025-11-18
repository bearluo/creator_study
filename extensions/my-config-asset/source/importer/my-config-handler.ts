import { writeFileSync } from 'fs-extra';
import { join } from 'path';
import myConfig from './my-config';

module.paths.push(join(Editor.App.path, 'node_modules'));

const { Asset } = require('@editor/asset-db');

const ShaderGraphHandler = {

    name: myConfig.name,

    extends: 'json',

    assetType: myConfig.assetType,

    iconInfo: {
        default: {
            type: 'image',
            value: 'packages://my-config-asset/static/asset-icon.png',
        },
    },

    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: `创建配置`,
                    fullFileName: 'New My Config.myconfig',
                    template: 'db://test.shadergraph', // 无用
                    // submenu: [
                    //     {
                    //         label: 'Surface',
                    //         fullFileName: 'New Shader Graph.shadergraph',
                    //         template: 'Surface', // 无用
                    //     },
                    //     {
                    //         label: 'Unlit',
                    //         fullFileName: 'New Shader Graph.shadergraph',
                    //         template: 'Unlit', // 无用
                    //     },
                    // ],
                },
            ];
        },
        async create(options: { target: string, template: string }): Promise<string | null> {
            try {
                console.log('create', options);
                let shaderGraph = '{}';
                writeFileSync(options.target, shaderGraph);
            } catch (e) {
                console.error(e);
            }
            return options.target;
        },
    },

    // @ts-expect-error
    async open(asset: Asset): Promise<boolean> {
        Editor.Message.send('shader-graph', 'open', asset.uuid);
        return true;
    },

    importer: {
        version: "1.0.0",

        migrations: [],

        // @ts-expect-error
        async before(asset: Asset) {
            return true;
        },

        // @ts-expect-error
        async after(asset: Asset) {
            return true;
        },
    },
};

export default ShaderGraphHandler;

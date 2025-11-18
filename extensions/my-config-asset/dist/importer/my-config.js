"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyConfig = void 0;
const path_1 = require("path");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const { Asset } = require('@editor/asset-db');
const VectorDataType = [
    'float',
    'vec2',
    'vec3',
    'vec4',
    'color',
    'enum',
    'boolean',
];
class MyConfig {
    constructor() {
        this.shaderNodeClassMap = new Map;
        /**
         * 用于存储每个 asset 对应的 source
         * 导入前先换成，把 source 替换成 temp 路径下的 effect
         * 导入后在替换成原本的 source
         */
        this.cacheSourceMap = new Map();
        this._initedGraph = false;
    }
    get assetType() {
        return 'MyConfigAsset';
    }
    get version() {
        return '1.0.0';
    }
    get name() {
        return 'my-config';
    }
    get migrations() {
        return [];
    }
    reset() {
        this._initedGraph = false;
    }
    // async initGraph() {
    //     if (this._initedGraph && this.shaderContext?.shaderTemplatesDir) {
    //         return;
    //     }
    //     await Editor.Module.importProjectModule('db://shader-graph/operation/index.ts');
    //     const { ShaderProperty } = await Editor.Module.importProjectModule('db://shader-graph/operation/property.ts') as any;
    //     this.ShaderProperty = ShaderProperty;
    //     const { shaderNodeMap, shaderPropertyMap, shaderNodeClassMap } = await Editor.Module.importProjectModule('db://shader-graph/graph/index.ts') as IModuleOptions;
    //     const { shaderContext } = await Editor.Module.importProjectModule('db://shader-graph/operation/context.ts') as any;
    //     declareShaderNodeBlock(shaderNodeMap);
    //     this.shaderNodeClassMap = shaderNodeClassMap;
    //     this.shaderContext = shaderContext;
    //     shaderContext.shaderTemplatesDir = await Editor.Message.request('asset-db', 'query-path', 'db://shader-graph/../compile-shader/shader-templates') as string;
    //     // shaderContext.shaderTemplatesDir = queryPath('db://shader-graph/../compile-shader/shader-templates');
    //     this._initedGraph = true;
    // }
    // createShaderNodes(blockMap: {
    //     [uuid: string]: Block;
    // }) {
    //     const shaderNodeClassMap = this.shaderNodeClassMap;
    //     const shaderContext = this.shaderContext;
    //     for (const uuid in blockMap) {
    //         const block = blockMap[uuid];
    //         if (!block.desc) continue;
    //         const type = block.desc.type;
    //         let shaderNode = (block as any).shaderNode;
    //         if (!shaderNode) {
    //             const cls = shaderNodeClassMap.get(type);
    //             if (!cls) {
    //                 console.error(`Can not find type for ${type}`);
    //             }
    //             shaderNode = new cls();
    //             shaderNode.init();
    //             shaderNode.block = block;
    //             if (!shaderContext.allNodes.includes(shaderNode)) {
    //                 shaderContext.allNodes.push(shaderNode);
    //             }
    //             if (type === 'RegisterLocalVar') {
    //                 if (!shaderContext.localVars.includes(shaderNode)) {
    //                     shaderNode.name = block.getInputPinsList()[1].value.value;
    //                     shaderContext.localVars.push(shaderNode);
    //                 }
    //             }
    //             if (type === 'GetLocalVar') {
    //                 if (!shaderContext.getLocalVars.includes(shaderNode)) {
    //                     shaderNode.name = block.getInputPinsList()[0].value.value;
    //                     shaderContext.getLocalVars.push(shaderNode);
    //                 }
    //             }
    //             if (type === 'PropertyNode') {
    //                 shaderNode.name = block.block.details.title;
    //             }
    //             const inputPins = block.getInputPinsList();
    //             for (let i = 0; i < inputPins.length; i++) {
    //                 const pin = inputPins[i];
    //                 const value = pin.value;
    //                 const input = shaderNode.inputs[i];
    //                 let slot = shaderNode.getSlotWithSlotName(pin.desc.name);
    //                 if (!slot) {
    //                     slot = shaderNode.getPropWithName(pin.desc.name);
    //                 }
    //                 if (VectorDataType.includes(value.dataType)) {
    //                     if (slot) {
    //                         if (typeof value.value === 'number' || typeof value.value === 'boolean') {
    //                             slot.value = value.value;
    //                         }
    //                         else if (value.dataType === 'color') {
    //                             // srgb to linear
    //                             slot.value.set(
    //                                 value.value.x * value.value.x,
    //                                 value.value.y * value.value.y,
    //                                 value.value.z * value.value.z,
    //                                 value.value.w,
    //                             );
    //                         }
    //                         else if (value.dataType === 'enum') {
    //                             slot.value = value.value;
    //                         }
    //                         else if (value.dataType === 'dynamicEnum') {
    //                             // TODO
    //                         }
    //                         else {
    //                             slot.value.set(value.value);
    //                         }
    //                     }
    //                 }
    //             }
    //             (block as any).shaderNode = shaderNode;
    //         }
    //     }
    // }
    // searchInputs(block: Block) {
    //     const shaderNode = (block as any).shaderNode;
    //     const inputList = block.getInputPinsList();
    //     for (let i = 0; i < inputList.length; i++) {
    //         const pin = inputList[i];
    //         if (!shaderNode.inputs[i]) {
    //             continue;
    //         }
    //         const connectPin = pin.connectPins[0];
    //         if (connectPin) {
    //             const connectBlock = connectPin.block;
    //             const connectShaderNode = (connectBlock as any).shaderNode;
    //             const connectOutIdx = connectPin.block.getOutputPinsList().indexOf(connectPin);
    //             const connectSlot = connectShaderNode.outputs[connectOutIdx];
    //             shaderNode.inputs[i].connectSlots[0] = connectSlot;
    //             connectSlot.connectSlots.push(shaderNode.inputs[i]);
    //             this.searchInputs(connectBlock);
    //         }
    //         else {
    //             shaderNode.inputs[i].connectSlots.length = 0;
    //         }
    //     }
    // }
    // public async generateMasterNode(graphData: GraphData) {
    //     await this.initGraph();
    //     const forge = new Forge(graphData);
    //     const graph = forge.getGraph();
    //     this.shaderContext.reset();
    //     // TODO 这里还需要处理子图的 properties
    //     const properties = graph.details.properties;
    //     if (properties) {
    //         properties.forEach((v: any) => {
    //             const prop = new this.ShaderProperty(v.type);
    //             prop.name = v.name;
    //             prop.setValue(v.outputPins[0].value);
    //             this.shaderContext.properties.push(prop);
    //         });
    //     }
    //     const blockMap = graph.getBlockMap();
    //     await this.createShaderNodes(blockMap);
    //     let masterBlock;
    //     for (const uuid in blockMap) {
    //         const block = blockMap[uuid];
    //         if (!block.desc) continue;
    //         const type = block.desc.type;
    //         if (type.includes('MasterNode')) {
    //             masterBlock = block;
    //         }
    //     }
    //     if (!masterBlock) {
    //         throw new Error('Can not find MasterBlock');
    //     }
    //     for (let i = 0; i < this.shaderContext.localVars.length; i++) {
    //         const locVar = this.shaderContext.localVars[i];
    //         await this.searchInputs(locVar.block);
    //     }
    //     await this.searchInputs(masterBlock);
    //     const masterNode = (masterBlock as any).shaderNode;
    //     return masterNode;
    // }
    // public async generateEffectByGraphData(graphData: GraphData) {
    //     const masterNode = await this.generateMasterNode(graphData);
    //     return masterNode.generateCode();
    // }
    // // @ts-expect-error
    // public async generateEffectByAsset(asset: Asset) {
    //     const serializeYAML = await readFile(asset.source, 'utf8');
    //     const graphData = load(serializeYAML) as GraphData;
    //     const code = await this.generateEffectByGraphData(graphData);
    //     ensureDirSync(this.tempEffectCodeDir);
    //     await writeFile(this.getTempEffectCodePath(asset), code);
    //     return code;
    // }
    /**
     * 获取存储 effect code 文件夹
     */
    // @ts-expect-error
    getTempEffectCodePath(asset) {
        return (0, path_1.join)(this.tempEffectCodeDir, `${asset.uuid}.effect`);
    }
    /**
     * 获取存储 effect code 路径
     */
    get tempEffectCodeDir() {
        return (0, path_1.join)(Editor.Project.tmpDir, `shader-graph`);
    }
    /**
     * 返回是否导入成功的标记
     * 如果返回 false，则 imported 标记不会变成 true
     * 后续的一系列操作都不会执行
     * @param asset
     */
    // @ts-expect-error
    async import(asset) {
        // await generateEffectAsset(asset, await this.generateEffectByAsset(asset));
        return true;
    }
}
exports.MyConfig = MyConfig;
exports.default = new MyConfig();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2ltcG9ydGVyL215LWNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBNEI7QUFJNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBQSxXQUFJLEVBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUV6RCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFOUMsTUFBTSxjQUFjLEdBQUc7SUFDbkIsT0FBTztJQUNQLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE9BQU87SUFDUCxNQUFNO0lBQ04sU0FBUztDQUNaLENBQUM7QUFFRixNQUFhLFFBQVE7SUFBckI7UUFrQkksdUJBQWtCLEdBQXFCLElBQUksR0FBRyxDQUFDO1FBSS9DOzs7O1dBSUc7UUFDSSxtQkFBYyxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXZELGlCQUFZLEdBQUcsS0FBSyxDQUFDO0lBd096QixDQUFDO0lBblFHLElBQUksU0FBUztRQUNULE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDUCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQWVELEtBQUs7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUM5QixDQUFDO0lBRUQsc0JBQXNCO0lBQ3RCLHlFQUF5RTtJQUN6RSxrQkFBa0I7SUFDbEIsUUFBUTtJQUVSLHVGQUF1RjtJQUV2Riw0SEFBNEg7SUFDNUgsNENBQTRDO0lBRTVDLHNLQUFzSztJQUV0SywwSEFBMEg7SUFD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QUFpRTtJQUNqRSxtRUFBbUU7SUFDbkUsd0NBQXdDO0lBQ3hDLElBQUk7SUFFSixzQkFBc0I7SUFDdEIscURBQXFEO0lBQ3JELGtFQUFrRTtJQUVsRSwwREFBMEQ7SUFFMUQsb0VBQW9FO0lBRXBFLDZDQUE2QztJQUM3QyxnRUFBZ0U7SUFDaEUsbUJBQW1CO0lBQ25CLElBQUk7SUFFSjs7T0FFRztJQUNILG1CQUFtQjtJQUNaLHFCQUFxQixDQUFDLEtBQVk7UUFDckMsT0FBTyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFXLGlCQUFpQjtRQUN4QixPQUFPLElBQUEsV0FBSSxFQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILG1CQUFtQjtJQUNaLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtRQUM1Qiw2RUFBNkU7UUFDN0UsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBclFELDRCQXFRQztBQUVELGtCQUFlLElBQUksUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGxvYWQgfSBmcm9tICdqcy15YW1sJztcclxuaW1wb3J0IHsgZW5zdXJlRGlyU3luYywgcmVhZEZpbGUsIHdyaXRlRmlsZSwgZXhpc3RzU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcclxuXHJcbm1vZHVsZS5wYXRocy5wdXNoKGpvaW4oRWRpdG9yLkFwcC5wYXRoLCAnbm9kZV9tb2R1bGVzJykpO1xyXG5cclxuY29uc3QgeyBBc3NldCB9ID0gcmVxdWlyZSgnQGVkaXRvci9hc3NldC1kYicpO1xyXG5cclxuY29uc3QgVmVjdG9yRGF0YVR5cGUgPSBbXHJcbiAgICAnZmxvYXQnLFxyXG4gICAgJ3ZlYzInLFxyXG4gICAgJ3ZlYzMnLFxyXG4gICAgJ3ZlYzQnLFxyXG4gICAgJ2NvbG9yJyxcclxuICAgICdlbnVtJyxcclxuICAgICdib29sZWFuJyxcclxuXTtcclxuXHJcbmV4cG9ydCBjbGFzcyBNeUNvbmZpZyB7XHJcblxyXG4gICAgZ2V0IGFzc2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gJ015Q29uZmlnQXNzZXQnO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2ZXJzaW9uKCkge1xyXG4gICAgICAgIHJldHVybiAnMS4wLjAnO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiAnbXktY29uZmlnJztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWlncmF0aW9ucygpIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgc2hhZGVyTm9kZUNsYXNzTWFwOiBNYXA8c3RyaW5nLCBhbnk+ID0gbmV3IE1hcDtcclxuICAgIHNoYWRlckNvbnRleHQ6IGFueTtcclxuICAgIFNoYWRlclByb3BlcnR5OiBhbnk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnlKjkuo7lrZjlgqjmr4/kuKogYXNzZXQg5a+55bqU55qEIHNvdXJjZVxyXG4gICAgICog5a+85YWl5YmN5YWI5o2i5oiQ77yM5oqKIHNvdXJjZSDmm7/mjaLmiJAgdGVtcCDot6/lvoTkuIvnmoQgZWZmZWN0XHJcbiAgICAgKiDlr7zlhaXlkI7lnKjmm7/mjaLmiJDljp/mnKznmoQgc291cmNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjYWNoZVNvdXJjZU1hcDogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICBfaW5pdGVkR3JhcGggPSBmYWxzZTtcclxuXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLl9pbml0ZWRHcmFwaCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFzeW5jIGluaXRHcmFwaCgpIHtcclxuICAgIC8vICAgICBpZiAodGhpcy5faW5pdGVkR3JhcGggJiYgdGhpcy5zaGFkZXJDb250ZXh0Py5zaGFkZXJUZW1wbGF0ZXNEaXIpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgYXdhaXQgRWRpdG9yLk1vZHVsZS5pbXBvcnRQcm9qZWN0TW9kdWxlKCdkYjovL3NoYWRlci1ncmFwaC9vcGVyYXRpb24vaW5kZXgudHMnKTtcclxuXHJcbiAgICAvLyAgICAgY29uc3QgeyBTaGFkZXJQcm9wZXJ0eSB9ID0gYXdhaXQgRWRpdG9yLk1vZHVsZS5pbXBvcnRQcm9qZWN0TW9kdWxlKCdkYjovL3NoYWRlci1ncmFwaC9vcGVyYXRpb24vcHJvcGVydHkudHMnKSBhcyBhbnk7XHJcbiAgICAvLyAgICAgdGhpcy5TaGFkZXJQcm9wZXJ0eSA9IFNoYWRlclByb3BlcnR5O1xyXG5cclxuICAgIC8vICAgICBjb25zdCB7IHNoYWRlck5vZGVNYXAsIHNoYWRlclByb3BlcnR5TWFwLCBzaGFkZXJOb2RlQ2xhc3NNYXAgfSA9IGF3YWl0IEVkaXRvci5Nb2R1bGUuaW1wb3J0UHJvamVjdE1vZHVsZSgnZGI6Ly9zaGFkZXItZ3JhcGgvZ3JhcGgvaW5kZXgudHMnKSBhcyBJTW9kdWxlT3B0aW9ucztcclxuXHJcbiAgICAvLyAgICAgY29uc3QgeyBzaGFkZXJDb250ZXh0IH0gPSBhd2FpdCBFZGl0b3IuTW9kdWxlLmltcG9ydFByb2plY3RNb2R1bGUoJ2RiOi8vc2hhZGVyLWdyYXBoL29wZXJhdGlvbi9jb250ZXh0LnRzJykgYXMgYW55O1xyXG4gICAgLy8gICAgIGRlY2xhcmVTaGFkZXJOb2RlQmxvY2soc2hhZGVyTm9kZU1hcCk7XHJcblxyXG4gICAgLy8gICAgIHRoaXMuc2hhZGVyTm9kZUNsYXNzTWFwID0gc2hhZGVyTm9kZUNsYXNzTWFwO1xyXG4gICAgLy8gICAgIHRoaXMuc2hhZGVyQ29udGV4dCA9IHNoYWRlckNvbnRleHQ7XHJcblxyXG4gICAgLy8gICAgIHNoYWRlckNvbnRleHQuc2hhZGVyVGVtcGxhdGVzRGlyID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktcGF0aCcsICdkYjovL3NoYWRlci1ncmFwaC8uLi9jb21waWxlLXNoYWRlci9zaGFkZXItdGVtcGxhdGVzJykgYXMgc3RyaW5nO1xyXG4gICAgLy8gICAgIC8vIHNoYWRlckNvbnRleHQuc2hhZGVyVGVtcGxhdGVzRGlyID0gcXVlcnlQYXRoKCdkYjovL3NoYWRlci1ncmFwaC8uLi9jb21waWxlLXNoYWRlci9zaGFkZXItdGVtcGxhdGVzJyk7XHJcbiAgICAvLyAgICAgdGhpcy5faW5pdGVkR3JhcGggPSB0cnVlO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIGNyZWF0ZVNoYWRlck5vZGVzKGJsb2NrTWFwOiB7XHJcbiAgICAvLyAgICAgW3V1aWQ6IHN0cmluZ106IEJsb2NrO1xyXG4gICAgLy8gfSkge1xyXG4gICAgLy8gICAgIGNvbnN0IHNoYWRlck5vZGVDbGFzc01hcCA9IHRoaXMuc2hhZGVyTm9kZUNsYXNzTWFwO1xyXG4gICAgLy8gICAgIGNvbnN0IHNoYWRlckNvbnRleHQgPSB0aGlzLnNoYWRlckNvbnRleHQ7XHJcblxyXG4gICAgLy8gICAgIGZvciAoY29uc3QgdXVpZCBpbiBibG9ja01hcCkge1xyXG4gICAgLy8gICAgICAgICBjb25zdCBibG9jayA9IGJsb2NrTWFwW3V1aWRdO1xyXG4gICAgLy8gICAgICAgICBpZiAoIWJsb2NrLmRlc2MpIGNvbnRpbnVlO1xyXG4gICAgLy8gICAgICAgICBjb25zdCB0eXBlID0gYmxvY2suZGVzYy50eXBlO1xyXG5cclxuICAgIC8vICAgICAgICAgbGV0IHNoYWRlck5vZGUgPSAoYmxvY2sgYXMgYW55KS5zaGFkZXJOb2RlO1xyXG4gICAgLy8gICAgICAgICBpZiAoIXNoYWRlck5vZGUpIHtcclxuICAgIC8vICAgICAgICAgICAgIGNvbnN0IGNscyA9IHNoYWRlck5vZGVDbGFzc01hcC5nZXQodHlwZSk7XHJcbiAgICAvLyAgICAgICAgICAgICBpZiAoIWNscykge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENhbiBub3QgZmluZCB0eXBlIGZvciAke3R5cGV9YCk7XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICBzaGFkZXJOb2RlID0gbmV3IGNscygpO1xyXG4gICAgLy8gICAgICAgICAgICAgc2hhZGVyTm9kZS5pbml0KCk7XHJcbiAgICAvLyAgICAgICAgICAgICBzaGFkZXJOb2RlLmJsb2NrID0gYmxvY2s7XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgaWYgKCFzaGFkZXJDb250ZXh0LmFsbE5vZGVzLmluY2x1ZGVzKHNoYWRlck5vZGUpKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgc2hhZGVyQ29udGV4dC5hbGxOb2Rlcy5wdXNoKHNoYWRlck5vZGUpO1xyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdSZWdpc3RlckxvY2FsVmFyJykge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIGlmICghc2hhZGVyQ29udGV4dC5sb2NhbFZhcnMuaW5jbHVkZXMoc2hhZGVyTm9kZSkpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgc2hhZGVyTm9kZS5uYW1lID0gYmxvY2suZ2V0SW5wdXRQaW5zTGlzdCgpWzFdLnZhbHVlLnZhbHVlO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBzaGFkZXJDb250ZXh0LmxvY2FsVmFycy5wdXNoKHNoYWRlck5vZGUpO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgIGlmICh0eXBlID09PSAnR2V0TG9jYWxWYXInKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgaWYgKCFzaGFkZXJDb250ZXh0LmdldExvY2FsVmFycy5pbmNsdWRlcyhzaGFkZXJOb2RlKSkge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBzaGFkZXJOb2RlLm5hbWUgPSBibG9jay5nZXRJbnB1dFBpbnNMaXN0KClbMF0udmFsdWUudmFsdWU7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHNoYWRlckNvbnRleHQuZ2V0TG9jYWxWYXJzLnB1c2goc2hhZGVyTm9kZSk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdQcm9wZXJ0eU5vZGUnKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgc2hhZGVyTm9kZS5uYW1lID0gYmxvY2suYmxvY2suZGV0YWlscy50aXRsZTtcclxuICAgIC8vICAgICAgICAgICAgIH1cclxuXHJcbiAgICAvLyAgICAgICAgICAgICBjb25zdCBpbnB1dFBpbnMgPSBibG9jay5nZXRJbnB1dFBpbnNMaXN0KCk7XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dFBpbnMubGVuZ3RoOyBpKyspIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCBwaW4gPSBpbnB1dFBpbnNbaV07XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwaW4udmFsdWU7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBzaGFkZXJOb2RlLmlucHV0c1tpXTtcclxuXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgbGV0IHNsb3QgPSBzaGFkZXJOb2RlLmdldFNsb3RXaXRoU2xvdE5hbWUocGluLmRlc2MubmFtZSk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgaWYgKCFzbG90KSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHNsb3QgPSBzaGFkZXJOb2RlLmdldFByb3BXaXRoTmFtZShwaW4uZGVzYy5uYW1lKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgICAgIGlmIChWZWN0b3JEYXRhVHlwZS5pbmNsdWRlcyh2YWx1ZS5kYXRhVHlwZSkpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgaWYgKHNsb3QpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUudmFsdWUgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2YWx1ZS52YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2xvdC52YWx1ZSA9IHZhbHVlLnZhbHVlO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUuZGF0YVR5cGUgPT09ICdjb2xvcicpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzcmdiIHRvIGxpbmVhclxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsb3QudmFsdWUuc2V0KFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS52YWx1ZS54ICogdmFsdWUudmFsdWUueCxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUudmFsdWUueSAqIHZhbHVlLnZhbHVlLnksXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnZhbHVlLnogKiB2YWx1ZS52YWx1ZS56LFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS52YWx1ZS53LFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZS5kYXRhVHlwZSA9PT0gJ2VudW0nKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2xvdC52YWx1ZSA9IHZhbHVlLnZhbHVlO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUuZGF0YVR5cGUgPT09ICdkeW5hbWljRW51bScpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbG90LnZhbHVlLnNldCh2YWx1ZS52YWx1ZSk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgKGJsb2NrIGFzIGFueSkuc2hhZGVyTm9kZSA9IHNoYWRlck5vZGU7XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gc2VhcmNoSW5wdXRzKGJsb2NrOiBCbG9jaykge1xyXG4gICAgLy8gICAgIGNvbnN0IHNoYWRlck5vZGUgPSAoYmxvY2sgYXMgYW55KS5zaGFkZXJOb2RlO1xyXG4gICAgLy8gICAgIGNvbnN0IGlucHV0TGlzdCA9IGJsb2NrLmdldElucHV0UGluc0xpc3QoKTtcclxuICAgIC8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0TGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gICAgICAgICBjb25zdCBwaW4gPSBpbnB1dExpc3RbaV07XHJcbiAgICAvLyAgICAgICAgIGlmICghc2hhZGVyTm9kZS5pbnB1dHNbaV0pIHtcclxuICAgIC8vICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgLy8gICAgICAgICB9XHJcblxyXG4gICAgLy8gICAgICAgICBjb25zdCBjb25uZWN0UGluID0gcGluLmNvbm5lY3RQaW5zWzBdO1xyXG4gICAgLy8gICAgICAgICBpZiAoY29ubmVjdFBpbikge1xyXG4gICAgLy8gICAgICAgICAgICAgY29uc3QgY29ubmVjdEJsb2NrID0gY29ubmVjdFBpbi5ibG9jaztcclxuICAgIC8vICAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RTaGFkZXJOb2RlID0gKGNvbm5lY3RCbG9jayBhcyBhbnkpLnNoYWRlck5vZGU7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25zdCBjb25uZWN0T3V0SWR4ID0gY29ubmVjdFBpbi5ibG9jay5nZXRPdXRwdXRQaW5zTGlzdCgpLmluZGV4T2YoY29ubmVjdFBpbik7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25zdCBjb25uZWN0U2xvdCA9IGNvbm5lY3RTaGFkZXJOb2RlLm91dHB1dHNbY29ubmVjdE91dElkeF07XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgc2hhZGVyTm9kZS5pbnB1dHNbaV0uY29ubmVjdFNsb3RzWzBdID0gY29ubmVjdFNsb3Q7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25uZWN0U2xvdC5jb25uZWN0U2xvdHMucHVzaChzaGFkZXJOb2RlLmlucHV0c1tpXSk7XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5zZWFyY2hJbnB1dHMoY29ubmVjdEJsb2NrKTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICBlbHNlIHtcclxuICAgIC8vICAgICAgICAgICAgIHNoYWRlck5vZGUuaW5wdXRzW2ldLmNvbm5lY3RTbG90cy5sZW5ndGggPSAwO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIHB1YmxpYyBhc3luYyBnZW5lcmF0ZU1hc3Rlck5vZGUoZ3JhcGhEYXRhOiBHcmFwaERhdGEpIHtcclxuICAgIC8vICAgICBhd2FpdCB0aGlzLmluaXRHcmFwaCgpO1xyXG5cclxuICAgIC8vICAgICBjb25zdCBmb3JnZSA9IG5ldyBGb3JnZShncmFwaERhdGEpO1xyXG5cclxuICAgIC8vICAgICBjb25zdCBncmFwaCA9IGZvcmdlLmdldEdyYXBoKCk7XHJcblxyXG4gICAgLy8gICAgIHRoaXMuc2hhZGVyQ29udGV4dC5yZXNldCgpO1xyXG5cclxuICAgIC8vICAgICAvLyBUT0RPIOi/memHjOi/mOmcgOimgeWkhOeQhuWtkOWbvueahCBwcm9wZXJ0aWVzXHJcbiAgICAvLyAgICAgY29uc3QgcHJvcGVydGllcyA9IGdyYXBoLmRldGFpbHMucHJvcGVydGllcztcclxuICAgIC8vICAgICBpZiAocHJvcGVydGllcykge1xyXG4gICAgLy8gICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goKHY6IGFueSkgPT4ge1xyXG4gICAgLy8gICAgICAgICAgICAgY29uc3QgcHJvcCA9IG5ldyB0aGlzLlNoYWRlclByb3BlcnR5KHYudHlwZSk7XHJcbiAgICAvLyAgICAgICAgICAgICBwcm9wLm5hbWUgPSB2Lm5hbWU7XHJcbiAgICAvLyAgICAgICAgICAgICBwcm9wLnNldFZhbHVlKHYub3V0cHV0UGluc1swXS52YWx1ZSk7XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLnNoYWRlckNvbnRleHQucHJvcGVydGllcy5wdXNoKHByb3ApO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IGJsb2NrTWFwID0gZ3JhcGguZ2V0QmxvY2tNYXAoKTtcclxuXHJcbiAgICAvLyAgICAgYXdhaXQgdGhpcy5jcmVhdGVTaGFkZXJOb2RlcyhibG9ja01hcCk7XHJcblxyXG4gICAgLy8gICAgIGxldCBtYXN0ZXJCbG9jaztcclxuICAgIC8vICAgICBmb3IgKGNvbnN0IHV1aWQgaW4gYmxvY2tNYXApIHtcclxuICAgIC8vICAgICAgICAgY29uc3QgYmxvY2sgPSBibG9ja01hcFt1dWlkXTtcclxuICAgIC8vICAgICAgICAgaWYgKCFibG9jay5kZXNjKSBjb250aW51ZTtcclxuICAgIC8vICAgICAgICAgY29uc3QgdHlwZSA9IGJsb2NrLmRlc2MudHlwZTtcclxuICAgIC8vICAgICAgICAgaWYgKHR5cGUuaW5jbHVkZXMoJ01hc3Rlck5vZGUnKSkge1xyXG4gICAgLy8gICAgICAgICAgICAgbWFzdGVyQmxvY2sgPSBibG9jaztcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgaWYgKCFtYXN0ZXJCbG9jaykge1xyXG4gICAgLy8gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgZmluZCBNYXN0ZXJCbG9jaycpO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNoYWRlckNvbnRleHQubG9jYWxWYXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyAgICAgICAgIGNvbnN0IGxvY1ZhciA9IHRoaXMuc2hhZGVyQ29udGV4dC5sb2NhbFZhcnNbaV07XHJcbiAgICAvLyAgICAgICAgIGF3YWl0IHRoaXMuc2VhcmNoSW5wdXRzKGxvY1Zhci5ibG9jayk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICAgIGF3YWl0IHRoaXMuc2VhcmNoSW5wdXRzKG1hc3RlckJsb2NrKTtcclxuXHJcbiAgICAvLyAgICAgY29uc3QgbWFzdGVyTm9kZSA9IChtYXN0ZXJCbG9jayBhcyBhbnkpLnNoYWRlck5vZGU7XHJcbiAgICAvLyAgICAgcmV0dXJuIG1hc3Rlck5vZGU7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gcHVibGljIGFzeW5jIGdlbmVyYXRlRWZmZWN0QnlHcmFwaERhdGEoZ3JhcGhEYXRhOiBHcmFwaERhdGEpIHtcclxuICAgIC8vICAgICBjb25zdCBtYXN0ZXJOb2RlID0gYXdhaXQgdGhpcy5nZW5lcmF0ZU1hc3Rlck5vZGUoZ3JhcGhEYXRhKTtcclxuICAgIC8vICAgICByZXR1cm4gbWFzdGVyTm9kZS5nZW5lcmF0ZUNvZGUoKTtcclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAvLyBwdWJsaWMgYXN5bmMgZ2VuZXJhdGVFZmZlY3RCeUFzc2V0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgLy8gICAgIGNvbnN0IHNlcmlhbGl6ZVlBTUwgPSBhd2FpdCByZWFkRmlsZShhc3NldC5zb3VyY2UsICd1dGY4Jyk7XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IGdyYXBoRGF0YSA9IGxvYWQoc2VyaWFsaXplWUFNTCkgYXMgR3JhcGhEYXRhO1xyXG5cclxuICAgIC8vICAgICBjb25zdCBjb2RlID0gYXdhaXQgdGhpcy5nZW5lcmF0ZUVmZmVjdEJ5R3JhcGhEYXRhKGdyYXBoRGF0YSk7XHJcblxyXG4gICAgLy8gICAgIGVuc3VyZURpclN5bmModGhpcy50ZW1wRWZmZWN0Q29kZURpcik7XHJcbiAgICAvLyAgICAgYXdhaXQgd3JpdGVGaWxlKHRoaXMuZ2V0VGVtcEVmZmVjdENvZGVQYXRoKGFzc2V0KSwgY29kZSk7XHJcbiAgICAvLyAgICAgcmV0dXJuIGNvZGU7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blrZjlgqggZWZmZWN0IGNvZGUg5paH5Lu25aS5XHJcbiAgICAgKi9cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIHB1YmxpYyBnZXRUZW1wRWZmZWN0Q29kZVBhdGgoYXNzZXQ6IEFzc2V0KTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gam9pbih0aGlzLnRlbXBFZmZlY3RDb2RlRGlyLCBgJHthc3NldC51dWlkfS5lZmZlY3RgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluWtmOWCqCBlZmZlY3QgY29kZSDot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB0ZW1wRWZmZWN0Q29kZURpcigpIHtcclxuICAgICAgICByZXR1cm4gam9pbihFZGl0b3IuUHJvamVjdC50bXBEaXIsIGBzaGFkZXItZ3JhcGhgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICog5aaC5p6c6L+U5ZueIGZhbHNl77yM5YiZIGltcG9ydGVkIOagh+iusOS4jeS8muWPmOaIkCB0cnVlXHJcbiAgICAgKiDlkI7nu63nmoTkuIDns7vliJfmk43kvZzpg73kuI3kvJrmiafooYxcclxuICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICovXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICBwdWJsaWMgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgIC8vIGF3YWl0IGdlbmVyYXRlRWZmZWN0QXNzZXQoYXNzZXQsIGF3YWl0IHRoaXMuZ2VuZXJhdGVFZmZlY3RCeUFzc2V0KGFzc2V0KSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBNeUNvbmZpZygpO1xyXG4iXX0=
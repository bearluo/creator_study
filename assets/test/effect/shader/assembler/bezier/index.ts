import { IAssembler, IAssemblerManager, UIRenderer } from "cc";
import { BezierRender } from "../../BezierRender";
import { simple } from "./simple";

const bezierRenderAssembler: IAssemblerManager = {
    getAssembler (spriteComp: UIRenderer) {
        let util: IAssembler = simple;


        return util;
    },

    // Skip invalid sprites (without own _assembler)
    // updateRenderData (sprite) {
    //     return sprite.__allocedDatas;
    // },
};

BezierRender.Assembler = bezierRenderAssembler;

export {
    bezierRenderAssembler,
    simple,
};
/*
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { IAssembler, IRenderData, RenderData, UITransform, Vec2 } from "cc";
import { BezierRender } from "../../BezierRender";

/**
 * @packageDocumentation
 * @module ui-assembler
 */


let QUAD_INDICES = Uint16Array.from([0, 1, 2, 1, 3, 2]);

function resizeUint16Array(oldArray: Uint16Array, newLength: number): Uint16Array {
    const newArray = new Uint16Array(newLength);
    newArray.set(oldArray); // 拷贝旧数据
    return newArray;
  }
  
/**
 * 动态生成索引数组
 * @param segmentCount segment 数量
 * @returns 索引数组
 */
function createQuadIndices(segmentCount: number, indexCount: number): Uint16Array {
    // 如果 segmentCount 不小于 QUAD_INDICES 能表示的个数，则复用老的QUAD_INDICES
    if (indexCount > QUAD_INDICES.length) {
        const old_length = QUAD_INDICES.length;
        const indices = resizeUint16Array(QUAD_INDICES, indexCount);
        QUAD_INDICES = indices;
        // 只填充新扩容的部分
        for (let i = old_length / 6, idx = old_length; i < segmentCount; i++) {
            let vertextID = i * 4;
            indices[idx++] = vertextID;
            indices[idx++] = vertextID + 1;
            indices[idx++] = vertextID + 2;
            indices[idx++] = vertextID + 1;
            indices[idx++] = vertextID + 3;
            indices[idx++] = vertextID + 2;
        }
    }
    // 只需要前面的 indexCount 项即可
    return QUAD_INDICES.subarray(0, indexCount);
}

/**
 * simple 组装器
 * 可通过 `UI.simple` 获取该组装器。
 */
class Simple implements IAssembler {

    createData (comp: BezierRender): RenderData {
        const renderData = comp.requestRenderData();
        let segmentCount = comp.getPointCount() - 1;
        let indexCount: number = 6 * segmentCount;
        // 用来计算本地坐标
        renderData.dataLength = 4 * segmentCount;
        renderData.resize(4 * segmentCount, indexCount);
        // 设置索引数据 - 动态生成索引数组
        let indices = createQuadIndices(segmentCount, indexCount);
        renderData.chunk.setIndexBuffer(indices);
        return renderData;
    }

    updateRenderData (comp: BezierRender): void {
        let pointNum: number = comp.getPointCount()
        if (pointNum < 2) {
            return
        }
        const frame = comp.textureList[0];

        //this.updateColor(sprite);// dirty need
        const renderData = comp.renderData;
        if (renderData) {
            if (renderData.vertDirty) {
                this.updateVertexData(comp);
            }
            renderData.updateRenderData(comp, frame);
        }
    }

    private updateWorldVerts (sprite: BezierRender, chunk: any): void {
        const renderData = sprite.renderData;
        if (!renderData) return;
        const vData = chunk.vb;

        const dataList: IRenderData[] = renderData.data;
        const node = sprite.node;
        const m = node.worldMatrix;

        const m00 = m.m00; const m01 = m.m01; const m02 = m.m02; const m03 = m.m03;
        const m04 = m.m04; const m05 = m.m05; const m06 = m.m06; const m07 = m.m07;
        const m12 = m.m12; const m13 = m.m13; const m14 = m.m14; const m15 = m.m15;

        const stride = renderData.floatStride;
        let offset = 0;
        const length = dataList.length;
        for (let i = 0; i < length; ++i) {
            const curData = dataList[i];
            const x = curData.x;
            const y = curData.y;
            let rhw = m03 * x + m07 * y + m15;
            rhw = rhw ? 1 / rhw : 1;

            offset = i * stride;
            vData[offset + 0] = (m00 * x + m04 * y + m12) * rhw;
            vData[offset + 1] = (m01 * x + m05 * y + m13) * rhw;
            vData[offset + 2] = (m02 * x + m06 * y + m14) * rhw;
        }
    }

    fillBuffers (comp: BezierRender, renderer: any): void {
        if (comp === null) {
            return;
        }

        const renderData = comp.renderData;
        if (!renderData) return;
        const chunk = renderData.chunk;
        if (comp._flagChangedVersion !== comp.node.flagChangedVersion || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            this.updateWorldVerts(comp, chunk);
            renderData.vertDirty = false;
            comp._flagChangedVersion = comp.node.flagChangedVersion;
        }

        // quick version
        const vidOrigin = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = chunk.meshBuffer.iData;
        let indexOffset = meshBuffer.indexOffset;
        let segmentCount = comp.getPointCount() - 1;
        const vid = vidOrigin;

        // 更新索引数据
        for (let i = 0, idx = indexOffset; i < segmentCount; i++) {
            let vertextID = vid + i * 4;
            ib[idx++] = vertextID;
            ib[idx++] = vertextID + 1;
            ib[idx++] = vertextID + 2;
            ib[idx++] = vertextID + 1;
            ib[idx++] = vertextID + 3;
            ib[idx++] = vertextID + 2;
        }

        meshBuffer.indexOffset += 6 * segmentCount;
        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    }

    private updateVertexData (comp: BezierRender): void {
        const renderData: RenderData | null = comp.renderData;
        if (!renderData) {
            return;
        }

        let pointNum: number = comp.getPointCount()
        if (pointNum < 2) {
            return
        }

        let node = comp.node
        const uiTrans:UITransform = (node as any)._getUITransformComp();
        let height = uiTrans.height
        let width = uiTrans.width
        // 左下角的坐标
        let posX = - width * uiTrans.anchorX
        let posY = - height * uiTrans.anchorY
        // 根据角度获得控制点的位置
        let ctrlPosData = this._getCtrlPosByAngle(comp,width)
        let startPos = ctrlPosData.startPos
        let endPos = ctrlPosData.endPos
        let ctrlPos1 = ctrlPosData.ctrlPos1
        let ctrlPos2 = ctrlPosData.ctrlPos2
        // 记录各个顶点的位置
        let bezierPosList: Vec2[] = []
        bezierPosList[0] = startPos
        // 当前所有顶点连线的总长
        let realWidth = 0
        // 上一个点的纹理坐标
        let lastU = 0
        // 下一个点的纹理坐标
        let nextU = 0

        const dataList: IRenderData[] = renderData.data;
        // 写verts时的下标
        let dstOffset = 0;
        for (let i = 1; i < pointNum; i++) {
            let isTail = i === pointNum - 1
            let lastBezierPos = bezierPosList[i - 1]
            let nextBezierPos = this._getBezierPos(i / (pointNum - 1) , startPos, endPos, ctrlPos1, ctrlPos2)
            let fixedData = this._fixWidth(lastBezierPos, nextBezierPos, width, realWidth, isTail)
            let gapWidth = fixedData.gapWidth
            nextBezierPos = fixedData.nextBezierPos
            realWidth += gapWidth
            bezierPosList[i] = nextBezierPos
            // 根据当前小矩形的宽度占总长度的比例来计算纹理坐标的间隔
            let gapU = gapWidth / width
            nextU = lastU + gapU
            /* 
                分别计算小矩形四个顶点的坐标和纹理坐标
                各顶点的坐标计算方法为在左下角坐标的基础上加上顶点在贝塞尔曲线上的坐标，如果是书页顶部的顶点则还要加上书页的高度
            */

            // 将4个顶点数据写入verts
            dataList[dstOffset].x = posX + lastBezierPos.x;
            dataList[dstOffset].y = posY + lastBezierPos.y;
            dataList[dstOffset].u = lastU;
            dataList[dstOffset].v = 1;
            dstOffset++;

            dataList[dstOffset].x = posX + nextBezierPos.x;
            dataList[dstOffset].y = posY + nextBezierPos.y;
            dataList[dstOffset].u = nextU;
            dataList[dstOffset].v = 1;
            dstOffset++;

            dataList[dstOffset].x = posX + lastBezierPos.x;
            dataList[dstOffset].y = posY + height + lastBezierPos.y;
            dataList[dstOffset].u = lastU;
            dataList[dstOffset].v = 0;
            dstOffset++;
        
            dataList[dstOffset].x = posX + nextBezierPos.x;
            dataList[dstOffset].y = posY + height + nextBezierPos.y;
            dataList[dstOffset].u = nextU;
            dataList[dstOffset].v = 0;
            dstOffset++;

            lastU = nextU;
        }
        
        this.updateUVs(comp);// dirty need
        this.updateIsFront(comp);
        renderData.vertDirty = true;
    }

    updateUVs (sprite: BezierRender): void {
        const renderData = sprite.renderData;
        if (!renderData) return;
        const vData = renderData.chunk.vb;
        const stride = renderData.floatStride;
        let uvOffset = 3;
        const dataList: IRenderData[] = renderData.data;
        for (let i = 0; i < renderData.dataLength; ++i) {
            vData[uvOffset] = dataList[i].u;
            vData[uvOffset + 1] = dataList[i].v;
            uvOffset += stride;
        }
    }

    updateColor (sprite: BezierRender): void {
        const renderData = sprite.renderData;
        if (!renderData) return;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (let i = 0; i < renderData.dataLength; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    }

    updateIsFront(comp: BezierRender) {
        const renderData = comp.renderData;
        if (!renderData) return;
        const vData = renderData.chunk.vb;
        let frontOffset = 10;
        let indexOffset = 0;
        let floatStride = renderData.floatStride;
        for (let i = 0; i < renderData.dataLength; i++, frontOffset += floatStride, indexOffset += floatStride) {
            let isFirstVert = i % 2 === 0;
            let firstVertX = isFirstVert ? vData[indexOffset] : vData[indexOffset - floatStride];
            let secondVertX = isFirstVert ? vData[indexOffset + floatStride] : vData[indexOffset];
            let isFront = firstVertX < secondVertX ? 1.0 : 0.0;
            vData[frontOffset] = isFront;
        }
    }

    private _getCtrlPosByAngle(comp: BezierRender, width: number): {startPos: Vec2, endPos: Vec2, ctrlPos1: Vec2, ctrlPos2: Vec2} {
        let angle = comp.angle;
        let startPos = new Vec2(0, 0)
        let endPos = null
        let ctrlPos1 = null
        let ctrlPos2 = null
        let rad = angle * Math.PI / 180
        let per = rad * 2 / Math.PI
        if(angle <= 90) {
            // 终点的x坐标变换 width => 0，速度先慢后快，使用InCubic缓动函数
            let endPosX = width * (1 - Math.pow(per, 3))
            // InCubic
            // 终点的y坐标变换 0 => width / 4, 速度先快后慢，使用OutQuart缓动函数
            let endPosY = width / 4 * (1 - Math.pow(1 - per, 4))
            endPos = new Vec2(endPosX, endPosY)

            // 中间两个控制点坐标匀速变换
            // x坐标 width => width * 3 / 4
            let ctrlPosX = width * (1 - 1 / 4 * per)
            // 控制点1y坐标 0 => width / 16
            let ctrlPos1Y = width * 1 / 16 * per
            // 控制点2y坐标 0 => width * 3 / 16
            let ctrlPos2Y = width * 3 / 16 * per
            ctrlPos1 = new Vec2(ctrlPosX, ctrlPos1Y)
            ctrlPos2 = new Vec2(ctrlPosX, ctrlPos2Y)
        } else {
            per = per - 1
            // 终点的x坐标变换 0 => width，速度先快后慢，使用OutCubic缓动函数
            let endPosX = - width * (1 - Math.pow(1 - per, 3))
            // 终点的y坐标变换 width / 4 => 0, 速度先慢后快，使用InQuart缓动函数
            let endPosY = width / 4 * (1 - Math.pow(per, 4))
            endPos = new Vec2(endPosX, endPosY)

            // 控制点1x坐标 width * 3 / 4 => 0
            let ctrlPos1X = width * 3 / 4 * (1 - per)
            // 控制点2x坐标 width * 3 / 4 => 0
            let ctrlPos2X = width * 3 / 4 * Math.pow(1 - per, 3)
            // 控制点1y坐标 width / 16 => 0
            let ctrlPos1Y = width * 1 / 16 *  (1 - per)
            // 控制点2y坐标 width * 3 / 16 => 0
            let ctrlPos2Y = width * 3 / 16 * (1 - Math.pow(per, 4))
            ctrlPos1 = new Vec2(ctrlPos1X, ctrlPos1Y)
            ctrlPos2 = new Vec2(ctrlPos2X, ctrlPos2Y)
        }

        return {
            startPos: startPos,
            endPos: endPos,
            ctrlPos1: ctrlPos1,
            ctrlPos2: ctrlPos2
        }
    }

    // 修正宽度
    private _fixWidth(lastBezierPos: Vec2, nextBezierPos: Vec2, width: number, realWidth: number, isTail: boolean) {
        let deltaVector = nextBezierPos.clone().subtract(lastBezierPos)
        // 两个顶点的间距
        let gapWidth = deltaVector.length()
        // 当前的总长
        let curWidth = realWidth + gapWidth
        if(isTail) {
            // 如果是最后一个顶点则将总长度修正至书页的真实宽度
            gapWidth = width - realWidth
            let direction = deltaVector.normalize()
            nextBezierPos = lastBezierPos.clone().add(direction.multiplyScalar(gapWidth))
        } else if(curWidth >= width) {
            // 如果当前总长超过了书页的真实宽度，就衰减超过部分的1.1倍
            let delta = curWidth - width
            gapWidth = gapWidth - delta * 1.1
            gapWidth = Math.max(0, gapWidth)
            let direction = deltaVector.normalize()
            nextBezierPos = lastBezierPos.clone().add(direction.multiplyScalar(gapWidth))
        }

        return {
            gapWidth: gapWidth,
            nextBezierPos: nextBezierPos,
        }
    }

    // 贝塞尔曲线公式
    private _getBezierPos(t: number, startPos: Vec2, endPos: Vec2, ctrlPos1: Vec2, ctrlPos2: Vec2): Vec2 {
        startPos = startPos.clone().multiplyScalar(Math.pow(1 - t, 3))
        ctrlPos1 = ctrlPos1.clone().multiplyScalar(3 * t * Math.pow(1 - t, 2))
        ctrlPos2 = ctrlPos2.clone().multiplyScalar(3 * (1 - t) * Math.pow(t, 2))
        endPos = endPos.clone().multiplyScalar(Math.pow(t, 3))
        return startPos.add(ctrlPos1.add(ctrlPos2.add(endPos)))
    }
}

export const simple = new Simple();

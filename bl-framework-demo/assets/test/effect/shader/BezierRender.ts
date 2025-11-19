import { __private, _decorator, Color, Component, gfx, Graphics, IRenderData, Node, RenderData, SpriteFrame, Texture2D, UIRenderer } from 'cc';
const { ccclass, property } = _decorator;

let vfmtPosUvColorFront = [
    new gfx.Attribute(gfx.AttributeName.ATTR_POSITION, gfx.Format.RGB32F),
    new gfx.Attribute(gfx.AttributeName.ATTR_TEX_COORD, gfx.Format.RG32F),
    new gfx.Attribute(gfx.AttributeName.ATTR_COLOR, gfx.Format.RGBA32F),
    new gfx.Attribute("a_isFront", gfx.Format.R32F),
];
// new gfx.VertexFormat([
//     { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
//     { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
//     { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
//     { name: "a_isFront", type: gfx.ATTR_TYPE_FLOAT32, num: 1},
// ]);

@ccclass('BezierRender')
export class BezierRender extends UIRenderer {
    @property({displayName: "角度"})
    get angle(): number {
        return this._angle;
    }
    set angle(value: number) {
        this._angle = value;
        this.markForUpdateRenderData();
    }
    public _angle:number = 0;
    @property({type: [SpriteFrame], displayName: "纹理"})
    public textureList: SpriteFrame[] = [];

    @property({displayName: "每条边上的顶点数量"})
    public pointsCount: number = 10;

    protected _initedMaterial: boolean = false

    protected _graphics: Graphics = null;
    @property({displayName: "debug"})
    set debug(value: boolean) {
        this._debug = value;
        this.createGraphics();
    }
    get debug(): boolean {
        return this._debug;
    }
    @property
    public _debug: boolean = false;

    updateMaterial() {
        super.updateMaterial();
        if (this._customMaterial) {
            if (this.textureList.length === 2) {
                this._customMaterial.setProperty("texture0", this.textureList[0].texture);
                this._customMaterial.setProperty("texture1", this.textureList[1].texture);
            }
        }
    }

    onEnable(): void {
        super.onEnable();
        if (this._debug) {
            this.createGraphics();
        }
    }

    onDisable(): void {
        super.onDisable();
        if (this._graphics) {
            this._graphics.node.destroy();
            this._graphics = null;
        }
    }

    protected _flushAssembler (): void {
        const self = this;
        const assembler = BezierRender.Assembler.getAssembler(self);

        if (self._assembler !== assembler) {
            self.destroyRenderData();
            self._assembler = assembler;
        }

        if (!self._renderData) {
            if (assembler && assembler.createData) {
                const rd = self._renderData = assembler.createData(self) as RenderData;
                rd.material = self.getRenderMaterial(0);
                self.markForUpdateRenderData();
                assembler.updateUVs!(self);
                self._updateColor();
            }
        }
    }
    public requestRenderData (drawInfoType:__private._cocos_2d_renderer_render_draw_info__RenderDrawInfoType = 0): RenderData {
        const data = RenderData.add(vfmtPosUvColorFront);
        data.initRenderDrawInfo(this, drawInfoType);
        this._renderData = data;
        return data;
    }

    public getPointCount(): number {
        return this.pointsCount
    }

    updateAngle(angle: number) {
        this.angle = angle;
        this.markForUpdateRenderData();
    }

    _render(render: any) {
        render.commitComp(this, this.renderData, this.textureList[0], this._assembler, null);
    }

    update() {
        if (this._debug) {
            this.drawGraphics();
        }
    }

    createGraphics() {
        if (this._graphics) {
            this._graphics.node.destroy();
            this._graphics = null;
        }
        let node = new Node();
        node.parent = this.node;
        this._graphics = node.addComponent(Graphics);
    }

    drawGraphics() {
        if(!this._graphics) return;
        if(!this._renderData) return;
        const dataList: IRenderData[] = this._renderData.data;
        // 绘制datalist
        const graphics = this._graphics;
        graphics.clear();

        // 预定义一组颜色
        const colors = [
            Color.RED,
            Color.GREEN,
            Color.BLUE,
            Color.YELLOW,
            Color.CYAN,
            Color.MAGENTA,
            Color.GRAY,
            Color.WHITE,
            Color.BLACK
        ];

        // 每4个点为一个矩形, 每个用不同的颜色
        for (let i = 0; i + 3 < dataList.length; i += 4) {
            // 选择当前的颜色
            const colorIdx = Math.floor(i / 4) % colors.length;
            graphics.strokeColor = colors[colorIdx];

            graphics.moveTo(dataList[i].x, dataList[i].y);
            graphics.lineTo(dataList[i + 1].x, dataList[i + 1].y);
            graphics.lineTo(dataList[i + 3].x, dataList[i + 3].y);
            graphics.lineTo(dataList[i + 2].x, dataList[i + 2].y);
            graphics.close(); // 闭合曲线，视觉显示为一个矩形
            graphics.stroke(); // 绘制当前矩形
        }
    }
}



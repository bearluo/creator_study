import { _decorator, Component, Graphics, Color, input, Input, EventTouch, Vec2, CCInteger } from 'cc';
import PF from 'db://bl-framework/extensions/pathfinding/pathfinding';

const { ccclass, property } = _decorator;

/**
 * Pathfinding 可视化示例
 * 用于游戏中的 2D 网格寻路
 */
@ccclass('PathfindingExample')
export class PathfindingExample extends Component {

    @property(Graphics)
    graphics: Graphics = null;

    @property({ type: CCInteger, tooltip: "网格宽度" })
    gridWidth: number = 30;

    @property({ type: CCInteger, tooltip: "网格高度" })
    gridHeight: number = 20;

    @property({ type: CCInteger, tooltip: "格子大小(像素)" })
    cellSize: number = 20;

    private grid: any = null;  // PF.Grid
    private finder: any = null; // PF.AStarFinder
    private path: number[][] = [];
    private startPos: [number, number] = [0, 0];
    private endPos: [number, number] = [29, 19];
    private obstacles: Set<string> = new Set();

    start() {
        this.initGrid();
        this.initFinder();
        this.findPath();
        this.draw();
        
        // 添加点击事件监听
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        
        console.log("=== Pathfinding 可视化示例 ===");
        console.log("左键点击: 切换障碍物");
        console.log("使用 setStart(x, y) 设置起点");
        console.log("使用 setEnd(x, y) 设置终点");
    }

    /**
     * 初始化网格
     */
    initGrid() {
        this.grid = new PF.Grid(this.gridWidth, this.gridHeight);
        
        // 添加一些示例障碍物
        this.addSampleObstacles();
    }

    /**
     * 添加示例障碍物
     */
    addSampleObstacles() {
        // 垂直墙
        for (let y = 5; y < 15; y++) {
            this.setObstacle(10, y, true);
        }
        
        // 水平墙
        for (let x = 15; x < 25; x++) {
            this.setObstacle(x, 10, true);
        }
        
        // 留一些缺口
        this.setObstacle(10, 10, false);
        this.setObstacle(20, 10, false);
    }

    /**
     * 初始化寻路器
     */
    initFinder() {
        // 默认使用 A* 算法
        this.finder = new PF.AStarFinder({
            allowDiagonal: true,           // 允许对角线移动
            dontCrossCorners: true,        // 不穿越角落
            heuristic: PF.Heuristic.euclidean  // 使用欧几里得距离
        });
    }

    /**
     * 查找路径
     */
    findPath() {
        // 克隆网格(因为寻路会修改网格状态)
        const gridClone = this.grid.clone();
        
        this.path = this.finder.findPath(
            this.startPos[0], this.startPos[1],
            this.endPos[0], this.endPos[1],
            gridClone
        );
        
        console.log(`找到路径: ${this.path.length} 步`);
    }

    /**
     * 绘制网格和路径
     */
    draw() {
        if (!this.graphics) return;
        
        this.graphics.clear();
        
        const offsetX = -this.gridWidth * this.cellSize / 2;
        const offsetY = -this.gridHeight * this.cellSize / 2;
        
        // 1. 绘制网格线
        this.graphics.strokeColor = new Color(100, 100, 100, 100);
        this.graphics.lineWidth = 1;
        
        for (let x = 0; x <= this.gridWidth; x++) {
            const px = offsetX + x * this.cellSize;
            this.graphics.moveTo(px, offsetY);
            this.graphics.lineTo(px, offsetY + this.gridHeight * this.cellSize);
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            const py = offsetY + y * this.cellSize;
            this.graphics.moveTo(offsetX, py);
            this.graphics.lineTo(offsetX + this.gridWidth * this.cellSize, py);
        }
        this.graphics.stroke();
        
        // 2. 绘制障碍物
        this.graphics.fillColor = new Color(50, 50, 50);
        this.obstacles.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            const px = offsetX + x * this.cellSize;
            const py = offsetY + y * this.cellSize;
            this.graphics.rect(px, py, this.cellSize, this.cellSize);
            this.graphics.fill();
        });
        
        // 3. 绘制路径
        if (this.path.length > 1) {
            this.graphics.strokeColor = new Color(100, 200, 255, 200);
            this.graphics.lineWidth = 3;
            
            const [fx, fy] = this.path[0];
            this.graphics.moveTo(
                offsetX + (fx + 0.5) * this.cellSize,
                offsetY + (fy + 0.5) * this.cellSize
            );
            
            for (let i = 1; i < this.path.length; i++) {
                const [x, y] = this.path[i];
                this.graphics.lineTo(
                    offsetX + (x + 0.5) * this.cellSize,
                    offsetY + (y + 0.5) * this.cellSize
                );
            }
            this.graphics.stroke();
            
            // 绘制路径点
            this.graphics.fillColor = new Color(100, 200, 255, 150);
            this.path.forEach(([x, y]) => {
                const px = offsetX + (x + 0.5) * this.cellSize;
                const py = offsetY + (y + 0.5) * this.cellSize;
                this.graphics.circle(px, py, 2);
                this.graphics.fill();
            });
        }
        
        // 4. 绘制起点(绿色)
        this.graphics.fillColor = Color.GREEN;
        const startPx = offsetX + (this.startPos[0] + 0.5) * this.cellSize;
        const startPy = offsetY + (this.startPos[1] + 0.5) * this.cellSize;
        this.graphics.circle(startPx, startPy, this.cellSize * 0.4);
        this.graphics.fill();
        
        // 5. 绘制终点(红色)
        this.graphics.fillColor = Color.RED;
        const endPx = offsetX + (this.endPos[0] + 0.5) * this.cellSize;
        const endPy = offsetY + (this.endPos[1] + 0.5) * this.cellSize;
        this.graphics.circle(endPx, endPy, this.cellSize * 0.4);
        this.graphics.fill();
        
        // 6. 绘制信息文本
        const pathLength = this.path.length > 0 ? this.path.length - 1 : 0;
        console.log(`路径: ${this.path.length > 0 ? '找到' : '无法到达'} (${pathLength} 步)`);
    }

    /**
     * 点击事件处理
     */
    onTouchStart(event: EventTouch) {
        const location = event.getUILocation();
        const nodePos = this.node.getComponent(Graphics)!.node.getWorldPosition();
        
        const offsetX = -this.gridWidth * this.cellSize / 2;
        const offsetY = -this.gridHeight * this.cellSize / 2;
        
        const gridX = Math.floor((location.x - nodePos.x - offsetX) / this.cellSize);
        const gridY = Math.floor((location.y - nodePos.y - offsetY) / this.cellSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            this.toggleObstacle(gridX, gridY);
        }
    }

    /**
     * 切换障碍物
     */
    toggleObstacle(x: number, y: number) {
        // 不能在起点和终点设置障碍物
        if ((x === this.startPos[0] && y === this.startPos[1]) ||
            (x === this.endPos[0] && y === this.endPos[1])) {
            return;
        }
        
        const key = `${x},${y}`;
        if (this.obstacles.has(key)) {
            this.obstacles.delete(key);
            this.grid.setWalkableAt(x, y, true);
        } else {
            this.obstacles.add(key);
            this.grid.setWalkableAt(x, y, false);
        }
        
        this.findPath();
        this.draw();
    }

    /**
     * 设置障碍物
     */
    setObstacle(x: number, y: number, isObstacle: boolean) {
        const key = `${x},${y}`;
        if (isObstacle) {
            this.obstacles.add(key);
            this.grid.setWalkableAt(x, y, false);
        } else {
            this.obstacles.delete(key);
            this.grid.setWalkableAt(x, y, true);
        }
    }

    /**
     * 设置起点
     */
    setStart(x: number, y: number) {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            this.startPos = [x, y];
            this.findPath();
            this.draw();
            console.log(`起点设置为: (${x}, ${y})`);
        }
    }

    /**
     * 设置终点
     */
    setEnd(x: number, y: number) {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            this.endPos = [x, y];
            this.findPath();
            this.draw();
            console.log(`终点设置为: (${x}, ${y})`);
        }
    }

    /**
     * 切换寻路算法
     */
    setAlgorithm(algorithm: 'astar' | 'dijkstra' | 'bfs' | 'bestfirst' | 'jps') {
        switch (algorithm) {
            case 'astar':
                this.finder = new PF.AStarFinder({ allowDiagonal: true, dontCrossCorners: true });
                console.log("切换到 A* 算法");
                break;
            case 'dijkstra':
                this.finder = new PF.DijkstraFinder({ allowDiagonal: true, dontCrossCorners: true });
                console.log("切换到 Dijkstra 算法");
                break;
            case 'bfs':
                this.finder = new PF.BreadthFirstFinder({ diagonalMovement: PF.DiagonalMovement.Always });
                console.log("切换到广度优先搜索");
                break;
            case 'bestfirst':
                this.finder = new PF.BestFirstFinder({ allowDiagonal: true });
                console.log("切换到最佳优先搜索");
                break;
            case 'jps':
                this.finder = new PF.JPFAlwaysMoveDiagonally();
                console.log("切换到跳点搜索 (JPS)");
                break;
        }
        
        this.findPath();
        this.draw();
    }

    /**
     * 清除所有障碍物
     */
    clearObstacles() {
        this.obstacles.clear();
        this.grid = new PF.Grid(this.gridWidth, this.gridHeight);
        this.findPath();
        this.draw();
        console.log("已清除所有障碍物");
    }

    /**
     * 随机生成障碍物
     */
    generateRandomObstacles(density: number = 0.2) {
        this.clearObstacles();
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                // 跳过起点和终点
                if ((x === this.startPos[0] && y === this.startPos[1]) ||
                    (x === this.endPos[0] && y === this.endPos[1])) {
                    continue;
                }
                
                if (Math.random() < density) {
                    this.setObstacle(x, y, true);
                }
            }
        }
        
        this.findPath();
        this.draw();
        console.log(`已生成随机障碍物 (密度: ${(density * 100).toFixed(0)}%)`);
    }

    /**
     * 获取路径信息
     */
    getPathInfo() {
        return {
            length: this.path.length,
            path: this.path,
            start: this.startPos,
            end: this.endPos,
            found: this.path.length > 0
        };
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
}


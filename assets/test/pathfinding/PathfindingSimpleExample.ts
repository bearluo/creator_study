/**
 * Pathfinding 库简单使用示例 - 纯 TypeScript 版本
 * 提供多种寻路算法的演示
 */
import PF from 'db://bl-framework/extensions/pathfinding/pathfinding';

export class PathfindingSimpleExample {

    /**
     * 示例1: A* 算法基础使用
     */
    static example1_BasicAStar() {
        console.log("\n========== 示例1: A* 寻路算法 ==========");
        
        // 1. 创建网格地图 (0=可通行, 1=障碍物)
        const matrix = [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        
        const grid = new PF.Grid(matrix);
        
        console.log("地图 (0=可通行, 1=障碍):");
        matrix.forEach((row, i) => console.log(`  行${i}: ${row.join(' ')}`));
        
        // 2. 创建 A* 寻路器
        const finder = new PF.AStarFinder({
            allowDiagonal: true,                    // 允许对角线移动
            dontCrossCorners: true                  // 不穿越角落
        });
        
        // 3. 查找路径
        const startX = 0, startY = 0;
        const endX = 4, endY = 4;
        
        const path = finder.findPath(startX, startY, endX, endY, grid);
        
        console.log(`\n起点: (${startX}, ${startY})`);
        console.log(`终点: (${endX}, ${endY})`);
        console.log(`路径长度: ${path.length} 步`);
        console.log(`路径:`);
        path.forEach((point, i) => {
            console.log(`  步骤${i}: (${point[0]}, ${point[1]})`);
        });
        
        // 4. 可视化路径
        this.visualizePath(matrix, path);
    }

    /**
     * 示例2: 对比不同寻路算法
     */
    static example2_CompareAlgorithms() {
        console.log("\n========== 示例2: 对比不同算法 ==========");
        
        // 创建较大的地图
        const width = 20, height = 20;
        const grid = new PF.Grid(width, height);
        
        // 添加一些障碍物
        for (let i = 5; i < 15; i++) {
            grid.setWalkableAt(10, i, false);  // 垂直墙
        }
        grid.setWalkableAt(10, 10, true);  // 留一个口子
        
        const start = [0, 0];
        const end = [19, 19];
        
        console.log(`地图大小: ${width}x${height}`);
        console.log(`起点: (${start[0]}, ${start[1]})`);
        console.log(`终点: (${end[0]}, ${end[1]})`);
        console.log("\n算法对比:\n");
        
        // 测试不同算法
        const algorithms = [
            { name: "A* 算法", finder: new PF.AStarFinder() },
            { name: "Dijkstra 算法", finder: new PF.DijkstraFinder() },
            { name: "最佳优先搜索", finder: new PF.BestFirstFinder() },
            { name: "广度优先搜索", finder: new PF.BreadthFirstFinder() },
            { name: "跳点搜索 (JPS)", finder: new PF.JPFAlwaysMoveDiagonally() }
        ];
        
        algorithms.forEach(algo => {
            const gridClone = grid.clone();
            const startTime = performance.now();
            const path = algo.finder.findPath(start[0], start[1], end[0], end[1], gridClone);
            const endTime = performance.now();
            
            console.log(`  ${algo.name}:`);
            console.log(`    路径长度: ${path.length} 步`);
            console.log(`    耗时: ${(endTime - startTime).toFixed(3)} ms`);
        });
    }

    /**
     * 示例3: 对角线移动模式
     */
    static example3_DiagonalMovement() {
        console.log("\n========== 示例3: 对角线移动模式 ==========");
        
        // 创建一个有障碍物的简单地图
        const matrix = [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]
        ];
        
        const grid = new PF.Grid(matrix);
        
        console.log("地图:");
        matrix.forEach((row, i) => console.log(`  ${row.join(' ')}`));
        console.log("\n从 (0,0) 到 (2,2) 的路径:\n");
        
        // 测试不同的对角线移动模式
        const modes = [
            {
                name: "从不对角移动",
                movement: PF.DiagonalMovement.Never
            },
            {
                name: "总是对角移动",
                movement: PF.DiagonalMovement.Always
            },
            {
                name: "无障碍时对角移动",
                movement: PF.DiagonalMovement.OnlyWhenNoObstacles
            },
            {
                name: "最多一个障碍时对角移动",
                movement: PF.DiagonalMovement.IfAtMostOneObstacle
            }
        ];
        
        modes.forEach(mode => {
            const finder = new PF.AStarFinder({
                diagonalMovement: mode.movement
            });
            
            const gridClone = grid.clone();
            const path = finder.findPath(0, 0, 2, 2, gridClone);
            
            console.log(`  ${mode.name}:`);
            console.log(`    路径长度: ${path.length} 步`);
            console.log(`    路径: ${path.map(p => `(${p[0]},${p[1]})`).join(' -> ')}`);
        });
    }

    /**
     * 示例4: 启发式函数对比
     */
    static example4_HeuristicFunctions() {
        console.log("\n========== 示例4: 启发式函数对比 ==========");
        
        const grid = new PF.Grid(10, 10);
        
        const heuristics = [
            { name: "曼哈顿距离", func: PF.Heuristic.manhattan },
            { name: "欧几里得距离", func: PF.Heuristic.euclidean },
            { name: "切比雪夫距离", func: PF.Heuristic.chebyshev },
            { name: "Octile 距离", func: PF.Heuristic.octile }
        ];
        
        console.log("从 (0,0) 到 (9,9) 使用不同启发式:\n");
        
        heuristics.forEach(h => {
            const finder = new PF.AStarFinder({
                heuristic: h.func,
                allowDiagonal: true
            });
            
            const gridClone = grid.clone();
            const path = finder.findPath(0, 0, 9, 9, gridClone);
            
            console.log(`  ${h.name}:`);
            console.log(`    路径长度: ${path.length} 步`);
            console.log(`    首几步: ${path.slice(0, 3).map(p => `(${p[0]},${p[1]})`).join(' -> ')}...`);
        });
    }

    /**
     * 示例5: 路径平滑和压缩
     */
    static example5_PathSmoothing() {
        console.log("\n========== 示例5: 路径平滑和压缩 ==========");
        
        const matrix = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ];
        
        const grid = new PF.Grid(matrix);
        const finder = new PF.AStarFinder({ allowDiagonal: true });
        
        const path = finder.findPath(0, 0, 6, 3, grid.clone());
        
        console.log(`原始路径 (${path.length} 个点):`);
        console.log(`  ${path.map(p => `(${p[0]},${p[1]})`).join(' -> ')}`);
        
        // 压缩路径 (移除共线点)
        const compressed = PF.Util.compressPath(path);
        console.log(`\n压缩路径 (${compressed.length} 个点):`);
        console.log(`  ${compressed.map(p => `(${p[0]},${p[1]})`).join(' -> ')}`);
        
        // 平滑路径
        const smoothed = PF.Util.smoothenPath(grid.clone(), path);
        console.log(`\n平滑路径 (${smoothed.length} 个点):`);
        console.log(`  ${smoothed.map(p => `(${p[0]},${p[1]})`).join(' -> ')}`);
    }

    /**
     * 示例6: 动态地图更新
     */
    static example6_DynamicMap() {
        console.log("\n========== 示例6: 动态地图更新 ==========");
        
        const grid = new PF.Grid(8, 8);
        const finder = new PF.AStarFinder();
        
        // 第一次寻路
        let path = finder.findPath(0, 0, 7, 7, grid.clone());
        console.log(`初始路径长度: ${path.length} 步`);
        
        // 添加障碍物
        console.log("\n添加障碍物在 (4, 0) 到 (4, 5)...");
        for (let y = 0; y < 6; y++) {
            grid.setWalkableAt(4, y, false);
        }
        
        // 重新寻路
        path = finder.findPath(0, 0, 7, 7, grid.clone());
        console.log(`绕过障碍物后路径长度: ${path.length} 步`);
        
        // 移除部分障碍物
        console.log("\n打开缺口在 (4, 2)...");
        grid.setWalkableAt(4, 2, true);
        
        // 再次寻路
        path = finder.findPath(0, 0, 7, 7, grid.clone());
        console.log(`通过缺口后路径长度: ${path.length} 步`);
    }

    /**
     * 示例7: 多目标寻路
     */
    static example7_MultipleTargets() {
        console.log("\n========== 示例7: 多目标寻路 ==========");
        
        const grid = new PF.Grid(15, 15);
        const finder = new PF.AStarFinder({ allowDiagonal: true });
        
        const start = [0, 0];
        const targets = [
            [5, 5],
            [10, 5],
            [10, 10],
            [5, 10]
        ];
        
        console.log(`起点: (${start[0]}, ${start[1]})`);
        console.log("目标点:");
        targets.forEach((t, i) => console.log(`  目标${i + 1}: (${t[0]}, ${t[1]})`));
        
        // 计算访问所有目标的总距离
        let currentPos = start;
        let totalDistance = 0;
        const visitOrder: number[][] = [];
        
        console.log("\n访问顺序:");
        targets.forEach((target, i) => {
            const path = finder.findPath(
                currentPos[0], currentPos[1],
                target[0], target[1],
                grid.clone()
            );
            
            totalDistance += path.length;
            visitOrder.push(target);
            
            console.log(`  ${i + 1}. (${currentPos[0]},${currentPos[1]}) -> (${target[0]},${target[1]}): ${path.length} 步`);
            currentPos = target;
        });
        
        console.log(`\n总距离: ${totalDistance} 步`);
    }

    /**
     * 示例8: 双向搜索算法
     */
    static example8_BidirectionalSearch() {
        console.log("\n========== 示例8: 双向搜索算法 ==========");
        
        const grid = new PF.Grid(30, 30);
        
        // 添加复杂障碍物
        for (let i = 5; i < 25; i++) {
            if (i !== 15) {  // 留缺口
                grid.setWalkableAt(15, i, false);
            }
        }
        
        const start = [0, 0];
        const end = [29, 29];
        
        console.log("对比单向和双向搜索:\n");
        
        // 单向 A*
        const astar = new PF.AStarFinder();
        const startTime1 = performance.now();
        const path1 = astar.findPath(start[0], start[1], end[0], end[1], grid.clone());
        const time1 = performance.now() - startTime1;
        
        console.log(`  单向 A* 搜索:`);
        console.log(`    路径长度: ${path1.length} 步`);
        console.log(`    耗时: ${time1.toFixed(3)} ms`);
        
        // 双向 A*
        const biAstar = new PF.BiAStarFinder();
        const startTime2 = performance.now();
        const path2 = biAstar.findPath(start[0], start[1], end[0], end[1], grid.clone());
        const time2 = performance.now() - startTime2;
        
        console.log(`\n  双向 A* 搜索:`);
        console.log(`    路径长度: ${path2.length} 步`);
        console.log(`    耗时: ${time2.toFixed(3)} ms`);
        console.log(`    速度提升: ${(time1 / time2).toFixed(2)}x`);
    }

    /**
     * 辅助方法: 可视化路径
     */
    private static visualizePath(matrix: number[][], path: number[][]) {
        const display: any[][] = matrix.map(row => [...row]);
        
        // 标记路径 (2)
        path.forEach(([x, y]) => {
            if (display[y] && display[y][x] !== undefined) {
                display[y][x] = 2;
            }
        });
        
        // 标记起点 (S) 和终点 (E)
        if (path.length > 0) {
            const [sx, sy] = path[0];
            const [ex, ey] = path[path.length - 1];
            display[sy][sx] = 'S';
            display[ey][ex] = 'E';
        }
        
        console.log("\n路径可视化 (S=起点, E=终点, ·=路径, █=障碍):");
        display.forEach((row, i) => {
            const visual = row.map(cell => {
                if (cell === 'S') return 'S';
                if (cell === 'E') return 'E';
                if (cell === 2) return '·';
                if (cell === 1) return '█';
                return ' ';
            }).join(' ');
            console.log(`  ${visual}`);
        });
    }

    /**
     * 运行所有示例
     */
    static runAll() {
        console.log("\n╔════════════════════════════════════════╗");
        console.log("║   Pathfinding 库使用示例 - 完整演示   ║");
        console.log("╚════════════════════════════════════════╝");
        
        this.example1_BasicAStar();
        this.example2_CompareAlgorithms();
        this.example3_DiagonalMovement();
        this.example4_HeuristicFunctions();
        this.example5_PathSmoothing();
        this.example6_DynamicMap();
        this.example7_MultipleTargets();
        this.example8_BidirectionalSearch();
        
        console.log("\n✓ 所有示例运行完成!");
    }
}

// 如果需要直接运行,可以取消注释下面这行
// PathfindingSimpleExample.runAll();


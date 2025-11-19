import { _decorator, Component, Node, Graphics, Color } from 'cc';
import Simulator from 'db://bl-framework/extensions/rvo/Simulator';
import Vector2D from 'db://bl-framework/extensions/rvo/Vector2D';
const { ccclass, property } = _decorator;

/**
 * RVO (Reciprocal Velocity Obstacles) 使用示例
 * 用于多智能体避障模拟
 * 
 * 🎯 示例包含：
 * 1. basicExample() - 基础示例：10个Agent圆形阵型对向移动
 * 2. obstacleExample() - 障碍物示例：Agent绕过矩形障碍物
 * 3. largeScaleExample() - 大规模测试：1000个Agent随机移动（默认）
 * 4. dynamicExample() - 动态添加删除：运行时随机添加/删除Agent
 * 
 * 💡 使用方法：
 * - 在 start() 中取消注释想要测试的示例
 * - 可以调用 addNewAgent() 动态添加
 * - 可以调用 removeAgentById() 删除指定Agent
 * - 可以调用 addMultipleAgents() 批量添加
 * - 可以调用 removeMultipleAgents() 批量删除
 * 
 * 📊 性能监控：
 * - 每100帧输出一次性能数据（update时间、run时间、FPS）
 * - 超过200个Agent自动启用简化绘制（只绘制200个）
 * 
 * ⚡ 优化特性：
 * - 使用 Map 存储 Agent ID，O(1) 查找
 * - 脏标记延迟刷新数组，减少不必要的操作
 * - Vector2D 对象池减少99%的对象创建
 */
@ccclass('RVOExample')
export class RVOExample extends Component {

    @property(Graphics)
    graphics: Graphics = null;

    private simulator: Simulator = null;
    private agentIds: number[] = [];  // 存储所有 Agent ID
    private agentCount: number = 10;

    start() {
        // 示例1: 基础使用 - 圆形阵型对向移动
        // this.basicExample();
        
        // 示例2: 带障碍物的场景
        // this.obstacleExample();

        // 示例3: 大规模测试 - 1000个对象（推荐）
        // this.largeScaleExample();

        // 示例4: 动态添加删除测试
        this.dynamicExample();
    }

    /**
     * 基础示例：多个智能体从圆形阵型移动到对面
     */
    basicExample() {
        console.log("=== RVO 基础示例开始 ===");
        
        this.agentIds = [];
        
        // 1. 创建模拟器
        this.simulator = new Simulator();
        
        // 2. 设置代理默认参数
        // setAgentDefaults(邻居距离, 最大邻居数, 时间视野, 障碍时间视野, 半径, 最大速度, 初始速度X, 初始速度Y)
        this.simulator.setAgentDefaults(
            15.0,   // neighborDist: 感知邻居的距离
            10,     // maxNeighbors: 最多考虑的邻居数量
            5.0,    // timeHorizon: 对其他代理的反应时间(越大越早避让)
            5.0,    // timeHorizonObst: 对障碍物的反应时间
            2.0,    // radius: 代理半径
            2.0,    // maxSpeed: 最大移动速度
            0.0,    // velocityX: 初始速度X
            0.0     // velocityY: 初始速度Y
        );
        
        // 3. 设置时间步长
        this.simulator.setTimeStep(0.25);

        // 处理障碍物(必须调用)
        this.simulator.processObstacles();
        
        // 4. 在圆形阵型中添加代理
        const circleRadius = 200.0;
        for (let i = 0; i < this.agentCount; i++) {
            const angle = i * 2.0 * Math.PI / this.agentCount;
            const x = circleRadius * Math.cos(angle);
            const y = circleRadius * Math.sin(angle);
            
            // 添加代理（返回 Agent ID）
            const agentId = this.simulator.addAgent(new Vector2D(x, y));
            this.agentIds.push(agentId);
            
            // 设置目标点(对面位置)
            this.simulator.setAgentGoal(agentId, -x, -y);
            
            console.log(`代理 ${agentId}: 起点(${x.toFixed(1)}, ${y.toFixed(1)}) -> 目标(${(-x).toFixed(1)}, ${(-y).toFixed(1)})`);
        }
    }

    /**
     * 带障碍物的示例
     */
    obstacleExample() {
        console.log("=== RVO 障碍物示例开始 ===");
        
        this.agentIds = [];
        
        // 1. 创建模拟器
        this.simulator = new Simulator();
        
        // 2. 设置代理默认参数
        this.simulator.setAgentDefaults(15.0, 10, 5.0, 5.0, 2.0, 2.0);
        this.simulator.setTimeStep(0.25);
        
        // 3. 添加障碍物(矩形墙壁)
        const obstacleVertices = [
            new Vector2D(-50, -50),
            new Vector2D(50, -50),
            new Vector2D(50, 50),
            new Vector2D(-50, 50)
        ];
        this.simulator.addObstacle(obstacleVertices);
        
        // 处理障碍物(必须调用)
        this.simulator.processObstacles();
        
        console.log("添加了矩形障碍物: (-50,-50) 到 (50,50)");
        
        // 4. 添加代理
        for (let i = 0; i < 5; i++) {
            const startX = -200 + i * 100;
            const agentId = this.simulator.addAgent(new Vector2D(startX, -200));
            this.agentIds.push(agentId);
            this.simulator.setAgentGoal(agentId, startX, 200);
        }
    }

    /**
     * 大规模测试：1000个对象随机位移
     */
    largeScaleExample() {
        console.log("=== RVO 大规模测试开始 ===");
        console.time("初始化1000个Agent");
        
        this.agentIds = [];
        
        // 1. 创建模拟器
        this.simulator = new Simulator();
        
        // 2. 设置代理默认参数（针对大量对象优化）
        this.simulator.setAgentDefaults(
            20.0,   // neighborDist: 稍大的感知距离
            15,     // maxNeighbors: 考虑更多邻居
            3.0,    // timeHorizon: 较短的反应时间（提高性能）
            3.0,    // timeHorizonObst
            1.5,    // radius: 稍小的半径（减少碰撞）
            3.0,    // maxSpeed: 较快的移动速度
            0.0,
            0.0
        );
        
        this.simulator.setTimeStep(0.25);
        this.simulator.processObstacles();
        
        // 3. 在大区域随机添加1000个代理
        const areaSize = 500;  // 区域大小 -500 到 500
        const agentCount = 1000;
        
        for (let i = 0; i < agentCount; i++) {
            // 随机起始位置
            const startX = (Math.random() - 0.5) * areaSize * 2;
            const startY = (Math.random() - 0.5) * areaSize * 2;
            
            // 随机目标位置
            const goalX = (Math.random() - 0.5) * areaSize * 2;
            const goalY = (Math.random() - 0.5) * areaSize * 2;
            
            const agentId = this.simulator.addAgent(new Vector2D(startX, startY));
            this.agentIds.push(agentId);
            this.simulator.setAgentGoal(agentId, goalX, goalY);
        }
        
        console.timeEnd("初始化1000个Agent");
        console.log(`成功添加 ${agentCount} 个代理`);
        console.log(`区域范围: ${-areaSize} 到 ${areaSize}`);
    }

    /**
     * 动态添加删除示例
     */
    dynamicExample() {
        console.log("=== RVO 动态添加删除示例开始 ===");
        
        this.agentIds = [];
        
        // 1. 创建模拟器
        this.simulator = new Simulator();
        this.simulator.setAgentDefaults(15.0, 10, 5.0, 5.0, 2.0, 2.0);
        this.simulator.setTimeStep(0.25);
        this.simulator.processObstacles();
        
        // 2. 初始添加100个代理
        console.log("初始添加 100 个代理");
        for (let i = 0; i < 100; i++) {
            const x = (Math.random() - 0.5) * 400;
            const y = (Math.random() - 0.5) * 400;
            const goalX = (Math.random() - 0.5) * 400;
            const goalY = (Math.random() - 0.5) * 400;
            
            const agentId = this.simulator.addAgent(new Vector2D(x, y));
            this.agentIds.push(agentId);
            this.simulator.setAgentGoal(agentId, goalX, goalY);
        }
        
        // 3. 每秒随机添加或删除代理
        this.schedule(() => {
            const action = Math.random();
            
            if (action < 0.3 && this.agentIds.length > 10) {
                // 30% 概率删除一个随机代理
                const randomIndex = Math.floor(Math.random() * this.agentIds.length);
                const agentId = this.agentIds[randomIndex];
                
                if (this.simulator.removeAgent(agentId)) {
                    this.agentIds.splice(randomIndex, 1);
                    console.log(`删除代理 ${agentId}，当前数量: ${this.agentIds.length}`);
                }
            } else if (action < 0.7 && this.agentIds.length < 200) {
                // 40% 概率添加一个新代理
                const x = (Math.random() - 0.5) * 400;
                const y = (Math.random() - 0.5) * 400;
                const goalX = (Math.random() - 0.5) * 400;
                const goalY = (Math.random() - 0.5) * 400;
                
                const agentId = this.simulator.addAgent(new Vector2D(x, y));
                this.agentIds.push(agentId);
                this.simulator.setAgentGoal(agentId, goalX, goalY);
                console.log(`添加代理 ${agentId}，当前数量: ${this.agentIds.length}`);
            }
            // 30% 概率什么都不做
        }, 1.0);  // 每秒执行一次
    }

    update(deltaTime: number) {
        if (!this.simulator) return;
        
        // 性能监控（每100帧输出一次）
        if (this.frameCount % 100 === 0) {
            console.time("update");
        }
        
        // 更新每个代理的期望速度(朝向目标)
        for (const agentId of this.agentIds) {
            const goal = this.simulator.getGoal(agentId);
            const position = this.simulator.getAgentPosition(agentId);
            
            if (!goal || !position) continue;
            
            // 计算朝向目标的速度
            const diff = goal.minus(position);
            const distToGoal = diff.abs();
            
            if (distToGoal > 1.0) {
                // 未到达目标,设置期望速度
                const prefVelocity = diff.scale(1.0 / distToGoal); // 归一化方向
                this.simulator.setAgentPrefVelocity(agentId, prefVelocity.x, prefVelocity.y);
            } else {
                // 已到达目标,停止
                this.simulator.setAgentPrefVelocity(agentId, 0, 0);
            }
        }
        
        // 运行模拟步骤
        if (this.frameCount % 100 === 0) {
            console.time("simulator.run");
        }
        this.simulator.run();
        if (this.frameCount % 100 === 0) {
            console.timeEnd("simulator.run");
        }
        
        // 绘制代理和目标点
        this.drawAgents();
        
        if (this.frameCount % 100 === 0) {
            console.timeEnd("update");
            console.log(`当前 Agent 数量: ${this.agentIds.length}, FPS: ${(1 / deltaTime).toFixed(1)}`);
        }
        
        this.frameCount++;
        
        // 检查是否全部到达
        if (this.simulator.reachedGoal()) {
            console.log(`全部代理已到达目标! 总时间: ${this.simulator.getGlobalTime().toFixed(2)}秒`);
        }
    }

    private frameCount = 0;

    /**
     * 绘制所有代理和目标点
     * 针对大量对象优化：只绘制部分代理或使用简化绘制
     */
    drawAgents() {
        if (!this.graphics) return;
        
        this.graphics.clear();
        
        const agentCount = this.agentIds.length;
        const shouldSimplify = agentCount > 200;  // 超过200个代理使用简化绘制
        
        // 大量对象时只绘制部分
        const drawCount = shouldSimplify ? Math.min(200, agentCount) : agentCount;
        const step = Math.ceil(agentCount / drawCount);
        
        for (let i = 0; i < agentCount; i += step) {
            const agentId = this.agentIds[i];
            const position = this.simulator.getAgentPosition(agentId);
            const velocity = this.simulator.getAgentVelocity(agentId);
            const goal = this.simulator.getGoal(agentId);
            const radius = this.simulator.getAgentRadius(agentId);
            
            if (!position || !velocity || !goal || !radius) continue;
            
            // 绘制代理(实心圆)
            this.graphics.fillColor = Color.BLUE;
            this.graphics.circle(position.x, position.y, radius);
            this.graphics.fill();
            
            // 简化模式下不绘制速度和目标
            if (!shouldSimplify) {
                // 绘制速度方向(箭头)
                if (velocity.abs() > 0.1) {
                    this.graphics.strokeColor = Color.RED;
                    this.graphics.lineWidth = 1;
                    const arrowEnd = position.plus(velocity.scale(10));
                    this.graphics.moveTo(position.x, position.y);
                    this.graphics.lineTo(arrowEnd.x, arrowEnd.y);
                    this.graphics.stroke();
                }
                
                // 绘制目标点(空心圆)
                this.graphics.strokeColor = Color.GREEN;
                this.graphics.lineWidth = 2;
                this.graphics.circle(goal.x, goal.y, radius);
                this.graphics.stroke();
            }
        }

        // 绘制障碍物
        if (this.simulator.obstacles.length > 0) {
            this.graphics.strokeColor = Color.GRAY;
            this.graphics.lineWidth = 2;
            
            let currentObstacle = this.simulator.obstacles[0];
            do {
                // 绘制当前障碍物顶点到下一个顶点的连线
                this.graphics.moveTo(currentObstacle.point.x, currentObstacle.point.y);
                this.graphics.lineTo(currentObstacle.next.point.x, currentObstacle.next.point.y);
                this.graphics.stroke();
                
                currentObstacle = currentObstacle.next;
            } while (currentObstacle !== this.simulator.obstacles[0]);
        }
        
        // 显示绘制信息
        if (shouldSimplify && this.frameCount % 100 === 0) {
            console.log(`简化绘制: 只绘制 ${drawCount}/${agentCount} 个代理`);
        }
    }

    /**
     * 手动控制示例: 动态添加/移除代理
     */
    addNewAgent(x: number, y: number, goalX: number, goalY: number): number {
        if (!this.simulator) return -1;
        
        const agentId = this.simulator.addAgent(new Vector2D(x, y));
        this.agentIds.push(agentId);
        this.simulator.setAgentGoal(agentId, goalX, goalY);
        
        console.log(`添加新代理 ${agentId} 在位置(${x}, ${y}), 目标(${goalX}, ${goalY})`);
        console.log(`当前代理总数: ${this.agentIds.length}`);
        
        return agentId;
    }

    /**
     * 移除代理
     */
    removeAgentById(agentId: number): boolean {
        if (!this.simulator) return false;
        
        const index = this.agentIds.indexOf(agentId);
        if (index === -1) {
            console.warn(`代理 ${agentId} 不存在`);
            return false;
        }
        
        if (this.simulator.removeAgent(agentId)) {
            this.agentIds.splice(index, 1);
            console.log(`移除代理 ${agentId}，当前代理总数: ${this.agentIds.length}`);
            return true;
        }
        
        return false;
    }

    /**
     * 批量添加代理
     */
    addMultipleAgents(count: number, areaSize: number = 200) {
        console.log(`批量添加 ${count} 个代理...`);
        console.time("批量添加");
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * areaSize * 2;
            const y = (Math.random() - 0.5) * areaSize * 2;
            const goalX = (Math.random() - 0.5) * areaSize * 2;
            const goalY = (Math.random() - 0.5) * areaSize * 2;
            
            const agentId = this.simulator.addAgent(new Vector2D(x, y));
            this.agentIds.push(agentId);
            this.simulator.setAgentGoal(agentId, goalX, goalY);
        }
        
        console.timeEnd("批量添加");
        console.log(`成功添加 ${count} 个代理，当前总数: ${this.agentIds.length}`);
    }

    /**
     * 批量删除代理
     */
    removeMultipleAgents(count: number) {
        console.log(`批量删除 ${count} 个代理...`);
        console.time("批量删除");
        
        const removeCount = Math.min(count, this.agentIds.length);
        for (let i = 0; i < removeCount; i++) {
            const randomIndex = Math.floor(Math.random() * this.agentIds.length);
            const agentId = this.agentIds[randomIndex];
            
            if (this.simulator.removeAgent(agentId)) {
                this.agentIds.splice(randomIndex, 1);
            }
        }
        
        console.timeEnd("批量删除");
        console.log(`成功删除 ${removeCount} 个代理，当前总数: ${this.agentIds.length}`);
    }

    /**
     * 清空所有代理
     */
    clearAllAgents() {
        console.log("清空所有代理...");
        
        for (const agentId of this.agentIds) {
            this.simulator.removeAgent(agentId);
        }
        
        this.agentIds = [];
        console.log("已清空所有代理");
    }

    /**
     * 查询两点之间是否可见(无障碍物遮挡)
     */
    checkVisibility(x1: number, y1: number, x2: number, y2: number, radius: number = 1.0): boolean {
        if (!this.simulator) return false;
        
        const point1 = new Vector2D(x1, y1);
        const point2 = new Vector2D(x2, y2);
        return this.simulator.queryVisibility(point1, point2, radius);
    }
}


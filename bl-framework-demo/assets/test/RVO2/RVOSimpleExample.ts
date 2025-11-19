/**
 * RVO 库简单使用示例 - 纯 TypeScript 版本
 * 不依赖任何 UI 框架,可直接运行测试
 */

import Simulator from 'db://bl-framework/extensions/rvo/Simulator';
import Vector2D from 'db://bl-framework/extensions/rvo/Vector2D';

export class RVOSimpleExample {

    /**
     * 示例1: 两个代理面对面相遇并避让
     */
    static example1_TwoAgents() {
        console.log("\n========== 示例1: 两个代理相遇 ==========");
        
        // 1. 创建模拟器
        const sim = new Simulator();
        
        // 2. 设置代理默认参数
        sim.setAgentDefaults(
            15.0,   // neighborDist: 邻居感知距离
            10,     // maxNeighbors: 最大邻居数
            5.0,    // timeHorizon: 避让时间窗口
            5.0,    // timeHorizonObst: 障碍物避让时间窗口
            2.0,    // radius: 代理半径
            2.0     // maxSpeed: 最大速度
        );
        
        // 3. 添加两个代理
        sim.addAgent(new Vector2D(-50, 0));  // 代理0: 左侧
        sim.addAgent(new Vector2D(50, 0));   // 代理1: 右侧
        
        // 4. 设置目标(交换位置)
        sim.setAgentGoal(0, 50, 0);   // 代理0 目标: 右侧
        sim.setAgentGoal(1, -50, 0);  // 代理1 目标: 左侧
        
        console.log("初始状态:");
        console.log(`  代理0: (${sim.getAgentPosition(0).x}, ${sim.getAgentPosition(0).y}) -> 目标: (50, 0)`);
        console.log(`  代理1: (${sim.getAgentPosition(1).x}, ${sim.getAgentPosition(1).y}) -> 目标: (-50, 0)`);
        
        // 5. 模拟运行
        let step = 0;
        while (step < 50 && !sim.reachedGoal()) {
            // 更新每个代理的期望速度
            for (let i = 0; i < sim.getNumAgents(); i++) {
                const position = sim.getAgentPosition(i);
                const goal = sim.getGoal(i);
                const diff = goal.minus(position);
                
                if (diff.abs() > 1.0) {
                    const prefVel = diff.normalize();
                    sim.setAgentPrefVelocity(i, prefVel.x, prefVel.y);
                } else {
                    sim.setAgentPrefVelocity(i, 0, 0);
                }
            }
            
            // 执行一步模拟
            sim.run();
            
            // 每10步输出一次位置
            if (step % 10 === 0) {
                const pos0 = sim.getAgentPosition(0);
                const pos1 = sim.getAgentPosition(1);
                console.log(`\n步骤 ${step}, 时间 ${sim.getGlobalTime().toFixed(2)}s:`);
                console.log(`  代理0: (${pos0.x.toFixed(2)}, ${pos0.y.toFixed(2)})`);
                console.log(`  代理1: (${pos1.x.toFixed(2)}, ${pos1.y.toFixed(2)})`);
                console.log(`  距离: ${pos0.minus(pos1).abs().toFixed(2)}`);
            }
            
            step++;
        }
        
        console.log(`\n✓ 模拟完成! 总步数: ${step}, 总时间: ${sim.getGlobalTime().toFixed(2)}秒`);
    }

    /**
     * 示例2: 多个代理圆形阵型
     */
    static example2_CircleFormation() {
        console.log("\n========== 示例2: 圆形阵型(10个代理) ==========");
        
        const sim = new Simulator();
        sim.setAgentDefaults(15.0, 10, 5.0, 5.0, 2.0, 2.0);
        
        // 在圆周上均匀分布10个代理
        const agentCount = 10;
        const radius = 100.0;
        
        for (let i = 0; i < agentCount; i++) {
            const angle = i * 2 * Math.PI / agentCount;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            sim.addAgent(new Vector2D(x, y));
            sim.setAgentGoal(i, -x, -y);  // 目标为对面
        }
        
        console.log(`已添加 ${agentCount} 个代理`);
        
        // 运行100步
        for (let step = 0; step < 100; step++) {
            for (let i = 0; i < sim.getNumAgents(); i++) {
                const position = sim.getAgentPosition(i);
                const goal = sim.getGoal(i);
                const diff = goal.minus(position);
                
                if (diff.abs() > 1.0) {
                    const prefVel = diff.normalize();
                    sim.setAgentPrefVelocity(i, prefVel.x, prefVel.y);
                } else {
                    sim.setAgentPrefVelocity(i, 0, 0);
                }
            }
            
            sim.run();
            
            if (step % 25 === 0) {
                console.log(`\n步骤 ${step}:`);
                for (let i = 0; i < Math.min(3, agentCount); i++) {
                    const pos = sim.getAgentPosition(i);
                    const goal = sim.getGoal(i);
                    const dist = pos.minus(goal).abs();
                    console.log(`  代理${i}: 剩余距离 ${dist.toFixed(2)}`);
                }
            }
        }
        
        console.log(`✓ 完成! 时间: ${sim.getGlobalTime().toFixed(2)}秒`);
    }

    /**
     * 示例3: 带障碍物的场景
     */
    static example3_WithObstacles() {
        console.log("\n========== 示例3: 障碍物避让 ==========");
        
        const sim = new Simulator();
        sim.setAgentDefaults(15.0, 10, 5.0, 5.0, 2.0, 2.0);
        
        // 1. 添加矩形障碍物(墙壁)
        const wallVertices = [
            new Vector2D(-20, -50),
            new Vector2D(20, -50),
            new Vector2D(20, 50),
            new Vector2D(-20, 50)
        ];
        sim.addObstacle(wallVertices);
        sim.processObstacles();  // 必须调用!
        
        console.log("已添加矩形障碍物: 中心 (0,0), 尺寸 40x100");
        
        // 2. 添加代理(从左到右穿过障碍物)
        sim.addAgent(new Vector2D(-100, 0));
        sim.setAgentGoal(0, 100, 0);
        
        console.log("代理起点: (-100, 0), 目标: (100, 0)");
        console.log("障碍物在路径中央!\n");
        
        // 3. 模拟
        let step = 0;
        while (step < 150 && !sim.reachedGoal()) {
            const position = sim.getAgentPosition(0);
            const goal = sim.getGoal(0);
            const diff = goal.minus(position);
            
            if (diff.abs() > 1.0) {
                const prefVel = diff.normalize();
                sim.setAgentPrefVelocity(0, prefVel.x, prefVel.y);
            } else {
                sim.setAgentPrefVelocity(0, 0, 0);
            }
            
            sim.run();
            
            if (step % 20 === 0) {
                const pos = sim.getAgentPosition(0);
                const vel = sim.getAgentVelocity(0);
                console.log(`步骤 ${step}: 位置(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}), 速度(${vel.x.toFixed(2)}, ${vel.y.toFixed(2)})`);
            }
            
            step++;
        }
        
        console.log(`✓ 完成! 代理成功绕过障碍物`);
    }

    /**
     * 示例4: 可见性查询
     */
    static example4_VisibilityQuery() {
        console.log("\n========== 示例4: 可见性查询 ==========");
        
        const sim = new Simulator();
        sim.setAgentDefaults(15.0, 10, 5.0, 5.0, 2.0, 2.0);
        
        // 添加障碍物
        const obstacleVertices = [
            new Vector2D(-10, -10),
            new Vector2D(10, -10),
            new Vector2D(10, 10),
            new Vector2D(-10, 10)
        ];
        sim.addObstacle(obstacleVertices);
        sim.processObstacles();
        
        // 测试多个点对的可见性
        const testCases = [
            { p1: new Vector2D(-50, 0), p2: new Vector2D(50, 0), desc: "穿过障碍物" },
            { p1: new Vector2D(-50, 50), p2: new Vector2D(50, 50), desc: "绕过障碍物" },
            { p1: new Vector2D(-50, 0), p2: new Vector2D(-30, 0), desc: "障碍物外" }
        ];
        
        console.log("障碍物: 中心(0,0), 尺寸 20x20\n");
        
        testCases.forEach(test => {
            const visible = sim.queryVisibility(test.p1, test.p2, 1.0);
            console.log(`${test.desc}:`);
            console.log(`  点1: (${test.p1.x}, ${test.p1.y}) -> 点2: (${test.p2.x}, ${test.p2.y})`);
            console.log(`  可见性: ${visible ? '✓ 可见' : '✗ 被遮挡'}\n`);
        });
    }

    /**
     * 运行所有示例
     */
    static runAll() {
        console.log("\n╔════════════════════════════════════════╗");
        console.log("║   RVO2 库使用示例 - 完整演示          ║");
        console.log("╚════════════════════════════════════════╝");
        
        this.example1_TwoAgents();
        this.example2_CircleFormation();
        this.example3_WithObstacles();
        this.example4_VisibilityQuery();
        
        console.log("\n✓ 所有示例运行完成!");
    }
}

// 如果需要直接运行,可以取消注释下面这行
// RVOSimpleExample.runAll();


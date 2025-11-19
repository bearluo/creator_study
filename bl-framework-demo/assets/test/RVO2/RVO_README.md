# RVO2 库使用指南

RVO2 (Reciprocal Velocity Obstacles) 是一个用于多智能体避障的算法库,适用于游戏中的人群模拟、NPC寻路等场景。

## 📁 示例文件

- **RVOExample.ts** - Cocos Creator 组件版本,带可视化绘制
- **RVOSimpleExample.ts** - 纯 TypeScript 版本,无依赖,可直接运行

## 🚀 快速开始

### 基础用法(5步)

```typescript
import Simulator from 'rvo/Simulator';
import Vector2D from 'rvo/Vector2D';

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

// 3. 添加代理
sim.addAgent(new Vector2D(-50, 0));  // 在 (-50, 0) 添加代理
sim.setAgentGoal(0, 50, 0);          // 设置目标为 (50, 0)

// 4. 每帧更新(在 update 循环中)
const position = sim.getAgentPosition(0);
const goal = sim.getGoal(0);
const diff = goal.minus(position);

if (diff.abs() > 1.0) {
    const prefVel = diff.normalize();
    sim.setAgentPrefVelocity(0, prefVel.x, prefVel.y);
}

// 5. 运行模拟
sim.run();

// 获取结果
const newPosition = sim.getAgentPosition(0);
const newVelocity = sim.getAgentVelocity(0);
```

## 📚 核心 API

### Simulator 类

#### 初始化
```typescript
setAgentDefaults(neighborDist, maxNeighbors, timeHorizon, timeHorizonObst, radius, maxSpeed)
setTimeStep(timeStep)  // 设置模拟时间步长(默认 0.25)
```

#### 代理管理
```typescript
addAgent(position: Vector2D): Agent        // 添加代理
removeAgent(agent: Agent)                  // 移除代理
getNumAgents(): number                     // 获取代理数量
```

#### 代理控制
```typescript
setAgentPosition(i, x, y)                  // 设置代理位置
setAgentGoal(i, x, y)                      // 设置代理目标
setAgentPrefVelocity(i, vx, vy)           // 设置期望速度
```

#### 查询
```typescript
getAgentPosition(i): Vector2D              // 获取代理位置
getAgentVelocity(i): Vector2D              // 获取代理速度
getAgentRadius(i): number                  // 获取代理半径
getGoal(i): Vector2D                       // 获取目标位置
```

#### 障碍物
```typescript
addObstacle(vertices: Vector2D[]): number  // 添加障碍物(顶点数组)
processObstacles()                         // 处理障碍物(必须调用!)
queryVisibility(p1, p2, radius): boolean   // 查询两点可见性
```

#### 模拟
```typescript
run()                                      // 执行一步模拟
reachedGoal(): boolean                     // 是否所有代理到达目标
getGlobalTime(): number                    // 获取模拟总时间
```

### Vector2D 类

```typescript
new Vector2D(x, y)        // 构造函数
plus(v): Vector2D         // 加法
minus(v): Vector2D        // 减法
scale(k): Vector2D        // 标量乘法
multiply(v): number       // 点乘
normalize(): Vector2D     // 归一化
abs(): number             // 长度
clone(): Vector2D         // 克隆
```

## 🎯 典型应用场景

### 1. 人群模拟
```typescript
// 创建100个代理,模拟人群疏散
for (let i = 0; i < 100; i++) {
    const startPos = getRandomPosition();
    const exitPos = getNearestExit(startPos);
    
    sim.addAgent(startPos);
    sim.setAgentGoal(i, exitPos.x, exitPos.y);
}
```

### 2. NPC 寻路
```typescript
// NPC 在有障碍物的环境中移动
sim.addObstacle(buildingVertices);
sim.processObstacles();

sim.addAgent(npcPosition);
sim.setAgentGoal(0, targetPosition.x, targetPosition.y);
```

### 3. 编队移动
```typescript
// 维持编队,互相避让
const formationPositions = getFormation();
for (let i = 0; i < units.length; i++) {
    sim.addAgent(units[i].position);
    sim.setAgentGoal(i, formationPositions[i].x, formationPositions[i].y);
}
```

## ⚙️ 参数调优指南

### neighborDist (邻居距离)
- **小值 (5-10)**: 只关注近距离邻居,反应快但可能碰撞
- **中值 (15-20)**: 平衡性能和安全性 ✅ 推荐
- **大值 (30+)**: 提前避让,但计算量大

### timeHorizon (时间视野)
- **小值 (1-3)**: 激进移动,可能穿插
- **中值 (5-10)**: 平滑避让 ✅ 推荐
- **大值 (15+)**: 过于保守,可能停滞

### maxNeighbors (最大邻居数)
- **小值 (3-5)**: 性能优先,密集场景可能碰撞
- **中值 (10-15)**: 通用场景 ✅ 推荐
- **大值 (20+)**: 密集人群,计算量大

### radius (半径)
- 代理的物理半径,应该与视觉表现一致
- 建议设置为实际大小的 1.0-1.2 倍

### maxSpeed (最大速度)
- 根据游戏单位调整
- 建议: 走路 2-3, 跑步 5-8

## 🔧 常见问题

### Q: 代理不移动?
A: 确保设置了 `setAgentPrefVelocity`,这是期望速度,不是目标点!

### Q: 代理穿墙?
A: 调用 `processObstacles()` 处理障碍物。

### Q: 性能问题?
A: 减小 `maxNeighbors` 或 `neighborDist`,使用空间分割。

### Q: 代理抖动?
A: 减小 `timeStep` 或增大 `timeHorizon`。

## 📊 性能建议

- **代理数 < 100**: 默认参数即可
- **代理数 100-500**: 减小 `maxNeighbors` 到 5-8
- **代理数 > 500**: 考虑分组处理,使用 LOD

## 🎮 完整示例

查看以下文件获取完整示例:
- `RVOSimpleExample.ts` - 4个独立示例
- `RVOExample.ts` - Cocos Creator 可视化示例

运行测试:
```typescript
import { RVOSimpleExample } from './RVOSimpleExample';

// 运行所有示例
RVOSimpleExample.runAll();

// 或运行单个示例
RVOSimpleExample.example1_TwoAgents();
```

## 📖 算法原理

RVO2 算法通过计算"速度障碍"来实现避障:
1. 每个代理计算其他代理和障碍物形成的速度障碍区域
2. 选择最接近期望速度且不在障碍区域的速度
3. 多个代理同时避让,形成互惠行为

## 📄 许可

本库遵循原 RVO2 库的许可协议。

---

**作者**: BearLuo  
**更新**: 2025-10-20


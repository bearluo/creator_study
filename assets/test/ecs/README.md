# ECS 框架示例

本目录包含 ECS 框架的使用示例和测试代码。

## 文件说明

### 基础示例
- `ECSExample.scene` - ECS 基础示例场景（需手动创建）
- `ECSExample.ts` - 基础使用示例
- `BitSetPerformanceTest.ts` - BitSet 性能测试

### 示例组件
- `components/TransformComponent.ts` - 位置变换组件
- `components/VelocityComponent.ts` - 速度组件
- `components/PlayerComponent.ts` - 玩家组件
- `components/HealthComponent.ts` - 生命值组件

### 示例系统
- `systems/MovementSystem.ts` - 移动系统
- `systems/RenderSystem.ts` - 渲染系统

## 使用方法

### 基础示例
1. 在 Cocos Creator 中手动创建 `ECSExample.scene` 场景
2. 将 `ECSExample.ts` 挂载到场景节点
3. 运行场景查看基础功能

### 性能测试
1. 将 `BitSetPerformanceTest.ts` 挂载到场景节点
2. 创建 Label 节点并关联到脚本
3. 运行场景查看性能测试结果
4. 验证 BitSet 优化效果

## 核心概念

### Entity（实体）
实体是游戏对象的唯一标识符，本身不包含数据和逻辑。

```typescript
const entity = world.createEntity('Player');
```

### Component（组件）
组件是纯数据容器，用于存储实体的属性。

```typescript
class PositionComponent extends Component {
    x: number = 0;
    y: number = 0;
}

world.addComponent(entity.id, PositionComponent);
```

### System（系统）
系统包含游戏逻辑，处理具有特定组件的实体。

```typescript
class MovementSystem extends System {
    private query!: Query;
    
    onInit() {
        this.query = this.world.createQuery({
            all: [PositionComponent, VelocityComponent]
        });
    }
    
    onUpdate(dt: number) {
        this.query.forEach(entity => {
            const pos = this.world.getComponent(entity.id, PositionComponent)!;
            const vel = this.world.getComponent(entity.id, VelocityComponent)!;
            
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;
        });
    }
}
```

## 性能优化建议

1. 使用对象池减少 GC 压力
2. 合理设置组件池大小
3. 避免在更新循环中创建/销毁大量实体
4. 使用查询缓存避免重复查询
5. 系统优先级设置合理，控制执行顺序


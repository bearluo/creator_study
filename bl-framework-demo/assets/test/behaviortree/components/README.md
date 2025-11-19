# 测试组件

## 📋 概述

本目录包含用于测试的 ECS 组件，用于测试行为树系统与 ECS 的集成。

## 📝 组件列表

### HealthComponent
健康组件，用于测试 Entity 数据绑定。

**属性**:
- `health: number` - 当前生命值
- `maxHealth: number` - 最大生命值
- `isDead: boolean` - 是否死亡

**方法**:
- `takeDamage(damage: number)` - 受到伤害
- `heal(amount: number)` - 恢复生命值
- `getHealthPercent()` - 获取生命值百分比

### PositionComponent
位置组件，用于测试 Entity 数据绑定。

**属性**:
- `position: Vec3` - 位置
- `rotation: Vec3` - 旋转
- `scale: Vec3` - 缩放

**方法**:
- `setPosition(x, y, z)` - 设置位置
- `move(dx, dy, dz)` - 移动

## 🚀 使用示例

```typescript
import { HealthComponent } from 'assets/test/components/HealthComponent';
import { PositionComponent } from 'assets/test/components/PositionComponent';

// 在测试中使用
const entity = world.createEntity('TestEntity');
const healthComp = entity.addComponent(HealthComponent);
const positionComp = entity.addComponent(PositionComponent);
```

## ⚠️ 注意事项

这些组件仅用于测试目的，不应在生产代码中使用。

---

*最后更新: 2025-11-17*


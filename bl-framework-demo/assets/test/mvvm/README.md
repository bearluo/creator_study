# MVVM 测试用例

## 📋 概述

本目录包含用于测试 `@bl-framework/mvvm-creator` 的测试用例和示例组件。

## 📝 文件说明

### SceneMVVMTest.ts
场景测试组件，用于在 Cocos Creator 场景中运行测试。

**使用方法**：
1. 在场景中添加一个空节点
2. 将 `SceneMVVMTest` 组件添加到该节点
3. 配置测试选项：
   - `runBasicTest`: 是否运行基础测试（默认：true）
   - `runComponentTest`: 是否运行组件测试（默认：true）
   - `autoRun`: 是否在 start 时自动运行（默认：true）
   - `testDelay`: 测试延迟时间（秒，默认：1）
   - `testNode`: 测试节点（用于添加 PlayerMVVMComponent）

### MVVMTest.ts
MVVM 测试类，包含各种功能测试用例。

**测试用例**：
1. **testDuplicatePathDetection**: 测试重复 path 检测
2. **testTwoWayBinding**: 测试 Two-way 回环防护
3. **testNodeFieldMapping**: 测试 Node 字段映射
4. **testDisableEnableCycle**: 测试 disable/enable 循环

### PlayerMVVMComponent.ts
玩家 MVVM 组件示例，演示如何使用 `MVVMComponent`。

**功能**：
- 绑定玩家名称到 Label
- 绑定等级到 Label（带格式化）
- 绑定生命值到 Label 和 ProgressBar
- 双向绑定玩家名称到 EditBox
- 绑定死亡状态到 Node.active

## 🚀 快速开始

### 1. 创建测试场景

1. 在 Cocos Creator 中打开 `scene-mvvm-test.scene`
2. 在场景中添加一个空节点
3. 将 `SceneMVVMTest` 组件添加到该节点
4. 配置测试选项

### 2. 运行测试

#### 自动运行
如果 `autoRun` 为 true，测试会在场景加载后自动运行。

#### 手动运行
在控制台或代码中调用：
```typescript
// 运行所有测试
sceneMVVMTest.runTests();

// 只运行基础测试
sceneMVVMTest.runBasicTests();
```

## 📝 测试内容

### 基础测试（MVVMTest）

1. **testDuplicatePathDetection**: 测试重复 path 检测
   - 验证 `BindingBuilder` 能正确检测重复的绑定路径
   - 验证抛出正确的错误消息

2. **testTwoWayBinding**: 测试 Two-way 回环防护
   - 验证程序更新不触发 change 事件
   - 验证 `silentDepth` 保护机制

3. **testNodeFieldMapping**: 测试 Node 字段映射
   - 验证 Node.active 映射不需要 componentCtor
   - 验证正常工作

4. **testDisableEnableCycle**: 测试 disable/enable 循环
   - 验证 watcher 数量不增长
   - 验证输入事件不叠加
   - 验证内存不泄露

### 组件测试（PlayerMVVMComponent）

1. **数据绑定测试**
   - 单向绑定（Label, ProgressBar）
   - 双向绑定（EditBox）
   - 格式化绑定（toLabelFmt）

2. **生命周期测试**
   - onLoad 创建
   - onEnable 绑定
   - onDisable 解绑
   - onDestroy 销毁

## ⚠️ 注意事项

1. 测试用例需要在 Cocos Creator 环境中运行
2. 某些测试需要实际的 Node/Component 对象
3. 测试结果会在控制台输出

---

*最后更新: 2025-01-XX*


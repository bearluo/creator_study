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
   - `mvvmTestComponent`: MVVM 测试组件（用于运行基础测试）

### MVVMTestComponent.ts
MVVM 测试组件，用于在 Cocos Creator 场景中运行 MVVM 功能测试。

**使用方法**：
1. 在场景中添加一个空节点
2. 将 `MVVMTestComponent` 组件添加到该节点
3. 配置测试选项：
   - `autoRun`: 是否在 start 时自动运行（默认：true）
   - `testDelay`: 测试延迟时间（秒，默认：1）

**测试用例**：
1. **testDuplicatePathDetection**: 测试同 path 多个 target（规则变更）
2. **testTwoWayBinding**: 测试 Two-way 回环防护（silentDepth 机制）
3. **testMultipleInputSamePath**: 测试同 path 多个 input（silentDepth 防回环）
4. **testNodeFieldMapping**: 测试 Node 字段映射（需要实际 Node 对象）
5. **testDisableEnableCycle**: 测试 disable/enable 循环（需要实际 MVVMComponent 实例）

**功能**：
- 使用 async/await 确保异步测试的正确执行
- 使用 `waitNextFrame()` 等待下一帧，确保响应式更新完成
- 自动运行所有测试用例
- 支持手动运行测试（调用 `runTestsManually()`）
- 防止重复运行（`hasRun` 标志）

### BindingConfigTestComponent.ts
bindConfig 测试组件，用于在 Cocos Creator 场景中运行 bindConfig 测试。

**使用方法**：
1. 在场景中添加一个空节点
2. 将 `BindingConfigTestComponent` 组件添加到该节点
3. 在属性检查器中配置测试组件：
   - **测试 1**: `test1Label` (Label) - 基础 bindConfig 测试
   - **测试 2**: `test2Label1`, `test2Label2` (Label) - 同 path 多个 target
   - **测试 3**: `test3LabelText`, `test3LabelFmt` (Label), `test3ProgressBar` (ProgressBar), `test3Node` (Node), `test3EditBox` (EditBox), `test3Toggle` (Toggle), `test3Slider` (Slider) - 所有内置 helper
   - **测试 4**: `test4Label` (Label) - 自定义 ViewTarget
   - **测试 5**: 使用 `test3LabelFmt` - formatter 类型推断
   - **测试 6**: 使用 `test3ProgressBar` - converter 类型推断
   - **测试 7**: 使用 `test3ProgressBar` - toProgress clamp
   - **测试 8**: 不需要组件 - null target 处理
   - **测试 9**: 使用 `test3LabelText` - mode 校验
   - **测试 10**: `test10EditBox` (EditBox) - two-way 绑定
4. 配置测试选项：
   - `autoRun`: 是否在 start 时自动运行（默认：true）
   - `testDelay`: 测试延迟时间（秒，默认：1）

**功能**：
- 使用真实的 Cocos Creator 组件进行测试
- 自动运行所有 bindConfig 测试
- 支持手动运行测试（调用 `runTestsManually()`）
- 防止重复运行（`hasRun` 标志）
- 如果组件未设置，测试会跳过并提示

**注意**：
- 所有测试组件通过 `@property` 声明，需要在 Cocos Creator 编辑器中手动绑定
- 测试会在场景中创建真实的 ViewModel 和 BindingBuilder 实例
- 测试完成后会自动清理资源

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

### 基础测试（MVVMTestComponent）

1. **testDuplicatePathDetection**: 测试同 path 多个 target（规则变更）
   - ✅ 新规则：允许同 path 绑定多个 ViewTarget
   - 验证更新数据时，所有 target 都能正确更新

2. **testTwoWayBinding**: 测试 Two-way 回环防护（silentDepth 机制）
   - 验证程序更新不触发 change 事件
   - 验证 `silentDepth` 保护机制正常工作

3. **testMultipleInputSamePath**: 测试同 path 多个 input（silentDepth 防回环）
   - 测试场景：两个 EditBox 绑定到同一个 path
   - 验证用户在 A 输入后，VM 更新，A 和 B 都更新到新值
   - 验证 `silentDepth` 机制防止回环

4. **testNodeFieldMapping**: 测试 Node 字段映射
   - ⚠️ 需要在 Cocos Creator 环境中运行（需要实际的 Node 对象）

5. **testDisableEnableCycle**: 测试 disable/enable 循环
   - ⚠️ 需要在 Cocos Creator 环境中运行（需要实际的 MVVMComponent 实例）

### 组件测试（PlayerMVVMComponent）

1. **数据绑定测试**
   - 单向绑定（Label, ProgressBar）
   - 双向绑定（EditBox）
   - 格式化绑定（使用 converter）

2. **生命周期测试**
   - onLoad 创建
   - onEnable 绑定
   - onDisable 解绑
   - onDestroy 销毁

3. **同 path 多个 target 测试**
   - 同 path 多个 display target（如 health 绑定到 Label 和 ProgressBar）
   - 同 path 多个 input target（如 playerName 绑定到两个 EditBox，silentDepth 防回环）

## ⚠️ 注意事项

1. 测试用例需要在 Cocos Creator 环境中运行
2. 某些测试需要实际的 Node/Component 对象
3. 测试结果会在控制台输出

---

*最后更新: 2025-01-XX*


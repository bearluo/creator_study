# 🎨 CREATIVE: 绑定声明语法糖设计

## 任务信息
- **任务ID**: MVVM-CREATOR-006-CREATIVE-1
- **方案**: 绑定声明语法糖（装饰器 + 配置式）
- **状态**: 🔄 设计中

---

## 📋 问题陈述

### 当前问题

**现有使用方式**（需要改进）：
```typescript
protected onMVVMCreate(): void {
    this.bindingBuilder
        .bind('name', toLabelText(this.nameLabel))
        .bind('level', toLabelFmt(this.levelLabel, (v: number) => `Lv.${v}`))
        .bind('playerName', toEditBox(this.nameInput), { mode: 'two-way' })
        .bind('isDead', toActive(this.deadMask));
}
```

**问题**：
- 需要手动调用 `bindingBuilder.bind()` 多次
- 需要手动导入 ViewTarget 辅助函数（toLabelText, toEditBox 等）
- 代码重复性较高
- 对于简单绑定，代码量较多

### 设计目标

1. **减少模板代码**：提供更简洁的绑定声明方式
2. **保持类型安全**：不能牺牲现有的类型安全特性
3. **向后兼容**：现有 BindingBuilder API 必须继续工作
4. **易于使用**：降低学习曲线，提高开发效率

### 约束条件

1. **类型安全**：必须保持 Path<T> 和 PathValue<T, P> 的类型推断
2. **向后兼容**：现有 API 不能破坏
3. **性能**：不能引入明显的性能开销
4. **可维护性**：代码清晰，易于理解和维护

---

## 🔍 方案探索

### 方案 1: 属性装饰器（@bindProperty）

**核心思路**：在 `@property` 装饰的属性上添加 `@bindProperty` 装饰器，自动创建绑定。

**实现方式**：
- 使用 TypeScript 装饰器（experimentalDecorators）
- 装饰器存储元数据到类原型（WeakMap）
- MVVMComponent 在初始化时扫描装饰器元数据
- 自动应用绑定配置

**示例**：
```typescript
@ccclass('PlayerComponent')
export class PlayerComponent extends MVVMComponent<PlayerData> {
    @property(Label)
    @bindProperty('name')  // 自动推断：Label -> toLabelText
    nameLabel!: Label;
    
    @property(Label)
    @bindProperty('level', { 
        helper: 'toLabelFmt',
        formatter: (v: number) => `Lv.${v}`
    })
    levelLabel!: Label;
    
    @property(EditBox)
    @bindProperty('playerName', { mode: 'two-way' })  // 自动推断：EditBox -> toEditBox
    nameInput!: EditBox;
}
```

**优点**：
- ✅ 最简洁，代码量最少
- ✅ 声明式，易于理解
- ✅ 与 Cocos Creator 的 `@property` 风格一致
- ✅ 属性名和路径关联清晰

**缺点**：
- ❌ TypeScript 装饰器限制（需要 experimentalDecorators）
- ❌ 类型推断可能受限（装饰器参数中的路径类型）
- ❌ 复杂绑定（格式化、转换器）支持困难
- ❌ 需要修改 MVVMComponent 的初始化逻辑
- ❌ 装饰器元数据访问受限

### 方案 2: 配置式绑定（bindConfig）

**核心思路**：使用配置对象声明绑定，在 `onMVVMCreate()` 中调用 `bindConfig()`。

**实现方式**：
- 扩展 BindingBuilder，添加 `bindConfig()` 方法
- 配置对象类型化，支持类型推断
- 配置到 ViewTarget 的自动转换

**示例**：
```typescript
protected onMVVMCreate(): void {
    this.bindingBuilder.bindConfig({
        name: { 
            target: this.nameLabel, 
            helper: 'toLabelText' 
        },
        level: { 
            target: this.levelLabel, 
            helper: 'toLabelFmt',
            formatter: (v: number) => `Lv.${v}`
        },
        playerName: { 
            target: this.nameInput, 
            helper: 'toEditBox',
            mode: 'two-way'
        },
        isDead: {
            target: this.deadMask,
            helper: 'toActive'
        }
    });
}
```

**优点**：
- ✅ 类型安全（配置对象可以类型化）
- ✅ 支持复杂绑定（格式化、转换器）
- ✅ 不需要装饰器支持
- ✅ 易于理解和维护
- ✅ 路径类型自动推断

**缺点**：
- ❌ 仍然需要显式调用
- ❌ 代码量减少有限
- ❌ 需要手动指定 helper 名称（字符串）

### 方案 3: 智能属性推断（autoBind）

**核心思路**：在 `onMVVMCreate()` 中，通过属性名自动推断绑定规则，使用约定优于配置。

**实现方式**：
- 约定：`nameLabel` -> `'name'` + `toLabelText`
- 约定：`levelLabel` -> `'level'` + `toLabelFmt`
- 约定：`nameInput` -> `'name'` + `toEditBox` (two-way)
- 自动扫描组件属性，推断绑定规则

**示例**：
```typescript
protected onMVVMCreate(): void {
    // 自动推断：nameLabel -> 'name' + toLabelText
    // 自动推断：levelLabel -> 'level' + toLabelFmt
    // 自动推断：nameInput -> 'playerName' + toEditBox (two-way)
    this.bindingBuilder.autoBind(this);
}
```

**优点**：
- ✅ 不需要装饰器
- ✅ 类型安全
- ✅ 代码最简洁
- ✅ 支持复杂绑定（通过配置覆盖）

**缺点**：
- ❌ 需要严格的命名约定
- ❌ 灵活性受限（命名必须遵循约定）
- ❌ 推断规则可能复杂
- ❌ 错误难以调试（推断失败时）

### 方案 4: 混合方案（推荐）

**核心思路**：结合方案 1 和方案 2，提供装饰器和配置式两种方式。

**实现方式**：
- 装饰器：简单场景，声明式
- 配置式：复杂场景，灵活配置
- 两者可以混合使用

**示例**：
```typescript
@ccclass('PlayerComponent')
export class PlayerComponent extends MVVMComponent<PlayerData> {
    // 简单绑定：使用装饰器
    @property(Label)
    @bindProperty('name')
    nameLabel!: Label;
    
    // 复杂绑定：使用配置式
    protected onMVVMCreate(): void {
        this.bindingBuilder
            .bindConfig({
                level: { 
                    target: this.levelLabel, 
                    helper: 'toLabelFmt',
                    formatter: (v: number) => `Lv.${v}`
                },
                playerName: { 
                    target: this.nameInput, 
                    helper: 'toEditBox',
                    mode: 'two-way'
                }
            });
    }
}
```

**优点**：
- ✅ 灵活性高
- ✅ 简单场景用装饰器，复杂场景用配置
- ✅ 向后兼容
- ✅ 类型安全

**缺点**：
- ❌ 实现复杂度较高
- ❌ 需要维护两套 API
- ❌ 可能增加学习曲线

---

## 🎯 方案对比

| 方案 | 代码简洁度 | 类型安全 | 灵活性 | 实现复杂度 | 向后兼容 |
|------|-----------|---------|--------|-----------|---------|
| 方案 1: 装饰器 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 方案 2: 配置式 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 方案 3: 智能推断 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 方案 4: 混合方案 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## ✅ 推荐方案：方案 2（配置式绑定 - 最终版）

### 选择理由

1. **类型安全最佳**：配置对象可以完全类型化，路径类型自动推断
2. **实现复杂度适中**：不需要装饰器支持，实现相对简单
3. **灵活性高**：支持所有复杂绑定场景
4. **向后兼容**：完全可选，不影响现有 API
5. **易于维护**：代码清晰，易于理解和调试
6. **支持同 path 多 target**：数组式结构天然支持

### 核心说明

**重要**：`bindConfig` 是"声明期语法糖"，最终仍然落到 `bind(path, ViewTarget, options)`。因此它不会改变运行时行为，只减少样板代码。这确保了：
- ✅ 不会引入新的运行时风险
- ✅ 与现有 `bind()` 方法行为完全一致
- ✅ 支持所有现有功能（同 path 多 target、sourceId 防回环等）

**sourceId 说明**：
- `sourceId` 在 `build()` 阶段由 `TargetViewAdapter` 分配并注入 `DataBinding`，不需要在 `bindConfig` 配置中声明
- `bindConfig` 是声明期语法糖，只负责声明绑定规则，实际的 `sourceId` 分配在 `BindingBuilder.build()` 时完成
- 这确保了同 path 多个 input target 时，每个 target 都有唯一的 `sourceId`，防止 two-way 绑定回环

### 不选择方案 1（装饰器）的原因

1. **TypeScript 装饰器限制**：需要 experimentalDecorators，可能影响兼容性
2. **类型推断受限**：装饰器参数中的路径类型推断困难
3. **复杂绑定支持困难**：格式化、转换器等难以在装饰器中表达

### 不选择方案 3（智能推断）的原因

1. **命名约定限制**：需要严格的命名约定，灵活性受限
2. **推断规则复杂**：推断失败时难以调试
3. **错误处理困难**：推断失败时错误信息不清晰

### 不选择方案 4（混合方案）的原因

1. **实现复杂度高**：需要维护两套 API
2. **学习曲线**：用户需要理解两套 API
3. **过度设计**：对于当前需求，单一方案更合适

---

## 🏗️ 实施方案设计（方案 2：配置式绑定）

### 核心设计

#### 1. 配置对象类型定义（最终版）

**关键设计决策**：
- ✅ **数组式结构**：支持同 path 多个 target
- ✅ **Discriminated Union**：编译期类型检查，确保 helper 与参数匹配
- ✅ **类型推断**：formatter/converter 参数类型自动推断

```typescript
import type { Path, PathValue, BindingOptions } from '@bl-framework/mvvm';
import type { Label, EditBox, ProgressBar, Toggle, Slider, Node } from 'cc';

type EditBoxEventType = typeof EditBox.EventType[keyof typeof EditBox.EventType];

/**
 * 绑定配置项（Discriminated Union - 编译期类型检查）
 * 
 * 每个 helper 对应不同的参数要求，TypeScript 会在编译期检查：
 * - toLabelFmt 必须有 formatter
 * - toEditBox target 必须是 EditBox
 * - 等等
 */
type BindingConfigItem<T, P extends Path<T> & string> =
    // Display targets（只支持 one-way）
    | {
          helper: 'toLabelText';
          target: Label | null;
          mode?: 'one-way'; // 只允许 one-way
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toLabelFmt';
          target: Label | null;
          formatter: (value: PathValue<T, P>) => string; // 必须提供
          mode?: 'one-way'; // 只允许 one-way
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toProgress';
          target: ProgressBar | null;
          /**
           * 转换器（可选）
           * 
           * ⚠️ **重要**：
           * - converter 接收原始值（PathValue<T, P>），应当返回 0..1 的 ratio
           * - 如果数据本身就是 0..1，可以不传 converter（直接使用原始值）
           * - 如果数据是 0..max，需要 converter: (v) => v / max
           * - **规范**：helper 内部会 clamp 到 0..1 范围，确保 ProgressBar.progress 始终有效
           * - 开发者无需在 converter 中手动 clamp，但建议 converter 返回合理范围
           */
          converter?: (value: PathValue<T, P>) => number;
          mode?: 'one-way'; // 只允许 one-way
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toActive';
          target: Node | null;
          mode?: 'one-way'; // 只允许 one-way
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    // Input targets（支持 two-way / one-way-to-source）
    | {
          helper: 'toEditBox';
          target: EditBox | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          event?: EditBoxEventType;
          reverseConverter?: (value: string) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toToggle';
          target: Toggle | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          reverseConverter?: (value: boolean) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toSlider';
          target: Slider | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          reverseConverter?: (value: number) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      };

/**
 * 绑定配置项入口（按 path 自动推断 P，保持类型推断）
 * 
 * @template T 数据类型
 * @template P 数据路径类型（从 path 推断）
 */
export type BindingConfigEntry<T, P extends Path<T> & string> = {
    path: P;
} & BindingConfigItem<T, P>;

/**
 * 绑定配置数组（支持同 path 多个 target）
 * 
 * @template T 数据类型
 * 
 * 使用数组式结构，天然支持同 path 多个 target：
 * ```typescript
 * [
 *   { path: 'health', target: this.healthLabel, helper: 'toLabelFmt', formatter: v => `${v}` },
 *   { path: 'health', target: this.healthBar, helper: 'toProgress', converter: v => v / max }
 * ]
 * ```
 * 
 * ⚠️ **类型推断关键**：使用 `BindingConfigEntry<T, Path<T> & string>` 而不是 `BindingConfigItem<T, any>`，
 * 确保 path 的字面量类型（'level'）能传进 P，PathValue<T,P> 才能推回 formatter 参数类型。
 */
export type BindingConfig<T> = Array<BindingConfigEntry<T, Path<T> & string>>;
```

#### 2. BindingBuilder.bindConfig() 方法（最终版）

```typescript
/**
 * 批量绑定配置（类型安全，支持同 path 多个 target）
 * 
 * @param config 绑定配置数组（路径类型自动推断）
 * @returns this（支持链式调用）
 * 
 * @example
 * ```typescript
 * this.bindingBuilder.bindConfig([
 *     { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
 *     { 
 *         path: 'level', 
 *         target: this.levelLabel, 
 *         helper: 'toLabelFmt',
 *         formatter: (v) => `Lv.${v}`  // ✅ v 自动推断为 number（不要手写类型）
 *     },
 *     { 
 *         path: 'health', 
 *         target: this.healthLabel, 
 *         helper: 'toLabelFmt',
 *         formatter: (v) => `${v}/${max}`  // ✅ 同 path 多个 target
 *     },
 *     { 
 *         path: 'health', 
 *         target: this.healthBar, 
 *         helper: 'toProgress',
 *         converter: (v) => v / max  // ✅ 同 path 多个 target
 *     }
 * ]);
 * ```
 */
/**
 * 批量绑定配置（类型安全，支持同 path 多个 target）
 * 
 * ⚠️ **类型推断关键**：使用泛型保持推断，让 path 的字面量类型（'level'）能传进 P
 * 
 * @param config 绑定配置数组（路径类型自动推断）
 * @returns this（支持链式调用）
 * 
 * @example
 * ```typescript
 * this.bindingBuilder.bindConfig([
 *     { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
 *     { 
 *         path: 'level', 
 *         target: this.levelLabel, 
 *         helper: 'toLabelFmt',
 *         formatter: (v) => `Lv.${v}`  // ✅ v 自动推断为 number（不要手写类型）
 *     }
 * ] as const);  // 使用 as const 保持字面量类型
 * ```
 */
bindConfig<const C extends readonly BindingConfigEntry<T, Path<T> & string>[]>(
    config: C
): this {
    for (const item of config) {
        const { path, helper, ...rest } = item;
        const target = item.target;
        
        // ⚠️ 工程约束：target === null 处理
        if (target === null) {
            // 使用 Cocos Creator 的 DEBUG 标志（而不是 process.env.NODE_ENV）
            // import { DEBUG } from 'cc/env';
            if (typeof DEBUG !== 'undefined' && DEBUG) {
                throw new Error(`[bindConfig] target is null for path "${path}", helper "${helper}". Please check @property binding.`);
            } else {
                console.warn(`[bindConfig] target is null for path "${path}", helper "${helper}". Skipping binding.`);
                continue;
            }
        }
        
        // ⚠️ 工程约束：mode 与 helper 的合法组合校验（仅用于运行时兜底，防 any/JS）
        this._validateModeHelper(helper, rest.mode);
        
        // 根据 helper 创建 ViewTarget（discriminated union 确保类型安全）
        // ⚠️ 注意：此时 target 已确保非 null，TypeScript 会根据 helper 分支自动收窄 target 类型
        const viewTarget = this._createViewTarget(item);
        
        // 构建 BindingOptions
        const options: BindingOptions<PathValue<T, any>, any> = {
            mode: rest.mode || (this._isInputHelper(helper) ? 'two-way' : 'one-way'),
            converter: 'converter' in rest ? rest.converter : undefined,
            reverseConverter: 'reverseConverter' in rest ? rest.reverseConverter : undefined,
            validator: 'validator' in rest ? rest.validator : undefined,
            onError: 'onError' in rest ? rest.onError : undefined
        };
        
        // 调用现有的 bind 方法（类型安全）
        this.bind(path as any, viewTarget, options);
    }
    return this;
}

/**
 * 根据 helper 创建 ViewTarget（discriminated union 确保类型安全）
 * 
 * ⚠️ **类型收窄**：在调用此方法前，必须确保 item.target !== null。
 * TypeScript 会根据 helper 分支自动收窄 target 类型，无需额外断言。
 * 
 * @private
 * @param item 绑定配置项（调用前需确保 target 非 null）
 */
private _createViewTarget<P extends Path<T> & string>(
    item: BindingConfigEntry<T, P>
): ViewTarget<any> {
    // 此时 item.target 已确保非 null（由 bindConfig 的 null-check 保证）
    // TypeScript 会根据 item.helper 分支自动收窄 item.target 的类型
    switch (item.helper) {
        case 'toLabelText':
            // item.target 自动收窄为 Label（discriminated union）
            return toLabelText(item.target as Label);
        case 'toLabelFmt':
            // item.target 自动收窄为 Label，item.formatter 确保存在
            return toLabelFmt(item.target as Label, item.formatter);
        case 'toEditBox':
            // item.target 自动收窄为 EditBox
            return toEditBox(item.target as EditBox, item.event ? { event: item.event } : undefined);
        case 'toProgress':
            // item.target 自动收窄为 ProgressBar
            // ⚠️ **注意**：toProgress 的 converter 接收原始值，应当返回 0..1 的 ratio
            // 如果数据本身就是 0..1，可以不传 converter
            // 如果数据是 0..max，需要 converter: (v) => v / max
            // **规范**：helper 内部会 clamp 到 0..1 范围，开发者无需手动 clamp
            return toProgress(item.target as ProgressBar, item.converter);
        case 'toActive':
            // item.target 自动收窄为 Node
            return toActive(item.target as Node);
        case 'toToggle':
            // item.target 自动收窄为 Toggle
            return toToggle(item.target as Toggle);
        case 'toSlider':
            // item.target 自动收窄为 Slider
            return toSlider(item.target as Slider);
        default:
            // TypeScript 会确保所有 case 都被处理
            const _exhaustive: never = item;
            throw new Error(`[bindConfig] Unknown helper: ${(item as any).helper}`);
    }
}

/**
 * 校验 mode 与 helper 的合法组合（仅用于运行时兜底，防 any/JS）
 * 
 * ⚠️ **定位**：discriminated union 已经在类型层限制了 display helper 的 mode 为 'one-way'，
 * 此方法主要用于：
 * - 防止用户用 `as any` 绕过类型检查
 * - JS 调用场景
 * 
 * @private
 */
private _validateModeHelper(helper: string, mode?: string): void {
    if (!mode) return;
    
    const isDisplayHelper = ['toLabelText', 'toLabelFmt', 'toProgress', 'toActive'].includes(helper);
    const isInputHelper = ['toEditBox', 'toToggle', 'toSlider'].includes(helper);
    
    if (isDisplayHelper && mode !== 'one-way') {
        // 使用 Cocos Creator 的 DEBUG 标志
        if (typeof DEBUG !== 'undefined' && DEBUG) {
            throw new Error(
                `[bindConfig] Display helper "${helper}" only supports 'one-way' mode, got "${mode}"`
            );
        }
    }
    
    if (isInputHelper && mode === 'one-way') {
        // 使用 Cocos Creator 的 DEBUG 标志
        if (typeof DEBUG !== 'undefined' && DEBUG) {
            console.warn(
                `[bindConfig] Input helper "${helper}" with 'one-way' mode is unusual. Consider 'two-way' or 'one-way-to-source'.`
            );
        }
    }
}

/**
 * 判断是否为 input helper
 * 
 * @private
 */
private _isInputHelper(helper: string): boolean {
    return ['toEditBox', 'toToggle', 'toSlider'].includes(helper);
}
```

#### 3. 使用示例（最终版）

**完整示例**：
```typescript
protected onMVVMCreate(): void {
    // 方式 1: 使用 bindConfig（推荐，类型安全，减少模板代码，支持同 path 多 target）
    this.bindingBuilder.bindConfig([
        { 
            path: 'name', 
            target: this.nameLabel, 
            helper: 'toLabelText' 
        },
        { 
            path: 'level', 
            target: this.levelLabel, 
            helper: 'toLabelFmt',
            formatter: (v) => `Lv.${v}`  // ✅ v 自动推断为 number（不要手写类型）
        },
        { 
            path: 'health', 
            target: this.healthLabel, 
            helper: 'toLabelFmt',
            formatter: (v) => `${v}/${this.viewModel.reactive.value.maxHealth}`  // ✅ 同 path 多个 target
        },
        { 
            path: 'health',  // ✅ 同 path 多个 target（数组式天然支持）
            target: this.healthBar, 
            helper: 'toProgress',
            converter: (v) => v / this.viewModel.reactive.value.maxHealth
        },
        { 
            path: 'playerName', 
            target: this.nameInput, 
            helper: 'toEditBox',
            mode: 'two-way'  // 默认就是 two-way，可省略
        },
        {
            path: 'isDead',
            target: this.deadMask,
            helper: 'toActive'
        }
    ]);
    
    // 方式 2: 继续使用现有的 bind() 方法（向后兼容）
    // this.bindingBuilder
    //     .bind('name', toLabelText(this.nameLabel))
    //     .bind('level', toLabelFmt(this.levelLabel, (v) => `Lv.${v}`))
    //     .bind('playerName', toEditBox(this.nameInput), { mode: 'two-way' })
    //     .bind('isDead', toActive(this.deadMask));
    
    // 方式 3: 混合使用（bindConfig + bind）
    // this.bindingBuilder
    //     .bindConfig([
    //         { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
    //         { path: 'level', target: this.levelLabel, helper: 'toLabelFmt', formatter: (v) => `Lv.${v}` }
    //     ])
    //     .bind('playerName', toEditBox(this.nameInput), { mode: 'two-way' });
}
```

**类型安全验证**：
```typescript
// ✅ 类型安全：路径自动提示
this.bindingBuilder.bindConfig([
    { path: 'name', target: this.nameLabel, helper: 'toLabelText' },           // ✅ 'name' 有效
    { path: 'level', target: this.levelLabel, helper: 'toLabelFmt', formatter: (v) => `Lv.${v}` }, // ✅ 'level' 有效
    { path: 'stats.health', target: this.healthLabel, helper: 'toLabelText' }, // ✅ 'stats.health' 有效
    // { path: 'invalid', target: this.nameLabel, helper: 'toLabelText' },    // ❌ TypeScript 错误
]);

// ✅ 类型安全：formatter 参数类型自动推断（不要手写类型）
this.bindingBuilder.bindConfig([
    { 
        path: 'level', 
        target: this.levelLabel, 
        helper: 'toLabelFmt',
        formatter: (v) => `Lv.${v}`  // ✅ v 自动推断为 number（最佳实践：不要手写 v: number）
    },
    { 
        path: 'name', 
        target: this.nameLabel, 
        helper: 'toLabelFmt',
        formatter: (v) => v.toUpperCase()  // ✅ v 自动推断为 string
    }
]);

// ✅ 类型安全：discriminated union 确保 helper 与参数匹配
this.bindingBuilder.bindConfig([
    { 
        path: 'level', 
        target: this.levelLabel, 
        helper: 'toLabelFmt',
        // formatter: (v) => `Lv.${v}`  // ❌ TypeScript 错误：toLabelFmt 必须提供 formatter
    },
    { 
        path: 'name', 
        target: this.nameInput,  // ❌ TypeScript 错误：toLabelText 的 target 必须是 Label
        helper: 'toLabelText'
    }
]);
```

**最佳实践**：
```typescript
// ✅ 推荐：让 TypeScript 自动推断类型
formatter: (v) => `Lv.${v}`  // v 自动推断为 number

// ❌ 不推荐：手写类型会削弱类型推断的价值
formatter: (v: number) => `Lv.${v}`  // 虽然也能工作，但失去了自动推断的意义
```

---

## 📋 实施指南（最终版）

### 阶段 1: 类型定义

**文件**: `packages/mvvm-creator/src/types/binding-config.ts`

```typescript
import type { Path, PathValue } from '@bl-framework/mvvm';
import type { Label, EditBox, ProgressBar, Toggle, Slider, Node } from 'cc';

type EditBoxEventType = typeof EditBox.EventType[keyof typeof EditBox.EventType];

/**
 * 绑定配置项（Discriminated Union - 编译期类型检查）
 * 
 * 每个 helper 对应不同的参数要求，TypeScript 会在编译期检查：
 * - toLabelFmt 必须有 formatter
 * - toEditBox target 必须是 EditBox
 * - display helpers 只允许 one-way
 * - input helpers 允许 two-way / one-way-to-source
 */
export type BindingConfigItem<T, P extends Path<T> & string> =
    // Display targets（只支持 one-way）
    | {
          helper: 'toLabelText';
          target: Label | null;
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toLabelFmt';
          target: Label | null;
          formatter: (value: PathValue<T, P>) => string; // 必须提供
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toProgress';
          target: ProgressBar | null;
          converter?: (value: PathValue<T, P>) => number;
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toActive';
          target: Node | null;
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    // Input targets（支持 two-way / one-way-to-source）
    | {
          helper: 'toEditBox';
          target: EditBox | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          event?: EditBoxEventType;
          reverseConverter?: (value: string) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toToggle';
          target: Toggle | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          reverseConverter?: (value: boolean) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toSlider';
          target: Slider | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          reverseConverter?: (value: number) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      };

/**
 * 绑定配置项入口（按 path 自动推断 P，保持类型推断）
 * 
 * @template T 数据类型
 * @template P 数据路径类型（从 path 推断）
 */
export type BindingConfigEntry<T, P extends Path<T> & string> = {
    path: P;
} & BindingConfigItem<T, P>;

/**
 * 绑定配置数组（支持同 path 多个 target）
 * 
 * @template T 数据类型
 * 
 * ⚠️ **类型推断关键**：使用 `BindingConfigEntry<T, Path<T> & string>` 而不是 `BindingConfigItem<T, any>`，
 * 确保 path 的字面量类型（'level'）能传进 P，PathValue<T,P> 才能推回 formatter 参数类型。
 */
export type BindingConfig<T> = Array<BindingConfigEntry<T, Path<T> & string>>;
```

**任务**：
- [ ] 创建类型定义文件
- [ ] 使用 Discriminated Union 确保类型安全
- [ ] **关键（硬要求）**：使用 `BindingConfigEntry<T, P>` 而不是 `BindingConfigItem<T, any>`，保持类型推断
  - [ ] **禁止使用 `any`**：`BindingConfig<T>` 必须使用 `Array<BindingConfigEntry<T, Path<T> & string>>`
  - [ ] **禁止写法**：`Array<{ path: Path<T> & string } & BindingConfigItem<T, any>>`（会破坏类型推断）
  - [ ] **正确写法**：先定义 `BindingConfigEntry<T, P>`，再定义 `BindingConfig<T> = Array<BindingConfigEntry<T, Path<T> & string>>`
- [ ] 导出类型到 `packages/mvvm-creator/src/types/index.ts`
- [ ] 确保路径类型自动推断（path 字面量类型能传进 P）
- [ ] **toProgress 规范**：在类型注释中明确说明 helper 内部会 clamp 0..1

### 阶段 2: BindingBuilder 扩展

**文件**: `packages/mvvm-creator/src/builders/BindingBuilder.ts`

**任务**：
- [ ] 导入类型定义
- [ ] 添加 `bindConfig()` 方法（数组式，支持同 path 多 target）
  - [ ] **关键**：使用泛型 `bindConfig<const C extends readonly BindingConfigEntry<T, Path<T> & string>[]>` 保持类型推断
  - [ ] 使用 `import { DEBUG } from 'cc/env'` 而不是 `process.env.NODE_ENV`
- [ ] 实现 `_createViewTarget()` 私有方法（使用 discriminated union）
  - [ ] **关键**：简化签名 `_createViewTarget<P>(item: BindingConfigEntry<T, P>)`
  - [ ] 在 `bindConfig` 中先做 null-check，确保进入 `_createViewTarget` 时 target 非 null
  - [ ] 利用 discriminated union 的类型收窄，TypeScript 会根据 helper 分支自动收窄 target 类型
  - [ ] 实现中只需要少量类型断言（因为 union 类型收窄不是完美的）
- [ ] 实现 `_validateModeHelper()` 私有方法（mode 与 helper 合法组合校验）
  - [ ] **定位**：仅用于运行时兜底（防 any/JS），主要防线是 discriminated union
  - [ ] 使用 `import { DEBUG } from 'cc/env'` 而不是 `process.env.NODE_ENV`
- [ ] 实现 `_isInputHelper()` 私有方法（判断是否为 input helper）
- [ ] 实现 target === null 处理（DEBUG 模式 throw，release warn）
- [ ] **toProgress 规范**：更新 `toProgress` helper 实现，添加内部 clamp 0..1（`Math.max(0, Math.min(1, value))`）
- [ ] 确保与现有 `bind()` 方法兼容
- [ ] 支持同 path 多个 target（与现有行为一致）

### 阶段 3: 测试和文档

**任务**：
- [ ] 创建单元测试（`packages/mvvm-creator/src/__tests__/BindingBuilder.bindConfig.test.ts`）
- [ ] 更新 README.md（添加 bindConfig 使用示例）
- [ ] 更新示例文件（`packages/mvvm-creator/examples/builder-usage.ts`）
- [ ] 验证类型安全（编译时检查）

---

## ⚠️ 风险点和工程约束

### 风险点

1. **类型推断**：确保配置数组中的路径类型可以正确推断
   - **缓解**：使用 `BindingConfig<T>` 数组类型，确保路径类型自动推断
   - **验证**：编译时类型检查

2. **类型推断完整性**：确保 path 字面量类型能传进 P
   - **缓解**：使用 `BindingConfigEntry<T, P>` 而不是 `BindingConfigItem<T, any>`
   - **缓解**：`bindConfig` 方法使用泛型 `bindConfig<const C extends readonly BindingConfigEntry<T, Path<T> & string>[]>`
   - **验证**：TypeScript 编译时检查，formatter 参数类型自动推断

3. **Discriminated Union 完整性**：确保所有 helper 都被处理
   - **缓解**：使用 `never` 类型确保 exhaustive check
   - **验证**：TypeScript 编译时检查

4. **向后兼容**：确保现有 API 不受影响
   - **缓解**：`bindConfig()` 是新方法，不影响现有 `bind()` 方法
   - **验证**：现有测试用例继续通过

5. **同 path 多个 target**：确保与现有行为一致
   - **缓解**：`bindConfig()` 内部调用 `bind()`，行为一致
   - **验证**：测试同 path 多个 target 的场景

6. **Cocos Creator 环境变量**：`process.env.NODE_ENV` 可能不存在
   - **缓解**：使用 `import { DEBUG } from 'cc/env'` 而不是 `process.env.NODE_ENV`
   - **验证**：在 Cocos Creator 环境中测试

### 工程约束

1. **mode 与 helper 的合法组合**（硬规则）
   - **Display helpers**（toLabelText, toLabelFmt, toProgress, toActive）：只允许 `one-way`
   - **Input helpers**（toEditBox, toToggle, toSlider）：允许 `two-way`（默认）或 `one-way-to-source`
   - **验证**：`_validateModeHelper()` 在 DEBUG 模式下 throw，release 模式下 warn
   - **定位**：discriminated union 是主要防线，`_validateModeHelper()` 仅用于运行时兜底（防 any/JS）

2. **target: null 的语义**（硬规则）
   - **DEBUG 模式**：`target === null` → throw（快速暴露 prefab 未挂引用）
   - **Release 模式**：warn + skip（不中断游戏）
   - **判断方式**：使用 `import { DEBUG } from 'cc/env'` 而不是 `process.env.NODE_ENV`
   - **API 注释**：明确说明 null 的处理方式

3. **类型推断用法约束**（最佳实践）
   - **推荐**：`formatter: (v) => ...`（让 TS 自动推断 v 的类型）
   - **不推荐**：`formatter: (v: number) => ...`（手写类型会削弱推断价值）
   - **文档**：在示例和最佳实践中明确说明
   - **调用方式**：使用 `as const` 保持 path 字面量类型，确保类型推断

4. **toProgress converter 语义**（硬规则）
   - **converter 接收**：原始值（PathValue<T, P>）
   - **converter 返回**：应当返回 0..1 的 ratio（建议范围，但不强制）
   - **缺省行为**：如果不传 converter，直接使用原始值（假设数据本身就是 0..1）
   - **常见用法**：如果数据是 0..max，需要 `converter: (v) => v / max`
   - **规范（固化）**：helper 内部会 clamp 到 0..1 范围，确保 ProgressBar.progress 始终有效
   - **开发者建议**：虽然 helper 会 clamp，但建议 converter 返回合理范围，避免依赖 clamp 行为

---

## ✅ 验收标准（最终版）

### 功能验收

1. **bindConfig() 方法**：
   - [ ] 可以批量声明绑定（数组式）
   - [ ] 配置数组类型安全（路径类型自动推断）
   - [ ] 支持所有 ViewTarget 辅助函数（toLabelText, toLabelFmt, toEditBox, toProgress, toActive, toToggle, toSlider）
   - [ ] 支持复杂绑定（格式化、转换器、验证器）
   - [ ] **支持同 path 多个 target**（数组式天然支持）
   - [ ] 支持 two-way 绑定

2. **类型安全（Discriminated Union）**：
   - [ ] 路径类型自动推断（IDE 自动补全）
   - [ ] formatter/converter 参数类型自动推断（不要手写类型）
   - [ ] 编译时类型检查（无效路径报错）
   - [ ] **toLabelFmt 缺少 formatter → 编译时错误**
   - [ ] **toEditBox target 不是 EditBox → 编译时错误**

3. **工程约束**：
   - [ ] mode 与 helper 合法组合校验（DEBUG 模式 throw，使用 `import { DEBUG } from 'cc/env'`）
   - [ ] target === null 处理（DEBUG 模式 throw，release 模式 warn + skip）
   - [ ] 文档明确说明 null 处理方式
   - [ ] toProgress converter 的语义明确（接收原始值，应当返回 0..1 ratio）
   - [ ] toProgress helper 内部 clamp 0..1 规范已固化（实施要求）

4. **向后兼容**：
   - [ ] 现有的 `bind()` 方法继续工作
   - [ ] 现有的使用方式不受影响
   - [ ] 新功能是可选的

### 质量验收

1. **性能**：
   - [ ] 初始化性能无明显下降
   - [ ] 运行时性能无影响

2. **文档**：
   - [ ] README 更新完整
   - [ ] 示例代码清晰（使用数组式，展示同 path 多 target）
   - [ ] API 文档完整
   - [ ] 最佳实践说明（不要手写类型，让 TS 自动推断）

3. **测试**：
   - [ ] 单元测试覆盖主要场景
   - [ ] 类型安全测试（discriminated union）
   - [ ] 同 path 多 target 测试
   - [ ] mode 校验测试
   - [ ] target === null 处理测试
   - [ ] 向后兼容测试

---

## 📝 实施注意事项（关键修复）

### 1. 类型推断修复（必须）

**问题**：`BindingConfigItem<T, any>` 会破坏类型推断

**修复**：
```typescript
// ❌ 错误：会破坏类型推断
type BindingConfig<T> = Array<{
    path: Path<T> & string;
} & BindingConfigItem<T, any>>;

// ✅ 正确：保持类型推断
export type BindingConfigEntry<T, P extends Path<T> & string> = {
    path: P;
} & BindingConfigItem<T, P>;

export type BindingConfig<T> = Array<BindingConfigEntry<T, Path<T> & string>>;

// bindConfig 方法签名
bindConfig<const C extends readonly BindingConfigEntry<T, Path<T> & string>[]>(
    config: C
): this
```

### 2. _createViewTarget 签名简化（必须）

**问题**：类型签名过于复杂，实现里会很难写得漂亮

**修复**：
```typescript
// ❌ 过于复杂：BindingConfigItem<T,P>['target'] 是 union，NonNullable 后仍是 union
private _createViewTarget<P extends Path<T> & string>(
    item: BindingConfigEntry<T, P> & { target: NonNullable<BindingConfigItem<T, P>['target']> }
): ViewTarget<any>

// ✅ 简化：利用 discriminated union 的类型收窄
// 在 bindConfig 中先做 null-check，之后 TypeScript 会根据 helper 分支自动收窄 target 类型
private _createViewTarget<P extends Path<T> & string>(
    item: BindingConfigEntry<T, P>
): ViewTarget<any>
```

**关键点**：
- 在 `bindConfig` 中先做 `target === null` 检查并跳过
- 进入 `_createViewTarget` 时，`target` 已确保非 null
- TypeScript 会根据 `item.helper` 分支自动收窄 `item.target` 的类型（discriminated union 的强项）
- 实现中只需要少量类型断言（因为 union 类型收窄不是完美的）

### 3. Dev 判断方式（必须）

**问题**：`process.env.NODE_ENV` 在 Cocos Creator 中可能不存在

**修复**：
```typescript
// ❌ 错误
if (process.env.NODE_ENV !== 'production') { ... }

// ✅ 正确
import { DEBUG } from 'cc/env';
if (typeof DEBUG !== 'undefined' && DEBUG) { ... }
```

### 4. toProgress converter 语义（固化规范）

**明确说明**：
- converter 接收原始值，应当返回 0..1 的 ratio（建议范围，但不强制）
- 如果数据本身就是 0..1，可以不传 converter
- 如果数据是 0..max，需要 `converter: (v) => v / max`
- **规范（固化）**：helper 内部会 clamp 到 0..1 范围，确保 ProgressBar.progress 始终有效
- **实施要求**：在 `toProgress` helper 实现中添加 `Math.max(0, Math.min(1, value))` clamp

### 5. sourceId 说明（建议）

**补充说明**：
- `sourceId` 在 `build()` 阶段由 `TargetViewAdapter` 分配并注入 `DataBinding`
- 不需要在 `bindConfig` 配置中声明
- `bindConfig` 是声明期语法糖，只负责声明绑定规则

---

**CREATIVE 模式状态**: ✅ **COMPLETE**（最终版，已修复所有关键问题）


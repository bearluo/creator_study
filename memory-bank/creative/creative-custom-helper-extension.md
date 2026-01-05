# 🎨 CREATIVE: 自定义 Helper 扩展设计

## 任务信息
- **任务ID**: MVVM-CREATOR-006-CREATIVE-2
- **方案**: 自定义 Helper 扩展（基于 bindConfig - 直接传递 ViewTarget）
- **状态**: ✅ COMPLETE（已明确责任边界）
- **依赖**: MVVM-CREATOR-006-CREATIVE-1（bindConfig 设计已完成）

---

## 📋 问题陈述

### 当前状态

**现有设计**（bindConfig）：
```typescript
this.bindingBuilder.bindConfig([
    { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
    { path: 'level', target: this.levelLabel, helper: 'toLabelFmt', formatter: (v) => `Lv.${v}` },
    { path: 'playerName', target: this.nameInput, helper: 'toEditBox', mode: 'two-way' }
]);
```

**问题**：
- `helper` 字段只能使用内置的字符串字面量（'toLabelText', 'toEditBox' 等）
- 用户无法注册自定义 helper 函数
- 对于特殊组件或自定义组件，需要回退到手动调用 `bind()` 方法
- 扩展性受限，无法满足所有 Cocos Creator 组件的需求

### 设计目标

1. **支持自定义 helper**：允许用户注册自己的 ViewTarget 创建函数
2. **保持类型安全**：自定义 helper 也要有类型检查
3. **向后兼容**：不影响现有的内置 helper 使用
4. **易于扩展**：注册和使用自定义 helper 的流程简单清晰

### 约束条件

1. **类型安全**：自定义 helper 必须符合 `ViewTarget` 接口
2. **向后兼容**：现有 `bindConfig` API 不能破坏
3. **性能**：不能引入明显的性能开销
4. **可维护性**：代码清晰，易于理解和维护

---

## 🔍 方案探索

### 方案 1: 字符串注册表（Registry Pattern）

**核心思路**：使用字符串 key 注册自定义 helper，在 `bindConfig` 中通过字符串查找。

**实现方式**：
- `BindingBuilder.registerHelper(name: string, factory: (target: any, options?: any) => ViewTarget<any>)`
- `bindConfig` 中先查找内置 helper，再查找注册表

**示例**：
```typescript
// 注册自定义 helper
this.bindingBuilder.registerHelper('toCustomLabel', (target: CustomLabel, options?: { prefix?: string }) => {
    return {
        set: (value: string) => {
            target.text = options?.prefix ? `${options.prefix}${value}` : value;
        },
        get: () => target.text
    };
});

// 使用
this.bindingBuilder.bindConfig([
    { path: 'name', target: this.customLabel, helper: 'toCustomLabel', prefix: 'Name: ' }
]);
```

**优点**：
- ✅ 简单直观
- ✅ 与内置 helper 使用方式一致
- ✅ 易于理解

**缺点**：
- ❌ 类型安全受限（字符串 key 无法类型检查）
- ❌ 无法在编译期检查 helper 是否存在
- ❌ 自定义 helper 的参数类型无法推断

### 方案 2: 直接传递 ViewTarget（推荐）

**核心思路**：在 `bindConfig` 中允许直接传递 `ViewTarget` 实例，绕过 helper 字符串。

**实现方式**：
- 扩展 `BindingConfigItem`，允许 `helper` 为 `ViewTarget` 实例
- 或者添加新字段 `viewTarget?: ViewTarget<any>`

**示例**：
```typescript
// 方式 1: helper 可以是 ViewTarget
this.bindingBuilder.bindConfig([
    { 
        path: 'name', 
        target: this.customLabel, 
        helper: toCustomLabel(this.customLabel, { prefix: 'Name: ' })
    }
]);

// 方式 2: 使用 viewTarget 字段
this.bindingBuilder.bindConfig([
    { 
        path: 'name', 
        viewTarget: toCustomLabel(this.customLabel, { prefix: 'Name: ' })
    }
]);
```

**优点**：
- ✅ 完全类型安全（ViewTarget 是类型）
- ✅ 灵活，可以传递任何 ViewTarget 实例
- ✅ 不需要注册机制
- ✅ 向后兼容（内置 helper 字符串继续工作）

**缺点**：
- ❌ 需要手动创建 ViewTarget（但这是合理的）
- ❌ 与内置 helper 的使用方式略有不同

### 方案 3: 混合方案（推荐）

**核心思路**：结合方案 1 和方案 2，既支持注册表，也支持直接传递 ViewTarget。

**实现方式**：
- 支持字符串 helper（内置 + 注册表）
- 支持直接传递 ViewTarget 实例
- 类型系统自动区分

**示例**：
```typescript
// 方式 1: 使用内置 helper（字符串）
this.bindingBuilder.bindConfig([
    { path: 'name', target: this.nameLabel, helper: 'toLabelText' }
]);

// 方式 2: 注册自定义 helper（字符串）
this.bindingBuilder.registerHelper('toCustomLabel', (target, options) => toCustomLabel(target, options));
this.bindingBuilder.bindConfig([
    { path: 'name', target: this.customLabel, helper: 'toCustomLabel', prefix: 'Name: ' }
]);

// 方式 3: 直接传递 ViewTarget（最灵活）
this.bindingBuilder.bindConfig([
    { 
        path: 'name', 
        viewTarget: toCustomLabel(this.customLabel, { prefix: 'Name: ' })
    }
]);
```

**优点**：
- ✅ 灵活性最高
- ✅ 类型安全（ViewTarget 直接传递）
- ✅ 向后兼容
- ✅ 支持注册表（方便复用）

**缺点**：
- ❌ 实现复杂度较高
- ❌ 需要维护两套机制

### 方案 4: 类型安全的注册表（推荐）

**核心思路**：使用 TypeScript 的模板字面量类型和映射类型，实现类型安全的注册表。

**实现方式**：
- `BindingBuilder.registerHelper<K extends string>(name: K, factory: ...)`
- `bindConfig` 中的 `helper` 类型扩展为 `BuiltinHelper | K`（K 是已注册的自定义 helper）

**示例**：
```typescript
// 注册自定义 helper（类型安全）
this.bindingBuilder.registerHelper('toCustomLabel', (target: CustomLabel, options?: { prefix?: string }) => {
    return {
        set: (value: string) => {
            target.text = options?.prefix ? `${options.prefix}${value}` : value;
        },
        get: () => target.text
    };
});

// 使用（类型安全，IDE 自动补全）
this.bindingBuilder.bindConfig([
    { path: 'name', target: this.customLabel, helper: 'toCustomLabel', prefix: 'Name: ' }
    // ✅ 'toCustomLabel' 会被识别为有效 helper
    // ✅ prefix 参数类型自动推断
]);
```

**优点**：
- ✅ 类型安全（注册的 helper 会被 TypeScript 识别）
- ✅ IDE 自动补全
- ✅ 编译期检查 helper 是否存在
- ✅ 参数类型可以推断

**缺点**：
- ❌ 实现复杂度高（需要复杂的类型系统）
- ❌ TypeScript 类型系统限制（可能无法完美实现）

---

## 🎯 方案对比

| 方案 | 类型安全 | 灵活性 | 实现复杂度 | 向后兼容 | IDE 支持 |
|------|---------|--------|-----------|---------|---------|
| 方案 1: 字符串注册表 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 方案 2: 直接传递 ViewTarget | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 方案 3: 混合方案 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 方案 4: 类型安全注册表 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## ✅ 推荐方案：方案 2（直接传递 ViewTarget）

### 选择理由

1. **类型安全最佳**：直接传递 ViewTarget，完全类型安全
2. **实现简单**：不需要复杂的类型系统或注册机制
3. **灵活性高**：可以传递任何 ViewTarget 实例
4. **向后兼容**：不影响现有 API
5. **易于理解**：概念清晰，使用直观
6. **无需注册**：直接使用，减少维护成本

### 不选择方案 1（字符串注册表）的原因

1. **类型安全受限**：字符串 key 无法类型检查
2. **无法编译期检查**：helper 是否存在只能在运行时发现
3. **参数类型无法推断**：自定义 helper 的参数类型无法推断

### 不选择方案 3（混合方案）的原因

1. **实现复杂度高**：需要维护两套机制
2. **过度设计**：对于当前需求，单一方案更合适
3. **注册表价值有限**：直接传递 ViewTarget 已经足够灵活

### 不选择方案 4（类型安全注册表）的原因

1. **实现复杂度极高**：需要复杂的 TypeScript 类型系统
2. **可能无法完美实现**：TypeScript 类型系统限制
3. **维护成本高**：类型定义复杂，难以维护
4. **收益有限**：直接传递 ViewTarget 已经满足需求

---

## 🏗️ 实施方案设计

### 责任边界（硬规则 - 必须明确）

**重要**：在使用 `viewTarget` 时，必须明确以下责任边界：

1. **viewTarget 不做 null 校验**（硬规则）：
   - `viewTarget` 是已经构造完成的 `ViewTarget` 实例
   - null 校验应该发生在 helper 函数内，而不是 `bindConfig`
   - `bindConfig` 的 `viewTarget` 分支**不做 null 校验**
   - **责任划分**：helper 作者需自行保证合法性
   - **对比**：内置 helper 会在 `bindConfig` 中做 null 校验（target === null → throw/warn）

2. **mode 的正确性由 ViewTarget 作者保证**（硬规则）：
   - 框架**不会检查** `ViewTarget` 是否支持 `two-way`（即是否实现了 `onChange`）
   - `mode` 是否有效取决于 `ViewTarget` 是否实现了 `onChange`
   - 如果 `mode` 写了 `two-way` 但 `ViewTarget` 没有 `onChange`，不会回写（**这不是 bug，是职责边界**）
   - **责任划分**：`mode` 的正确性由 `ViewTarget` 作者自行保证
   - **常见问题**："我 mode 写了 two-way，怎么没回写？" → 检查 ViewTarget 是否实现了 `onChange`

### 核心设计

#### 1. 扩展 BindingConfigItem 类型

**关键设计决策**：
- ✅ **Discriminated Union**：使用 `viewTarget` 字段区分自定义 helper
- ✅ **向后兼容**：现有内置 helper 继续工作
- ✅ **类型安全**：直接传递 ViewTarget，完全类型安全

```typescript
/**
 * 绑定配置项（支持内置 helper 或直接传递 ViewTarget）
 * 
 * @template T 数据类型
 * @template P 数据路径类型
 */
type BindingConfigItem<T, P extends Path<T> & string> =
    // 内置 helper（字符串字面量）- 现有设计
    | ({
          helper: 'toLabelText';
          target: Label | null;
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      })
    | ({
          helper: 'toLabelFmt';
          target: Label | null;
          formatter: (value: PathValue<T, P>) => string;
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      })
    // ... 其他内置 helper
    // 直接传递 ViewTarget（自定义 helper）- 新增
    | {
          viewTarget: ViewTarget<any>;
          mode?: 'one-way' | 'two-way' | 'one-way-to-source';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
          // target 和 helper 都不需要
          // ⚠️ **责任边界**：viewTarget 是已经构造完成的 ViewTarget，不做 null 校验
      };
```

#### 2. bindConfig 方法扩展

```typescript
bindConfig<const C extends readonly BindingConfigEntry<T, Path<T> & string>[]>(
    config: C
): this {
    for (const item of config) {
        const { path, ...rest } = item;
        
        // 判断是内置 helper 还是直接传递 ViewTarget
        if ('viewTarget' in rest) {
            // 直接传递 ViewTarget（自定义 helper）
            // ⚠️ **责任边界**：
            // 1. viewTarget 是已经构造完成的 ViewTarget，不做 null 校验（校验应在 helper 函数内完成）
            // 2. mode 的正确性由 ViewTarget 作者自行保证（框架不会检查 ViewTarget 是否支持 two-way）
            const viewTarget = rest.viewTarget;
            
            // 构建 BindingOptions
            const options: BindingOptions<PathValue<T, any>, any> = {
                mode: rest.mode || 'one-way',
                validator: 'validator' in rest ? rest.validator : undefined,
                onError: 'onError' in rest ? rest.onError : undefined
            };
            
            // 调用现有的 bind 方法（类型安全）
            this.bind(path as any, viewTarget, options);
        } else {
            // 内置 helper（现有逻辑，保持不变）
            const target = (rest as any).target;
            
            // ⚠️ 工程约束：target === null 处理
            if (target === null) {
                if (typeof DEBUG !== 'undefined' && DEBUG) {
                    throw new Error(`[bindConfig] target is null for path "${path}", helper "${(rest as any).helper}". Please check @property binding.`);
                } else {
                    console.warn(`[bindConfig] target is null for path "${path}", helper "${(rest as any).helper}". Skipping binding.`);
                    continue;
                }
            }
            
            // ⚠️ 工程约束：mode 与 helper 的合法组合校验
            this._validateModeHelper((rest as any).helper, (rest as any).mode);
            
            // 根据 helper 创建 ViewTarget（discriminated union 确保类型安全）
            const viewTarget = this._createViewTarget(item as any);
            
            // 构建 BindingOptions
            const options: BindingOptions<PathValue<T, any>, any> = {
                mode: (rest as any).mode || (this._isInputHelper((rest as any).helper) ? 'two-way' : 'one-way'),
                converter: 'converter' in rest ? (rest as any).converter : undefined,
                reverseConverter: 'reverseConverter' in rest ? (rest as any).reverseConverter : undefined,
                validator: 'validator' in rest ? (rest as any).validator : undefined,
                onError: 'onError' in rest ? (rest as any).onError : undefined
            };
            
            // 调用现有的 bind 方法（类型安全）
            this.bind(path as any, viewTarget, options);
        }
    }
    return this;
}
```

#### 3. 可选：注册表机制（简化版，不推荐）

**设计决策**：注册表机制**不推荐**作为主要方案，原因：
- ❌ 类型安全受限（字符串 key 无法类型检查）
- ❌ 无法在编译期检查 helper 是否存在
- ❌ 自定义 helper 的参数类型无法推断
- ✅ 直接传递 ViewTarget 更简单、更类型安全

**如果确实需要注册表**（用于复用场景）：
```typescript
/**
 * 注册自定义 helper（可选，方便复用）
 * 
 * ⚠️ **注意**：
 * - 注册表主要用于复用，类型安全由直接传递 ViewTarget 保证
 * - 推荐优先使用直接传递 ViewTarget 的方式
 * - 注册表是实例级别的，不同 BindingBuilder 实例不共享
 */
private customHelpers = new Map<string, (target: any, options?: any) => ViewTarget<any>>();

registerHelper(name: string, factory: (target: any, options?: any) => ViewTarget<any>): this {
    if (this.customHelpers.has(name)) {
        console.warn(`[BindingBuilder] Helper "${name}" already registered, will be overwritten.`);
    }
    this.customHelpers.set(name, factory);
    return this;
}

// 在 _createViewTarget 中使用（需要扩展 helper 类型）
private _createViewTarget<P extends Path<T> & string>(
    item: BindingConfigEntry<T, P>
): ViewTarget<any> {
    // 直接传递 ViewTarget（优先）
    if ('viewTarget' in item) {
        return item.viewTarget;
    }
    
    // 内置 helper
    switch (item.helper) {
        case 'toLabelText':
            return toLabelText(item.target as Label);
        // ... 其他内置 helper
        default:
            // 自定义 helper（注册表）
            const customFactory = this.customHelpers.get(item.helper);
            if (customFactory) {
                return customFactory(item.target, item);
            }
            throw new Error(`[bindConfig] Unknown helper: ${item.helper}`);
    }
}
```

**推荐方案**：直接传递 ViewTarget，不使用注册表。

---

## 📋 使用示例

### 示例 1: 直接传递 ViewTarget（推荐）

```typescript
// 自定义 helper 函数
function toCustomLabel(label: CustomLabel, options?: { prefix?: string }): ViewTarget<string> {
    return {
        set: (value: string) => {
            label.text = options?.prefix ? `${options.prefix}${value}` : value;
        },
        get: () => label.text
    };
}

// 使用
protected onMVVMCreate(): void {
    this.bindingBuilder.bindConfig([
        { path: 'name', viewTarget: toCustomLabel(this.customLabel, { prefix: 'Name: ' }) },
        { path: 'level', target: this.levelLabel, helper: 'toLabelFmt', formatter: (v) => `Lv.${v}` }
    ]);
}
```

### 示例 2: 混合使用（内置 + 自定义）

```typescript
protected onMVVMCreate(): void {
    this.bindingBuilder.bindConfig([
        // 内置 helper
        { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
        { path: 'level', target: this.levelLabel, helper: 'toLabelFmt', formatter: (v) => `Lv.${v}` },
        
        // 自定义 helper（直接传递 ViewTarget）
        { 
            path: 'customName', 
            viewTarget: toCustomLabel(this.customLabel, { prefix: 'Name: ' }),
            mode: 'one-way'
        },
        
        // 自定义 helper（复杂场景）
        { 
            path: 'complexData', 
            viewTarget: toComplexComponent(this.complexComponent, {
                format: (v) => `${v.value} (${v.unit})`,
                validate: (v) => v.value > 0
            }),
            mode: 'two-way',
            validator: (v) => v.value > 0
        }
    ]);
}
```

### 示例 3: 自定义 Helper 函数定义

```typescript
/**
 * 自定义 helper 函数示例
 * 
 * ⚠️ **责任边界**：
 * 1. helper 函数内部必须做 null 校验（bindConfig 不会做）
 * 2. 如果支持 two-way，必须实现 onChange（否则 mode: 'two-way' 无效）
 */
function toCustomLabel(label: CustomLabel, options?: { prefix?: string }): ViewTarget<string> {
    // ✅ 必须在 helper 内部做 null 校验
    if (!label) {
        throw new Error('[toCustomLabel] CustomLabel is null');
    }
    return {
        set: (value: string) => {
            label.text = options?.prefix ? `${options.prefix}${value}` : value;
        },
        get: () => label.text
        // ⚠️ 注意：没有 onChange，所以 mode: 'two-way' 无效
    };
}

function toComplexComponent(component: ComplexComponent, options?: { format?: (v: any) => string }): ViewTarget<any> {
    // ✅ 必须在 helper 内部做 null 校验
    if (!component) {
        throw new Error('[toComplexComponent] ComplexComponent is null');
    }
    return {
        set: (value: any) => {
            if (options?.format) {
                component.displayText = options.format(value);
            } else {
                component.value = value;
            }
        },
        get: () => component.value,
        // ✅ 实现了 onChange，所以支持 mode: 'two-way'
        onChange: (callback: (value: any) => void) => {
            const handler = () => {
                callback(component.value);
            };
            component.on('change', handler);
            return () => {
                component.off('change', handler);
            };
        }
    };
}
```

### 示例 4: 责任边界说明

```typescript
// ❌ 错误用法：依赖 bindConfig 做 null 校验
this.bindingBuilder.bindConfig([
    { 
        path: 'name', 
        viewTarget: toCustomLabel(null, { prefix: 'Name: ' }) // 应该在 helper 内 throw
    }
]);

// ✅ 正确用法：helper 内部做 null 校验
function toCustomLabel(label: CustomLabel | null, options?: { prefix?: string }): ViewTarget<string> {
    if (!label) {
        throw new Error('[toCustomLabel] CustomLabel is null'); // helper 内校验
    }
    return { /* ... */ };
}

// ❌ 错误用法：mode: 'two-way' 但 ViewTarget 没有 onChange
this.bindingBuilder.bindConfig([
    { 
        path: 'name', 
        viewTarget: toCustomLabel(this.customLabel), // 没有 onChange
        mode: 'two-way' // ⚠️ 无效，不会回写（不是 bug，是职责边界）
    }
]);

// ✅ 正确用法：支持 two-way 的 ViewTarget
this.bindingBuilder.bindConfig([
    { 
        path: 'name', 
        viewTarget: toComplexComponent(this.complexComponent), // 有 onChange
        mode: 'two-way' // ✅ 有效
    }
]);
```

---

## ⚠️ 风险点和工程约束

### 风险点

1. **类型推断**：直接传递 ViewTarget 时，路径类型推断可能受限
   - **缓解**：使用泛型保持推断
   - **验证**：编译时类型检查

2. **向后兼容**：扩展类型定义可能影响现有代码
   - **缓解**：使用 discriminated union，确保现有代码继续工作
   - **验证**：现有测试用例继续通过

3. **责任边界混淆**：用户可能误解 viewTarget 的责任边界
   - **缓解**：在文档中明确说明硬规则
   - **验证**：文档清晰，示例完整

### 工程约束

1. **viewTarget 优先级**：如果同时提供 `viewTarget` 和 `helper`，优先使用 `viewTarget`

2. **viewTarget 不做 null 校验**（硬规则）：
   - `viewTarget` 是已经构造完成的 `ViewTarget` 实例
   - null 校验应该发生在 helper 函数内，而不是 `bindConfig`
   - `bindConfig` 的 `viewTarget` 分支不做 null 校验
   - **责任划分**：helper 作者需自行保证合法性

3. **mode 的正确性由 ViewTarget 作者保证**（硬规则）：
   - 框架**不会检查** `ViewTarget` 是否支持 `two-way`（即是否实现了 `onChange`）
   - `mode` 是否有效取决于 `ViewTarget` 是否实现了 `onChange`
   - 如果 `mode` 写了 `two-way` 但 `ViewTarget` 没有 `onChange`，不会回写（这不是 bug，是职责边界）
   - **责任划分**：`mode` 的正确性由 `ViewTarget` 作者自行保证

4. **类型安全**：直接传递 ViewTarget 时，类型安全由 ViewTarget 本身保证

5. **向后兼容**：现有内置 helper 继续工作，不受影响

6. **推荐用法**：优先使用直接传递 ViewTarget，简单直接，类型安全

---

## ✅ 验收标准

### 功能验收

1. **直接传递 ViewTarget**：
   - [ ] `bindConfig` 支持 `viewTarget` 字段
   - [ ] 可以直接传递任何 ViewTarget 实例
   - [ ] 类型安全（ViewTarget 类型检查）

2. **自定义 Helper 支持**：
   - [ ] `bindConfig` 支持 `viewTarget` 字段
   - [ ] 可以直接传递任何 ViewTarget 实例
   - [ ] 与内置 helper 可以混合使用
   - [ ] **责任边界**：viewTarget 分支不做 null 校验（校验应在 helper 函数内完成）
   - [ ] **责任边界**：mode 的正确性由 ViewTarget 作者保证（框架不会检查 ViewTarget 是否支持 two-way）

3. **向后兼容**：
   - [ ] 现有的内置 helper 继续工作
   - [ ] 现有的使用方式不受影响

### 质量验收

1. **类型安全**：
   - [ ] 直接传递 ViewTarget 时类型检查
   - [ ] 注册表 helper 参数类型可以推断（如果可能）

2. **文档**：
   - [ ] README 更新完整
   - [ ] 示例代码清晰
   - [ ] API 文档完整

---

**CREATIVE 模式状态**: ✅ **COMPLETE**


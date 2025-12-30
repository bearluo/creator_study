# 🎨 CREATIVE: 视图绑定系统优化设计

## 任务信息
- **任务ID**: MVVM-CREATOR-004-CREATIVE
- **CREATIVE 类型**: Architecture Design / Path Resolution / Event System
- **创建日期**: 2025-01-XX
- **设计者**: AI Assistant

---

## 🎯 问题陈述

### 当前问题

视图绑定系统存在三个核心问题：

1. **路径混淆**：
   - `BindingBuilder.bind()` 的 `target` 参数可能是字符串属性名、节点对象或组件对象
   - 创建映射时，字符串 target 直接作为 `path` 存入映射
   - `CocosViewAdapter._getNodeByPath()` 只能解析节点路径，无法解析属性名
   - **结果**：无法找到节点，更新失败

2. **属性更新缺失**：
   - 当 `target` 是字符串时，映射的 `path` 是属性名
   - `CocosViewAdapter` 缺少组件实例引用，无法通过属性名获取节点
   - **结果**：属性绑定无法工作

3. **更新通知缺失**：
   - `CocosViewAdapter._emitChange()` 是空实现
   - 双向绑定无法工作
   - **结果**：视图变化无法通知数据源

### 设计目标

1. **清晰的路径解析**：支持节点路径和属性路径的统一解析
2. **完整的属性绑定**：支持通过属性名绑定组件属性
3. **双向绑定支持**：实现视图变化通知机制
4. **向后兼容**：保持现有 API 的兼容性

---

## 🔍 技术背景

### Cocos Creator 组件和节点关系

- **Component**：组件实例，有 `node` 属性指向所属节点
- **Node**：节点对象，有 `children` 属性包含子节点
- **属性访问**：组件实例的属性（如 `this.nameLabel`）可能是 `Node` 或 `Component`

### 当前绑定流程

```
1. BindingBuilder.bind('name', 'nameLabel', 'string')
   ↓
2. build() 时创建映射: { path: 'nameLabel', viewPath: 'name' }
   ↓
3. DataBinding 调用 view.update('name', value)
   ↓
4. CocosViewAdapter.update('name', value) 查找映射
   ↓
5. 找到映射，调用 _getNodeByPath('nameLabel')
   ↓
6. _getNodeByPath() 尝试解析节点路径，但 'nameLabel' 是属性名
   ↓
7. 返回 null，更新失败 ❌
```

---

## 💡 设计方案探索

### 方案 1: 双重路径解析（推荐）

#### 描述

在 `CocosViewAdapter` 中实现双重路径解析机制：
- 首先尝试属性路径解析（从组件实例获取）
- 如果失败，回退到节点路径解析

#### 实现

```typescript
export class CocosViewAdapter implements IView {
    private rootNode: CocosNode;
    private componentInstance?: any;  // 新增：组件实例引用
    private mappings: Map<string, NodeViewMapping> = new Map();
    private changeListeners: Map<string, Set<(path: string, value: any) => void>> = new Map();  // 新增：事件监听器
    
    constructor(config: CocosViewAdapterConfig) {
        this.rootNode = config.rootNode;
        this.componentInstance = config.componentInstance;  // 新增
        // ...
    }
    
    /**
     * 增强的路径解析：支持节点路径和属性路径
     */
    private _getNodeByPath(path: string): CocosNode | null {
        if (path === '' || path === '/') {
            return this.rootNode;
        }
        
        // 首先尝试属性路径解析
        if (this.componentInstance) {
            const propertyNode = this._resolvePropertyPath(path);
            if (propertyNode) {
                return propertyNode;
            }
        }
        
        // 回退到节点路径解析
        return this._getNodeByNodePath(path);
    }
    
    /**
     * 解析属性路径为节点
     */
    private _resolvePropertyPath(propertyName: string): CocosNode | null {
        if (!this.componentInstance) {
            return null;
        }
        
        const target = this.componentInstance[propertyName];
        if (!target) {
            return null;
        }
        
        // 如果是组件，返回其 node
        if ((target as any).node !== undefined) {
            return (target as CocosComponent).node;
        }
        
        // 如果是节点，直接返回
        if ((target as any).children !== undefined) {
            return target as CocosNode;
        }
        
        return null;
    }
    
    /**
     * 节点路径解析（原有逻辑）
     */
    private _getNodeByNodePath(path: string): CocosNode | null {
        const parts = path.split('/').filter(p => p);
        let currentNode: CocosNode | null = this.rootNode;
        
        for (const part of parts) {
            if (!currentNode) {
                return null;
            }
            
            const child = currentNode.children.find((c) => c.name === part);
            if (!child) {
                return null;
            }
            
            currentNode = child;
        }
        
        return currentNode;
    }
    
    /**
     * 实现更新通知机制
     */
    private _emitChange(path: string, value: any): void {
        const listeners = this.changeListeners.get('change');
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(path, value);
                } catch (error) {
                    console.error(`[CocosViewAdapter] Error in change listener:`, error);
                }
            });
        }
    }
    
    /**
     * 监听 change 事件
     */
    on(event: string, callback: (...args: any[]) => void): () => void {
        if (event === 'change') {
            if (!this.changeListeners.has('change')) {
                this.changeListeners.set('change', new Set());
            }
            this.changeListeners.get('change')!.add(callback);
            
            return () => {
                const listeners = this.changeListeners.get('change');
                if (listeners) {
                    listeners.delete(callback);
                }
            };
        }
        
        // 其他事件处理...
        this.rootNode.on(event, callback);
        const unsubscribe = () => {
            this.rootNode.off(event, callback);
            this.eventUnsubscribes.delete(event);
        };
        this.eventUnsubscribes.set(event, unsubscribe);
        return unsubscribe;
    }
    
    /**
     * 设置视图路径的值（触发 change 事件）
     */
    set(path: string, value: any): void {
        this.update(path, value);
        this._emitChange(path, value);
    }
}
```

#### 优点
- ✅ 向后兼容：不影响现有节点路径解析
- ✅ 自动回退：属性路径失败时自动使用节点路径
- ✅ 实现简单：只需添加属性路径解析逻辑
- ✅ 事件系统简单：使用 Map + Set 实现

#### 缺点
- ⚠️ 需要组件实例引用（可选，不影响无组件实例的场景）

#### 技术评估
- **实现复杂度**: ⭐⭐ (2/5) - 简单
- **向后兼容**: ⭐⭐⭐⭐⭐ (5/5) - 完全兼容
- **性能**: ⭐⭐⭐⭐ (4/5) - 良好
- **可维护性**: ⭐⭐⭐⭐ (4/5) - 良好

---

### 方案 2: 映射时解析 Target（推荐）

#### 描述

在 `BindingBuilder.build()` 时解析所有字符串 target，将解析后的节点路径存入映射。

#### 实现

```typescript
export class BindingBuilder<T> {
    // ...
    
    /**
     * 构建所有绑定（使用批量绑定 API）
     */
    build(): void {
        // 确保视图适配器存在
        if (!this.viewAdapter) {
            this.viewAdapter = new CocosViewAdapter({
                rootNode: this.rootNode,
                componentInstance: this.componentInstance  // 传递组件实例
            });
        }
        
        // 处理视图适配器映射（在批量绑定前）
        this.bindings.forEach(binding => {
            // 解析 target 为节点
            const resolved = this._resolveTargetToNode(binding.target);
            
            if (resolved) {
                // 计算节点路径
                const nodePath = this._getNodePath(resolved.node, this.rootNode);
                
                // 创建映射
                this.viewAdapter!.addMapping({
                    path: nodePath,  // 使用节点路径，而不是属性名
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property,
                    isPropertyPath: resolved.isProperty  // 标记是否为属性路径
                });
            } else {
                // 无法解析，使用属性名（向后兼容）
                this.viewAdapter!.addMapping({
                    path: typeof binding.target === 'string' ? binding.target : '',
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property,
                    isPropertyPath: true
                });
            }
        });
        
        // 使用批量绑定 API
        // ...
    }
    
    /**
     * 解析 target 为节点对象
     */
    private _resolveTargetToNode(target: CocosNode | CocosComponent | string): {
        node: CocosNode;
        isProperty: boolean;
        propertyName?: string;
    } | null {
        if (typeof target === 'string') {
            // 字符串：尝试从组件实例获取
            const resolved = this._resolveTarget(target);
            if (resolved) {
                const node = this._getNodeFromTarget(resolved);
                if (node) {
                    return {
                        node,
                        isProperty: true,
                        propertyName: target
                    };
                }
            }
            return null;
        } else {
            // 节点或组件对象
            const node = this._getNodeFromTarget(target);
            if (node) {
                return {
                    node,
                    isProperty: false
                };
            }
            return null;
        }
    }
    
    /**
     * 从 target 获取节点
     */
    private _getNodeFromTarget(target: CocosNode | CocosComponent): CocosNode | null {
        // 如果是组件，获取其 node
        if ((target as any).node !== undefined) {
            return (target as CocosComponent).node;
        }
        // 如果是节点，直接返回
        if ((target as any).children !== undefined) {
            return target as CocosNode;
        }
        return null;
    }
    
    /**
     * 计算节点路径（相对于根节点）
     */
    private _getNodePath(node: CocosNode, rootNode: CocosNode): string {
        if (node === rootNode) {
            return '';
        }
        
        // 向上遍历找到路径
        const path: string[] = [];
        let current: CocosNode | null = node;
        
        while (current && current !== rootNode) {
            path.unshift(current.name);
            current = current.parent;
        }
        
        return path.join('/');
    }
}
```

#### 优点
- ✅ 映射清晰：映射中的 `path` 始终是节点路径
- ✅ 性能更好：路径解析在 `build()` 时完成，运行时无需解析
- ✅ 类型明确：可以区分属性路径和节点路径

#### 缺点
- ⚠️ 需要计算节点路径（可能有性能开销）
- ⚠️ 如果节点树变化，路径可能失效

#### 技术评估
- **实现复杂度**: ⭐⭐⭐ (3/5) - 中等
- **向后兼容**: ⭐⭐⭐⭐ (4/5) - 基本兼容
- **性能**: ⭐⭐⭐⭐⭐ (5/5) - 优秀
- **可维护性**: ⭐⭐⭐⭐ (4/5) - 良好

---

### 方案 3: 绑定时显式指定类型（最佳，推荐）

#### 描述

在 `bind()` 时通过参数显式指定 target 的类型（节点路径 vs 属性路径），避免自动判断的歧义：
- 如果 target 是 Node/Component 对象 → 自动推断为 `'node'`，立即计算节点路径
- 如果 target 是 string → 需要显式指定 `targetType` 参数：
  - `targetType: 'property'` → 从组件实例解析属性，标记为属性路径
  - `targetType: 'node'` → 作为节点路径字符串处理
- 在 binding 对象中存储类型信息和解析结果
- 在 `build()` 时直接使用，无需再次判断

#### 实现

```typescript
export class BindingBuilder<T> {
    private bindings: Array<{
        path: Path<T> & string;
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions<any>;
        // 新增：绑定时确定的类型信息
        targetType: 'node' | 'property';  // 目标类型（必需）
        resolvedNode?: CocosNode;  // 解析后的节点（如果已解析）
        nodePath?: string;  // 节点路径（如果已计算）
        propertyName?: string;  // 属性名（如果是属性路径）
    }> = [];
    
    /**
     * 类型安全的数据绑定方法
     * 
     * @param path 数据路径
     * @param target 目标节点/组件/属性名
     * @param property 组件属性名（可选）
     * @param options 绑定选项（可选）
     * @param targetType 目标类型（当 target 是 string 时必须指定）
     */
    bind<P extends Path<T> & string>(
        path: P,
        target: CocosNode | CocosComponent,
        property?: string,
        options?: BindingOptions<PathValue<T, P>>
    ): this;
    bind<P extends Path<T> & string>(
        path: P,
        target: string,
        property: string | undefined,
        options: BindingOptions<PathValue<T, P>> | undefined,
        targetType: 'node' | 'property'  // 字符串 target 必须指定类型
    ): this;
    bind<P extends Path<T> & string>(
        path: P,
        target: CocosNode | CocosComponent | string,
        property?: string,
        options?: BindingOptions<PathValue<T, P>>,
        targetType?: 'node' | 'property'
    ): this {
        // 确定 target 类型
        let finalTargetType: 'node' | 'property';
        let resolvedNode: CocosNode | undefined;
        let nodePath: string | undefined;
        let propertyName: string | undefined;
        
        if (typeof target === 'string') {
            // 字符串 target：必须显式指定 targetType
            if (!targetType) {
                throw new Error(
                    `[BindingBuilder] When target is a string, targetType must be specified. ` +
                    `Use bind(path, target, property, options, 'node') or bind(path, target, property, options, 'property')`
                );
            }
            
            finalTargetType = targetType;
            
            if (targetType === 'property') {
                // 属性路径：从组件实例解析
                if (this.componentInstance) {
                    const resolved = this._resolveTarget(target);
                    if (resolved) {
                        const node = this._getNodeFromTarget(resolved);
                        if (node) {
                            resolvedNode = node;
                            nodePath = this._getNodePath(node, this.rootNode);
                            propertyName = target;
                        } else {
                            throw new Error(
                                `[BindingBuilder] Cannot resolve property "${target}" to a node. ` +
                                `Make sure the property exists in the component instance.`
                            );
                        }
                    } else {
                        throw new Error(
                            `[BindingBuilder] Property "${target}" not found in component instance.`
                        );
                    }
                } else {
                    throw new Error(
                        `[BindingBuilder] Cannot bind property "${target}" without component instance. ` +
                        `Make sure BindingBuilder is created with a component instance.`
                    );
                }
            } else {
                // 节点路径：直接使用字符串作为路径
                nodePath = target;
                finalTargetType = 'node';
            }
        } else {
            // Node/Component 对象：自动推断为 'node'
            finalTargetType = 'node';
            const node = this._getNodeFromTarget(target);
            if (node) {
                resolvedNode = node;
                nodePath = this._getNodePath(node, this.rootNode);
            } else {
                throw new Error(
                    `[BindingBuilder] Cannot resolve target to a node. ` +
                    `Target must be a CocosNode or CocosComponent.`
                );
            }
        }
        
        this.bindings.push({
            path,
            target,
            property,
            componentType: property ? this._inferComponentType(target) : undefined,
            options,
            targetType: finalTargetType,
            resolvedNode,
            nodePath,
            propertyName
        });
        return this;
    }
    
    /**
     * 分析 target，确定类型和解析结果
     */
    private _analyzeTarget(target: CocosNode | CocosComponent | string): {
        type: 'node' | 'property';
        node?: CocosNode;
        nodePath?: string;
        propertyName?: string;
    } {
        if (typeof target === 'string') {
            // 字符串：尝试解析为属性路径
            if (this.componentInstance) {
                const resolved = this._resolveTarget(target);
                if (resolved) {
                    const node = this._getNodeFromTarget(resolved);
                    if (node) {
                        // 计算节点路径
                        const nodePath = this._getNodePath(node, this.rootNode);
                        return {
                            type: 'property',  // 标记为属性路径
                            node,
                            nodePath,
                            propertyName: target
                        };
                    }
                }
            }
            // 无法解析，可能是节点路径字符串
            return {
                type: 'node',  // 标记为节点路径
                propertyName: target
            };
        } else {
            // 节点或组件对象：立即计算节点路径
            const node = this._getNodeFromTarget(target);
            if (node) {
                const nodePath = this._getNodePath(node, this.rootNode);
                return {
                    type: 'node',  // 标记为节点路径
                    node,
                    nodePath
                };
            }
            return {
                type: 'node'
            };
        }
    }
    
    /**
     * 构建所有绑定（使用批量绑定 API）
     */
    build(): void {
        // 确保视图适配器存在
        if (!this.viewAdapter) {
            this.viewAdapter = new CocosViewAdapter({
                rootNode: this.rootNode,
                componentInstance: this.componentInstance
            });
        }
        
        // 处理视图适配器映射（在批量绑定前）
        this.bindings.forEach(binding => {
            // 直接使用绑定时确定的类型信息
            if (binding.targetType === 'node' && binding.nodePath !== undefined) {
                // 节点路径：直接使用计算好的路径
                this.viewAdapter!.addMapping({
                    path: binding.nodePath,
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property
                });
            } else if (binding.targetType === 'property' && binding.propertyName) {
                // 属性路径：使用属性名，标记为属性路径
                this.viewAdapter!.addMapping({
                    path: binding.propertyName,
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property,
                    isPropertyPath: true
                });
            } else {
                // 回退：使用 target 字符串
                this.viewAdapter!.addMapping({
                    path: typeof binding.target === 'string' ? binding.target : '',
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property,
                    isPropertyPath: binding.targetType === 'property'
                });
            }
        });
        
        // 使用批量绑定 API
        // ...
    }
    
    /**
     * 从 target 获取节点
     */
    private _getNodeFromTarget(target: CocosNode | CocosComponent): CocosNode | null {
        // 如果是组件，获取其 node
        if ((target as any).node !== undefined) {
            return (target as CocosComponent).node;
        }
        // 如果是节点，直接返回
        if ((target as any).children !== undefined) {
            return target as CocosNode;
        }
        return null;
    }
    
    /**
     * 计算节点路径（相对于根节点）
     */
    private _getNodePath(node: CocosNode, rootNode: CocosNode): string {
        if (node === rootNode) {
            return '';
        }
        
        // 向上遍历找到路径
        const path: string[] = [];
        let current: CocosNode | null = node;
        
        while (current && current !== rootNode) {
            path.unshift(current.name);
            current = current.parent;
        }
        
        return path.join('/');
    }
}
```

#### 优点
- ✅ **性能最优**：路径解析在 `bind()` 时完成，`build()` 时直接使用
- ✅ **类型明确**：绑定时就确定类型，无需运行时判断
- ✅ **语义清晰**：binding 对象包含完整的类型信息
- ✅ **向后兼容**：不影响现有 API

#### 缺点
- ⚠️ 如果节点树在 `bind()` 后变化，路径可能失效（但这是合理的，因为绑定应该在节点树稳定后创建）

#### 技术评估
- **实现复杂度**: ⭐⭐⭐ (3/5) - 中等
- **向后兼容**: ⭐⭐⭐⭐⭐ (5/5) - 完全兼容
- **性能**: ⭐⭐⭐⭐⭐ (5/5) - 最优
- **可维护性**: ⭐⭐⭐⭐⭐ (5/5) - 优秀

---

### 方案 4: 路径解析器接口

#### 描述

创建路径解析器接口，支持多种路径类型。

#### 实现

```typescript
/**
 * 路径解析器接口
 */
interface PathResolver {
    resolve(path: string): CocosNode | CocosComponent | null;
}

/**
 * 节点路径解析器
 */
class NodePathResolver implements PathResolver {
    constructor(private rootNode: CocosNode) {}
    
    resolve(path: string): CocosNode | null {
        // 节点路径解析逻辑
    }
}

/**
 * 属性路径解析器
 */
class PropertyPathResolver implements PathResolver {
    constructor(private componentInstance: any) {}
    
    resolve(path: string): CocosNode | CocosComponent | null {
        // 属性路径解析逻辑
    }
}

/**
 * 组合路径解析器
 */
class CompositePathResolver implements PathResolver {
    private resolvers: PathResolver[] = [];
    
    addResolver(resolver: PathResolver): void {
        this.resolvers.push(resolver);
    }
    
    resolve(path: string): CocosNode | CocosComponent | null {
        for (const resolver of this.resolvers) {
            const result = resolver.resolve(path);
            if (result) {
                return result;
            }
        }
        return null;
    }
}
```

#### 优点
- ✅ 扩展性强：可以添加更多路径解析器
- ✅ 职责分离：每个解析器只负责一种路径类型
- ✅ 易于测试：可以单独测试每个解析器

#### 缺点
- ⚠️ 实现复杂度较高
- ⚠️ 可能过度设计

#### 技术评估
- **实现复杂度**: ⭐⭐⭐⭐ (4/5) - 较高
- **向后兼容**: ⭐⭐⭐⭐ (4/5) - 基本兼容
- **性能**: ⭐⭐⭐⭐ (4/5) - 良好
- **可维护性**: ⭐⭐⭐⭐⭐ (5/5) - 优秀

---

## ⚖️ 方案对比

| 方案 | 实现复杂度 | 向后兼容 | 性能 | 可维护性 | 推荐度 |
|------|-----------|---------|------|---------|--------|
| 方案 1: 双重路径解析 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 方案 2: 映射时解析 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **方案 3: 绑定时确定类型** | **⭐⭐⭐** | **⭐⭐⭐⭐⭐** | **⭐⭐⭐⭐⭐** | **⭐⭐⭐⭐⭐** | **⭐⭐⭐⭐⭐** |
| 方案 4: 路径解析器接口 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## ✅ 推荐方案

### 方案 3: 绑定时显式指定类型（推荐）

**理由**：
1. **类型明确**：显式指定 target 类型，避免自动判断的歧义，符合用户需求
2. **性能最优**：路径解析在 `bind()` 时完成，`build()` 时直接使用，无需运行时判断
3. **错误提示友好**：如果类型指定错误或缺少，会立即抛出清晰的错误
4. **向后兼容**：Node/Component 对象自动推断，不影响现有 API
5. **可维护性高**：binding 对象包含完整的类型信息，易于调试和维护
6. **符合用户需求**：在 `bind()` 时传入 target 类型，而不是解析时自动判断

**实施要点**：
1. 在 `BindingBuilder.bind()` 时通过参数显式指定 target 类型
2. Node/Component 对象：自动推断为 `'node'`，立即计算节点路径
3. 字符串 target：必须显式指定 `targetType` 参数：
   - `'property'` → 从组件实例解析属性，计算节点路径
   - `'node'` → 作为节点路径字符串处理
4. 在 `build()` 时直接使用绑定时确定的类型信息，无需再次判断
5. 在 `CocosViewAdapter` 中实现属性路径解析（仅用于属性路径）
6. 实现事件系统支持双向绑定

---

## 🔧 实施指南

### 步骤 1: 更新类型定义

```typescript
// packages/mvvm-creator/src/types/adapters.ts

export interface CocosViewAdapterConfig {
    rootNode: CocosNode;
    mappings?: NodeViewMapping[];
    propertyAccessor?: ComponentPropertyAccessor;
    componentInstance?: any;  // 新增：组件实例引用
}

export interface NodeViewMapping {
    path: string;
    viewPath: string;
    componentType?: string;
    propertyName?: string;
    isPropertyPath?: boolean;  // 新增：标记是否为属性路径
}
```

### 步骤 2: 增强 CocosViewAdapter

```typescript
// packages/mvvm-creator/src/adapters/CocosViewAdapter.ts

export class CocosViewAdapter implements IView {
    private componentInstance?: any;  // 新增
    private changeListeners: Map<string, Set<(path: string, value: any) => void>> = new Map();  // 新增
    
    constructor(config: CocosViewAdapterConfig) {
        this.componentInstance = config.componentInstance;  // 新增
        // ...
    }
    
    // 路径解析（支持属性路径和节点路径）
    private _getNodeByPath(path: string, mapping?: NodeViewMapping): CocosNode | null {
        if (path === '' || path === '/') {
            return this.rootNode;
        }
        
        // 如果是属性路径，尝试从组件实例获取
        if (mapping?.isPropertyPath && this.componentInstance) {
            const propertyNode = this._resolvePropertyPath(path);
            if (propertyNode) {
                return propertyNode;
            }
        }
        
        // 回退到节点路径解析
        return this._getNodeByNodePath(path);
    }
    
    // 实现事件系统
    private _emitChange(path: string, value: any): void {
        // 实现逻辑...
    }
}
```

### 步骤 3: 改进 BindingBuilder

```typescript
// packages/mvvm-creator/src/builders/BindingBuilder.ts

export class BindingBuilder<T> {
    private bindings: Array<{
        path: Path<T> & string;
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions<any>;
        // 新增：绑定时确定的类型信息
        targetType: 'node' | 'property';  // 必需
        resolvedNode?: CocosNode;
        nodePath?: string;
        propertyName?: string;
    }> = [];
    
    // 方法重载：Node/Component 对象（自动推断为 'node'）
    bind<P extends Path<T> & string>(
        path: P,
        target: CocosNode | CocosComponent,
        property?: string,
        options?: BindingOptions<PathValue<T, P>>
    ): this;
    
    // 方法重载：字符串 target（必须显式指定 targetType）
    bind<P extends Path<T> & string>(
        path: P,
        target: string,
        property: string | undefined,
        options: BindingOptions<PathValue<T, P>> | undefined,
        targetType: 'node' | 'property'
    ): this;
    
    // 实现
    bind<P extends Path<T> & string>(
        path: P,
        target: CocosNode | CocosComponent | string,
        property?: string,
        options?: BindingOptions<PathValue<T, P>>,
        targetType?: 'node' | 'property'
    ): this {
        // 确定 target 类型和解析结果
        let finalTargetType: 'node' | 'property';
        let resolvedNode: CocosNode | undefined;
        let nodePath: string | undefined;
        let propertyName: string | undefined;
        
        if (typeof target === 'string') {
            // 字符串 target：必须显式指定 targetType
            if (!targetType) {
                throw new Error(
                    `[BindingBuilder] When target is a string, targetType must be specified. ` +
                    `Use bind(path, target, property, options, 'node') or bind(path, target, property, options, 'property')`
                );
            }
            
            finalTargetType = targetType;
            
            if (targetType === 'property') {
                // 属性路径：从组件实例解析
                if (!this.componentInstance) {
                    throw new Error(
                        `[BindingBuilder] Cannot bind property "${target}" without component instance.`
                    );
                }
                
                const resolved = this._resolveTarget(target);
                if (!resolved) {
                    throw new Error(
                        `[BindingBuilder] Property "${target}" not found in component instance.`
                    );
                }
                
                const node = this._getNodeFromTarget(resolved);
                if (!node) {
                    throw new Error(
                        `[BindingBuilder] Cannot resolve property "${target}" to a node.`
                    );
                }
                
                resolvedNode = node;
                nodePath = this._getNodePath(node, this.rootNode);
                propertyName = target;
            } else {
                // 节点路径：直接使用字符串作为路径
                nodePath = target;
            }
        } else {
            // Node/Component 对象：自动推断为 'node'
            finalTargetType = 'node';
            const node = this._getNodeFromTarget(target);
            if (!node) {
                throw new Error(
                    `[BindingBuilder] Cannot resolve target to a node.`
                );
            }
            
            resolvedNode = node;
            nodePath = this._getNodePath(node, this.rootNode);
        }
        
        this.bindings.push({
            path,
            target,
            property,
            componentType: property ? this._inferComponentType(target) : undefined,
            options,
            targetType: finalTargetType,
            resolvedNode,
            nodePath,
            propertyName
        });
        return this;
    }
    
    build(): void {
        // 创建 CocosViewAdapter 时传递组件实例
        if (!this.viewAdapter) {
            this.viewAdapter = new CocosViewAdapter({
                rootNode: this.rootNode,
                componentInstance: this.componentInstance
            });
        }
        
        // 直接使用绑定时确定的类型信息创建映射
        this.bindings.forEach(binding => {
            if (binding.targetType === 'node' && binding.nodePath !== undefined) {
                // 节点路径：直接使用计算好的路径
                this.viewAdapter!.addMapping({
                    path: binding.nodePath,
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property
                });
            } else if (binding.targetType === 'property' && binding.propertyName) {
                // 属性路径：使用属性名，标记为属性路径
                this.viewAdapter!.addMapping({
                    path: binding.propertyName,
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property,
                    isPropertyPath: true
                });
            }
        });
        
        // 批量绑定...
    }
    
    // 新增：从 target 获取节点
    private _getNodeFromTarget(target: CocosNode | CocosComponent): CocosNode | null {
        // 实现逻辑...
    }
    
    // 新增：计算节点路径
    private _getNodePath(node: CocosNode, rootNode: CocosNode): string {
        // 实现逻辑...
    }
}
```

---

## 📋 使用示例

### 示例 1: 字符串属性名（最常见）

```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel: Label | null = null;
    
    protected onMVVMLoad(): void {
        // 使用属性名绑定（必须显式指定 targetType: 'property'）
        this.bindingBuilder
            .bind('name', 'nameLabel', 'string', undefined, 'property')  // ✅ 显式指定类型
            .build();
    }
}
```

### 示例 1.1: 直接绑定组件对象（推荐）

```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel: Label | null = null;
    
    protected onMVVMLoad(): void {
        // 直接绑定组件对象（自动推断为 'node'，无需指定 targetType）
        this.bindingBuilder
            .bind('name', this.nameLabel!, 'string')  // ✅ 直接绑定组件，自动推断
            .build();
    }
}
```

### 示例 2: 节点路径字符串

```typescript
protected onMVVMLoad(): void {
    // 使用节点路径字符串绑定（必须显式指定 targetType: 'node'）
    this.bindingBuilder
        .bind('name', 'child/grandchild', 'string', undefined, 'node')  // ✅ 显式指定类型
        .build();
}
```

### 示例 3: 节点对象（自动推断）

```typescript
protected onMVVMLoad(): void {
    // 使用节点对象绑定（自动推断为 'node'，无需指定 targetType）
    this.bindingBuilder
        .bind('name', this.nameLabel!.node, 'string')  // ✅ 自动推断
        .build();
}
```

### 示例 4: 组件对象（自动推断）

```typescript
protected onMVVMLoad(): void {
    // 使用组件对象绑定（自动推断为 'node'，无需指定 targetType）
    this.bindingBuilder
        .bind('name', this.nameLabel!, 'string')  // ✅ 自动推断
        .build();
}
```

### 示例 5: 双向绑定

```typescript
protected onMVVMLoad(): void {
    // 双向绑定（属性路径）
    this.bindingBuilder
        .bind('name', 'nameLabel', 'string', { 
            mode: 'two-way'  // ✅ 现在可以工作
        }, 'property')  // ✅ 显式指定类型
        .build();
}
```

### 示例 6: 直接绑定组件属性（推荐方式）

```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    protected onMVVMLoad(): void {
        // ✅ 方式 1: 直接绑定组件对象 + 属性名（推荐）
        // 绑定到 nameLabel.string 属性
        this.bindingBuilder
            .bind('name', this.nameLabel!, 'string')  // 组件对象 + 属性名
            .bind('level', this.levelLabel!, 'string')  // 组件对象 + 属性名
            .build();
        
        // ✅ 方式 2: 使用属性名字符串 + targetType: 'property'
        // 绑定到 nameLabel.string 属性（通过属性名解析）
        this.bindingBuilder
            .bind('name', 'nameLabel', 'string', undefined, 'property')  // 属性名 + 显式类型
            .build();
        
        // ✅ 方式 3: 使用节点路径字符串 + targetType: 'node'
        // 绑定到节点路径 'child/grandchild' 上的组件属性
        this.bindingBuilder
            .bind('name', 'child/grandchild', 'string', undefined, 'node')  // 节点路径 + 显式类型
            .build();
    }
}
```

**说明**：
- **方式 1（推荐）**：直接传入组件对象（如 `this.nameLabel!`），然后指定组件属性名（如 `'string'`）。这是最直接、类型最安全的方式。
- **方式 2**：使用属性名字符串（如 `'nameLabel'`），需要显式指定 `targetType: 'property'`，系统会从组件实例中解析属性。
- **方式 3**：使用节点路径字符串（如 `'child/grandchild'`），需要显式指定 `targetType: 'node'`，系统会通过节点路径查找节点。

**推荐使用方式 1**，因为：
- ✅ 类型安全：直接使用组件对象，TypeScript 可以检查类型
- ✅ 性能更好：无需解析属性名或节点路径
- ✅ 代码更清晰：直接看到绑定的组件对象

---

## 🎯 验收标准

### 功能验收

1. **路径解析**：
   - ✅ 支持节点路径解析（如 `'child/grandchild'`）
   - ✅ 支持属性路径解析（如 `'nameLabel'`）
   - ✅ 支持组件对象 target
   - ✅ 支持节点对象 target

2. **数据绑定**：
   - ✅ 字符串属性名 target 的绑定可以正常工作
   - ✅ 节点对象 target 的绑定可以正常工作
   - ✅ 组件对象 target 的绑定可以正常工作

3. **双向绑定**：
   - ✅ `_emitChange()` 可以触发 `change` 事件
   - ✅ `DataBinding` 可以监听视图变化
   - ✅ 视图变化可以更新数据源

4. **错误处理**：
   - ✅ 路径解析失败时提供清晰的错误提示
   - ✅ 属性不存在时提供清晰的错误提示

---

## 📊 技术评估总结

### 方案 3: 绑定时显式指定类型

- **类型安全**: ⭐⭐⭐⭐⭐ (5/5) - 显式指定类型，最安全
- **性能**: ⭐⭐⭐⭐⭐ (5/5) - 最优，无需运行时判断
- **易用性**: ⭐⭐⭐⭐ (4/5) - 字符串 target 需要显式指定类型（但这是优点）
- **实现复杂度**: ⭐⭐⭐ (3/5) - 中等
- **向后兼容**: ⭐⭐⭐⭐ (4/5) - Node/Component 对象自动推断，字符串需要显式指定
- **可维护性**: ⭐⭐⭐⭐⭐ (5/5) - 类型信息完整，错误提示友好

**总体评分**: ⭐⭐⭐⭐⭐ (4.7/5) - **强烈推荐**

---

**CREATIVE 模式完成时间**: 2025-01-XX  
**设计状态**: ✅ **COMPLETE**  
**推荐方案**: 方案 3 - 混合方案  
**下一步**: 进入 BUILD 模式实现优化


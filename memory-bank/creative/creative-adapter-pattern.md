# 🎨 CREATIVE PHASE: 适配器模式设计

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**描述**: 设计适配器模式，将 Cocos Creator 的 API 适配到引擎抽象接口，使框架能够通过统一接口使用不同引擎的功能。

**需求**:
- 将 Creator 特定 API 转换为抽象接口
- 保持适配器代码简洁高效
- 支持错误处理和异常情况
- 易于测试和维护
- 支持可选功能的优雅降级

**约束**:
- 必须保持现有 Creator 项目的兼容性
- 适配器层不能引入明显的性能开销
- 需要处理 Creator API 的异步特性
- 需要处理类型转换和兼容性

## 2️⃣ OPTIONS

**Option A: 直接适配器类**
- 每个适配器直接实现对应接口
- 简单直接，易于理解
- 代码结构清晰

**Option B: 适配器基类 + 继承**
- 定义适配器基类，提供通用功能
- 子类继承并实现特定功能
- 代码复用，但可能过度设计

**Option C: 组合模式 + 委托**
- 适配器内部组合 Creator 对象
- 通过委托调用 Creator API
- 灵活性高，但可能增加复杂度

## 3️⃣ ANALYSIS

| 评估标准 | Option A | Option B | Option C |
|---------|----------|----------|----------|
| **简洁性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **代码复用** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **可维护性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **扩展性** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **实现复杂度** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

**关键洞察**:
- Option A 最简单，适合快速实现
- Option B 提供代码复用，但可能过度设计
- Option C 最灵活，但增加复杂度

## 4️⃣ DECISION

**选择**: **Option A: 直接适配器类**（为主）+ **Option C: 组合模式**（为辅）

**理由**:
1. **简洁性**: 直接适配器类简单明了，易于理解和维护
2. **性能**: 减少继承层次，降低性能开销
3. **灵活性**: 组合 Creator 对象，保持灵活性
4. **渐进式**: 可以先实现简单版本，后续优化

## 5️⃣ IMPLEMENTATION NOTES

### 5.1 Creator 引擎适配器结构

```typescript
/**
 * Cocos Creator 引擎适配器
 */
class CreatorEngine implements IEngine {
    public resource: IResourceManager;
    public ui: IUIManager;
    public scene?: ISceneManager;
    public audio?: IAudioManager;
    public network?: INetworkManager;
    public hotupdate?: IHotupdateManager;
    
    constructor() {
        // 初始化各个子系统适配器
        this.resource = new CreatorResourceManager();
        this.ui = new CreatorUIManager();
        this.scene = new CreatorSceneManager();
        this.audio = new CreatorAudioManager();
        // network 和 hotupdate 可选
    }
    
    async init(config?: EngineConfig): Promise<void> {
        // 初始化 Creator 引擎
        // 可以在这里进行引擎特定的初始化
    }
    
    destroy(): void {
        // 清理资源
        this.resource = null as any;
        this.ui = null as any;
        // ...
    }
}
```

### 5.2 Creator 资源管理器适配器

```typescript
/**
 * Creator 资源管理器适配器
 */
class CreatorResourceManager implements IResourceManager {
    /**
     * 加载资源
     */
    async loadAsset<T = any>(path: string, type?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            // 使用 Creator 的 assetManager 加载资源
            assetManager.loadAny({ path, type: type as any }, (err, asset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset as T);
                }
            });
        });
    }
    
    /**
     * 加载资源包
     */
    async loadBundle(name: string, options?: BundleOptions): Promise<IBundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, bundle) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new CreatorBundle(bundle));
                }
            });
        });
    }
    
    /**
     * 释放资源
     */
    releaseAsset(asset: IAsset): void {
        // 转换并释放 Creator 资源
        if (asset && (asset as any).isValid) {
            assetManager.releaseAsset(asset as any);
        }
    }
    
    /**
     * 释放资源包
     */
    releaseBundle(bundle: IBundle): void {
        if (bundle instanceof CreatorBundle) {
            bundle.release();
        }
    }
    
    /**
     * 预加载资源
     */
    async preload(paths: string[]): Promise<void> {
        const promises = paths.map(path => this.loadAsset(path));
        await Promise.all(promises);
    }
}

/**
 * Creator 资源包适配器
 */
class CreatorBundle implements IBundle {
    private bundle: AssetManager.Bundle;
    
    constructor(bundle: AssetManager.Bundle) {
        this.bundle = bundle;
    }
    
    get name(): string {
        return this.bundle.name;
    }
    
    async load<T = any>(path: string, type?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.bundle.load(path, type as any, (err, asset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset as T);
                }
            });
        });
    }
    
    release(): void {
        this.bundle.releaseAll();
    }
}
```

### 5.3 Creator UI 管理器适配器

```typescript
/**
 * Creator UI 管理器适配器
 */
class CreatorUIManager implements IUIManager {
    private rootNode: Node | null = null;
    
    /**
     * 创建节点
     */
    createNode(name?: string): INode {
        const node = new Node(name || 'Node');
        return new CreatorNode(node);
    }
    
    /**
     * 创建组件
     */
    createComponent<T>(type: string): T {
        // 使用 Creator 的组件系统
        // 这里需要根据类型字符串创建对应的组件
        // 可以使用工厂模式或注册表
        const ComponentClass = this.getComponentClass(type);
        return new ComponentClass() as T;
    }
    
    /**
     * 实例化预制体
     */
    instantiate(prefab: IPrefab): INode {
        // 使用 Creator 的 instantiate
        const node = instantiate(prefab.data as Prefab);
        return new CreatorNode(node);
    }
    
    /**
     * 查找节点
     */
    findNode(path: string): INode | null {
        const node = this.getRoot().find(path);
        return node ? new CreatorNode(node) : null;
    }
    
    /**
     * 获取根节点
     */
    getRoot(): INode {
        if (!this.rootNode) {
            // 获取场景根节点或创建
            this.rootNode = director.getScene()?.getChildByName('Canvas') || new Node('Canvas');
        }
        return new CreatorNode(this.rootNode);
    }
    
    private getComponentClass(type: string): Constructor<any> {
        // 组件类型注册表
        const componentMap: Record<string, Constructor<any>> = {
            'Label': Label,
            'Sprite': Sprite,
            'Button': Button,
            // ... 其他组件
        };
        return componentMap[type] || Component;
    }
}

/**
 * Creator 节点适配器
 */
class CreatorNode implements INode {
    private node: Node;
    
    constructor(node: Node) {
        this.node = node;
    }
    
    get name(): string {
        return this.node.name;
    }
    
    set name(value: string) {
        this.node.name = value;
    }
    
    get parent(): INode | null {
        return this.node.parent ? new CreatorNode(this.node.parent) : null;
    }
    
    get children(): INode[] {
        return this.node.children.map(child => new CreatorNode(child));
    }
    
    addChild(child: INode): void {
        if (child instanceof CreatorNode) {
            this.node.addChild(child.node);
        }
    }
    
    removeChild(child: INode): void {
        if (child instanceof CreatorNode) {
            this.node.removeChild(child.node);
        }
    }
    
    addComponent<T>(type: string): T {
        // 使用 Creator 的 addComponent
        const ComponentClass = this.getComponentClass(type);
        return this.node.addComponent(ComponentClass) as T;
    }
    
    getComponent<T>(type: string): T | null {
        const ComponentClass = this.getComponentClass(type);
        return this.node.getComponent(ComponentClass) as T;
    }
    
    destroy(): void {
        this.node.destroy();
    }
    
    private getComponentClass(type: string): Constructor<any> {
        // 同 CreatorUIManager 的实现
        // ...
    }
}
```

### 5.4 适配器文件结构

```
bl-framework-demo/extensions/bl-framework/adapters/
├── creator/
│   ├── index.ts                    # 导出 Creator 适配器
│   ├── CreatorEngine.ts            # Creator 引擎适配器
│   ├── CreatorResourceManager.ts   # Creator 资源管理器适配器
│   ├── CreatorUIManager.ts         # Creator UI 管理器适配器
│   ├── CreatorSceneManager.ts      # Creator 场景管理器适配器
│   ├── CreatorAudioManager.ts      # Creator 音频管理器适配器
│   ├── CreatorNetworkManager.ts    # Creator 网络管理器适配器
│   ├── CreatorHotupdateManager.ts # Creator 热更新管理器适配器
│   └── types.ts                    # Creator 特定类型
└── index.ts                        # 导出所有适配器
```

### 5.5 适配器注册和使用

```typescript
/**
 * 在框架初始化时注册引擎
 */
import { CreatorEngine } from './adapters/creator';
import { EngineServiceLocator } from '@bl-framework/core';

// 初始化 Creator 引擎适配器
const engine = new CreatorEngine();
await engine.init();

// 注册到服务定位器
EngineServiceLocator.register(engine);

// 现在可以在任何地方使用
const resourceManager = EngineServiceLocator.getResourceManager();
const asset = await resourceManager.loadAsset('path/to/asset');
```

### 5.6 错误处理和兼容性

```typescript
/**
 * 适配器中的错误处理示例
 */
class CreatorResourceManager implements IResourceManager {
    async loadAsset<T = any>(path: string, type?: string): Promise<T> {
        try {
            return new Promise((resolve, reject) => {
                assetManager.loadAny({ path, type: type as any }, (err, asset) => {
                    if (err) {
                        // 统一错误格式
                        reject(new ResourceLoadError(`Failed to load asset: ${path}`, err));
                    } else {
                        resolve(asset as T);
                    }
                });
            });
        } catch (error) {
            // 处理同步错误
            throw new ResourceLoadError(`Failed to load asset: ${path}`, error);
        }
    }
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END


# 🎨 CREATIVE PHASE: 依赖注入机制设计

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**描述**: 设计依赖注入机制，使框架能够获取和使用引擎实例，同时保持代码解耦和可测试性。

**需求**:
- 提供简单的方式获取引擎实例
- 支持可选依赖（某些引擎可能不支持某些功能）
- 支持测试时的依赖替换（Mock）
- 保持 API 简洁易用
- 支持延迟初始化

**约束**:
- 不能引入复杂的依赖注入框架
- 必须保持 TypeScript 类型安全
- 性能开销要小
- 易于理解和维护

## 2️⃣ OPTIONS

**Option A: 服务定位器模式（Service Locator）**
- 全局服务定位器，通过静态方法获取服务
- 简单直接，易于使用
- 但可能隐藏依赖关系

**Option B: 依赖注入容器（DI Container）**
- 使用依赖注入容器管理依赖
- 支持构造函数注入、属性注入
- 功能强大，但复杂度高

**Option C: 混合模式（服务定位器 + 可选注入）**
- 默认使用服务定位器
- 支持可选的构造函数注入
- 平衡简洁性和灵活性

## 3️⃣ ANALYSIS

| 评估标准 | Option A | Option B | Option C |
|---------|----------|----------|----------|
| **简洁性** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **灵活性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **可测试性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **实现复杂度** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**关键洞察**:
- Option A 最简单，适合快速实现
- Option B 功能强大但可能过度设计
- Option C 平衡了简洁性和灵活性，适合大多数场景

## 4️⃣ DECISION

**选择**: **Option C: 混合模式（服务定位器 + 可选注入）**

**理由**:
1. **简洁性**: 默认使用服务定位器，API 简单易用
2. **灵活性**: 支持可选的构造函数注入，提高可测试性
3. **渐进式**: 可以先实现服务定位器，后续添加注入支持
4. **类型安全**: TypeScript 可以很好地支持两种方式

## 5️⃣ IMPLEMENTATION NOTES

### 5.1 服务定位器实现

```typescript
/**
 * 引擎服务定位器
 * 提供全局访问引擎实例的方式
 */
class EngineServiceLocator {
    private static engine: IEngine | null = null;
    private static initialized: boolean = false;
    
    /**
     * 注册引擎实例
     */
    static register(engine: IEngine): void {
        if (this.engine) {
            console.warn('Engine already registered. Replacing existing engine.');
        }
        this.engine = engine;
        this.initialized = true;
    }
    
    /**
     * 获取引擎实例
     */
    static getEngine(): IEngine {
        if (!this.engine) {
            throw new Error(
                'Engine not registered. ' +
                'Please call EngineServiceLocator.register(engine) before using the framework.'
            );
        }
        return this.engine;
    }
    
    /**
     * 检查引擎是否已注册
     */
    static isInitialized(): boolean {
        return this.initialized;
    }
    
    /**
     * 获取资源管理器
     */
    static getResourceManager(): IResourceManager {
        return this.getEngine().resource;
    }
    
    /**
     * 获取 UI 管理器
     */
    static getUIManager(): IUIManager {
        return this.getEngine().ui;
    }
    
    /**
     * 获取场景管理器（可选）
     */
    static getSceneManager(): ISceneManager | null {
        return this.getEngine().scene || null;
    }
    
    /**
     * 获取音频管理器（可选）
     */
    static getAudioManager(): IAudioManager | null {
        return this.getEngine().audio || null;
    }
    
    /**
     * 获取网络管理器（可选）
     */
    static getNetworkManager(): INetworkManager | null {
        return this.getEngine().network || null;
    }
    
    /**
     * 获取热更新管理器（可选）
     */
    static getHotupdateManager(): IHotupdateManager | null {
        return this.getEngine().hotupdate || null;
    }
    
    /**
     * 重置（主要用于测试）
     */
    static reset(): void {
        this.engine = null;
        this.initialized = false;
    }
}
```

### 5.2 可选依赖注入支持

```typescript
/**
 * 管理器基类
 * 支持可选的依赖注入
 */
abstract class BaseManager {
    protected engine: IEngine;
    protected resource: IResourceManager;
    protected ui: IUIManager;
    
    /**
     * 构造函数支持依赖注入
     * 如果不提供，则从服务定位器获取
     */
    constructor(
        engine?: IEngine,
        resource?: IResourceManager,
        ui?: IUIManager
    ) {
        this.engine = engine || EngineServiceLocator.getEngine();
        this.resource = resource || this.engine.resource;
        this.ui = ui || this.engine.ui;
    }
}

/**
 * 使用示例：支持依赖注入的管理器
 */
class FWAssetManager extends BaseManager {
    constructor(
        engine?: IEngine,
        resource?: IResourceManager
    ) {
        super(engine, resource);
    }
    
    async loadAsset(path: string) {
        // 使用 this.resource 而不是直接调用服务定位器
        return await this.resource.loadAsset(path);
    }
}
```

### 5.3 工厂模式支持

```typescript
/**
 * 管理器工厂
 * 用于创建管理器实例，支持依赖注入
 */
class ManagerFactory {
    /**
     * 创建资源管理器
     */
    static createAssetManager(
        engine?: IEngine,
        resource?: IResourceManager
    ): FWAssetManager {
        return new FWAssetManager(engine, resource);
    }
    
    /**
     * 创建 UI 管理器
     */
    static createUIManager(
        engine?: IEngine,
        ui?: IUIManager
    ): FWUIManager {
        return new FWUIManager(engine, ui);
    }
    
    // ... 其他管理器工厂方法
}
```

### 5.4 测试支持

```typescript
/**
 * Mock 引擎用于测试
 */
class MockEngine implements IEngine {
    resource: IResourceManager;
    ui: IUIManager;
    
    constructor() {
        this.resource = new MockResourceManager();
        this.ui = new MockUIManager();
    }
    
    async init(): Promise<void> {
        // Mock 实现
    }
    
    destroy(): void {
        // Mock 实现
    }
}

/**
 * 测试示例
 */
describe('FWAssetManager', () => {
    beforeEach(() => {
        // 注册 Mock 引擎
        const mockEngine = new MockEngine();
        EngineServiceLocator.register(mockEngine);
    });
    
    afterEach(() => {
        // 清理
        EngineServiceLocator.reset();
    });
    
    it('should load asset', async () => {
        const manager = new FWAssetManager();
        // 或者使用依赖注入
        const mockResource = new MockResourceManager();
        const manager = new FWAssetManager(undefined, mockResource);
        
        const asset = await manager.loadAsset('test/path');
        expect(asset).toBeDefined();
    });
});
```

### 5.5 配置和初始化

```typescript
/**
 * 引擎配置
 */
interface EngineConfig {
    /** 是否启用场景管理 */
    enableScene?: boolean;
    /** 是否启用音频管理 */
    enableAudio?: boolean;
    /** 是否启用网络管理 */
    enableNetwork?: boolean;
    /** 是否启用热更新 */
    enableHotupdate?: boolean;
    /** 自定义配置 */
    [key: string]: any;
}

/**
 * 框架初始化函数
 */
export async function initFramework(
    engine: IEngine,
    config?: EngineConfig
): Promise<void> {
    // 初始化引擎
    await engine.init(config);
    
    // 注册到服务定位器
    EngineServiceLocator.register(engine);
    
    // 初始化管理器
    // ...
}

/**
 * 使用示例
 */
import { initFramework } from '@bl-framework/core';
import { CreatorEngine } from './adapters/creator';

async function main() {
    const engine = new CreatorEngine();
    await initFramework(engine, {
        enableScene: true,
        enableAudio: true,
    });
    
    // 现在可以使用框架了
    const resourceManager = EngineServiceLocator.getResourceManager();
    // ...
}
```

### 5.6 文件结构

```
packages/core/src/engine/
├── index.ts                    # 导出所有接口和类
├── IEngine.ts                  # 核心引擎接口
├── IResourceManager.ts         # 资源管理接口
├── IUIManager.ts               # UI 管理接口
├── ISceneManager.ts            # 场景管理接口
├── IAudioManager.ts            # 音频管理接口
├── INetworkManager.ts          # 网络管理接口
├── IHotupdateManager.ts        # 热更新接口
├── EngineServiceLocator.ts     # 服务定位器
├── ManagerFactory.ts           # 管理器工厂
└── types.ts                    # 通用类型定义
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END


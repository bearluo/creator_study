# 🎨 CREATIVE PHASE: 引擎抽象接口设计

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**描述**: 设计一套引擎抽象接口，使 bl-framework 的核心功能能够适配不同的游戏引擎（Cocos Creator、Unity、Unreal Engine 等）。

**需求**:
- 抽象不同引擎的通用概念（节点、组件、资源等）
- 提供类型安全的接口定义
- 支持异步操作（资源加载等）
- 易于扩展和维护
- 保持接口简洁，避免过度抽象

**约束**:
- 必须保持向后兼容（现有 Creator 项目）
- 接口设计不能影响性能
- 需要支持 TypeScript 类型推断
- 必须支持可选功能（某些引擎可能不支持某些功能）

## 2️⃣ OPTIONS

**Option A: 单一 IEngine 接口 + 子接口**
- 一个主接口包含所有子系统接口
- 结构清晰，易于理解
- 所有功能集中在一个地方

**Option B: 独立接口 + 服务定位器**
- 每个子系统独立接口（IResourceManager, IUIManager 等）
- 通过服务定位器获取实例
- 更灵活，支持可选功能

**Option C: 接口组合 + 依赖注入**
- 核心接口 + 可选接口组合
- 通过依赖注入提供实现
- 最灵活，但复杂度较高

## 3️⃣ ANALYSIS

| 评估标准 | Option A | Option B | Option C |
|---------|----------|----------|----------|
| **简洁性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **灵活性** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **可维护性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **扩展性** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **实现复杂度** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

**关键洞察**:
- Option A 最简单，但灵活性不足，难以处理可选功能
- Option B 平衡了简洁性和灵活性，适合大多数场景
- Option C 最灵活但复杂度高，可能过度设计

## 4️⃣ DECISION

**选择**: **Option B: 独立接口 + 服务定位器**

**理由**:
1. **灵活性**: 支持可选功能，某些引擎可能不支持某些子系统
2. **可维护性**: 每个接口职责单一，易于理解和维护
3. **扩展性**: 新引擎只需实现需要的接口即可
4. **类型安全**: TypeScript 可以很好地支持接口组合
5. **性能**: 服务定位器开销小，不影响性能

## 5️⃣ IMPLEMENTATION NOTES

### 5.1 核心接口设计

#### IEngine 核心接口
```typescript
/**
 * 引擎核心接口
 * 提供对各个子系统的访问
 */
interface IEngine {
    /** 资源管理器 */
    resource: IResourceManager;
    /** UI 管理器 */
    ui: IUIManager;
    /** 场景管理器 */
    scene?: ISceneManager;  // 可选
    /** 音频管理器 */
    audio?: IAudioManager;   // 可选
    /** 网络管理器 */
    network?: INetworkManager;  // 可选
    /** 热更新管理器 */
    hotupdate?: IHotupdateManager;  // 可选
    
    /** 初始化引擎 */
    init(config?: EngineConfig): Promise<void>;
    /** 销毁引擎 */
    destroy(): void;
}
```

#### IResourceManager 接口
```typescript
/**
 * 资源管理器接口
 */
interface IResourceManager {
    /** 加载资源 */
    loadAsset<T = any>(path: string, type?: string): Promise<T>;
    /** 加载资源包 */
    loadBundle(name: string, options?: BundleOptions): Promise<IBundle>;
    /** 释放资源 */
    releaseAsset(asset: IAsset): void;
    /** 释放资源包 */
    releaseBundle(bundle: IBundle): void;
    /** 预加载资源 */
    preload(paths: string[]): Promise<void>;
}

interface IAsset {
    /** 资源路径 */
    path: string;
    /** 资源类型 */
    type: string;
    /** 资源数据 */
    data: any;
    /** 释放资源 */
    release(): void;
}

interface IBundle {
    /** 包名称 */
    name: string;
    /** 加载资源 */
    load<T = any>(path: string, type?: string): Promise<T>;
    /** 释放包 */
    release(): void;
}
```

#### IUIManager 接口
```typescript
/**
 * UI 管理器接口
 */
interface IUIManager {
    /** 创建节点 */
    createNode(name?: string): INode;
    /** 创建组件 */
    createComponent<T>(type: string): T;
    /** 实例化预制体 */
    instantiate(prefab: IPrefab): INode;
    /** 查找节点 */
    findNode(path: string): INode | null;
    /** 获取根节点 */
    getRoot(): INode;
}

interface INode {
    /** 节点名称 */
    name: string;
    /** 父节点 */
    parent: INode | null;
    /** 子节点列表 */
    children: INode[];
    /** 添加子节点 */
    addChild(child: INode): void;
    /** 移除子节点 */
    removeChild(child: INode): void;
    /** 添加组件 */
    addComponent<T>(type: string): T;
    /** 获取组件 */
    getComponent<T>(type: string): T | null;
    /** 销毁节点 */
    destroy(): void;
}

interface IPrefab {
    /** 预制体路径 */
    path: string;
    /** 预制体数据 */
    data: any;
}
```

#### ISceneManager 接口
```typescript
/**
 * 场景管理器接口（可选）
 */
interface ISceneManager {
    /** 加载场景 */
    loadScene(name: string): Promise<void>;
    /** 预加载场景 */
    preloadScene(name: string): Promise<void>;
    /** 获取当前场景 */
    getCurrentScene(): IScene | null;
}

interface IScene {
    /** 场景名称 */
    name: string;
    /** 场景根节点 */
    root: INode;
}
```

#### IAudioManager 接口
```typescript
/**
 * 音频管理器接口（可选）
 */
interface IAudioManager {
    /** 播放音效 */
    playEffect(clip: IAudioClip, volume?: number): IAudioSource;
    /** 播放背景音乐 */
    playMusic(clip: IAudioClip, loop?: boolean, volume?: number): IAudioSource;
    /** 设置音效音量 */
    setEffectVolume(volume: number): void;
    /** 设置音乐音量 */
    setMusicVolume(volume: number): void;
    /** 停止所有音频 */
    stopAll(): void;
}

interface IAudioClip {
    /** 音频路径 */
    path: string;
    /** 音频数据 */
    data: any;
}

interface IAudioSource {
    /** 播放 */
    play(): void;
    /** 暂停 */
    pause(): void;
    /** 停止 */
    stop(): void;
    /** 设置音量 */
    setVolume(volume: number): void;
}
```

#### INetworkManager 接口
```typescript
/**
 * 网络管理器接口（可选）
 */
interface INetworkManager {
    /** HTTP 请求 */
    request<T = any>(config: RequestConfig): Promise<T>;
    /** WebSocket 连接 */
    connect(url: string, protocols?: string[]): IWebSocket;
}

interface RequestConfig {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    data?: any;
    timeout?: number;
}

interface IWebSocket {
    /** 发送消息 */
    send(data: string | ArrayBuffer): void;
    /** 关闭连接 */
    close(): void;
    /** 监听消息 */
    onMessage(callback: (data: any) => void): void;
    /** 监听错误 */
    onError(callback: (error: Error) => void): void;
}
```

#### IHotupdateManager 接口
```typescript
/**
 * 热更新管理器接口（可选）
 */
interface IHotupdateManager {
    /** 检查更新 */
    checkUpdate(): Promise<UpdateInfo>;
    /** 下载更新 */
    downloadUpdate(info: UpdateInfo, onProgress?: (progress: number) => void): Promise<void>;
    /** 应用更新 */
    applyUpdate(): Promise<void>;
}

interface UpdateInfo {
    /** 是否有更新 */
    hasUpdate: boolean;
    /** 版本号 */
    version?: string;
    /** 更新大小 */
    size?: number;
    /** 更新描述 */
    description?: string;
}
```

### 5.2 服务定位器设计

```typescript
/**
 * 引擎服务定位器
 */
class EngineServiceLocator {
    private static engine: IEngine | null = null;
    
    /**
     * 注册引擎实例
     */
    static register(engine: IEngine): void {
        this.engine = engine;
    }
    
    /**
     * 获取引擎实例
     */
    static getEngine(): IEngine {
        if (!this.engine) {
            throw new Error('Engine not registered. Call EngineServiceLocator.register() first.');
        }
        return this.engine;
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
    
    // ... 其他获取方法
}
```

### 5.3 类型定义位置

- 所有接口定义在 `packages/core/src/engine/` 目录
- 文件结构：
  ```
  packages/core/src/engine/
  ├── index.ts              # 导出所有接口
  ├── IEngine.ts            # 核心引擎接口
  ├── IResourceManager.ts   # 资源管理接口
  ├── IUIManager.ts         # UI 管理接口
  ├── ISceneManager.ts      # 场景管理接口
  ├── IAudioManager.ts      # 音频管理接口
  ├── INetworkManager.ts    # 网络管理接口
  ├── IHotupdateManager.ts  # 热更新接口
  └── types.ts              # 通用类型定义
  ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END


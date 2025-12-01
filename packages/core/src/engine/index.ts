/**
 * 引擎抽象层
 * 
 * 导出所有引擎接口和服务定位器
 */

// 核心接口
export * from './IEngine';
export * from './IResourceManager';
export * from './IUIManager';
export * from './ISceneManager';
export * from './IAudioManager';
export * from './INetworkManager';
export * from './IHotupdateManager';

// 服务定位器
export * from './EngineServiceLocator';

// 类型定义
export * from './types';


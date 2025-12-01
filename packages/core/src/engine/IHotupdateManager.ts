/**
 * 热更新管理器接口（可选）
 */

/**
 * 热更新管理器接口
 */
export interface IHotupdateManager {
    /** 检查更新 */
    checkUpdate(): Promise<UpdateInfo>;
    /** 下载更新 */
    downloadUpdate(info: UpdateInfo, onProgress?: (progress: number) => void): Promise<void>;
    /** 应用更新 */
    applyUpdate(): Promise<void>;
}

/**
 * 更新信息
 */
export interface UpdateInfo {
    /** 是否有更新 */
    hasUpdate: boolean;
    /** 版本号 */
    version?: string;
    /** 更新大小 */
    size?: number;
    /** 更新描述 */
    description?: string;
}


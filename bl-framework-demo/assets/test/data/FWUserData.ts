import { _decorator, sys } from 'cc';
import { log } from 'db://bl-framework/common';
import { FWEncryptedDataBase } from 'db://bl-framework/manager';


/**
 * 用户数据接口定义
 */
export interface IUserData {
    /** 用户ID */
    userId: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname?: string;
    /** 头像URL */
    avatar?: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    phone?: string;
    /** 用户等级 */
    level: number;
    /** 经验值 */
    experience: number;
    /** 金币 */
    gold: number;
    /** 钻石 */
    diamond: number;
    /** VIP等级 */
    vipLevel: number;
    /** 注册时间 */
    registerTime: Date;
    /** 最后登录时间 */
    lastLoginTime: Date;
    /** 是否首次登录 */
    isFirstLogin: boolean;
    /** 用户设置 */
    settings: IUserSettings;
    /** 游戏进度 */
    gameProgress: IGameProgress;
    /** 用户统计 */
    statistics: IUserStatistics;
}

/**
 * 用户设置接口
 */
export interface IUserSettings {
    /** 音效开关 */
    soundEnabled: boolean;
    /** 背景音乐开关 */
    bgmEnabled: boolean;
    /** 音效音量 */
    soundVolume: number;
    /** 背景音乐音量 */
    bgmVolume: number;
    /** 语言设置 */
    language: string;
    /** 画质设置 */
    graphicsQuality: string;
    /** 自动保存开关 */
    autoSave: boolean;
    /** 推送通知开关 */
    pushNotification: boolean;
}

/**
 * 游戏进度接口
 */
export interface IGameProgress {
    /** 当前关卡 */
    currentLevel: number;
    /** 最高关卡 */
    maxLevel: number;
    /** 已解锁关卡 */
    unlockedLevels: number[];
    /** 关卡星级 */
    levelStars: Record<number, number>;
    /** 成就完成情况 */
    achievements: Record<string, boolean>;
    /** 收集品 */
    collectibles: Record<string, number>;
}

/**
 * 用户统计接口
 */
export interface IUserStatistics {
    /** 游戏时长（秒） */
    playTime: number;
    /** 登录次数 */
    loginCount: number;
    /** 连续登录天数 */
    consecutiveLoginDays: number;
    /** 最大连续登录天数 */
    maxConsecutiveLoginDays: number;
    /** 消费金额 */
    totalSpent: number;
    /** 获得金币总数 */
    totalGoldEarned: number;
    /** 消费金币总数 */
    totalGoldSpent: number;
}

/**
 * 用户数据加密类
 * 专门用于处理用户数据的加密存储和管理
 * 继承自FWEncryptedDataBase，提供用户数据特定的功能
 */
export class FWUserData extends FWEncryptedDataBase {
    /** 用户数据键名常量 */
    private static readonly KEYS = {
        USER_INFO: 'user_info',
        USER_SETTINGS: 'user_settings',
        GAME_PROGRESS: 'game_progress',
        USER_STATISTICS: 'user_statistics',
        LOGIN_HISTORY: 'login_history',
        PURCHASE_HISTORY: 'purchase_history',
        ACHIEVEMENT_HISTORY: 'achievement_history',
        DATA_VERSION: 'data_version',
        LAST_BACKUP_TIME: 'last_backup_time',
        LAST_LOGIN_TIME: 'last_login_time',
        DEVICE_ID: 'device_id',
        SESSION_TOKEN: 'session_token'
    };

    /** 当前数据版本 */
    private static readonly CURRENT_VERSION = '1.0.0';

    /** 默认用户设置 */
    private static readonly DEFAULT_SETTINGS: IUserSettings = {
        soundEnabled: true,
        bgmEnabled: true,
        soundVolume: 0.8,
        bgmVolume: 0.6,
        language: 'zh-CN',
        graphicsQuality: 'medium',
        autoSave: true,
        pushNotification: true
    };

    /** 默认游戏进度 */
    private static readonly DEFAULT_GAME_PROGRESS: IGameProgress = {
        currentLevel: 1,
        maxLevel: 1,
        unlockedLevels: [1],
        levelStars: {},
        achievements: {},
        collectibles: {}
    };

    /** 默认用户统计 */
    private static readonly DEFAULT_STATISTICS: IUserStatistics = {
        playTime: 0,
        loginCount: 0,
        consecutiveLoginDays: 0,
        maxConsecutiveLoginDays: 0,
        totalSpent: 0,
        totalGoldEarned: 0,
        totalGoldSpent: 0
    };

    /**
     * 构造函数
     * @param userId 用户ID
     * @param encryptKey 自定义加密密钥
     * @param iv 自定义初始化向量
     */
    constructor(userId: string, encryptKey?: string, iv?: string) {
        super(`user_data_${userId}`, encryptKey, iv);
        this.initializeUserData();
    }

    // ==================== 用户数据初始化 ====================

    /**
     * 初始化用户数据
     */
    private initializeUserData() {
        const dataVersion = this.getString(FWUserData.KEYS.DATA_VERSION);
        
        if (!dataVersion) {
            // 新用户，初始化默认数据
            this.setString(FWUserData.KEYS.DATA_VERSION, FWUserData.CURRENT_VERSION);
            this.setObject(FWUserData.KEYS.USER_SETTINGS, FWUserData.DEFAULT_SETTINGS);
            this.setObject(FWUserData.KEYS.GAME_PROGRESS, FWUserData.DEFAULT_GAME_PROGRESS);
            this.setObject(FWUserData.KEYS.USER_STATISTICS, FWUserData.DEFAULT_STATISTICS);
            this.setDate(FWUserData.KEYS.LAST_BACKUP_TIME, new Date());
            
            log.info(`新用户数据初始化完成: ${this.getUserId()}`);
        } else if (dataVersion !== FWUserData.CURRENT_VERSION) {
            // 数据版本不匹配，执行数据迁移
            this.migrateUserData(dataVersion);
        }
    }

    /**
     * 数据迁移
     * @param oldVersion 旧版本号
     */
    private migrateUserData(oldVersion: string) {
        log.info(`开始数据迁移: ${oldVersion} -> ${FWUserData.CURRENT_VERSION}`);
        
        // 这里可以添加版本迁移逻辑
        // 例如：从1.0.0迁移到1.1.0时，添加新的字段
        
        this.setString(FWUserData.KEYS.DATA_VERSION, FWUserData.CURRENT_VERSION);
        log.info('数据迁移完成');
    }

    // ==================== 用户基本信息管理 ====================

    /**
     * 设置用户基本信息
     * @param userInfo 用户信息
     */
    setUserInfo(userInfo: Partial<IUserData>) {
        const currentInfo = this.getUserInfo();
        const updatedInfo = { ...currentInfo, ...userInfo };
        this.setObject(FWUserData.KEYS.USER_INFO, updatedInfo);
        log.info('用户信息已更新');
    }

    /**
     * 获取用户基本信息
     * @returns 用户信息
     */
    getUserInfo(): IUserData | null {
        return this.getObject<IUserData>(FWUserData.KEYS.USER_INFO);
    }

    /**
     * 获取用户ID
     * @returns 用户ID
     */
    getUserId(): string {
        const userInfo = this.getUserInfo();
        return userInfo?.userId || 'unknown';
    }

    /**
     * 更新用户等级和经验
     * @param level 新等级
     * @param experience 新经验值
     */
    updateUserLevel(level: number, experience: number) {
        const userInfo = this.getUserInfo();
        if (userInfo) {
            userInfo.level = level;
            userInfo.experience = experience;
            this.setUserInfo(userInfo);
        }
    }

    /**
     * 更新用户货币
     * @param gold 金币变化量
     * @param diamond 钻石变化量
     */
    updateUserCurrency(gold: number = 0, diamond: number = 0) {
        const userInfo = this.getUserInfo();
        if (userInfo) {
            userInfo.gold += gold;
            userInfo.diamond += diamond;
            
            // 更新统计信息
            const statistics = this.getUserStatistics();
            if (statistics) {
                if (gold > 0) {
                    statistics.totalGoldEarned += gold;
                } else if (gold < 0) {
                    statistics.totalGoldSpent += Math.abs(gold);
                }
                this.setUserStatistics(statistics);
            }
            
            this.setUserInfo(userInfo);
        }
    }

    // ==================== 用户设置管理 ====================

    /**
     * 设置用户设置
     * @param settings 用户设置
     */
    setUserSettings(settings: Partial<IUserSettings>) {
        const currentSettings = this.getUserSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        this.setObject(FWUserData.KEYS.USER_SETTINGS, updatedSettings);
    }

    /**
     * 获取用户设置
     * @returns 用户设置
     */
    getUserSettings(): IUserSettings {
        return this.getObject<IUserSettings>(FWUserData.KEYS.USER_SETTINGS) || FWUserData.DEFAULT_SETTINGS;
    }

    /**
     * 更新单个设置项
     * @param key 设置键名
     * @param value 设置值
     */
    updateSetting<K extends keyof IUserSettings>(key: K, value: IUserSettings[K]) {
        const settings = this.getUserSettings();
        settings[key] = value;
        this.setUserSettings(settings);
    }

    // ==================== 游戏进度管理 ====================

    /**
     * 设置游戏进度
     * @param progress 游戏进度
     */
    setGameProgress(progress: Partial<IGameProgress>) {
        const currentProgress = this.getGameProgress();
        const updatedProgress = { ...currentProgress, ...progress };
        this.setObject(FWUserData.KEYS.GAME_PROGRESS, updatedProgress);
    }

    /**
     * 获取游戏进度
     * @returns 游戏进度
     */
    getGameProgress(): IGameProgress {
        return this.getObject<IGameProgress>(FWUserData.KEYS.GAME_PROGRESS) || FWUserData.DEFAULT_GAME_PROGRESS;
    }

    /**
     * 解锁新关卡
     * @param level 关卡号
     */
    unlockLevel(level: number) {
        const progress = this.getGameProgress();
        if (progress.unlockedLevels.indexOf(level) === -1) {
            progress.unlockedLevels.push(level);
            progress.maxLevel = Math.max(progress.maxLevel, level);
            this.setGameProgress(progress);
        }
    }

    /**
     * 设置关卡星级
     * @param level 关卡号
     * @param stars 星级（1-3）
     */
    setLevelStars(level: number, stars: number) {
        const progress = this.getGameProgress();
        progress.levelStars[level] = Math.max(progress.levelStars[level] || 0, stars);
        this.setGameProgress(progress);
    }

    /**
     * 完成成就
     * @param achievementId 成就ID
     */
    completeAchievement(achievementId: string) {
        const progress = this.getGameProgress();
        progress.achievements[achievementId] = true;
        this.setGameProgress(progress);
    }

    /**
     * 更新收集品数量
     * @param collectibleId 收集品ID
     * @param count 数量变化
     */
    updateCollectible(collectibleId: string, count: number) {
        const progress = this.getGameProgress();
        progress.collectibles[collectibleId] = (progress.collectibles[collectibleId] || 0) + count;
        this.setGameProgress(progress);
    }

    // ==================== 用户统计管理 ====================

    /**
     * 设置用户统计
     * @param statistics 用户统计
     */
    setUserStatistics(statistics: Partial<IUserStatistics>) {
        const currentStatistics = this.getUserStatistics();
        const updatedStatistics = { ...currentStatistics, ...statistics };
        this.setObject(FWUserData.KEYS.USER_STATISTICS, updatedStatistics);
    }

    /**
     * 获取用户统计
     * @returns 用户统计
     */
    getUserStatistics(): IUserStatistics {
        return this.getObject<IUserStatistics>(FWUserData.KEYS.USER_STATISTICS) || FWUserData.DEFAULT_STATISTICS;
    }

    /**
     * 增加游戏时长
     * @param seconds 增加的秒数
     */
    addPlayTime(seconds: number) {
        const statistics = this.getUserStatistics();
        statistics.playTime += seconds;
        this.setUserStatistics(statistics);
    }

    /**
     * 记录登录
     */
    recordLogin() {
        const statistics = this.getUserStatistics();
        statistics.loginCount++;
        
        // 更新连续登录天数
        const lastLoginTime = this.getLastLoginTime();
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (lastLoginTime) {
            const daysDiff = Math.floor((now.getTime() - lastLoginTime.getTime()) / oneDayMs);
            if (daysDiff === 1) {
                statistics.consecutiveLoginDays++;
            } else if (daysDiff > 1) {
                statistics.consecutiveLoginDays = 1;
            }
        } else {
            statistics.consecutiveLoginDays = 1;
        }
        
        statistics.maxConsecutiveLoginDays = Math.max(
            statistics.maxConsecutiveLoginDays,
            statistics.consecutiveLoginDays
        );
        
        this.setUserStatistics(statistics);
        this.setLastLoginTime(now);
        
        // 记录登录历史
        this.addLoginHistory(now);
    }

    /**
     * 记录消费
     * @param amount 消费金额
     */
    recordPurchase(amount: number) {
        const statistics = this.getUserStatistics();
        statistics.totalSpent += amount;
        this.setUserStatistics(statistics);
        
        // 记录购买历史
        this.addPurchaseHistory({
            amount,
            timestamp: new Date(),
            currency: 'CNY'
        });
    }

    // ==================== 历史记录管理 ====================

    /**
     * 添加登录历史
     * @param loginTime 登录时间
     */
    private addLoginHistory(loginTime: Date) {
        const history = this.getLoginHistory();
        history.push({
            timestamp: loginTime,
            deviceId: this.getDeviceId()
        });
        
        // 只保留最近100条记录
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        this.setObject(FWUserData.KEYS.LOGIN_HISTORY, history);
    }

    /**
     * 获取登录历史
     * @returns 登录历史
     */
    getLoginHistory(): Array<{ timestamp: Date; deviceId: string }> {
        return this.getArray<{ timestamp: Date; deviceId: string }>(FWUserData.KEYS.LOGIN_HISTORY) || [];
    }

    /**
     * 添加购买历史
     * @param purchase 购买记录
     */
    private addPurchaseHistory(purchase: { amount: number; timestamp: Date; currency: string }) {
        const history = this.getPurchaseHistory();
        history.push(purchase);
        
        // 只保留最近50条记录
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        this.setObject(FWUserData.KEYS.PURCHASE_HISTORY, history);
    }

    /**
     * 获取购买历史
     * @returns 购买历史
     */
    getPurchaseHistory(): Array<{ amount: number; timestamp: Date; currency: string }> {
        return this.getArray<{ amount: number; timestamp: Date; currency: string }>(FWUserData.KEYS.PURCHASE_HISTORY) || [];
    }

    // ==================== 设备信息管理 ====================

    /**
     * 设置设备ID
     * @param deviceId 设备ID
     */
    setDeviceId(deviceId: string) {
        this.setString(FWUserData.KEYS.DEVICE_ID, deviceId);
    }

    /**
     * 获取设备ID
     * @returns 设备ID
     */
    getDeviceId(): string {
        return this.getString(FWUserData.KEYS.DEVICE_ID, '') || '';
    }

    /**
     * 设置会话令牌
     * @param token 会话令牌
     */
    setSessionToken(token: string) {
        this.setString(FWUserData.KEYS.SESSION_TOKEN, token);
    }

    /**
     * 获取会话令牌
     * @returns 会话令牌
     */
    getSessionToken(): string {
        return this.getString(FWUserData.KEYS.SESSION_TOKEN, '') || '';
    }

    // ==================== 时间管理 ====================

    /**
     * 设置最后登录时间
     * @param time 登录时间
     */
    setLastLoginTime(time: Date) {
        this.setDate(FWUserData.KEYS.LAST_LOGIN_TIME, time);
    }

    /**
     * 获取最后登录时间
     * @returns 最后登录时间
     */
    getLastLoginTime(): Date | null {
        return this.getDate(FWUserData.KEYS.LAST_LOGIN_TIME);
    }

    /**
     * 设置最后备份时间
     * @param time 备份时间
     */
    setLastBackupTime(time: Date) {
        this.setDate(FWUserData.KEYS.LAST_BACKUP_TIME, time);
    }

    /**
     * 获取最后备份时间
     * @returns 最后备份时间
     */
    getLastBackupTime(): Date | null {
        return this.getDate(FWUserData.KEYS.LAST_BACKUP_TIME);
    }

    // ==================== 数据备份和恢复 ====================

    /**
     * 创建数据备份
     * @returns 备份数据
     */
    createBackup(): Record<string, any> {
        const backup = {
            version: FWUserData.CURRENT_VERSION,
            timestamp: new Date(),
            userId: this.getUserId(),
            deviceId: this.getDeviceId(),
            data: {
                userInfo: this.getUserInfo(),
                userSettings: this.getUserSettings(),
                gameProgress: this.getGameProgress(),
                userStatistics: this.getUserStatistics(),
                loginHistory: this.getLoginHistory(),
                purchaseHistory: this.getPurchaseHistory()
            }
        };
        
        this.setLastBackupTime(new Date());
        log.info('用户数据备份已创建');
        return backup;
    }

    /**
     * 从备份恢复数据
     * @param backup 备份数据
     * @returns 是否恢复成功
     */
    restoreFromBackup(backup: Record<string, any>): boolean {
        try {
            if (!backup.data) {
                log.error('备份数据格式无效');
                return false;
            }
            
            const { data } = backup;
            
            if (data.userInfo) this.setObject(FWUserData.KEYS.USER_INFO, data.userInfo);
            if (data.userSettings) this.setObject(FWUserData.KEYS.USER_SETTINGS, data.userSettings);
            if (data.gameProgress) this.setObject(FWUserData.KEYS.GAME_PROGRESS, data.gameProgress);
            if (data.userStatistics) this.setObject(FWUserData.KEYS.USER_STATISTICS, data.userStatistics);
            if (data.loginHistory) this.setObject(FWUserData.KEYS.LOGIN_HISTORY, data.loginHistory);
            if (data.purchaseHistory) this.setObject(FWUserData.KEYS.PURCHASE_HISTORY, data.purchaseHistory);
            
            log.info('用户数据已从备份恢复');
            return true;
        } catch (error) {
            log.error('恢复备份数据失败:', error);
            return false;
        }
    }

    // ==================== 数据验证和清理 ====================

    /**
     * 验证用户数据完整性
     * @returns 验证结果
     */
    validateUserData(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // 检查必要字段
        const userInfo = this.getUserInfo();
        if (!userInfo?.userId) {
            errors.push('用户ID缺失');
        }
        
        const settings = this.getUserSettings();
        if (!settings) {
            errors.push('用户设置缺失');
        }
        
        const progress = this.getGameProgress();
        if (!progress) {
            errors.push('游戏进度缺失');
        }
        
        const statistics = this.getUserStatistics();
        if (!statistics) {
            errors.push('用户统计缺失');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 清理过期数据
     */
    cleanupExpiredData() {
        // 清理过期的登录历史（保留最近30天）
        const loginHistory = this.getLoginHistory();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const filteredHistory = loginHistory.filter(record => 
            new Date(record.timestamp) > thirtyDaysAgo
        );
        
        if (filteredHistory.length !== loginHistory.length) {
            this.setObject(FWUserData.KEYS.LOGIN_HISTORY, filteredHistory);
            log.info('已清理过期登录历史');
        }
        
        // 清理过期的购买历史（保留最近90天）
        const purchaseHistory = this.getPurchaseHistory();
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const filteredPurchases = purchaseHistory.filter(record => 
            new Date(record.timestamp) > ninetyDaysAgo
        );
        
        if (filteredPurchases.length !== purchaseHistory.length) {
            this.setObject(FWUserData.KEYS.PURCHASE_HISTORY, filteredPurchases);
            log.info('已清理过期购买历史');
        }
    }

    // ==================== 数据导出和导入 ====================

    /**
     * 导出用户数据（用于数据迁移或备份）
     * @returns 导出的数据字符串
     */
    exportUserData(): string {
        const exportData = {
            version: FWUserData.CURRENT_VERSION,
            exportTime: new Date(),
            data: this.createBackup()
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 导入用户数据
     * @param dataString 数据字符串
     * @returns 是否导入成功
     */
    importUserData(dataString: string): boolean {
        try {
            const importData = JSON.parse(dataString);
            if (importData.data) {
                return this.restoreFromBackup(importData.data);
            }
            return false;
        } catch (error) {
            log.error('导入用户数据失败:', error);
            return false;
        }
    }

    // ==================== 重写父类方法 ====================

    /**
     * 重写清空方法，添加用户数据特定的清理逻辑
     */
    clear() {
        super.clear();
        log.info(`用户数据已清空: ${this.getUserId()}`);
    }

    /**
     * 获取用户数据统计信息
     * @returns 增强的统计信息
     */
    getUserDataStats() {
        const baseStats = this.getStats();
        const userInfo = this.getUserInfo();
        const statistics = this.getUserStatistics();
        
        return {
            ...baseStats,
            userInfo: {
                hasUserInfo: !!userInfo,
                userId: userInfo?.userId || 'unknown',
                level: userInfo?.level || 0,
                lastLogin: this.getLastLoginTime()
            },
            statistics: {
                playTime: statistics?.playTime || 0,
                loginCount: statistics?.loginCount || 0,
                consecutiveLoginDays: statistics?.consecutiveLoginDays || 0
            },
            dataVersion: this.getString(FWUserData.KEYS.DATA_VERSION, 'unknown'),
            lastBackup: this.getLastBackupTime()
        };
    }
}

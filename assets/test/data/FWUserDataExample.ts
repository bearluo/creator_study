import { _decorator, Component, Node } from 'cc';
import { FWUserData, IUserData, IUserSettings, IGameProgress, IUserStatistics } from './FWUserData';


/**
 * FWUserData 使用示例
 * 展示用户数据加密类的各种功能和使用方法
 */
export class FWUserDataExample extends Component {
    private userData: FWUserData;

    start() {
        // 创建用户数据实例（使用用户ID）
        this.userData = new FWUserData('user_12345');
        
        // 演示各种用户数据功能
        this.demoUserInfoManagement();
        this.demoUserSettingsManagement();
        this.demoGameProgressManagement();
        this.demoUserStatisticsManagement();
        this.demoHistoryManagement();
        this.demoDataBackupAndRestore();
        this.demoDataValidationAndCleanup();
        this.demoDataExportAndImport();
    }

    /**
     * 演示用户信息管理
     */
    private demoUserInfoManagement() {
        console.log('=== 用户信息管理演示 ===');
        
        // 设置用户基本信息
        const userInfo: Partial<IUserData> = {
            userId: 'user_12345',
            username: '张三',
            nickname: '小张',
            avatar: 'https://example.com/avatar.jpg',
            email: 'zhangsan@example.com',
            phone: '13800138000',
            level: 10,
            experience: 2500,
            gold: 10000,
            diamond: 500,
            vipLevel: 2,
            registerTime: new Date('2024-01-01'),
            lastLoginTime: new Date(),
            isFirstLogin: false
        };
        
        this.userData.setUserInfo(userInfo);
        
        // 获取用户信息
        const savedUserInfo = this.userData.getUserInfo();
        console.log('用户信息:', savedUserInfo);
        
        // 更新用户等级和经验
        this.userData.updateUserLevel(15, 3500);
        console.log('更新后的等级:', this.userData.getUserInfo()?.level);
        
        // 更新用户货币
        this.userData.updateUserCurrency(1000, 50); // 增加1000金币，50钻石
        console.log('更新后的货币:', {
            gold: this.userData.getUserInfo()?.gold,
            diamond: this.userData.getUserInfo()?.diamond
        });
    }

    /**
     * 演示用户设置管理
     */
    private demoUserSettingsManagement() {
        console.log('=== 用户设置管理演示 ===');
        
        // 设置用户设置
        const settings: Partial<IUserSettings> = {
            soundEnabled: true,
            bgmEnabled: false,
            soundVolume: 0.7,
            bgmVolume: 0.3,
            language: 'zh-CN',
            graphicsQuality: 'high',
            autoSave: true,
            pushNotification: false
        };
        
        this.userData.setUserSettings(settings);
        
        // 获取用户设置
        const savedSettings = this.userData.getUserSettings();
        console.log('用户设置:', savedSettings);
        
        // 更新单个设置项
        this.userData.updateSetting('soundVolume', 0.8);
        console.log('更新后的音效音量:', this.userData.getUserSettings().soundVolume);
    }

    /**
     * 演示游戏进度管理
     */
    private demoGameProgressManagement() {
        console.log('=== 游戏进度管理演示 ===');
        
        // 设置游戏进度
        const progress: Partial<IGameProgress> = {
            currentLevel: 5,
            maxLevel: 10,
            unlockedLevels: [1, 2, 3, 4, 5],
            levelStars: {
                1: 3,
                2: 2,
                3: 3,
                4: 1,
                5: 2
            },
            achievements: {
                'first_win': true,
                'level_5_complete': true,
                'collect_10_items': false
            },
            collectibles: {
                'coin': 150,
                'gem': 25,
                'key': 3
            }
        };
        
        this.userData.setGameProgress(progress);
        
        // 获取游戏进度
        const savedProgress = this.userData.getGameProgress();
        console.log('游戏进度:', savedProgress);
        
        // 解锁新关卡
        this.userData.unlockLevel(6);
        console.log('解锁关卡6后的进度:', this.userData.getGameProgress().unlockedLevels);
        
        // 设置关卡星级
        this.userData.setLevelStars(5, 3); // 关卡5获得3星
        console.log('关卡5星级:', this.userData.getGameProgress().levelStars[5]);
        
        // 完成成就
        this.userData.completeAchievement('collect_10_items');
        console.log('成就完成情况:', this.userData.getGameProgress().achievements);
        
        // 更新收集品
        this.userData.updateCollectible('coin', 50); // 增加50个金币
        console.log('收集品数量:', this.userData.getGameProgress().collectibles);
    }

    /**
     * 演示用户统计管理
     */
    private demoUserStatisticsManagement() {
        console.log('=== 用户统计管理演示 ===');
        
        // 设置用户统计
        const statistics: Partial<IUserStatistics> = {
            playTime: 3600, // 1小时
            loginCount: 15,
            consecutiveLoginDays: 7,
            maxConsecutiveLoginDays: 10,
            totalSpent: 100.50,
            totalGoldEarned: 50000,
            totalGoldSpent: 20000
        };
        
        this.userData.setUserStatistics(statistics);
        
        // 获取用户统计
        const savedStatistics = this.userData.getUserStatistics();
        console.log('用户统计:', savedStatistics);
        
        // 增加游戏时长
        this.userData.addPlayTime(1800); // 增加30分钟
        console.log('更新后的游戏时长:', this.userData.getUserStatistics().playTime);
        
        // 记录登录
        this.userData.recordLogin();
        console.log('记录登录后的统计:', {
            loginCount: this.userData.getUserStatistics().loginCount,
            consecutiveLoginDays: this.userData.getUserStatistics().consecutiveLoginDays
        });
        
        // 记录消费
        this.userData.recordPurchase(50.00);
        console.log('记录消费后的总消费:', this.userData.getUserStatistics().totalSpent);
    }

    /**
     * 演示历史记录管理
     */
    private demoHistoryManagement() {
        console.log('=== 历史记录管理演示 ===');
        
        // 设置设备ID
        this.userData.setDeviceId('device_abc123');
        console.log('设备ID:', this.userData.getDeviceId());
        
        // 设置会话令牌
        this.userData.setSessionToken('token_xyz789');
        console.log('会话令牌:', this.userData.getSessionToken());
        
        // 获取登录历史
        const loginHistory = this.userData.getLoginHistory();
        console.log('登录历史:', loginHistory);
        
        // 获取购买历史
        const purchaseHistory = this.userData.getPurchaseHistory();
        console.log('购买历史:', purchaseHistory);
    }

    /**
     * 演示数据备份和恢复
     */
    private demoDataBackupAndRestore() {
        console.log('=== 数据备份和恢复演示 ===');
        
        // 创建数据备份
        const backup = this.userData.createBackup();
        console.log('数据备份:', backup);
        
        // 获取最后备份时间
        const lastBackupTime = this.userData.getLastBackupTime();
        console.log('最后备份时间:', lastBackupTime);
        
        // 模拟数据恢复（这里只是演示，实际不会恢复）
        console.log('备份数据可用于恢复用户数据');
    }

    /**
     * 演示数据验证和清理
     */
    private demoDataValidationAndCleanup() {
        console.log('=== 数据验证和清理演示 ===');
        
        // 验证用户数据完整性
        const validation = this.userData.validateUserData();
        console.log('数据验证结果:', validation);
        
        // 清理过期数据
        this.userData.cleanupExpiredData();
        console.log('过期数据清理完成');
        
        // 获取用户数据统计信息
        const stats = this.userData.getUserDataStats();
        console.log('用户数据统计:', stats);
    }

    /**
     * 演示数据导出和导入
     */
    private demoDataExportAndImport() {
        console.log('=== 数据导出和导入演示 ===');
        
        // 导出用户数据
        const exportedData = this.userData.exportUserData();
        console.log('导出的用户数据:', exportedData);
        
        // 模拟导入数据（这里只是演示，实际不会导入）
        console.log('导出的数据可用于数据迁移或备份');
        
        // 验证加密配置
        const isValid = this.userData.validateEncryptionConfig();
        console.log('加密配置是否有效:', isValid);
        
        // 获取加密算法信息
        const encryptionInfo = this.userData.getEncryptionInfo();
        console.log('加密算法信息:', encryptionInfo);
    }

    /**
     * 演示批量操作
     */
    private demoBatchOperations() {
        console.log('=== 批量操作演示 ===');
        
        // 批量设置数据
        const batchData = {
            'temp_setting_1': 'value1',
            'temp_setting_2': 'value2',
            'temp_setting_3': 'value3'
        };
        
        this.userData.setBatch(batchData);
        
        // 批量获取数据
        const keysToGet = ['temp_setting_1', 'temp_setting_2', 'temp_setting_3'];
        const batchResult = this.userData.getBatch(keysToGet);
        console.log('批量获取结果:', batchResult);
        
        // 清理临时数据
        keysToGet.forEach(key => this.userData.removeItem(key));
    }

    /**
     * 演示错误处理
     */
    private demoErrorHandling() {
        console.log('=== 错误处理演示 ===');
        
        // 尝试获取不存在的用户信息
        const nonExistentUser = this.userData.getUserInfo();
        console.log('不存在的用户信息:', nonExistentUser);
        
        // 尝试获取不存在的设置（会返回默认值）
        const settings = this.userData.getUserSettings();
        console.log('用户设置（包含默认值）:', settings);
        
        // 尝试获取不存在的进度（会返回默认值）
        const progress = this.userData.getGameProgress();
        console.log('游戏进度（包含默认值）:', progress);
    }

    /**
     * 演示数据版本管理
     */
    private demoVersionManagement() {
        console.log('=== 数据版本管理演示 ===');
        
        // 获取当前数据版本
        const currentVersion = this.userData.getString('data_version', 'unknown');
        console.log('当前数据版本:', currentVersion);
        
        // 检查是否需要数据迁移
        if (currentVersion !== '1.0.0') {
            console.log('检测到数据版本不匹配，可能需要迁移');
        } else {
            console.log('数据版本匹配，无需迁移');
        }
    }
} 
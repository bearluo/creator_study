import { _decorator, Component, Node } from 'cc';
import { FWUserData, IUserData, IUserSettings, IGameProgress, IUserStatistics } from './FWUserData';

const { ccclass, property } = _decorator;

/**
 * 游戏用户数据管理器
 * 在实际游戏项目中使用FWUserData的示例
 */
@ccclass('GameUserDataManager')
export class GameUserDataManager extends Component {
    private userData: FWUserData;
    private userId: string = '';

    /**
     * 初始化用户数据管理器
     * @param userId 用户ID
     */
    init(userId: string) {
        this.userId = userId;
        this.userData = new FWUserData(userId);
        
        // 初始化用户数据
        this.initializeUserData();
        
        // 记录登录
        this.userData.recordLogin();
        
        console.log(`用户数据管理器初始化完成: ${userId}`);
    }

    /**
     * 初始化用户数据
     */
    private initializeUserData() {
        const userInfo = this.userData.getUserInfo();
        
        if (!userInfo) {
            // 新用户，设置初始数据
            const initialUserInfo: Partial<IUserData> = {
                userId: this.userId,
                username: '新玩家',
                nickname: '新手',
                level: 1,
                experience: 0,
                gold: 1000,
                diamond: 50,
                vipLevel: 0,
                registerTime: new Date(),
                lastLoginTime: new Date(),
                isFirstLogin: true
            };
            
            this.userData.setUserInfo(initialUserInfo);
            console.log('新用户数据初始化完成');
        } else {
            // 老用户，更新登录时间
            this.userData.setUserInfo({
                lastLoginTime: new Date(),
                isFirstLogin: false
            });
            console.log('老用户数据加载完成');
        }
    }

    // ==================== 用户信息管理 ====================

    /**
     * 获取用户信息
     */
    getUserInfo(): IUserData | null {
        return this.userData.getUserInfo();
    }

    /**
     * 更新用户昵称
     * @param nickname 新昵称
     */
    updateNickname(nickname: string) {
        this.userData.setUserInfo({ nickname });
        console.log(`用户昵称已更新: ${nickname}`);
    }

    /**
     * 更新用户头像
     * @param avatar 头像URL
     */
    updateAvatar(avatar: string) {
        this.userData.setUserInfo({ avatar });
        console.log(`用户头像已更新: ${avatar}`);
    }

    /**
     * 增加用户经验
     * @param experience 增加的经验值
     */
    addExperience(experience: number) {
        const userInfo = this.userData.getUserInfo();
        if (userInfo) {
            const newExperience = userInfo.experience + experience;
            const newLevel = this.calculateLevel(newExperience);
            
            this.userData.updateUserLevel(newLevel, newExperience);
            console.log(`经验增加: +${experience}, 当前等级: ${newLevel}`);
        }
    }

    /**
     * 计算等级
     * @param experience 经验值
     * @returns 等级
     */
    private calculateLevel(experience: number): number {
        // 简单的等级计算公式：每1000经验升1级
        return Math.floor(experience / 1000) + 1;
    }

    // ==================== 货币管理 ====================

    /**
     * 增加金币
     * @param amount 增加的金币数量
     */
    addGold(amount: number) {
        this.userData.updateUserCurrency(amount, 0);
        console.log(`金币增加: +${amount}`);
    }

    /**
     * 消费金币
     * @param amount 消费的金币数量
     * @returns 是否消费成功
     */
    spendGold(amount: number): boolean {
        const userInfo = this.userData.getUserInfo();
        if (userInfo && userInfo.gold >= amount) {
            this.userData.updateUserCurrency(-amount, 0);
            console.log(`金币消费: -${amount}`);
            return true;
        } else {
            console.log(`金币不足，无法消费: ${amount}`);
            return false;
        }
    }

    /**
     * 增加钻石
     * @param amount 增加的钻石数量
     */
    addDiamond(amount: number) {
        this.userData.updateUserCurrency(0, amount);
        console.log(`钻石增加: +${amount}`);
    }

    /**
     * 消费钻石
     * @param amount 消费的钻石数量
     * @returns 是否消费成功
     */
    spendDiamond(amount: number): boolean {
        const userInfo = this.userData.getUserInfo();
        if (userInfo && userInfo.diamond >= amount) {
            this.userData.updateUserCurrency(0, -amount);
            console.log(`钻石消费: -${amount}`);
            return true;
        } else {
            console.log(`钻石不足，无法消费: ${amount}`);
            return false;
        }
    }

    // ==================== 游戏进度管理 ====================

    /**
     * 获取游戏进度
     */
    getGameProgress(): IGameProgress {
        return this.userData.getGameProgress();
    }

    /**
     * 完成关卡
     * @param level 关卡号
     * @param stars 获得的星级
     */
    completeLevel(level: number, stars: number) {
        const progress = this.userData.getGameProgress();
        
        // 解锁下一关
        if (level + 1 <= progress.maxLevel + 1) {
            this.userData.unlockLevel(level + 1);
        }
        
        // 设置星级
        this.userData.setLevelStars(level, stars);
        
        // 更新当前关卡
        this.userData.setGameProgress({
            currentLevel: Math.max(progress.currentLevel, level + 1)
        });
        
        console.log(`关卡${level}完成，获得${stars}星`);
    }

    /**
     * 完成成就
     * @param achievementId 成就ID
     */
    completeAchievement(achievementId: string) {
        this.userData.completeAchievement(achievementId);
        console.log(`成就完成: ${achievementId}`);
    }

    /**
     * 更新收集品
     * @param collectibleId 收集品ID
     * @param count 数量变化
     */
    updateCollectible(collectibleId: string, count: number) {
        this.userData.updateCollectible(collectibleId, count);
        console.log(`收集品更新: ${collectibleId} ${count > 0 ? '+' : ''}${count}`);
    }

    // ==================== 用户设置管理 ====================

    /**
     * 获取用户设置
     */
    getUserSettings(): IUserSettings {
        return this.userData.getUserSettings();
    }

    /**
     * 更新音效设置
     * @param enabled 是否启用
     * @param volume 音量
     */
    updateSoundSettings(enabled: boolean, volume: number) {
        this.userData.setUserSettings({
            soundEnabled: enabled,
            soundVolume: volume
        });
        console.log(`音效设置更新: 启用=${enabled}, 音量=${volume}`);
    }

    /**
     * 更新背景音乐设置
     * @param enabled 是否启用
     * @param volume 音量
     */
    updateBGMSettings(enabled: boolean, volume: number) {
        this.userData.setUserSettings({
            bgmEnabled: enabled,
            bgmVolume: volume
        });
        console.log(`背景音乐设置更新: 启用=${enabled}, 音量=${volume}`);
    }

    /**
     * 更新语言设置
     * @param language 语言代码
     */
    updateLanguage(language: string) {
        this.userData.updateSetting('language', language);
        console.log(`语言设置更新: ${language}`);
    }

    // ==================== 统计管理 ====================

    /**
     * 获取用户统计
     */
    getUserStatistics(): IUserStatistics {
        return this.userData.getUserStatistics();
    }

    /**
     * 增加游戏时长
     * @param seconds 增加的秒数
     */
    addPlayTime(seconds: number) {
        this.userData.addPlayTime(seconds);
    }

    /**
     * 记录消费
     * @param amount 消费金额
     */
    recordPurchase(amount: number) {
        this.userData.recordPurchase(amount);
        console.log(`记录消费: ${amount}`);
    }

    // ==================== 数据管理 ====================

    /**
     * 创建数据备份
     */
    createBackup() {
        const backup = this.userData.createBackup();
        console.log('数据备份已创建');
        return backup;
    }

    /**
     * 验证数据完整性
     */
    validateData(): boolean {
        const validation = this.userData.validateUserData();
        if (!validation.isValid) {
            console.error('数据完整性验证失败:', validation.errors);
            return false;
        }
        console.log('数据完整性验证通过');
        return true;
    }

    /**
     * 清理过期数据
     */
    cleanupData() {
        this.userData.cleanupExpiredData();
        console.log('过期数据清理完成');
    }

    /**
     * 获取数据统计信息
     */
    getDataStats() {
        return this.userData.getUserDataStats();
    }

    // ==================== 游戏事件处理 ====================

    /**
     * 游戏开始
     */
    onGameStart() {
        console.log('游戏开始');
        // 可以在这里记录游戏开始时间等
    }

    /**
     * 游戏结束
     * @param playTime 游戏时长（秒）
     * @param score 游戏分数
     */
    onGameEnd(playTime: number, score: number) {
        // 增加游戏时长
        this.addPlayTime(playTime);
        
        // 根据分数给予奖励
        if (score > 1000) {
            this.addGold(100);
            this.addExperience(50);
        }
        
        console.log(`游戏结束，时长: ${playTime}秒，分数: ${score}`);
    }

    /**
     * 购买道具
     * @param itemId 道具ID
     * @param price 价格
     * @param currency 货币类型 ('gold' | 'diamond')
     */
    purchaseItem(itemId: string, price: number, currency: 'gold' | 'diamond') {
        let success = false;
        
        if (currency === 'gold') {
            success = this.spendGold(price);
        } else if (currency === 'diamond') {
            success = this.spendDiamond(price);
        }
        
        if (success) {
            // 更新收集品
            this.updateCollectible(itemId, 1);
            console.log(`道具购买成功: ${itemId}`);
        } else {
            console.log(`道具购买失败: ${itemId}，货币不足`);
        }
        
        return success;
    }

    /**
     * 获得奖励
     * @param rewardType 奖励类型
     * @param amount 奖励数量
     */
    receiveReward(rewardType: string, amount: number) {
        switch (rewardType) {
            case 'gold':
                this.addGold(amount);
                break;
            case 'diamond':
                this.addDiamond(amount);
                break;
            case 'experience':
                this.addExperience(amount);
                break;
            default:
                console.log(`未知奖励类型: ${rewardType}`);
        }
        
        console.log(`获得奖励: ${rewardType} x${amount}`);
    }

    // ==================== 生命周期管理 ====================

    /**
     * 组件销毁时保存数据
     */
    onDestroy() {
        if (this.userData) {
            // 创建备份
            this.createBackup();
            
            // 验证数据
            this.validateData();
            
            console.log('用户数据已保存');
        }
    }

    /**
     * 应用暂停时保存数据
     */
    onApplicationPause() {
        if (this.userData) {
            this.createBackup();
            console.log('应用暂停，数据已保存');
        }
    }

    /**
     * 应用恢复时加载数据
     */
    onApplicationResume() {
        if (this.userData) {
            // 记录登录
            this.userData.recordLogin();
            console.log('应用恢复，数据已加载');
        }
    }
} 
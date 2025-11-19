# FWUserData 用户数据加密类

## 概述

`FWUserData` 是一个专门用于处理用户数据的加密存储和管理类，继承自 `FWEncryptedDataBase`，提供用户数据特定的功能和方法。它使用 AES-256-CBC 加密算法保护用户数据，确保数据安全性。

## 主要特性

### 数据安全
- **AES-256-CBC 加密**：所有用户数据都经过加密存储
- **自定义密钥支持**：支持自定义加密密钥和初始化向量
- **数据完整性验证**：提供数据完整性检查和验证功能

### 用户数据管理
- **用户基本信息**：用户ID、用户名、昵称、头像、联系方式等
- **用户设置**：音效、画质、语言等个性化设置
- **游戏进度**：关卡进度、成就、收集品等游戏数据
- **用户统计**：游戏时长、登录次数、消费记录等统计数据

### 高级功能
- **数据版本管理**：支持数据版本控制和迁移
- **数据备份恢复**：完整的数据备份和恢复功能
- **历史记录管理**：登录历史、购买历史等记录
- **数据清理**：自动清理过期数据
- **数据导出导入**：支持数据迁移和备份

## 基本使用

### 创建用户数据实例

```typescript
import { FWUserData } from 'db://bl-framework/manager';

// 创建用户数据实例（使用用户ID）
const userData = new FWUserData('user_12345');

// 使用自定义密钥创建实例
const secureUserData = new FWUserData('user_12345', 'custom_key', 'custom_iv');
```

### 用户基本信息管理

```typescript
// 设置用户基本信息
const userInfo = {
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

userData.setUserInfo(userInfo);

// 获取用户信息
const savedUserInfo = userData.getUserInfo();
console.log('用户信息:', savedUserInfo);

// 更新用户等级和经验
userData.updateUserLevel(15, 3500);

// 更新用户货币
userData.updateUserCurrency(1000, 50); // 增加1000金币，50钻石
```

### 用户设置管理

```typescript
// 设置用户设置
const settings = {
    soundEnabled: true,
    bgmEnabled: false,
    soundVolume: 0.7,
    bgmVolume: 0.3,
    language: 'zh-CN',
    graphicsQuality: 'high',
    autoSave: true,
    pushNotification: false
};

userData.setUserSettings(settings);

// 获取用户设置
const savedSettings = userData.getUserSettings();

// 更新单个设置项
userData.updateSetting('soundVolume', 0.8);
```

### 游戏进度管理

```typescript
// 设置游戏进度
const progress = {
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

userData.setGameProgress(progress);

// 解锁新关卡
userData.unlockLevel(6);

// 设置关卡星级
userData.setLevelStars(5, 3); // 关卡5获得3星

// 完成成就
userData.completeAchievement('collect_10_items');

// 更新收集品
userData.updateCollectible('coin', 50); // 增加50个金币
```

### 用户统计管理

```typescript
// 设置用户统计
const statistics = {
    playTime: 3600, // 1小时
    loginCount: 15,
    consecutiveLoginDays: 7,
    maxConsecutiveLoginDays: 10,
    totalSpent: 100.50,
    totalGoldEarned: 50000,
    totalGoldSpent: 20000
};

userData.setUserStatistics(statistics);

// 增加游戏时长
userData.addPlayTime(1800); // 增加30分钟

// 记录登录
userData.recordLogin();

// 记录消费
userData.recordPurchase(50.00);
```

## 高级功能

### 数据备份和恢复

```typescript
// 创建数据备份
const backup = userData.createBackup();
console.log('数据备份:', backup);

// 从备份恢复数据
const success = userData.restoreFromBackup(backup);
if (success) {
    console.log('数据恢复成功');
} else {
    console.log('数据恢复失败');
}
```

### 数据导出和导入

```typescript
// 导出用户数据
const exportedData = userData.exportUserData();
console.log('导出的数据:', exportedData);

// 导入用户数据
const importSuccess = userData.importUserData(exportedData);
if (importSuccess) {
    console.log('数据导入成功');
} else {
    console.log('数据导入失败');
}
```

### 数据验证和清理

```typescript
// 验证用户数据完整性
const validation = userData.validateUserData();
if (validation.isValid) {
    console.log('数据完整性验证通过');
} else {
    console.log('数据完整性验证失败:', validation.errors);
}

// 清理过期数据
userData.cleanupExpiredData();

// 获取用户数据统计信息
const stats = userData.getUserDataStats();
console.log('用户数据统计:', stats);
```

### 历史记录管理

```typescript
// 设置设备ID
userData.setDeviceId('device_abc123');

// 设置会话令牌
userData.setSessionToken('token_xyz789');

// 获取登录历史
const loginHistory = userData.getLoginHistory();
console.log('登录历史:', loginHistory);

// 获取购买历史
const purchaseHistory = userData.getPurchaseHistory();
console.log('购买历史:', purchaseHistory);
```

## 数据接口定义

### IUserData 用户数据接口

```typescript
interface IUserData {
    userId: string;           // 用户ID
    username: string;         // 用户名
    nickname?: string;        // 昵称
    avatar?: string;          // 头像URL
    email?: string;           // 邮箱
    phone?: string;           // 手机号
    level: number;            // 用户等级
    experience: number;       // 经验值
    gold: number;             // 金币
    diamond: number;          // 钻石
    vipLevel: number;         // VIP等级
    registerTime: Date;       // 注册时间
    lastLoginTime: Date;      // 最后登录时间
    isFirstLogin: boolean;    // 是否首次登录
    settings: IUserSettings;  // 用户设置
    gameProgress: IGameProgress; // 游戏进度
    statistics: IUserStatistics; // 用户统计
}
```

### IUserSettings 用户设置接口

```typescript
interface IUserSettings {
    soundEnabled: boolean;      // 音效开关
    bgmEnabled: boolean;        // 背景音乐开关
    soundVolume: number;        // 音效音量
    bgmVolume: number;          // 背景音乐音量
    language: string;           // 语言设置
    graphicsQuality: string;    // 画质设置
    autoSave: boolean;          // 自动保存开关
    pushNotification: boolean;  // 推送通知开关
}
```

### IGameProgress 游戏进度接口

```typescript
interface IGameProgress {
    currentLevel: number;                    // 当前关卡
    maxLevel: number;                        // 最高关卡
    unlockedLevels: number[];                // 已解锁关卡
    levelStars: Record<number, number>;      // 关卡星级
    achievements: Record<string, boolean>;   // 成就完成情况
    collectibles: Record<string, number>;    // 收集品
}
```

### IUserStatistics 用户统计接口

```typescript
interface IUserStatistics {
    playTime: number;              // 游戏时长（秒）
    loginCount: number;            // 登录次数
    consecutiveLoginDays: number;  // 连续登录天数
    maxConsecutiveLoginDays: number; // 最大连续登录天数
    totalSpent: number;            // 消费金额
    totalGoldEarned: number;       // 获得金币总数
    totalGoldSpent: number;        // 消费金币总数
}
```

## API 参考

### 构造函数

```typescript
constructor(userId: string, encryptKey?: string, iv?: string)
```

- `userId`: 用户ID，用于标识不同的用户数据
- `encryptKey`: 自定义加密密钥（可选）
- `iv`: 自定义初始化向量（可选）

### 用户信息管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setUserInfo(userInfo)` | `userInfo: Partial<IUserData>` | `void` | 设置用户基本信息 |
| `getUserInfo()` | - | `IUserData \| null` | 获取用户基本信息 |
| `getUserId()` | - | `string` | 获取用户ID |
| `updateUserLevel(level, experience)` | `level: number, experience: number` | `void` | 更新用户等级和经验 |
| `updateUserCurrency(gold, diamond)` | `gold: number, diamond: number` | `void` | 更新用户货币 |

### 用户设置管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setUserSettings(settings)` | `settings: Partial<IUserSettings>` | `void` | 设置用户设置 |
| `getUserSettings()` | - | `IUserSettings` | 获取用户设置 |
| `updateSetting(key, value)` | `key: K, value: IUserSettings[K]` | `void` | 更新单个设置项 |

### 游戏进度管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setGameProgress(progress)` | `progress: Partial<IGameProgress>` | `void` | 设置游戏进度 |
| `getGameProgress()` | - | `IGameProgress` | 获取游戏进度 |
| `unlockLevel(level)` | `level: number` | `void` | 解锁新关卡 |
| `setLevelStars(level, stars)` | `level: number, stars: number` | `void` | 设置关卡星级 |
| `completeAchievement(achievementId)` | `achievementId: string` | `void` | 完成成就 |
| `updateCollectible(collectibleId, count)` | `collectibleId: string, count: number` | `void` | 更新收集品 |

### 用户统计管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setUserStatistics(statistics)` | `statistics: Partial<IUserStatistics>` | `void` | 设置用户统计 |
| `getUserStatistics()` | - | `IUserStatistics` | 获取用户统计 |
| `addPlayTime(seconds)` | `seconds: number` | `void` | 增加游戏时长 |
| `recordLogin()` | - | `void` | 记录登录 |
| `recordPurchase(amount)` | `amount: number` | `void` | 记录消费 |

### 数据管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `createBackup()` | - | `Record<string, any>` | 创建数据备份 |
| `restoreFromBackup(backup)` | `backup: Record<string, any>` | `boolean` | 从备份恢复数据 |
| `exportUserData()` | - | `string` | 导出用户数据 |
| `importUserData(dataString)` | `dataString: string` | `boolean` | 导入用户数据 |
| `validateUserData()` | - | `{isValid: boolean, errors: string[]}` | 验证用户数据完整性 |
| `cleanupExpiredData()` | - | `void` | 清理过期数据 |
| `getUserDataStats()` | - | `Record<string, any>` | 获取用户数据统计信息 |

## 最佳实践

### 1. 数据初始化

```typescript
// 在应用启动时初始化用户数据
const userData = new FWUserData(userId);

// 检查是否是首次登录
const userInfo = userData.getUserInfo();
if (!userInfo) {
    // 新用户，设置初始数据
    userData.setUserInfo({
        userId: userId,
        username: '新用户',
        level: 1,
        experience: 0,
        gold: 1000,
        diamond: 50,
        vipLevel: 0,
        registerTime: new Date(),
        lastLoginTime: new Date(),
        isFirstLogin: true
    });
}
```

### 2. 数据安全

```typescript
// 使用强密钥
const strongKey = 'MySuperSecureKey2024!@#$%^&*()';
const strongIV = 'MySecureIV16!@#';
const secureUserData = new FWUserData(userId, strongKey, strongIV);

// 验证加密配置
const isValid = secureUserData.validateEncryptionConfig();
if (!isValid) {
    console.error('加密配置无效');
}
```

### 3. 数据备份策略

```typescript
// 定期备份数据
function scheduleBackup() {
    const lastBackup = userData.getLastBackupTime();
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (!lastBackup || (now.getTime() - lastBackup.getTime()) > oneDayMs) {
        const backup = userData.createBackup();
        // 将备份数据发送到服务器或保存到本地文件
        saveBackupToServer(backup);
    }
}
```

### 4. 数据迁移

```typescript
// 处理数据版本升级
const currentVersion = userData.getString('data_version', '1.0.0');
if (currentVersion !== '2.0.0') {
    // 执行数据迁移
    migrateUserDataFromV1ToV2(userData);
    userData.setString('data_version', '2.0.0');
}
```

### 5. 错误处理

```typescript
// 安全的用户数据操作
function safeUserDataOperation() {
    try {
        const userInfo = userData.getUserInfo();
        if (!userInfo) {
            console.warn('用户信息不存在，使用默认值');
            return getDefaultUserInfo();
        }
        return userInfo;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return getDefaultUserInfo();
    }
}
```

## 注意事项

1. **数据版本管理**：在更新应用时，注意处理数据版本迁移
2. **加密密钥管理**：妥善保管加密密钥，避免硬编码在代码中
3. **数据备份**：定期备份用户数据，防止数据丢失
4. **性能考虑**：避免频繁的加密解密操作，考虑缓存机制
5. **存储限制**：注意localStorage的存储大小限制
6. **兼容性**：加密数据在不同设备间可能无法直接迁移
7. **数据清理**：定期清理过期数据，避免存储空间不足
8. **错误处理**：始终使用try-catch处理可能的异常情况

## 扩展功能

如果需要添加新的用户数据字段或功能，可以：

1. 扩展相应的接口定义
2. 添加新的管理方法
3. 更新数据版本号
4. 实现数据迁移逻辑
5. 更新默认值配置

```typescript
// 示例：添加新的用户数据字段
interface IUserData {
    // ... 现有字段
    newField?: string; // 新字段
}

// 在数据迁移中添加新字段的默认值
private migrateUserData(oldVersion: string) {
    if (oldVersion === '1.0.0') {
        const userInfo = this.getUserInfo();
        if (userInfo && !userInfo.newField) {
            userInfo.newField = 'default_value';
            this.setUserInfo(userInfo);
        }
    }
}
``` 
import { _decorator, Component, Node } from 'cc';
import { FWEncryptedDataBase } from 'db://bl-framework/manager';

/**
 * FWEncryptedDataBase 使用示例
 * 展示加密数据存储的各种功能和使用方法
 */
export class FWEncryptedDataBaseExample extends Component {
    private encryptedData: FWEncryptedDataBase;

    start() {
        // 创建加密数据存储实例
        this.encryptedData = new FWEncryptedDataBase('secure_game_data');
        
        // 验证加密配置
        this.validateEncryption();
        
        // 演示各种加密数据类型的存储和读取
        this.demoEncryptedBasicTypes();
        this.demoEncryptedAdvancedTypes();
        this.demoEncryptedBatchOperations();
        this.demoEncryptedDataManagement();
        this.demoEncryptedStatistics();
        this.demoEncryptionFeatures();
    }

    /**
     * 验证加密配置
     */
    private validateEncryption() {
        console.log('=== 加密配置验证 ===');
        
        const isValid = this.encryptedData.validateEncryptionConfig();
        console.log('加密配置是否有效:', isValid);
        
        const encryptionInfo = this.encryptedData.getEncryptionInfo();
        console.log('加密算法信息:', encryptionInfo);
        
        if (!isValid) {
            console.error('加密配置无效，请检查密钥和IV设置');
        }
    }

    /**
     * 演示加密基础数据类型
     */
    private demoEncryptedBasicTypes() {
        console.log('=== 加密基础数据类型演示 ===');
        
        // 加密浮点数
        this.encryptedData.setFloat('secure_score', 1234.56);
        const score = this.encryptedData.getFloat('secure_score', 0);
        console.log('加密的玩家分数:', score);
        
        // 加密整数
        this.encryptedData.setInt('secure_level', 10);
        const level = this.encryptedData.getInt('secure_level', 1);
        console.log('加密的玩家等级:', level);
        
        // 加密字符串
        this.encryptedData.setString('secure_name', '张三');
        const name = this.encryptedData.getString('secure_name', '未知玩家');
        console.log('加密的玩家姓名:', name);
        
        // 加密布尔值
        this.encryptedData.setBoolean('secure_sound', true);
        const soundEnabled = this.encryptedData.getBoolean('secure_sound', false);
        console.log('加密的音效设置:', soundEnabled);
    }

    /**
     * 演示加密高级数据类型
     */
    private demoEncryptedAdvancedTypes() {
        console.log('=== 加密高级数据类型演示 ===');
        
        // 加密JSON对象
        const securePlayerData = {
            id: 1001,
            name: '李四',
            password: 'secret123',
            items: ['sword', 'shield', 'potion'],
            stats: {
                hp: 100,
                mp: 50,
                attack: 25
            }
        };
        this.encryptedData.setObject('secure_player_data', securePlayerData);
        const savedSecurePlayerData = this.encryptedData.getObject('secure_player_data');
        console.log('加密的玩家数据:', savedSecurePlayerData);
        
        // 加密数组
        const secureInventory = ['gold', 'silver', 'bronze', 'iron'];
        this.encryptedData.setArray('secure_inventory', secureInventory);
        const savedSecureInventory = this.encryptedData.getArray('secure_inventory');
        console.log('加密的背包物品:', savedSecureInventory);
        
        // 加密日期
        const secureLastLogin = new Date();
        this.encryptedData.setDate('secure_last_login', secureLastLogin);
        const savedSecureLastLogin = this.encryptedData.getDate('secure_last_login');
        console.log('加密的最后登录时间:', savedSecureLastLogin);
    }

    /**
     * 演示加密批量操作
     */
    private demoEncryptedBatchOperations() {
        console.log('=== 加密批量操作演示 ===');
        
        // 批量设置加密数据
        const secureBatchData = {
            secure_gold: 1000,
            secure_experience: 5000,
            secure_is_vip: true,
            secure_nickname: 'VIP玩家',
            secure_achievements: ['first_win', 'level_10', 'collector'],
            secure_settings: {
                language: 'zh-CN',
                quality: 'high',
                auto_save: true
            }
        };
        this.encryptedData.setBatch(secureBatchData);
        
        // 批量获取解密数据
        const secureKeysToGet = ['secure_gold', 'secure_experience', 'secure_is_vip', 'secure_nickname'];
        const secureBatchResult = this.encryptedData.getBatch(secureKeysToGet);
        console.log('加密批量获取结果:', secureBatchResult);
    }

    /**
     * 演示加密数据管理功能
     */
    private demoEncryptedDataManagement() {
        console.log('=== 加密数据管理功能演示 ===');
        
        // 检查加密键是否存在
        const hasSecureGold = this.encryptedData.hasKey('secure_gold');
        console.log('是否存在加密金币数据:', hasSecureGold);
        
        // 获取所有加密键名
        const allSecureKeys = this.encryptedData.getKeys();
        console.log('所有加密数据键名:', allSecureKeys);
        
        // 获取加密数据数量
        const secureDataSize = this.encryptedData.getSize();
        console.log('加密数据项数量:', secureDataSize);
        
        // 删除特定加密数据
        this.encryptedData.removeItem('secure_name');
        console.log('删除加密玩家姓名后，是否存在:', this.encryptedData.hasKey('secure_name'));
    }

    /**
     * 演示加密统计功能
     */
    private demoEncryptedStatistics() {
        console.log('=== 加密数据统计演示 ===');
        
        const secureStats = this.encryptedData.getStats();
        console.log('加密数据统计信息:', secureStats);
        console.log('总加密键数:', secureStats.totalKeys);
        console.log('总加密大小:', secureStats.totalSize, '字符');
        console.log('解密后大小:', secureStats.encryptedSize, '字符');
        console.log('加密键类型分布:', secureStats.keyTypes);
    }

    /**
     * 演示加密特性
     */
    private demoEncryptionFeatures() {
        console.log('=== 加密特性演示 ===');
        
        // 动态更新加密密钥
        console.log('原始加密密钥:', this.encryptedData.getEncryptKey());
        this.encryptedData.setEncryptKey('NEW_SECURE_KEY_2024');
        console.log('更新后加密密钥:', this.encryptedData.getEncryptKey());
        
        // 动态更新初始化向量
        console.log('原始IV:', this.encryptedData.getIV());
        this.encryptedData.setIV('NEW_SECURE_IV_16');
        console.log('更新后IV:', this.encryptedData.getIV());
        
        // 验证更新后的加密配置
        const isValidAfterUpdate = this.encryptedData.validateEncryptionConfig();
        console.log('更新后加密配置是否有效:', isValidAfterUpdate);
    }

    /**
     * 演示错误处理和默认值
     */
    private demoEncryptedErrorHandling() {
        console.log('=== 加密错误处理演示 ===');
        
        // 尝试获取不存在的加密键，使用默认值
        const nonExistentSecureInt = this.encryptedData.getInt('non_existent_secure', 999);
        console.log('不存在的加密整数（使用默认值）:', nonExistentSecureInt);
        
        const nonExistentSecureString = this.encryptedData.getString('non_existent_secure', '默认加密字符串');
        console.log('不存在的加密字符串（使用默认值）:', nonExistentSecureString);
        
        const nonExistentSecureArray = this.encryptedData.getArray('non_existent_secure', ['默认', '加密', '数组']);
        console.log('不存在的加密数组（使用默认值）:', nonExistentSecureArray);
        
        // 尝试设置无效数据
        this.encryptedData.setInt('invalid_secure_int', NaN); // 会被忽略
        this.encryptedData.setString('invalid_secure_string', null as any); // 会被忽略
        this.encryptedData.setArray('invalid_secure_array', 'not_an_array' as any); // 会被忽略
    }

    /**
     * 演示数据迁移和升级
     */
    private demoEncryptedDataMigration() {
        console.log('=== 加密数据迁移演示 ===');
        
        // 模拟旧版本加密数据结构
        this.encryptedData.setString('secure_version', '1.0');
        this.encryptedData.setInt('old_secure_player_level', 5);
        
        // 检查版本并迁移数据
        const currentSecureVersion = this.encryptedData.getString('secure_version', '1.0');
        if (currentSecureVersion === '1.0') {
            // 迁移到新版本
            const oldSecureLevel = this.encryptedData.getInt('old_secure_player_level', 1);
            this.encryptedData.setInt('secure_player_level', oldSecureLevel);
            this.encryptedData.removeItem('old_secure_player_level');
            this.encryptedData.setString('secure_version', '2.0');
            console.log('加密数据已从版本1.0迁移到2.0');
        }
    }

    /**
     * 演示安全最佳实践
     */
    private demoSecurityBestPractices() {
        console.log('=== 安全最佳实践演示 ===');
        
        // 使用强密钥
        const strongKey = 'MySuperSecureKey2024!@#$%^&*()';
        const strongIV = 'MySecureIV16!@#';
        
        const secureDataWithStrongKey = new FWEncryptedDataBase('ultra_secure_data', strongKey, strongIV);
        
        // 存储敏感信息
        secureDataWithStrongKey.setString('password', 'super_secret_password');
        secureDataWithStrongKey.setObject('user_credentials', {
            username: 'admin',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            permissions: ['read', 'write', 'admin']
        });
        
        // 验证强密钥配置
        const isStrongConfigValid = secureDataWithStrongKey.validateEncryptionConfig();
        console.log('强密钥配置是否有效:', isStrongConfigValid);
        
        // 获取强密钥信息
        const strongEncryptionInfo = secureDataWithStrongKey.getEncryptionInfo();
        console.log('强密钥加密信息:', strongEncryptionInfo);
    }

    /**
     * 清理测试数据
     */
    onDestroy() {
        if (this.encryptedData) {
            this.encryptedData.clear();
            console.log('加密测试数据已清理');
        }
    }
} 
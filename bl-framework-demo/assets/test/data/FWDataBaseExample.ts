import { _decorator, Component, Node } from 'cc';
import { FWDataBase } from 'db://bl-framework/manager';


/**
 * FWDataBase 使用示例
 * 展示各种数据类型的存储和读取方法
 */
export class FWDataBaseExample extends Component {
    private dataBase: FWDataBase;

    start() {
        // 创建数据存储实例
        this.dataBase = new FWDataBase('game_data');
        
        // 演示各种数据类型的存储和读取
        this.demoBasicTypes();
        this.demoAdvancedTypes();
        this.demoBatchOperations();
        this.demoDataManagement();
        this.demoStatistics();
    }

    /**
     * 演示基础数据类型
     */
    private demoBasicTypes() {
        console.log('=== 基础数据类型演示 ===');
        
        // 浮点数
        this.dataBase.setFloat('player_score', 1234.56);
        const score = this.dataBase.getFloat('player_score', 0);
        console.log('玩家分数:', score);
        
        // 整数
        this.dataBase.setInt('player_level', 10);
        const level = this.dataBase.getInt('player_level', 1);
        console.log('玩家等级:', level);
        
        // 字符串
        this.dataBase.setString('player_name', '张三');
        const name = this.dataBase.getString('player_name', '未知玩家');
        console.log('玩家姓名:', name);
        
        // 布尔值
        this.dataBase.setBoolean('sound_enabled', true);
        const soundEnabled = this.dataBase.getBoolean('sound_enabled', false);
        console.log('音效开启:', soundEnabled);
    }

    /**
     * 演示高级数据类型
     */
    private demoAdvancedTypes() {
        console.log('=== 高级数据类型演示 ===');
        
        // JSON对象
        const playerData = {
            id: 1001,
            name: '李四',
            items: ['sword', 'shield', 'potion'],
            stats: {
                hp: 100,
                mp: 50,
                attack: 25
            }
        };
        this.dataBase.setObject('player_data', playerData);
        const savedPlayerData = this.dataBase.getObject('player_data');
        console.log('玩家数据:', savedPlayerData);
        
        // 数组
        const inventory = ['gold', 'silver', 'bronze', 'iron'];
        this.dataBase.setArray('inventory', inventory);
        const savedInventory = this.dataBase.getArray('inventory');
        console.log('背包物品:', savedInventory);
        
        // 日期
        const lastLoginTime = new Date();
        this.dataBase.setDate('last_login', lastLoginTime);
        const savedLastLogin = this.dataBase.getDate('last_login');
        console.log('最后登录时间:', savedLastLogin);
    }

    /**
     * 演示批量操作
     */
    private demoBatchOperations() {
        console.log('=== 批量操作演示 ===');
        
        // 批量设置数据
        const batchData = {
            gold: 1000,
            experience: 5000,
            is_vip: true,
            nickname: 'VIP玩家',
            achievements: ['first_win', 'level_10', 'collector'],
            settings: {
                language: 'zh-CN',
                quality: 'high',
                auto_save: true
            }
        };
        this.dataBase.setBatch(batchData);
        
        // 批量获取数据
        const keysToGet = ['gold', 'experience', 'is_vip', 'nickname'];
        const batchResult = this.dataBase.getBatch(keysToGet);
        console.log('批量获取结果:', batchResult);
    }

    /**
     * 演示数据管理功能
     */
    private demoDataManagement() {
        console.log('=== 数据管理功能演示 ===');
        
        // 检查键是否存在
        const hasGold = this.dataBase.hasKey('gold');
        console.log('是否存在金币数据:', hasGold);
        
        // 获取所有键名
        const allKeys = this.dataBase.getKeys();
        console.log('所有数据键名:', allKeys);
        
        // 获取数据数量
        const dataSize = this.dataBase.getSize();
        console.log('数据项数量:', dataSize);
        
        // 删除特定数据
        this.dataBase.removeItem('player_name');
        console.log('删除玩家姓名后，是否存在:', this.dataBase.hasKey('player_name'));
    }

    /**
     * 演示统计功能
     */
    private demoStatistics() {
        console.log('=== 数据统计演示 ===');
        
        const stats = this.dataBase.getStats();
        console.log('数据统计信息:', stats);
        console.log('总键数:', stats.totalKeys);
        console.log('总大小:', stats.totalSize, '字符');
        console.log('键类型分布:', stats.keyTypes);
    }

    /**
     * 演示错误处理和默认值
     */
    private demoErrorHandling() {
        console.log('=== 错误处理演示 ===');
        
        // 尝试获取不存在的键，使用默认值
        const nonExistentInt = this.dataBase.getInt('non_existent', 999);
        console.log('不存在的整数（使用默认值）:', nonExistentInt);
        
        const nonExistentString = this.dataBase.getString('non_existent', '默认字符串');
        console.log('不存在的字符串（使用默认值）:', nonExistentString);
        
        const nonExistentArray = this.dataBase.getArray('non_existent', ['默认', '数组']);
        console.log('不存在的数组（使用默认值）:', nonExistentArray);
        
        // 尝试设置无效数据
        this.dataBase.setInt('invalid_int', NaN); // 会被忽略
        this.dataBase.setString('invalid_string', null as any); // 会被忽略
        this.dataBase.setArray('invalid_array', 'not_an_array' as any); // 会被忽略
    }

    /**
     * 演示数据迁移和升级
     */
    private demoDataMigration() {
        console.log('=== 数据迁移演示 ===');
        
        // 模拟旧版本数据结构
        this.dataBase.setString('version', '1.0');
        this.dataBase.setInt('old_player_level', 5);
        
        // 检查版本并迁移数据
        const currentVersion = this.dataBase.getString('version', '1.0');
        if (currentVersion === '1.0') {
            // 迁移到新版本
            const oldLevel = this.dataBase.getInt('old_player_level', 1);
            this.dataBase.setInt('player_level', oldLevel);
            this.dataBase.removeItem('old_player_level');
            this.dataBase.setString('version', '2.0');
            console.log('数据已从版本1.0迁移到2.0');
        }
    }

    /**
     * 清理测试数据
     */
    onDestroy() {
        if (this.dataBase) {
            this.dataBase.clear();
            console.log('测试数据已清理');
        }
    }
} 
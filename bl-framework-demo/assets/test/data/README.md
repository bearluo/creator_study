# FWDataBase 数据存储类

## 概述

`FWDataBase` 是一个功能完善的本地数据存储基类，提供了多种数据类型的存储和读取功能，支持数据验证、默认值、批量操作等高级特性。

`FWEncryptedDataBase` 是 `FWDataBase` 的加密版本，提供 AES-256-CBC 加密存储功能，适用于存储敏感数据。

## 主要特性

### 支持的数据类型

- **基础类型**：浮点数、整数、字符串、布尔值
- **复杂类型**：JSON对象、数组、日期对象
- **类型安全**：所有方法都提供类型检查和验证

### 核心功能

- **数据验证**：自动验证输入数据的有效性
- **默认值支持**：所有读取方法都支持默认值参数
- **批量操作**：支持批量设置和获取数据
- **数据管理**：提供键存在检查、删除、清空等功能
- **统计信息**：获取数据存储的统计信息
- **加密存储**：AES-256-CBC 加密算法保护敏感数据

## 基本使用

### 创建实例

```typescript
import { FWDataBase } from './FWDataBase';
import { FWEncryptedDataBase } from './FWEncryptedDataBase';

// 创建普通数据存储实例
const dataBase = new FWDataBase('game_data');

// 创建加密数据存储实例
const encryptedData = new FWEncryptedDataBase('secure_game_data');

// 使用自定义密钥创建加密实例
const secureData = new FWEncryptedDataBase('ultra_secure_data', 'custom_key', 'custom_iv');
```

### 基础数据类型操作

```typescript
// 浮点数
dataBase.setFloat('player_score', 1234.56);
const score = dataBase.getFloat('player_score', 0);

// 整数
dataBase.setInt('player_level', 10);
const level = dataBase.getInt('player_level', 1);

// 字符串
dataBase.setString('player_name', '张三');
const name = dataBase.getString('player_name', '未知玩家');

// 布尔值
dataBase.setBoolean('sound_enabled', true);
const soundEnabled = dataBase.getBoolean('sound_enabled', false);
```

### 复杂数据类型操作

```typescript
// JSON对象
const playerData = {
    id: 1001,
    name: '李四',
    stats: { hp: 100, mp: 50 }
};
dataBase.setObject('player_data', playerData);
const savedData = dataBase.getObject('player_data');

// 数组
const inventory = ['sword', 'shield', 'potion'];
dataBase.setArray('inventory', inventory);
const savedInventory = dataBase.getArray('inventory');

// 日期
const lastLogin = new Date();
dataBase.setDate('last_login', lastLogin);
const savedDate = dataBase.getDate('last_login');
```

## 加密数据存储

### 加密配置

```typescript
// 验证加密配置
const isValid = encryptedData.validateEncryptionConfig();
console.log('加密配置是否有效:', isValid);

// 获取加密算法信息
const encryptionInfo = encryptedData.getEncryptionInfo();
console.log('加密算法信息:', encryptionInfo);
```

### 加密数据操作

```typescript
// 加密存储敏感信息
encryptedData.setString('password', 'secret123');
encryptedData.setObject('user_credentials', {
    username: 'admin',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    permissions: ['read', 'write', 'admin']
});

// 读取加密数据
const password = encryptedData.getString('password', '');
const credentials = encryptedData.getObject('user_credentials');
```

### 动态密钥管理

```typescript
// 更新加密密钥
encryptedData.setEncryptKey('NEW_SECURE_KEY_2024');

// 更新初始化向量
encryptedData.setIV('NEW_SECURE_IV_16');

// 验证更新后的配置
const isValidAfterUpdate = encryptedData.validateEncryptionConfig();
```

## 高级功能

### 批量操作

```typescript
// 批量设置数据
const batchData = {
    gold: 1000,
    experience: 5000,
    is_vip: true,
    nickname: 'VIP玩家'
};
dataBase.setBatch(batchData);

// 批量获取数据
const keysToGet = ['gold', 'experience', 'is_vip'];
const batchResult = dataBase.getBatch(keysToGet);
```

### 数据管理

```typescript
// 检查键是否存在
const hasKey = dataBase.hasKey('player_name');

// 获取所有键名
const allKeys = dataBase.getKeys();

// 获取数据数量
const size = dataBase.getSize();

// 删除特定数据
dataBase.removeItem('player_name');

// 清空所有数据
dataBase.clear();
```

### 统计信息

```typescript
const stats = dataBase.getStats();
console.log('总键数:', stats.totalKeys);
console.log('总大小:', stats.totalSize);
console.log('键类型分布:', stats.keyTypes);

// 加密数据统计（包含加密大小信息）
const encryptedStats = encryptedData.getStats();
console.log('加密大小:', encryptedStats.encryptedSize);
```

## 错误处理和默认值

### 默认值使用

```typescript
// 获取不存在的键时使用默认值
const score = dataBase.getFloat('non_existent_score', 0);
const name = dataBase.getString('non_existent_name', '默认玩家');
const items = dataBase.getArray('non_existent_items', []);
```

### 数据验证

```typescript
// 无效数据会被忽略并输出警告
dataBase.setInt('invalid_int', NaN);        // 会被忽略
dataBase.setString('invalid_string', null); // 会被忽略
dataBase.setArray('invalid_array', 'not_an_array'); // 会被忽略
```

## 最佳实践

### 1. 数据版本管理

```typescript
// 在应用启动时检查数据版本
const currentVersion = dataBase.getString('data_version', '1.0');
if (currentVersion === '1.0') {
    // 执行数据迁移
    const oldLevel = dataBase.getInt('old_player_level', 1);
    dataBase.setInt('player_level', oldLevel);
    dataBase.removeItem('old_player_level');
    dataBase.setString('data_version', '2.0');
}
```

### 2. 数据备份和恢复

```typescript
// 备份数据
const backupData = dataBase.getBatch(dataBase.getKeys());

// 恢复数据
dataBase.setBatch(backupData);
```

### 3. 性能优化

```typescript
// 对于频繁访问的数据，考虑缓存
class GameDataManager {
    private cache: Map<string, any> = new Map();
    
    getPlayerData() {
        if (!this.cache.has('player_data')) {
            const data = this.dataBase.getObject('player_data');
            this.cache.set('player_data', data);
        }
        return this.cache.get('player_data');
    }
}
```

### 4. 数据安全

```typescript
// 对于敏感数据，使用加密版本
import { FWEncryptedDataBase } from './FWEncryptedDataBase';

const secureData = new FWEncryptedDataBase('secure_data');

// 使用强密钥
const strongKey = 'MySuperSecureKey2024!@#$%^&*()';
const strongIV = 'MySecureIV16!@#';
const ultraSecureData = new FWEncryptedDataBase('ultra_secure_data', strongKey, strongIV);

// 存储敏感信息
secureData.setString('password', 'secret123');
secureData.setObject('user_credentials', {
    username: 'admin',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    permissions: ['read', 'write', 'admin']
});
```

### 5. 加密最佳实践

```typescript
// 验证加密配置
const isValid = encryptedData.validateEncryptionConfig();
if (!isValid) {
    console.error('加密配置无效，请检查密钥和IV设置');
}

// 定期更新密钥
function updateEncryptionKey() {
    const newKey = generateSecureKey();
    encryptedData.setEncryptKey(newKey);
    
    // 验证新密钥
    if (!encryptedData.validateEncryptionConfig()) {
        console.error('新密钥配置无效');
        // 回滚到旧密钥
    }
}

// 安全的数据迁移
function migrateEncryptedData() {
    const oldData = encryptedData.getBatch(encryptedData.getKeys());
    
    // 使用新密钥创建新实例
    const newEncryptedData = new FWEncryptedDataBase('new_secure_data', 'new_key', 'new_iv');
    
    // 迁移数据
    newEncryptedData.setBatch(oldData);
    
    // 验证迁移
    const migrationStats = newEncryptedData.getStats();
    console.log('数据迁移完成，新实例数据量:', migrationStats.totalKeys);
}
```

## API 参考

### FWDataBase 构造函数

```typescript
constructor(key: string)
```

- `key`: 数据实例的唯一标识符

### FWEncryptedDataBase 构造函数

```typescript
constructor(key: string, encryptKey?: string, iv?: string)
```

- `key`: 数据实例的唯一标识符
- `encryptKey`: 自定义加密密钥（可选）
- `iv`: 自定义初始化向量（可选）

### 基础数据类型方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setFloat(key, number)` | `key: string, number: number` | `void` | 保存浮点数 |
| `getFloat(key, defaultValue?)` | `key: string, defaultValue?: number` | `number` | 读取浮点数 |
| `setInt(key, number)` | `key: string, number: number` | `void` | 保存整数 |
| `getInt(key, defaultValue?)` | `key: string, defaultValue?: number` | `number` | 读取整数 |
| `setString(key, value)` | `key: string, value: string` | `void` | 保存字符串 |
| `getString(key, defaultValue?)` | `key: string, defaultValue?: string` | `string \| null` | 读取字符串 |
| `setBoolean(key, value)` | `key: string, value: boolean` | `void` | 保存布尔值 |
| `getBoolean(key, defaultValue?)` | `key: string, defaultValue?: boolean` | `boolean` | 读取布尔值 |

### 复杂数据类型方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setObject<T>(key, value)` | `key: string, value: T` | `void` | 保存JSON对象 |
| `getObject<T>(key, defaultValue?)` | `key: string, defaultValue?: T` | `T \| null` | 读取JSON对象 |
| `setArray<T>(key, value)` | `key: string, value: T[]` | `void` | 保存数组 |
| `getArray<T>(key, defaultValue?)` | `key: string, defaultValue?: T[]` | `T[]` | 读取数组 |
| `setDate(key, value)` | `key: string, value: Date` | `void` | 保存日期 |
| `getDate(key, defaultValue?)` | `key: string, defaultValue?: Date` | `Date \| null` | 读取日期 |

### 数据管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `hasKey(key)` | `key: string` | `boolean` | 检查键是否存在 |
| `removeItem(key)` | `key: string` | `void` | 删除指定键 |
| `clear()` | - | `void` | 清空所有数据 |
| `getKeys()` | - | `string[]` | 获取所有键名 |
| `getSize()` | - | `number` | 获取数据数量 |

### 批量操作方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setBatch(data)` | `data: Record<string, any>` | `void` | 批量设置数据 |
| `getBatch(keys)` | `keys: string[]` | `Record<string, any>` | 批量获取数据 |

### 统计方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getStats()` | - | `{totalKeys: number, totalSize: number, keyTypes: Record<string, string>}` | 获取统计信息 |

### 加密相关方法（仅 FWEncryptedDataBase）

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `validateEncryptionConfig()` | - | `boolean` | 验证加密配置 |
| `getEncryptionInfo()` | - | `{algorithm: string, keyLength: number, ivLength: number, padding: string, mode: string}` | 获取加密算法信息 |
| `getEncryptKey()` | - | `string` | 获取当前加密密钥 |
| `setEncryptKey(newKey)` | `newKey: string` | `void` | 设置新的加密密钥 |
| `getIV()` | - | `string` | 获取当前初始化向量 |
| `setIV(newIV)` | `newIV: string` | `void` | 设置新的初始化向量 |

## 注意事项

1. **存储限制**：localStorage 有存储大小限制（通常5-10MB），注意控制数据量
2. **数据类型**：所有数据最终都以字符串形式存储，注意类型转换
3. **键名规范**：建议使用有意义的键名，避免冲突
4. **错误处理**：始终使用默认值参数来处理数据不存在的情况
5. **性能考虑**：频繁访问的数据考虑使用缓存机制
6. **加密安全**：定期更新加密密钥，使用强密钥和IV
7. **密钥管理**：妥善保管加密密钥，避免硬编码在代码中
8. **兼容性**：加密数据在不同设备间可能无法直接迁移

## 扩展功能

如果需要加密存储功能，可以使用 `FWEncryptedDataBase` 类，它继承自 `FWDataBase` 并提供了 AES 加密功能。

```typescript
import { FWEncryptedDataBase } from './FWEncryptedDataBase';

const secureData = new FWEncryptedDataBase('secure_data', 'custom_key', 'custom_iv');
secureData.setString('sensitive_data', 'secret_value');
``` 
# JWT 客户端使用说明

## 概述

JWT 客户端是一个封装了 JWT 认证的 HTTP 请求客户端，提供了完整的认证流程管理，包括：

- 自动令牌管理（存储、加载、清除）
- 自动令牌刷新
- 认证请求封装
- 登录、注册、登出功能
- 错误处理和回调

## 快速开始

### 1. 创建 JWT 客户端

```typescript
import { JWTClient, JWTClientConfig } from './JWTClient';

const config: JWTClientConfig = {
    baseUrl: 'https://api.example.com',
    autoRefresh: true,
    refreshThreshold: 5 * 60 * 1000, // 5分钟
    onTokenExpired: () => {
        console.log('令牌已过期，需要重新登录');
    },
    onRefreshFailed: () => {
        console.log('刷新令牌失败，需要重新登录');
    }
};

const client = new JWTClient(config);
```

### 2. 用户登录

```typescript
try {
    const response = await client.login({
        username: 'testuser',
        password: 'password123'
    });
    console.log('登录成功:', response.data);
} catch (error) {
    console.error('登录失败:', error);
}
```

### 3. 发送认证请求

```typescript
// GET 请求
const userInfo = await client.get('/user/profile');

// POST 请求
const updateResult = await client.post('/user/profile', {
    nickname: '新昵称',
    email: 'new@example.com'
});

// PUT 请求
const putResult = await client.put('/user/profile', userData);

// DELETE 请求
const deleteResult = await client.delete('/users/123');
```

### 4. 用户登出

```typescript
await client.logout();
```

## 配置选项

### JWTClientConfig

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| baseUrl | string | - | API 基础 URL（必需） |
| tokenKey | string | 'jwt_token' | 本地存储中访问令牌的键名 |
| refreshTokenKey | string | 'jwt_refresh_token' | 本地存储中刷新令牌的键名 |
| autoRefresh | boolean | true | 是否自动刷新令牌 |
| refreshThreshold | number | 5 * 60 * 1000 | 令牌刷新阈值（毫秒） |
| onTokenExpired | function | - | 令牌过期回调 |
| onRefreshFailed | function | - | 刷新失败回调 |

## API 方法

### 认证方法

#### login(credentials)
用户登录
```typescript
client.login({
    username: 'testuser',
    password: 'password123'
})
```

#### register(userData)
用户注册
```typescript
client.register({
    username: 'newuser',
    password: 'password123',
    email: 'newuser@example.com'
})
```

#### logout()
用户登出
```typescript
client.logout()
```

#### refreshToken()
手动刷新令牌
```typescript
const newToken = await client.refreshToken()
```

### HTTP 请求方法

#### get(url, params?, config?)
发送 GET 请求
```typescript
client.get('/users', { page: 1, limit: 10 })
```

#### post(url, body?, config?)
发送 POST 请求
```typescript
client.post('/users', { name: 'John', email: 'john@example.com' })
```

#### put(url, body?, config?)
发送 PUT 请求
```typescript
client.put('/users/123', { name: 'John Updated' })
```

#### delete(url, config?)
发送 DELETE 请求
```typescript
client.delete('/users/123')
```

### 令牌管理方法

#### setToken(token)
设置访问令牌
```typescript
client.setToken('your-jwt-token')
```

#### getToken()
获取访问令牌
```typescript
const token = client.getToken()
```

#### setRefreshToken(refreshToken)
设置刷新令牌
```typescript
client.setRefreshToken('your-refresh-token')
```

#### getRefreshToken()
获取刷新令牌
```typescript
const refreshToken = client.getRefreshToken()
```

#### clearTokens()
清除所有令牌
```typescript
client.clearTokens()
```

#### isTokenExpiringSoon()
检查令牌是否即将过期
```typescript
const isExpiring = client.isTokenExpiringSoon()
```

## 特性

### 自动令牌管理
- 令牌自动保存到 localStorage
- 应用启动时自动加载令牌
- 支持令牌过期检查

### 自动令牌刷新
- 在令牌即将过期时自动刷新
- 防止并发刷新请求
- 刷新失败时自动清除令牌

### 错误处理
- 401 错误自动触发令牌过期回调
- 刷新失败自动触发失败回调
- 完整的错误信息传递

### 类型安全
- 完整的 TypeScript 类型定义
- 泛型支持响应数据类型
- 编译时类型检查

## 使用示例

完整的使用示例请参考 `JWTExample.ts` 文件。

## 注意事项

1. **安全性**: 令牌存储在 localStorage 中，在生产环境中应考虑安全性
2. **错误处理**: 建议实现 `onTokenExpired` 和 `onRefreshFailed` 回调
3. **网络错误**: 客户端会自动处理网络错误和超时
4. **并发请求**: 自动防止多个并发刷新请求
5. **令牌格式**: 确保服务器返回的 JWT 格式正确

## 依赖

- FWHttp: 基于现有的 HTTP 客户端
- localStorage: 用于令牌存储（浏览器环境） 
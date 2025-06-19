# FWHttp - 自定义HTTP请求工具类

## 概述

`FWHttp` 是一个基于 `XMLHttpRequest` 的HTTP请求工具类，提供了简洁易用的API来进行各种HTTP请求。同时提供了 `FWFormData` 类来处理文件上传和表单数据。

## 特性

- ✅ 支持所有主要HTTP方法（GET、POST、PUT、DELETE、PATCH等）
- ✅ 链式调用API
- ✅ 自动处理请求头设置
- ✅ 支持文件上传（FormData）
- ✅ 统一的错误处理
- ✅ 类型安全的TypeScript支持
- ✅ 便捷的静态方法
- ✅ 自定义配置支持

## 快速开始

### 基础GET请求

```typescript
import { FWHttp } from './FWHttp';

// 方式1：使用实例方法
const http = new FWHttp('https://api.example.com/users');
http.setCallback((error, response) => {
    if (error) {
        console.error('请求失败:', error.message);
    } else {
        console.log('请求成功:', response?.data);
    }
});
http.get();

// 方式2：使用静态便捷方法
FWHttp.get('https://api.example.com/users', 
    { page: 1, limit: 10 }, 
    (error, response) => {
        if (error) {
            console.error('请求失败:', error.message);
        } else {
            console.log('请求成功:', response?.data);
        }
    }
);
```

### 基础POST请求

```typescript
// 方式1：使用实例方法
const http = new FWHttp('https://api.example.com/users');
http.setBody({ name: '张三', age: 25, email: 'zhangsan@example.com' });
http.setCallback((error, response) => {
    if (error) {
        console.error('请求失败:', error.message);
    } else {
        console.log('请求成功:', response?.data);
    }
});
http.post();

// 方式2：使用静态便捷方法
FWHttp.post('https://api.example.com/users', 
    { name: '李四', age: 30, email: 'lisi@example.com' }, 
    (error, response) => {
        if (error) {
            console.error('请求失败:', error.message);
        } else {
            console.log('请求成功:', response?.data);
        }
    }
);
```

## API 参考

### FWHttp 类

#### 构造函数

```typescript
constructor(url: string, config?: HttpRequestConfig)
```

**参数：**
- `url`: 请求URL
- `config`: 可选的请求配置

#### 配置选项

```typescript
interface HttpRequestConfig {
    method?: HttpMethod;           // HTTP方法
    headers?: Record<string, string>; // 请求头
    timeout?: number;              // 超时时间（毫秒）
    withCredentials?: boolean;     // 是否发送cookies
    responseType?: XMLHttpRequestResponseType; // 响应类型
}
```

#### 实例方法

##### setRequestHeader(key: string, value: string): FWHttp
设置请求头，支持链式调用。

##### setBody(body: any): FWHttp
设置请求体，支持链式调用。

##### setParams(params: object): FWHttp
设置URL参数，支持链式调用。

##### setCallback(callback: Function): FWHttp
设置完成回调，支持链式调用。

##### get(): void
发送GET请求。

##### post(): void
发送POST请求。

##### put(): void
发送PUT请求。

##### delete(): void
发送DELETE请求。

##### patch(): void
发送PATCH请求。

##### abort(): void
中断请求。

#### 静态方法

##### FWHttp.get(url, params?, callback?)
便捷的GET请求方法。

##### FWHttp.post(url, body?, callback?)
便捷的POST请求方法。

### FWFormData 类

#### 方法

##### append(key: string, value: any, filename?: string): void
添加参数到表单数据。

##### set(key: string, value: any, filename?: string): void
设置参数（与append相同）。

##### clear(): void
清空表单数据。

##### delete(key: string): void
删除指定参数。

##### get arrayBuffer(): ArrayBuffer
获取ArrayBuffer格式的表单数据。

## 高级用法

### 自定义配置请求

```typescript
import { FWHttp, HttpMethod } from './FWHttp';

const config = {
    method: HttpMethod.POST,
    headers: {
        'Authorization': 'Bearer your-token-here',
        'X-Custom-Header': 'custom-value'
    },
    timeout: 15000,
    withCredentials: true,
    responseType: 'json'
};

const http = new FWHttp('https://api.example.com/secure-data', config);
http.setBody({ action: 'getData', userId: 123 });
http.setCallback((error, response) => {
    if (error) {
        console.error('请求失败:', error.message);
    } else {
        console.log('请求成功:', response?.data);
        console.log('响应状态:', response?.status);
        console.log('响应头:', response?.headers);
    }
});
http.post();
```

### 文件上传

```typescript
import { FWHttp, FWFormData } from './FWHttp';

// 创建FormData
const formData = new FWFormData();
formData.append('username', '张三');
formData.append('avatar', 'file-content-here', 'avatar.png');
formData.append('description', '这是我的头像');

const http = new FWHttp('https://api.example.com/upload');
http.setBody(formData);
http.setCallback((error, response) => {
    if (error) {
        console.error('文件上传失败:', error.message);
    } else {
        console.log('文件上传成功:', response?.data);
    }
});
http.post();
```

### 链式调用

```typescript
new FWHttp('https://api.example.com/users')
    .setRequestHeader('Authorization', 'Bearer token')
    .setRequestHeader('Content-Type', 'application/json')
    .setParams({ page: 1, limit: 20 })
    .setCallback((error, response) => {
        if (error) {
            console.error('请求失败:', error.message);
        } else {
            console.log('请求成功:', response?.data);
        }
    })
    .get();
```

### 批量请求

```typescript
const urls = [
    'https://api.example.com/users/1',
    'https://api.example.com/users/2',
    'https://api.example.com/users/3'
];

const promises = urls.map(url => {
    return new Promise<HttpResponse>((resolve, reject) => {
        FWHttp.get(url, {}, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response!);
            }
        });
    });
});

Promise.all(promises)
    .then(responses => {
        console.log('批量请求成功:', responses);
    })
    .catch(error => {
        console.error('批量请求失败:', error);
    });
```

## 错误处理

FWHttp 提供了统一的错误处理机制：

```typescript
const http = new FWHttp('https://api.example.com/data');
http.setCallback((error, response) => {
    if (error) {
        // 处理各种错误类型
        if (error.message.includes('网络错误')) {
            console.error('网络连接失败');
        } else if (error.message.includes('请求超时')) {
            console.error('请求超时，请重试');
        } else if (error.message.includes('请求被中断')) {
            console.error('请求被用户中断');
        } else {
            console.error('请求失败:', error.message);
        }
    } else {
        console.log('请求成功:', response?.data);
    }
});
http.get();
```

## 类型定义

### HttpResponse 接口

```typescript
interface HttpResponse<T = any> {
    data: T;                    // 响应数据
    status: number;             // HTTP状态码
    statusText: string;         // 状态文本
    headers: Record<string, string>; // 响应头
    url: string;                // 最终请求URL
}
```

### HttpMethod 枚举

```typescript
enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS'
}
```

## 注意事项

1. **URL编码**: 参数会自动进行URL编码，无需手动处理
2. **Content-Type**: 会根据请求体类型自动设置合适的Content-Type
3. **超时处理**: 默认超时时间为8秒，可通过配置修改
4. **错误处理**: 所有网络错误、超时、中断等都会通过回调函数返回
5. **FormData**: 支持文件上传，会自动处理boundary和Content-Type

## 示例代码

完整的使用示例请参考 `FWHttpExample.ts` 文件，其中包含了各种使用场景的详细代码示例。

## 许可证

MIT License 
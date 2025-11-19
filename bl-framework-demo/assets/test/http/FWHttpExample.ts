/**
 * FWHttp 和 FWFormData 使用示例
 * 展示各种HTTP请求和表单数据的使用方法
 */

import { FWFormData, FWHttp, HttpMethod, HttpRequestConfig, HttpResponse } from "db://bl-framework/network";


/**
 * HTTP请求使用示例类
 */
export class FWHttpExample {
    
    /**
     * 基础GET请求示例
     */
    static basicGetExample(): void {
        console.log('=== 基础GET请求示例 ===');
        
        // 方式1：使用实例方法
        const http1 = new FWHttp('https://api.example.com/users');
        http1.setCallback((error, response) => {
            if (error) {
                console.error('GET请求失败:', error.message);
            } else {
                console.log('GET请求成功:', response?.data);
            }
        });
        http1.get();
        
        // 方式2：使用静态便捷方法
        FWHttp.get('https://api.example.com/users', 
            { page: 1, limit: 10 }, 
            (error, response) => {
                if (error) {
                    console.error('GET请求失败:', error.message);
                } else {
                    console.log('GET请求成功:', response?.data);
                }
            }
        );
    }
    
    /**
     * 基础POST请求示例
     */
    static basicPostExample(): void {
        console.log('=== 基础POST请求示例 ===');
        
        // 方式1：使用实例方法
        const http1 = new FWHttp('https://api.example.com/users');
        http1.setBody({ name: '张三', age: 25, email: 'zhangsan@example.com' });
        http1.setCallback((error, response) => {
            if (error) {
                console.error('POST请求失败:', error.message);
            } else {
                console.log('POST请求成功:', response?.data);
            }
        });
        http1.post();
        
        // 方式2：使用静态便捷方法
        FWHttp.post('https://api.example.com/users', 
            { name: '李四', age: 30, email: 'lisi@example.com' }, 
            (error, response) => {
                if (error) {
                    console.error('POST请求失败:', error.message);
                } else {
                    console.log('POST请求成功:', response?.data);
                }
            }
        );
    }
    
    /**
     * 带自定义配置的请求示例
     */
    static customConfigExample(): void {
        console.log('=== 自定义配置请求示例 ===');
        
        const config: HttpRequestConfig = {
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
                console.error('自定义配置请求失败:', error.message);
            } else {
                console.log('自定义配置请求成功:', response?.data);
                console.log('响应状态:', response?.status);
                console.log('响应头:', response?.headers);
            }
        });
        http.post();
    }
    
    /**
     * 文件上传示例
     */
    static fileUploadExample(): void {
        console.log('=== 文件上传示例 ===');
        
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
    }
    
    /**
     * PUT请求示例
     */
    static putExample(): void {
        console.log('=== PUT请求示例 ===');
        
        const http = new FWHttp('https://api.example.com/users/123');
        http.setBody({ name: '王五', age: 28, email: 'wangwu@example.com' });
        http.setCallback((error, response) => {
            if (error) {
                console.error('PUT请求失败:', error.message);
            } else {
                console.log('PUT请求成功:', response?.data);
            }
        });
        http.put();
    }
    
    /**
     * DELETE请求示例
     */
    static deleteExample(): void {
        console.log('=== DELETE请求示例 ===');
        
        const http = new FWHttp('https://api.example.com/users/123');
        http.setCallback((error, response) => {
            if (error) {
                console.error('DELETE请求失败:', error.message);
            } else {
                console.log('DELETE请求成功:', response?.data);
            }
        });
        http.delete();
    }
    
    /**
     * 链式调用示例
     */
    static chainCallExample(): void {
        console.log('=== 链式调用示例 ===');
        
        new FWHttp('https://api.example.com/users')
            .setRequestHeader('Authorization', 'Bearer token')
            .setRequestHeader('Content-Type', 'application/json')
            .setParams({ page: 1, limit: 20 })
            .setCallback((error, response) => {
                if (error) {
                    console.error('链式调用请求失败:', error.message);
                } else {
                    console.log('链式调用请求成功:', response?.data);
                }
            })
            .get();
    }
    
    /**
     * 错误处理示例
     */
    static errorHandlingExample(): void {
        console.log('=== 错误处理示例 ===');
        
        // 网络错误
        const http1 = new FWHttp('https://invalid-url-that-does-not-exist.com');
        http1.setCallback((error, response) => {
            if (error) {
                console.error('网络错误:', error.message);
            }
        });
        http1.get();
        
        // 超时错误
        const http2 = new FWHttp('https://api.example.com/slow-endpoint', {
            timeout: 1000 // 1秒超时
        });
        http2.setCallback((error, response) => {
            if (error) {
                console.error('超时错误:', error.message);
            }
        });
        http2.get();
    }
    
    /**
     * FormData高级用法示例
     */
    static formDataAdvancedExample(): void {
        console.log('=== FormData高级用法示例 ===');
        
        const formData = new FWFormData();
        
        // 添加文本参数
        formData.append('title', '我的文章');
        formData.append('content', '这是文章内容');
        formData.append('tags', '技术,编程,TypeScript');
        
        // 添加文件参数
        formData.append('cover', 'cover-image-content', 'cover.jpg');
        formData.append('attachment', 'attachment-content', 'document.pdf');
        
        // 获取ArrayBuffer
        const buffer = formData.arrayBuffer;
        console.log('FormData转换为ArrayBuffer成功，大小:', buffer.byteLength);
        
        // 清空表单数据
        formData.clear();
        console.log('FormData已清空');
    }
    
    /**
     * 批量请求示例
     */
    static batchRequestExample(): void {
        console.log('=== 批量请求示例 ===');
        
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
    }
    
    /**
     * 运行所有示例
     */
    static runAllExamples(): void {
        console.log('开始运行FWHttp使用示例...\n');
        
        // 注意：这些示例中的URL是虚构的，实际使用时需要替换为真实的API地址
        // 为了避免实际网络请求，这里只是展示代码结构
        
        this.basicGetExample();
        this.basicPostExample();
        this.customConfigExample();
        this.fileUploadExample();
        this.putExample();
        this.deleteExample();
        this.chainCallExample();
        this.errorHandlingExample();
        this.formDataAdvancedExample();
        this.batchRequestExample();
        
        console.log('\n所有示例代码已展示完成！');
        console.log('注意：实际使用时请替换为真实的API地址。');
    }
}

// 导出示例类
export default FWHttpExample; 
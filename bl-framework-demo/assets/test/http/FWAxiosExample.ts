import { FWAxios, http, defaultAxios, RequestConfig, ResponseData, RequestError } from "../../../extensions/bl-framework/assets/network/FWAxios";
import { FWFormData } from "db://bl-framework/network";

/**
 * FWAxios 使用示例
 * 展示如何使用 FWAxios 进行各种 HTTP 请求
 */
export class FWAxiosExample {
    
    /**
     * 基础使用示例
     */
    public static async basicUsage() {
        console.log('=== 基础使用示例 ===');
        
        try {
            // 使用便捷方法
            const response1 = await http.get('https://api.example.com/users', { page: 1, limit: 10 });
            console.log('GET 请求成功:', response1.data);
            
            const response2 = await http.post('https://api.example.com/users', {
                name: '张三',
                email: 'zhangsan@example.com'
            });
            console.log('POST 请求成功:', response2.data);
            
        } catch (error) {
            console.error('请求失败:', (error as RequestError).message);
        }
    }
    
    /**
     * 创建自定义实例示例
     */
    public static async customInstance() {
        console.log('=== 自定义实例示例 ===');
        
        // 创建自定义配置的实例
        const customAxios = new FWAxios('https://api.example.com', {
            timeout: 15000,
            showLoading: true,
            showError: true,
            retryCount: 3,
            retryDelay: 2000,
            headers: {
                'X-Custom-Header': 'custom-value'
            }
        });
        
        // 添加请求拦截器
        customAxios.addRequestInterceptor((config) => {
            console.log('请求拦截器:', config.url);
            // 添加认证token
            config.headers.Authorization = 'Bearer your-token-here';
            return config;
        });
        
        // 添加响应拦截器
        customAxios.addResponseInterceptor((response) => {
            console.log('响应拦截器:', response.status);
            return response;
        });
        
        // 添加错误拦截器
        customAxios.addErrorInterceptor((error) => {
            console.log('错误拦截器:', error.message);
            // 可以在这里处理特定错误
            if (error.response?.status === 401) {
                // 处理未授权错误
                console.log('需要重新登录');
            }
        });
        
        try {
            const response = await customAxios.get('/users/profile');
            console.log('自定义实例请求成功:', response.data);
        } catch (error) {
            console.error('自定义实例请求失败:', (error as RequestError).message);
        }
    }
    
    /**
     * 文件上传示例
     */
    public static async fileUpload() {
        console.log('=== 文件上传示例 ===');
        
        try {
            // 使用自定义 FormData
            const formData = new FWFormData();
            formData.append('file', 'file-content', 'example.txt');
            formData.append('description', '这是一个示例文件');
            
            const response = await http.upload('https://api.example.com/upload', formData, {
                showLoading: true,
                loadingText: '文件上传中...'
            });
            
            console.log('文件上传成功:', response.data);
            
        } catch (error) {
            console.error('文件上传失败:', (error as RequestError).message);
        }
    }
    
    /**
     * 文件下载示例
     */
    public static async fileDownload() {
        console.log('=== 文件下载示例 ===');
        
        try {
            const blob = await http.download('https://api.example.com/files/document.pdf', {
                showLoading: true,
                loadingText: '文件下载中...'
            });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document.pdf';
            a.click();
            
            // 清理URL对象
            URL.revokeObjectURL(url);
            
            console.log('文件下载成功');
            
        } catch (error) {
            console.error('文件下载失败:', (error as RequestError).message);
        }
    }
    
    /**
     * 错误处理示例
     */
    public static async errorHandling() {
        console.log('=== 错误处理示例 ===');
        
        try {
            // 模拟网络错误
            await http.get('https://invalid-url-that-does-not-exist.com');
        } catch (error) {
            const requestError = error as RequestError;
            console.log('错误码:', requestError.code);
            console.log('错误信息:', requestError.message);
            
            // 根据错误类型进行不同处理
            switch (requestError.code) {
                case 'NETWORK_ERROR':
                    console.log('网络连接失败，请检查网络设置');
                    break;
                case 'HTTP_404':
                    console.log('请求的资源不存在');
                    break;
                case 'HTTP_500':
                    console.log('服务器内部错误');
                    break;
                default:
                    console.log('其他错误:', requestError.message);
            }
        }
    }
    
    /**
     * 并发请求示例
     */
    public static async concurrentRequests() {
        console.log('=== 并发请求示例 ===');
        
        try {
            // 并发发送多个请求
            const promises = [
                http.get('https://api.example.com/users'),
                http.get('https://api.example.com/posts'),
                http.get('https://api.example.com/comments')
            ];
            
            const results = await Promise.all(promises);
            
            console.log('用户数据:', results[0].data);
            console.log('文章数据:', results[1].data);
            console.log('评论数据:', results[2].data);
            
        } catch (error) {
            console.error('并发请求失败:', (error as RequestError).message);
        }
    }
    
    /**
     * 认证token管理示例
     */
    public static async tokenManagement() {
        console.log('=== 认证Token管理示例 ===');
        
        // 设置认证token
        defaultAxios.setAuthToken('your-jwt-token-here');
        
        try {
            // 发送需要认证的请求
            const response = await http.get('https://api.example.com/protected-resource');
            console.log('认证请求成功:', response.data);
            
        } catch (error) {
            console.error('认证请求失败:', (error as RequestError).message);
        } finally {
            // 清除认证token
            defaultAxios.clearAuthToken();
        }
    }
    
    /**
     * 请求配置示例
     */
    public static async requestConfig() {
        console.log('=== 请求配置示例 ===');
        
        const config: RequestConfig = {
            timeout: 5000,
            showLoading: true,
            loadingText: '加载中...',
            showError: true,
            retryCount: 2,
            retryDelay: 1000,
            headers: {
                'X-Request-ID': 'unique-request-id',
                'X-Client-Version': '1.0.0'
            }
        };
        
        try {
            const response = await http.get('https://api.example.com/data', undefined, config);
            console.log('配置化请求成功:', response.data);
            
        } catch (error) {
            console.error('配置化请求失败:', (error as RequestError).message);
        }
    }
    
    /**
     * 运行所有示例
     */
    public static async runAllExamples() {
        console.log('开始运行 FWAxios 使用示例...\n');
        
        await this.basicUsage();
        console.log('\n');
        
        await this.customInstance();
        console.log('\n');
        
        await this.fileUpload();
        console.log('\n');
        
        await this.fileDownload();
        console.log('\n');
        
        await this.errorHandling();
        console.log('\n');
        
        await this.concurrentRequests();
        console.log('\n');
        
        await this.tokenManagement();
        console.log('\n');
        
        await this.requestConfig();
        console.log('\n');
        
        console.log('所有示例运行完成！');
    }
}

// 导出示例类
export default FWAxiosExample; 
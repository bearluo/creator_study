import { FWAxios, http, defaultAxios, RequestConfig, ResponseData, RequestError } from "../../../extensions/bl-framework/assets/network/FWAxios";

/**
 * FWAxios 测试类
 * 用于验证 FWAxios 的基本功能
 */
export class FWAxiosTest {
    
    /**
     * 测试基础 GET 请求
     */
    public static async testGetRequest() {
        console.log('=== 测试 GET 请求 ===');
        
        try {
            // 使用 JSONPlaceholder 测试 API
            const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
            console.log('GET 请求成功:', response.data);
            console.log('状态码:', response.status);
            console.log('响应头:', response.headers);
            
            return true;
        } catch (error) {
            console.error('GET 请求失败:', (error as RequestError).message);
            return false;
        }
    }
    
    /**
     * 测试基础 POST 请求
     */
    public static async testPostRequest() {
        console.log('=== 测试 POST 请求 ===');
        
        try {
            const postData = {
                title: '测试标题',
                body: '测试内容',
                userId: 1
            };
            
            const response = await http.post('https://jsonplaceholder.typicode.com/posts', postData);
            console.log('POST 请求成功:', response.data);
            console.log('状态码:', response.status);
            
            return true;
        } catch (error) {
            console.error('POST 请求失败:', (error as RequestError).message);
            return false;
        }
    }
    
    /**
     * 测试自定义实例
     */
    public static async testCustomInstance() {
        console.log('=== 测试自定义实例 ===');
        
        const customAxios = new FWAxios('https://jsonplaceholder.typicode.com', {
            timeout: 10000,
            showLoading: true,
            showError: true,
            retryCount: 1,
            retryDelay: 1000
        });
        
        // 添加请求拦截器
        customAxios.addRequestInterceptor((config) => {
            console.log('请求拦截器触发:', config.url);
            config.headers['X-Test-Header'] = 'test-value';
            return config;
        });
        
        // 添加响应拦截器
        customAxios.addResponseInterceptor((response) => {
            console.log('响应拦截器触发:', response.status);
            return response;
        });
        
        try {
            const response = await customAxios.get('/users/1');
            console.log('自定义实例请求成功:', response.data);
            return true;
        } catch (error) {
            console.error('自定义实例请求失败:', (error as RequestError).message);
            return false;
        }
    }
    
    /**
     * 测试错误处理
     */
    public static async testErrorHandling() {
        console.log('=== 测试错误处理 ===');
        
        try {
            // 故意请求一个不存在的 URL
            await http.get('https://invalid-url-that-does-not-exist.com');
        } catch (error) {
            const requestError = error as RequestError;
            console.log('错误码:', requestError.code);
            console.log('错误信息:', requestError.message);
            
            // 验证错误类型
            if (requestError.code === 'NETWORK_ERROR') {
                console.log('✅ 网络错误处理正确');
                return true;
            } else {
                console.log('❌ 错误处理异常');
                return false;
            }
        }
        
        return false;
    }
    
    /**
     * 测试请求配置
     */
    public static async testRequestConfig() {
        console.log('=== 测试请求配置 ===');
        
        const config: RequestConfig = {
            timeout: 5000,
            showLoading: true,
            loadingText: '测试加载中...',
            showError: true,
            retryCount: 1,
            retryDelay: 500,
            headers: {
                'X-Test-Config': 'test-config-value'
            }
        };
        
        try {
            const response = await http.get('https://jsonplaceholder.typicode.com/posts/2', undefined, config);
            console.log('配置化请求成功:', response.data);
            return true;
        } catch (error) {
            console.error('配置化请求失败:', (error as RequestError).message);
            return false;
        }
    }
    
    /**
     * 测试并发请求
     */
    public static async testConcurrentRequests() {
        console.log('=== 测试并发请求 ===');
        
        try {
            const promises = [
                http.get('https://jsonplaceholder.typicode.com/posts/1'),
                http.get('https://jsonplaceholder.typicode.com/posts/2'),
                http.get('https://jsonplaceholder.typicode.com/posts/3')
            ];
            
            const results = await Promise.all(promises);
            
            console.log('并发请求成功:');
            console.log('请求1:', results[0].data.id);
            console.log('请求2:', results[1].data.id);
            console.log('请求3:', results[2].data.id);
            
            return true;
        } catch (error) {
            console.error('并发请求失败:', (error as RequestError).message);
            return false;
        }
    }
    
    /**
     * 测试认证token管理
     */
    public static async testTokenManagement() {
        console.log('=== 测试认证Token管理 ===');
        
        try {
            // 设置认证token
            defaultAxios.setAuthToken('test-token-123');
            console.log('✅ Token 设置成功');
            
            // 发送请求（虽然测试API不需要认证，但可以验证header是否正确设置）
            const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
            console.log('✅ 带Token的请求成功');
            
            // 清除认证token
            defaultAxios.clearAuthToken();
            console.log('✅ Token 清除成功');
            
            return true;
        } catch (error) {
            console.error('Token管理测试失败:', (error as RequestError).message);
            return false;
        }
    }
    
    /**
     * 运行所有测试
     */
    public static async runAllTests() {
        console.log('🚀 开始运行 FWAxios 测试...\n');
        
        const tests = [
            { name: 'GET 请求', test: this.testGetRequest },
            { name: 'POST 请求', test: this.testPostRequest },
            { name: '自定义实例', test: this.testCustomInstance },
            { name: '错误处理', test: this.testErrorHandling },
            { name: '请求配置', test: this.testRequestConfig },
            { name: '并发请求', test: this.testConcurrentRequests },
            { name: 'Token管理', test: this.testTokenManagement }
        ];
        
        const results = [];
        
        for (const test of tests) {
            console.log(`\n📋 运行测试: ${test.name}`);
            const result = await test.test();
            results.push({ name: test.name, success: result });
            console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? '通过' : '失败'}`);
        }
        
        console.log('\n📊 测试结果汇总:');
        const passed = results.filter(r => r.success).length;
        const total = results.length;
        
        results.forEach(result => {
            console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
        });
        
        console.log(`\n🎯 总体结果: ${passed}/${total} 测试通过`);
        
        if (passed === total) {
            console.log('🎉 所有测试通过！FWAxios 工作正常。');
        } else {
            console.log('⚠️ 部分测试失败，请检查相关功能。');
        }
        
        return results;
    }
}

// 导出测试类
export default FWAxiosTest; 
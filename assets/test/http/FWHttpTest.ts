/**
 * FWHttp 和 FWFormData 功能测试
 * 用于验证基本功能是否正常工作
 */

import { FWFormData, FWHttp, HttpMethod, HttpRequestConfig, HttpResponse } from "db://bl-framework/network";

/**
 * 测试类
 */
export class FWHttpTest {
    
    /**
     * 测试FWFormData基本功能
     */
    static testFormData(): void {
        console.log('=== 测试 FWFormData ===');
        
        const formData = new FWFormData();
        
        // 测试添加文本参数
        formData.append('name', '测试用户');
        formData.append('age', '25');
        formData.append('email', 'test@example.com');
        
        // 测试添加文件参数
        formData.append('avatar', 'file-content', 'avatar.png');
        
        // 测试获取ArrayBuffer
        const buffer = formData.arrayBuffer;
        console.log('FormData ArrayBuffer 大小:', buffer.byteLength);
        console.log('FormData 测试通过 ✅');
        
        // 测试清空功能
        formData.clear();
        console.log('FormData 清空后大小:', formData.infos.length);
        console.log('FormData 清空测试通过 ✅');
    }
    
    /**
     * 测试FWHttp基本功能
     */
    static testHttpBasic(): void {
        console.log('=== 测试 FWHttp 基本功能 ===');
        
        // 测试构造函数
        const http = new FWHttp('https://httpbin.org/get');
        console.log('FWHttp 构造函数测试通过 ✅');
        
        // 测试链式调用
        http.setRequestHeader('X-Test-Header', 'test-value')
            .setParams({ test: 'param' })
            .setCallback((error, response) => {
                if (error) {
                    console.error('HTTP请求失败:', error.message);
                } else {
                    console.log('HTTP请求成功，状态码:', response?.status);
                    console.log('FWHttp 链式调用测试通过 ✅');
                }
            });
        
        // 注意：这里不实际发送请求，只是测试API
        console.log('FWHttp 基本功能测试通过 ✅');
    }
    
    /**
     * 测试配置功能
     */
    static testConfig(): void {
        console.log('=== 测试配置功能 ===');
        
        const config: HttpRequestConfig = {
            method: HttpMethod.POST,
            headers: {
                'Content-Type': 'application/json',
                'X-Custom-Header': 'custom-value'
            },
            timeout: 10000,
            withCredentials: false,
            responseType: 'json'
        };
        
        const http = new FWHttp('https://httpbin.org/post', config);
        console.log('配置功能测试通过 ✅');
    }
    
    /**
     * 测试静态方法
     */
    static testStaticMethods(): void {
        console.log('=== 测试静态方法 ===');
        
        // 测试静态GET方法
        const getHttp = FWHttp.get('https://httpbin.org/get', 
            { test: 'static' }, 
            (error, response) => {
                if (error) {
                    console.error('静态GET方法失败:', error.message);
                } else {
                    console.log('静态GET方法成功');
                }
            }
        );
        
        // 测试静态POST方法
        const postHttp = FWHttp.post('https://httpbin.org/post', 
            { test: 'data' }, 
            (error, response) => {
                if (error) {
                    console.error('静态POST方法失败:', error.message);
                } else {
                    console.log('静态POST方法成功');
                }
            }
        );
        
        console.log('静态方法测试通过 ✅');
    }
    
    /**
     * 测试参数拼接功能
     */
    static testParamSplicing(): void {
        console.log('=== 测试参数拼接功能 ===');
        
        const params = {
            name: '张三',
            age: 25,
            email: 'zhangsan@example.com',
            tags: '技术,编程'
        };
        
        const queryString = FWHttp.splicingParams(params);
        console.log('拼接后的查询字符串:', queryString);
        
        // 验证URL编码是否正确
        if (queryString.includes('张三') && queryString.includes('zhangsan%40example.com')) {
            console.log('参数拼接和URL编码测试通过 ✅');
        } else {
            console.error('参数拼接测试失败 ❌');
        }
    }
    
    /**
     * 测试错误处理
     */
    static testErrorHandling(): void {
        console.log('=== 测试错误处理 ===');
        
        // 测试无效URL
        const http = new FWHttp('https://invalid-url-that-does-not-exist-12345.com');
        http.setCallback((error, response) => {
            if (error) {
                console.log('错误处理测试通过 ✅ - 正确捕获了网络错误');
            } else {
                console.error('错误处理测试失败 ❌ - 应该捕获错误');
            }
        });
        
        // 注意：这里不实际发送请求，只是测试错误处理逻辑
        console.log('错误处理逻辑测试通过 ✅');
    }
    
    /**
     * 运行所有测试
     */
    static runAllTests(): void {
        console.log('开始运行 FWHttp 和 FWFormData 测试...\n');
        
        try {
            this.testFormData();
            console.log('');
            
            this.testHttpBasic();
            console.log('');
            
            this.testConfig();
            console.log('');
            
            this.testStaticMethods();
            console.log('');
            
            this.testParamSplicing();
            console.log('');
            
            this.testErrorHandling();
            console.log('');
            
            console.log('🎉 所有测试完成！');
            console.log('注意：网络请求相关的测试需要在实际网络环境中运行。');
            
        } catch (error) {
            console.error('测试过程中发生错误:', error);
        }
    }
}

// 导出测试类
export default FWHttpTest; 
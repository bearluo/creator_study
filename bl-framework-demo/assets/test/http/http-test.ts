import { _decorator, Component, Node, Label, Button, ScrollView, EditBox } from 'cc';
import { FWAxios, FWHttp, HttpMethod, FWFormData } from 'db://bl-framework/network';
const { ccclass, property } = _decorator;

@ccclass('http_test')
export class http_test extends Component {
    @property(Label)
    logLabel: Label = null!;

    @property(ScrollView)
    scrollView: ScrollView = null!;

    @property(EditBox)
    urlInput: EditBox = null!;

    @property(EditBox)
    dataInput: EditBox = null!;

    private logContent: string = '';
    private fwAxios: FWAxios;

    start() {
        // 初始化 FWAxios 实例
        this.fwAxios = new FWAxios('https://httpbin.org', {
            timeout: 10000,
            showLoading: false,
            showError: true
        });

        // 添加请求拦截器
        this.fwAxios.addRequestInterceptor((config) => {
            this.log(`[请求拦截器] 发送请求到: ${config.url}`);
            return config;
        });

        // 添加响应拦截器
        this.fwAxios.addResponseInterceptor((response) => {
            this.log(`[响应拦截器] 收到响应: ${response.status}`);
            return response;
        });

        // 添加错误拦截器
        this.fwAxios.addErrorInterceptor((error) => {
            this.log(`[错误拦截器] 请求失败: ${error.message}`);
            return error;
        });

        this.log('HTTP 测试模块已初始化');
        this.log('基础 URL: https://httpbin.org');
        this.runAllTests();
    }

    update(deltaTime: number) {
        
    }

    /**
     * 添加日志
     */
    private log(message: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.logContent += `[${timestamp}] ${message}\n`;
        
        if (this.logLabel) {
            this.logLabel.string = this.logContent;
        }
        
        // 自动滚动到底部
        if (this.scrollView) {
            this.scrollView.scrollToBottom(0.1);
        }
    }

    /**
     * 清空日志
     */
    public clearLog() {
        this.logContent = '';
        if (this.logLabel) {
            this.logLabel.string = '';
        }
    }

    /**
     * 获取当前 URL
     */
    private getCurrentUrl(): string {
        return this.urlInput?.string || 'https://httpbin.org/get';
    }

    /**
     * 获取当前数据
     */
    private getCurrentData(): any {
        const dataStr = this.dataInput?.string || '{}';
        try {
            return JSON.parse(dataStr);
        } catch {
            return { message: dataStr };
        }
    }

    // ==================== FWHttp 测试方法 ====================

    /**
     * FWHttp GET 请求测试
     */
    public async testFWHttpGet() {
        this.log('=== FWHttp GET 请求测试 ===');
        
        const url = this.getCurrentUrl();
        const params = { test: 'fwhttp', timestamp: Date.now() };
        
        FWHttp.get(url, params, (error, response) => {
            if (error) {
                this.log(`❌ FWHttp GET 失败: ${error.message}`);
            } else {
                this.log(`✅ FWHttp GET 成功: ${response?.status}`);
                this.log(`响应数据: ${JSON.stringify(response?.data).substring(0, 200)}...`);
            }
        });
    }

    /**
     * FWHttp POST 请求测试
     */
    public async testFWHttpPost() {
        this.log('=== FWHttp POST 请求测试 ===');
        
        const url = 'https://httpbin.org/post';
        const data = this.getCurrentData();
        
        const http = new FWHttp(url, {
            method: HttpMethod.POST,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        http.setBody(data)
            .setCallback((error, response) => {
                if (error) {
                    this.log(`❌ FWHttp POST 失败: ${error.message}`);
                } else {
                    this.log(`✅ FWHttp POST 成功: ${response?.status}`);
                    this.log(`响应数据: ${JSON.stringify(response?.data).substring(0, 200)}...`);
                }
            })
            .post();
    }

    /**
     * FWHttp 文件上传测试
     */
    public async testFWHttpUpload() {
        this.log('=== FWHttp 文件上传测试 ===');
        
        const url = 'https://httpbin.org/post';
        const formData = new FWFormData();
        
        // 添加文本参数
        formData.append('name', 'test_file');
        formData.append('description', '这是一个测试文件');
        
        // 添加文件数据（模拟）
        const fileData = new TextEncoder().encode('Hello, this is a test file content!');
        formData.append('file', fileData, 'test.txt');
        
        const http = new FWHttp(url, {
            method: HttpMethod.POST,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData.boundary_key}`
            }
        });
        
        http.setBody(formData)
            .setCallback((error, response) => {
                if (error) {
                    this.log(`❌ FWHttp 文件上传失败: ${error.message}`);
                } else {
                    this.log(`✅ FWHttp 文件上传成功: ${response?.status}`);
                    this.log(`响应数据: ${JSON.stringify(response?.data).substring(0, 200)}...`);
                }
            })
            .post();
    }

    /**
     * FWHttp 超时测试
     */
    public async testFWHttpTimeout() {
        this.log('=== FWHttp 超时测试 ===');
        
        const url = 'https://httpbin.org/delay/10'; // 延迟10秒
        
        const http = new FWHttp(url, {
            method: HttpMethod.GET,
            timeout: 3000 // 3秒超时
        });
        
        http.setCallback((error, response) => {
            if (error) {
                this.log(`❌ FWHttp 超时测试: ${error.message}`);
            } else {
                this.log(`✅ FWHttp 超时测试成功: ${response?.status}`);
            }
        })
        .get();
    }

    // ==================== FWAxios 测试方法 ====================

    /**
     * FWAxios GET 请求测试
     */
    public async testFWAxiosGet() {
        this.log('=== FWAxios GET 请求测试 ===');
        
        try {
            const params = { test: 'fwaxios', timestamp: Date.now() };
            const response = await this.fwAxios.get('/get', params, {
                showLoading: true,
                loadingText: '正在获取数据...'
            });
            
            this.log(`✅ FWAxios GET 成功: ${response.status}`);
            this.log(`响应数据: ${JSON.stringify(response.data).substring(0, 200)}...`);
        } catch (error: any) {
            this.log(`❌ FWAxios GET 失败: ${error.message}`);
        }
    }

    /**
     * FWAxios POST 请求测试
     */
    public async testFWAxiosPost() {
        this.log('=== FWAxios POST 请求测试 ===');
        
        try {
            const data = this.getCurrentData();
            const response = await this.fwAxios.post('/post', data, {
                showLoading: true,
                loadingText: '正在提交数据...'
            });
            
            this.log(`✅ FWAxios POST 成功: ${response.status}`);
            this.log(`响应数据: ${JSON.stringify(response.data).substring(0, 200)}...`);
        } catch (error: any) {
            this.log(`❌ FWAxios POST 失败: ${error.message}`);
        }
    }

    /**
     * FWAxios PUT 请求测试
     */
    public async testFWAxiosPut() {
        this.log('=== FWAxios PUT 请求测试 ===');
        
        try {
            const data = { ...this.getCurrentData(), method: 'PUT' };
            const response = await this.fwAxios.put('/put', data);
            
            this.log(`✅ FWAxios PUT 成功: ${response.status}`);
            this.log(`响应数据: ${JSON.stringify(response.data).substring(0, 200)}...`);
        } catch (error: any) {
            this.log(`❌ FWAxios PUT 失败: ${error.message}`);
        }
    }

    /**
     * FWAxios DELETE 请求测试
     */
    public async testFWAxiosDelete() {
        this.log('=== FWAxios DELETE 请求测试 ===');
        
        try {
            const response = await this.fwAxios.delete('/delete');
            
            this.log(`✅ FWAxios DELETE 成功: ${response.status}`);
            this.log(`响应数据: ${JSON.stringify(response.data).substring(0, 200)}...`);
        } catch (error: any) {
            this.log(`❌ FWAxios DELETE 失败: ${error.message}`);
        }
    }

    /**
     * FWAxios 文件上传测试
     */
    public async testFWAxiosUpload() {
        this.log('=== FWAxios 文件上传测试 ===');
        
        try {
            const formData = new FWFormData();
            formData.append('name', 'test_file');
            formData.append('description', '这是一个测试文件');
            
            // 添加文件数据（模拟）
            const fileData = new TextEncoder().encode('Hello, this is a test file content!');
            formData.append('file', fileData, 'test.txt');
            
            const response = await this.fwAxios.upload('/post', formData, {
                showLoading: true,
                loadingText: '正在上传文件...'
            });
            
            this.log(`✅ FWAxios 文件上传成功: ${response.status}`);
            this.log(`响应数据: ${JSON.stringify(response.data).substring(0, 200)}...`);
        } catch (error: any) {
            this.log(`❌ FWAxios 文件上传失败: ${error.message}`);
        }
    }

    /**
     * FWAxios 重试机制测试
     */
    public async testFWAxiosRetry() {
        this.log('=== FWAxios 重试机制测试 ===');
        
        try {
            // 使用一个可能失败的URL来测试重试
            const response = await this.fwAxios.get('/status/500', {}, {
                retryCount: 3,
                retryDelay: 1000,
                showLoading: true,
                loadingText: '正在重试...'
            });
            
            this.log(`✅ FWAxios 重试测试完成: ${response.status}`);
        } catch (error: any) {
            this.log(`❌ FWAxios 重试测试失败: ${error.message}`);
        }
    }

    /**
     * FWAxios 自定义请求测试
     */
    public async testFWAxiosCustom() {
        this.log('=== FWAxios 自定义请求测试 ===');
        
        try {
            const response = await this.fwAxios.request({
                url: '/headers',
                method: 'GET',
                headers: {
                    'X-Custom-Header': 'test-value',
                    'X-Timestamp': Date.now().toString()
                },
                showLoading: true,
                loadingText: '自定义请求中...'
            });
            
            this.log(`✅ FWAxios 自定义请求成功: ${response.status}`);
            this.log(`响应数据: ${JSON.stringify(response.data).substring(0, 200)}...`);
        } catch (error: any) {
            this.log(`❌ FWAxios 自定义请求失败: ${error.message}`);
        }
    }

    // ==================== 批量测试方法 ====================

    /**
     * 运行所有 FWHttp 测试
     */
    public async runAllFWHttpTests() {
        this.log('🚀 开始运行所有 FWHttp 测试...');
        
        await this.testFWHttpGet();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWHttpPost();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWHttpUpload();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWHttpTimeout();
        
        this.log('✅ 所有 FWHttp 测试完成');
    }

    /**
     * 运行所有 FWAxios 测试
     */
    public async runAllFWAxiosTests() {
        this.log('🚀 开始运行所有 FWAxios 测试...');
        
        await this.testFWAxiosGet();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWAxiosPost();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWAxiosPut();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWAxiosDelete();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWAxiosUpload();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWAxiosRetry();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testFWAxiosCustom();
        
        this.log('✅ 所有 FWAxios 测试完成');
    }

    /**
     * 运行所有测试
     */
    public async runAllTests() {
        this.log('🚀 开始运行所有 HTTP 测试...');
        
        await this.runAllFWHttpTests();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await this.runAllFWAxiosTests();
        
        this.log('🎉 所有 HTTP 测试完成！');
    }
}



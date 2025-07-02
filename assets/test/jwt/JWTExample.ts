import { JWTClient, JWTClientConfig } from '../../../extensions/bl-framework/assets/network/jwt/JWTClient';

/**
 * JWT 客户端使用示例
 */
export class JWTExample {
    private client: JWTClient;

    constructor() {
        // 创建 JWT 客户端配置
        const config: JWTClientConfig = {
            baseUrl: 'https://api.example.com',
            autoRefresh: true,
            refreshThreshold: 5 * 60 * 1000, // 5分钟
            onTokenExpired: () => {
                console.log('令牌已过期，需要重新登录');
                // 可以在这里处理令牌过期逻辑，比如跳转到登录页面
            },
            onRefreshFailed: () => {
                console.log('刷新令牌失败，需要重新登录');
                // 可以在这里处理刷新失败逻辑
            }
        };

        this.client = new JWTClient(config);
    }

    /**
     * 用户登录示例
     */
    public async loginExample(): Promise<void> {
        try {
            const response = await this.client.login({
                username: 'testuser',
                password: 'password123'
            });

            console.log('登录成功:', response.data);
        } catch (error) {
            console.error('登录失败:', error);
        }
    }

    /**
     * 用户注册示例
     */
    public async registerExample(): Promise<void> {
        try {
            const response = await this.client.register({
                username: 'newuser',
                password: 'password123',
                email: 'newuser@example.com'
            });

            console.log('注册成功:', response.data);
        } catch (error) {
            console.error('注册失败:', error);
        }
    }

    /**
     * 获取用户信息示例
     */
    public async getUserInfoExample(): Promise<void> {
        try {
            const response = await this.client.get('/user/profile');
            console.log('用户信息:', response.data);
        } catch (error) {
            console.error('获取用户信息失败:', error);
        }
    }

    /**
     * 更新用户信息示例
     */
    public async updateUserInfoExample(): Promise<void> {
        try {
            const userData = {
                nickname: '新昵称',
                avatar: 'https://example.com/avatar.jpg'
            };

            const response = await this.client.put('/user/profile', userData);
            console.log('更新成功:', response.data);
        } catch (error) {
            console.error('更新失败:', error);
        }
    }

    /**
     * 获取用户列表示例
     */
    public async getUserListExample(): Promise<void> {
        try {
            const params = {
                page: 1,
                limit: 10,
                search: 'test'
            };

            const response = await this.client.get('/users', params);
            console.log('用户列表:', response.data);
        } catch (error) {
            console.error('获取用户列表失败:', error);
        }
    }

    /**
     * 删除用户示例
     */
    public async deleteUserExample(userId: string): Promise<void> {
        try {
            const response = await this.client.delete(`/users/${userId}`);
            console.log('删除成功:', response.data);
        } catch (error) {
            console.error('删除失败:', error);
        }
    }

    /**
     * 上传文件示例
     */
    public async uploadFileExample(file: File): Promise<void> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await this.client.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('上传成功:', response.data);
        } catch (error) {
            console.error('上传失败:', error);
        }
    }

    /**
     * 用户登出示例
     */
    public async logoutExample(): Promise<void> {
        try {
            await this.client.logout();
            console.log('登出成功');
        } catch (error) {
            console.error('登出失败:', error);
        }
    }

    /**
     * 手动刷新令牌示例
     */
    public async refreshTokenExample(): Promise<void> {
        try {
            const newToken = await this.client.refreshToken();
            console.log('令牌刷新成功:', newToken);
        } catch (error) {
            console.error('令牌刷新失败:', error);
        }
    }

    /**
     * 检查令牌状态示例
     */
    public checkTokenStatusExample(): void {
        const token = this.client.getToken();
        const refreshToken = this.client.getRefreshToken();
        const isExpiringSoon = this.client.isTokenExpiringSoon();

        console.log('当前令牌:', token ? '已设置' : '未设置');
        console.log('刷新令牌:', refreshToken ? '已设置' : '未设置');
        console.log('是否即将过期:', isExpiringSoon);
    }
}

/**
 * 使用示例
 */
export function createJWTExample(): JWTExample {
    return new JWTExample();
} 
/**
 * 网络管理器接口（可选）
 */

/**
 * 网络管理器接口
 */
export interface INetworkManager {
    /** HTTP 请求 */
    request<T = any>(config: RequestConfig): Promise<T>;
    /** WebSocket 连接 */
    connect(url: string, protocols?: string[]): IWebSocket;
}

/**
 * 请求配置
 */
export interface RequestConfig {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    data?: any;
    timeout?: number;
}

/**
 * WebSocket 接口
 */
export interface IWebSocket {
    /** 发送消息 */
    send(data: string | ArrayBuffer): void;
    /** 关闭连接 */
    close(): void;
    /** 监听消息 */
    onMessage(callback: (data: any) => void): void;
    /** 监听错误 */
    onError(callback: (error: Error) => void): void;
}


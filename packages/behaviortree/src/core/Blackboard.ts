/**
 * 黑板（共享数据存储）
 * 用于行为树节点之间共享数据
 */

/**
 * 黑板监听器类型
 */
export type BlackboardListener = (newValue: any, oldValue: any) => void;

/**
 * 黑板
 * 提供类型安全的数据存储和访问
 */
export class Blackboard {
    private data: Map<string, any> = new Map();
    private listeners: Map<string, Set<BlackboardListener>> = new Map();

    /**
     * 设置值
     * @param key 键
     * @param value 值
     */
    set<T>(key: string, value: T): void {
        const oldValue = this.data.get(key);
        this.data.set(key, value);

        // 触发监听器
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(listener => listener(value, oldValue));
        }
    }

    /**
     * 获取值
     * @param key 键
     * @param defaultValue 默认值
     * @returns 值
     */
    get<T>(key: string, defaultValue?: T): T {
        const value = this.data.get(key);
        if (value !== undefined) {
            return value;
        }

        return defaultValue as T;
    }

    /**
     * 检查是否存在
     * @param key 键
     * @returns 是否存在
     */
    has(key: string): boolean {
        return this.data.has(key);
    }

    /**
     * 删除键
     * @param key 键
     * @returns 是否删除成功
     */
    delete(key: string): boolean {
        return this.data.delete(key);
    }

    /**
     * 清空所有数据
     */
    clear(): void {
        this.data.clear();
        this.listeners.clear();
    }

    /**
     * 监听数据变化
     * @param key 键
     * @param listener 监听器
     * @returns 取消监听的函数
     */
    watch(key: string, listener: BlackboardListener): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(listener);

        // 返回取消监听的函数
        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }

}


/**
 * 日志级别
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

/**
 * 日志分类
 */
export enum LogCategory {
    REACTIVE = 'reactive',
    BINDING = 'binding',
    VIEWMODEL = 'viewmodel',
    PERFORMANCE = 'performance'
}

/**
 * MVVM 日志系统
 * 
 * 提供分类日志功能，支持级别控制和分类过滤
 * 
 * @example
 * ```typescript
 * // 启用日志
 * Logger.enable();
 * Logger.setLevel(LogLevel.DEBUG);
 * 
 * // 记录日志
 * Logger.debug(LogCategory.REACTIVE, 'Value updated', { path: 'name', value: 'John' });
 * Logger.warn(LogCategory.BINDING, 'Binding failed', { path: 'invalid.path' });
 * 
 * // 禁用特定分类
 * Logger.setCategoryEnabled(LogCategory.PERFORMANCE, false);
 * ```
 */
export class Logger {
    private static level: LogLevel = LogLevel.WARN;
    private static categories: Set<LogCategory> = new Set(Object.values(LogCategory));
    private static enabled: boolean = false;
    
    /**
     * 设置日志级别
     */
    static setLevel(level: LogLevel): void {
        this.level = level;
    }
    
    /**
     * 获取当前日志级别
     */
    static getLevel(): LogLevel {
        return this.level;
    }
    
    /**
     * 启用/禁用特定分类
     */
    static setCategoryEnabled(category: LogCategory, enabled: boolean): void {
        if (enabled) {
            this.categories.add(category);
        } else {
            this.categories.delete(category);
        }
    }
    
    /**
     * 检查分类是否启用
     */
    static isCategoryEnabled(category: LogCategory): boolean {
        return this.categories.has(category);
    }
    
    /**
     * 启用日志系统
     */
    static enable(): void {
        this.enabled = true;
    }
    
    /**
     * 禁用日志系统
     */
    static disable(): void {
        this.enabled = false;
    }
    
    /**
     * 检查日志系统是否启用
     */
    static isEnabled(): boolean {
        return this.enabled;
    }
    
    /**
     * 记录 DEBUG 级别日志
     */
    static debug(category: LogCategory, message: string, ...args: any[]): void {
        if (!this._shouldLog(LogLevel.DEBUG, category)) return;
        this._log('DEBUG', category, message, ...args);
    }
    
    /**
     * 记录 INFO 级别日志
     */
    static info(category: LogCategory, message: string, ...args: any[]): void {
        if (!this._shouldLog(LogLevel.INFO, category)) return;
        this._log('INFO', category, message, ...args);
    }
    
    /**
     * 记录 WARN 级别日志
     */
    static warn(category: LogCategory, message: string, ...args: any[]): void {
        if (!this._shouldLog(LogLevel.WARN, category)) return;
        this._log('WARN', category, message, ...args);
    }
    
    /**
     * 记录 ERROR 级别日志
     */
    static error(category: LogCategory, message: string, ...args: any[]): void {
        if (!this._shouldLog(LogLevel.ERROR, category)) return;
        this._log('ERROR', category, message, ...args);
    }
    
    /**
     * 检查是否应该记录日志
     */
    private static _shouldLog(level: LogLevel, category: LogCategory): boolean {
        if (!this.enabled) return false;
        if (level < this.level) return false;
        if (!this.categories.has(category)) return false;
        return true;
    }
    
    /**
     * 实际日志输出
     */
    private static _log(level: string, category: LogCategory, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}] [${category.toUpperCase()}]`;
        
        // 根据级别选择输出方法
        if (level === 'ERROR') {
            console.error(prefix, message, ...args);
        } else if (level === 'WARN') {
            console.warn(prefix, message, ...args);
        } else {
            console.log(prefix, message, ...args);
        }
    }
}


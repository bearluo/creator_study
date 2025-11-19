/**
 * 日志级别枚举
 * @enum {number}
 */
export enum LogLevel {
    /** 不输出日志 */
    NONE = 0,
    /** 错误级别日志 */
    ERROR = 1,
    /** 警告级别日志 */
    WARN = 2,
    /** 信息级别日志 */
    INFO = 3,
    /** 调试级别日志 */
    DEBUG = 4,
}

/**
 * 日志配置接口
 */
export interface LogConfig {
    /** 当前日志级别 */
    level: LogLevel;
    /** 是否启用时间戳 */
    enableTimestamp?: boolean;
    /** 时间格式选项 */
    timeFormatOptions?: Intl.DateTimeFormatOptions;
}

/**
 * 默认日志配置
 */
const DEFAULT_CONFIG: LogConfig = {
    level: LogLevel.INFO,
    enableTimestamp: true,
    timeFormatOptions: {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }
};

/**
 * 当前日志配置
 */
let currentConfig: LogConfig = { ...DEFAULT_CONFIG };

/**
 * 设置日志配置
 * @param config 日志配置
 */
export function setLogConfig(config: Partial<LogConfig>): void {
    currentConfig = { ...currentConfig, ...config };
}

/**
 * 获取当前日志级别
 */
export function getCurrentLogLevel(): LogLevel {
    return currentConfig.level;
}

/**
 * 日志工具类
 */
export class Log {
    private static getTimeStamp(): string {
        if (!currentConfig.enableTimestamp) {
            return '';
        }
        const options = currentConfig.timeFormatOptions || DEFAULT_CONFIG.timeFormatOptions!;
        return new Date().toLocaleTimeString('zh-CN', options);
    }

    private static formatMessage(level: string, ...args: any[]): any[] {
        const timestamp = this.getTimeStamp();
        return timestamp ? [`[${timestamp}][${level}]`, ...args] : [`[${level}]`, ...args];
    }

    private static dealData(callback: (...args: any[]) => void, level: string, ...data: any[]): void {
        callback(...this.formatMessage(level, ...data));
    }

    /**
     * 输出调试级别日志
     * @param args 日志参数
     */
    public static debug(...args: any[]): void {
        if (currentConfig.level >= LogLevel.DEBUG) {
            this.dealData(console.debug, 'DEBUG', ...args);
        }
    }

    /**
     * 输出信息级别日志
     * @param args 日志参数
     */
    public static info(...args: any[]): void {
        if (currentConfig.level >= LogLevel.INFO) {
            this.dealData(console.log, 'INFO', ...args);
        }
    }

    /**
     * 输出警告级别日志
     * @param args 日志参数
     */
    public static warn(...args: any[]): void {
        if (currentConfig.level >= LogLevel.WARN) {
            this.dealData(console.warn, 'WARN', ...args);
        }
    }

    /**
     * 输出错误级别日志
     * @param args 日志参数
     */
    public static error(...args: any[]): void {
        if (currentConfig.level >= LogLevel.ERROR) {
            this.dealData(console.error, 'ERROR', ...args);
        }
    }

    /**
     * 获取当前调用栈
     * @returns 错误栈信息
     */
    public static getStack(): Error {
        const error = new Error();
        error.name = 'StackTrace';
        return error;
    }

    /**
     * 输出带堆栈信息的错误日志
     * @param error 错误对象
     * @param message 错误消息
     */
    public static errorWithStack(error: Error, message?: string): void {
        if (currentConfig.level >= LogLevel.ERROR) {
            this.error(message || error.message);
            this.error('Stack:', error.stack);
        }
    }
}

/** 日志工具类的默认导出 */
export const log = Log;


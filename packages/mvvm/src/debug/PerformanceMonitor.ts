/**
 * 性能统计信息
 */
export interface PerformanceStats {
    reactiveUpdates: {
        count: number;
        totalTime: number;
        averageTime: number;
        maxTime: number;
        minTime: number;
        lastUpdateTime: number;
    };
    bindingExecutions: {
        count: number;
        totalTime: number;
        averageTime: number;
        maxTime: number;
        minTime: number;
        lastExecutionTime: number;
    };
}

/**
 * MVVM 性能监控器
 * 
 * 提供性能统计和报告功能
 * 
 * @example
 * ```typescript
 * // 开始性能监控
 * PerformanceMonitor.startTracking();
 * 
 * // ... 执行操作 ...
 * 
 * // 获取统计信息
 * const stats = PerformanceMonitor.getStats();
 * console.log('Average update time:', stats.reactiveUpdates.averageTime);
 * 
 * // 生成报告
 * const report = PerformanceMonitor.generateReport();
 * console.log(report);
 * ```
 */
export class PerformanceMonitor {
    private static enabled: boolean = false;
    private static stats: PerformanceStats = {
        reactiveUpdates: {
            count: 0,
            totalTime: 0,
            averageTime: 0,
            maxTime: 0,
            minTime: Infinity,
            lastUpdateTime: 0
        },
        bindingExecutions: {
            count: 0,
            totalTime: 0,
            averageTime: 0,
            maxTime: 0,
            minTime: Infinity,
            lastExecutionTime: 0
        }
    };
    
    /**
     * 开始性能监控
     */
    static startTracking(): void {
        this.enabled = true;
        this.clearStats();
    }
    
    /**
     * 停止性能监控
     */
    static stopTracking(): void {
        this.enabled = false;
    }
    
    /**
     * 检查是否正在监控
     */
    static isTracking(): boolean {
        return this.enabled;
    }
    
    /**
     * 记录响应式更新耗时
     */
    static recordReactiveUpdate(duration: number): void {
        if (!this.enabled) return;
        
        const stats = this.stats.reactiveUpdates;
        stats.count++;
        stats.totalTime += duration;
        stats.averageTime = stats.totalTime / stats.count;
        stats.maxTime = Math.max(stats.maxTime, duration);
        stats.minTime = Math.min(stats.minTime, duration);
        stats.lastUpdateTime = Date.now();
    }
    
    /**
     * 记录绑定执行耗时
     */
    static recordBindingExecution(duration: number): void {
        if (!this.enabled) return;
        
        const stats = this.stats.bindingExecutions;
        stats.count++;
        stats.totalTime += duration;
        stats.averageTime = stats.totalTime / stats.count;
        stats.maxTime = Math.max(stats.maxTime, duration);
        stats.minTime = Math.min(stats.minTime, duration);
        stats.lastExecutionTime = Date.now();
    }
    
    /**
     * 获取性能统计信息
     */
    static getStats(): PerformanceStats {
        return {
            reactiveUpdates: { ...this.stats.reactiveUpdates },
            bindingExecutions: { ...this.stats.bindingExecutions }
        };
    }
    
    /**
     * 清空统计信息
     */
    static clearStats(): void {
        this.stats = {
            reactiveUpdates: {
                count: 0,
                totalTime: 0,
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity,
                lastUpdateTime: 0
            },
            bindingExecutions: {
                count: 0,
                totalTime: 0,
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity,
                lastExecutionTime: 0
            }
        };
    }
    
    /**
     * 生成性能报告
     */
    static generateReport(): string {
        const stats = this.getStats();
        const lines: string[] = [];
        
        lines.push('Performance Report');
        lines.push('==================');
        lines.push('');
        lines.push('Reactive Updates:');
        lines.push(`  Count: ${stats.reactiveUpdates.count}`);
        lines.push(`  Total Time: ${stats.reactiveUpdates.totalTime.toFixed(2)}ms`);
        lines.push(`  Average Time: ${stats.reactiveUpdates.averageTime.toFixed(2)}ms`);
        lines.push(`  Max Time: ${stats.reactiveUpdates.maxTime.toFixed(2)}ms`);
        if (stats.reactiveUpdates.minTime === Infinity) {
            lines.push(`  Min Time: N/A`);
        } else {
            lines.push(`  Min Time: ${stats.reactiveUpdates.minTime.toFixed(2)}ms`);
        }
        lines.push('');
        lines.push('Binding Executions:');
        lines.push(`  Count: ${stats.bindingExecutions.count}`);
        lines.push(`  Total Time: ${stats.bindingExecutions.totalTime.toFixed(2)}ms`);
        lines.push(`  Average Time: ${stats.bindingExecutions.averageTime.toFixed(2)}ms`);
        lines.push(`  Max Time: ${stats.bindingExecutions.maxTime.toFixed(2)}ms`);
        if (stats.bindingExecutions.minTime === Infinity) {
            lines.push(`  Min Time: N/A`);
        } else {
            lines.push(`  Min Time: ${stats.bindingExecutions.minTime.toFixed(2)}ms`);
        }
        
        return lines.join('\n');
    }
}


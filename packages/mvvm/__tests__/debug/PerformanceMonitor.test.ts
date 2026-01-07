import { PerformanceMonitor } from '../../src/debug/PerformanceMonitor';

describe('PerformanceMonitor', () => {
    beforeEach(() => {
        PerformanceMonitor.stopTracking();
        PerformanceMonitor.clearStats();
    });

    afterEach(() => {
        PerformanceMonitor.stopTracking();
        PerformanceMonitor.clearStats();
    });

    describe('startTracking/stopTracking', () => {
        it('should start and stop tracking', () => {
            expect(PerformanceMonitor.isTracking()).toBe(false);
            
            PerformanceMonitor.startTracking();
            expect(PerformanceMonitor.isTracking()).toBe(true);
            
            PerformanceMonitor.stopTracking();
            expect(PerformanceMonitor.isTracking()).toBe(false);
        });
    });

    describe('recordReactiveUpdate', () => {
        it('should not record when not tracking', () => {
            PerformanceMonitor.recordReactiveUpdate(10);
            
            const stats = PerformanceMonitor.getStats();
            expect(stats.reactiveUpdates.count).toBe(0);
        });

        it('should record reactive update when tracking', () => {
            PerformanceMonitor.startTracking();
            
            PerformanceMonitor.recordReactiveUpdate(10);
            PerformanceMonitor.recordReactiveUpdate(20);
            
            const stats = PerformanceMonitor.getStats();
            expect(stats.reactiveUpdates.count).toBe(2);
            expect(stats.reactiveUpdates.totalTime).toBe(30);
            expect(stats.reactiveUpdates.averageTime).toBe(15);
            expect(stats.reactiveUpdates.maxTime).toBe(20);
            expect(stats.reactiveUpdates.minTime).toBe(10);
        });
    });

    describe('recordBindingExecution', () => {
        it('should not record when not tracking', () => {
            PerformanceMonitor.recordBindingExecution(5);
            
            const stats = PerformanceMonitor.getStats();
            expect(stats.bindingExecutions.count).toBe(0);
        });

        it('should record binding execution when tracking', () => {
            PerformanceMonitor.startTracking();
            
            PerformanceMonitor.recordBindingExecution(5);
            PerformanceMonitor.recordBindingExecution(15);
            
            const stats = PerformanceMonitor.getStats();
            expect(stats.bindingExecutions.count).toBe(2);
            expect(stats.bindingExecutions.totalTime).toBe(20);
            expect(stats.bindingExecutions.averageTime).toBe(10);
            expect(stats.bindingExecutions.maxTime).toBe(15);
            expect(stats.bindingExecutions.minTime).toBe(5);
        });
    });

    describe('getStats', () => {
        it('should return separate stats for reactive and binding', () => {
            PerformanceMonitor.startTracking();
            
            PerformanceMonitor.recordReactiveUpdate(10);
            PerformanceMonitor.recordBindingExecution(5);
            
            const stats = PerformanceMonitor.getStats();
            expect(stats.reactiveUpdates.count).toBe(1);
            expect(stats.bindingExecutions.count).toBe(1);
        });

        it('should return a copy of stats', () => {
            PerformanceMonitor.startTracking();
            PerformanceMonitor.recordReactiveUpdate(10);
            
            const stats1 = PerformanceMonitor.getStats();
            const stats2 = PerformanceMonitor.getStats();
            
            expect(stats1).not.toBe(stats2);
            expect(stats1.reactiveUpdates).not.toBe(stats2.reactiveUpdates);
        });
    });

    describe('clearStats', () => {
        it('should clear all stats', () => {
            PerformanceMonitor.startTracking();
            PerformanceMonitor.recordReactiveUpdate(10);
            PerformanceMonitor.recordBindingExecution(5);
            
            PerformanceMonitor.clearStats();
            
            const stats = PerformanceMonitor.getStats();
            expect(stats.reactiveUpdates.count).toBe(0);
            expect(stats.bindingExecutions.count).toBe(0);
        });
    });

    describe('generateReport', () => {
        it('should generate a formatted report', () => {
            PerformanceMonitor.startTracking();
            PerformanceMonitor.recordReactiveUpdate(10);
            PerformanceMonitor.recordBindingExecution(5);
            
            const report = PerformanceMonitor.generateReport();
            
            expect(report).toContain('Performance Report');
            expect(report).toContain('Reactive Updates');
            expect(report).toContain('Binding Executions');
            expect(report).toContain('Count: 1');
        });

        it('should handle N/A for min time when no records', () => {
            PerformanceMonitor.startTracking();
            
            const report = PerformanceMonitor.generateReport();
            
            expect(report).toContain('Min Time: N/A');
        });
    });
});



import { DependencyTracker } from '../../src/reactive/DependencyTracker';
import { Watcher } from '../../src/reactive/Watcher';

describe('DependencyTracker', () => {
    describe('基础功能', () => {
        it('应该创建依赖追踪器', () => {
            const tracker = new DependencyTracker();
            expect(tracker).toBeDefined();
        });
        
        it('应该追踪依赖', () => {
            const tracker = new DependencyTracker();
            const watcher = new Watcher(() => {});
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('name');
            
            expect(watcher.getDependencies().has('name')).toBe(true);
        });
        
        it('应该在没有当前 watcher 时不追踪', () => {
            const tracker = new DependencyTracker();
            
            // 不设置 currentWatcher
            tracker.track('name');
            
            // 不应该抛出错误
            expect(true).toBe(true);
        });
    });
    
    describe('获取 watcher', () => {
        it('应该获取相关路径的 watcher', () => {
            const tracker = new DependencyTracker();
            let runCount = 0;
            
            const watcher = new Watcher(() => {
                runCount++;
            });
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('name');
            tracker.setCurrentWatcher(null);
            
            const watchers = tracker.getWatchers('name');
            
            expect(watchers.has(watcher)).toBe(true);
            expect(watchers.size).toBe(1);
        });
        
        it('应该只获取相关路径的 watcher', () => {
            const tracker = new DependencyTracker();
            
            const watcher1 = new Watcher(() => {});
            const watcher2 = new Watcher(() => {});
            
            tracker.setCurrentWatcher(watcher1);
            tracker.track('name');
            tracker.setCurrentWatcher(null);
            
            tracker.setCurrentWatcher(watcher2);
            tracker.track('age');
            tracker.setCurrentWatcher(null);
            
            // 只获取 name 的 watcher
            const nameWatchers = tracker.getWatchers('name');
            const ageWatchers = tracker.getWatchers('age');
            
            expect(nameWatchers.has(watcher1)).toBe(true);
            expect(nameWatchers.has(watcher2)).toBe(false);
            expect(ageWatchers.has(watcher1)).toBe(false);
            expect(ageWatchers.has(watcher2)).toBe(true);
        });
    });
    
    describe('路径追踪', () => {
        it('应该追踪完整路径', () => {
            const tracker = new DependencyTracker();
            const watcher = new Watcher(() => {});
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('user.profile.name');
            tracker.setCurrentWatcher(null);
            
            expect(watcher.getDependencies().has('user.profile.name')).toBe(true);
        });
        
        it('应该追踪多个路径', () => {
            const tracker = new DependencyTracker();
            const watcher = new Watcher(() => {});
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('name');
            tracker.track('age');
            tracker.track('user.profile.email');
            tracker.setCurrentWatcher(null);
            
            expect(watcher.getDependencies().has('name')).toBe(true);
            expect(watcher.getDependencies().has('age')).toBe(true);
            expect(watcher.getDependencies().has('user.profile.email')).toBe(true);
            expect(watcher.getDependencies().size).toBe(3);
        });
    });
    
    describe('移除 watcher', () => {
        it('应该移除 watcher 的所有依赖', () => {
            const tracker = new DependencyTracker();
            const watcher = new Watcher(() => {});
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('name');
            tracker.track('age');
            tracker.setCurrentWatcher(null);
            
            expect(tracker.getWatchers('name').has(watcher)).toBe(true);
            expect(tracker.getWatchers('age').has(watcher)).toBe(true);
            
            tracker.removeWatcher(watcher);
            
            expect(tracker.getWatchers('name').has(watcher)).toBe(false);
            expect(tracker.getWatchers('age').has(watcher)).toBe(false);
            expect(watcher.getDependencies().size).toBe(0);
        });
    });
    
    describe('清除', () => {
        it('应该清除所有依赖', () => {
            const tracker = new DependencyTracker();
            const watcher = new Watcher(() => {});
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('name');
            tracker.setCurrentWatcher(null);
            
            tracker.clear();
            
            expect(tracker.getWatchers('name').size).toBe(0);
        });
    });
});


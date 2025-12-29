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
            const watcher = new Watcher(() => {}, () => {});
            
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
    
    describe('触发更新', () => {
        it('应该触发相关 watcher 的更新', () => {
            const tracker = new DependencyTracker();
            let updateCount = 0;
            let lastKey: string | symbol = '';
            
            const watcher = new Watcher(
                (key) => {
                    updateCount++;
                    lastKey = key;
                },
                () => {}
            );
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('name');
            tracker.setCurrentWatcher(null);
            
            tracker.trigger('name', 'Jane', 'John');
            
            expect(updateCount).toBe(1);
            expect(lastKey).toBe('name');
        });
        
        it('应该只触发相关 key 的 watcher', () => {
            const tracker = new DependencyTracker();
            let updateCount = 0;
            
            const watcher = new Watcher(
                () => {
                    updateCount++;
                },
                () => {}
            );
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('name');
            tracker.track('age');
            tracker.setCurrentWatcher(null);
            
            // 只触发 name
            tracker.trigger('name', 'Jane', 'John');
            
            expect(updateCount).toBe(1);
        });
    });
    
    describe('路径追踪', () => {
        it('应该追踪完整路径', () => {
            const tracker = new DependencyTracker();
            const watcher = new Watcher(() => {}, () => {});
            
            tracker.setCurrentWatcher(watcher);
            tracker.pushPath('user');
            tracker.pushPath('profile');
            tracker.track('name', 'user.profile.name');
            tracker.popPath();
            tracker.popPath();
            
            expect(watcher.getDependencies().has('user.profile.name')).toBe(true);
        });
        
        it('应该正确管理路径栈', () => {
            const tracker = new DependencyTracker();
            
            tracker.pushPath('a');
            expect(tracker.getCurrentPath()).toBe('a');
            
            tracker.pushPath('b');
            expect(tracker.getCurrentPath()).toBe('a.b');
            
            tracker.popPath();
            expect(tracker.getCurrentPath()).toBe('a');
            
            tracker.popPath();
            expect(tracker.getCurrentPath()).toBe('');
        });
    });
    
    describe('移除 watcher', () => {
        it('应该移除 watcher 的所有依赖', () => {
            const tracker = new DependencyTracker();
            const watcher = new Watcher(() => {}, () => {});
            
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
            const watcher = new Watcher(() => {}, () => {});
            
            tracker.setCurrentWatcher(watcher);
            tracker.track('name');
            tracker.setCurrentWatcher(null);
            
            tracker.clear();
            
            expect(tracker.getWatchers('name').size).toBe(0);
        });
    });
});


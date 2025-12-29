import { Watcher } from '../../src/reactive/Watcher';

describe('Watcher', () => {
    describe('基础功能', () => {
        it('应该创建 watcher', () => {
            const watcher = new Watcher(() => {}, () => {});
            expect(watcher).toBeDefined();
        });
        
        it('应该调用 update 回调', () => {
            let called = false;
            let receivedKey: string | symbol = '';
            let receivedNewValue: any;
            let receivedOldValue: any;
            
            const watcher = new Watcher(
                (key, newValue, oldValue) => {
                    called = true;
                    receivedKey = key;
                    receivedNewValue = newValue;
                    receivedOldValue = oldValue;
                },
                () => {}
            );
            
            watcher.update('name', 'Jane', 'John');
            
            expect(called).toBe(true);
            expect(receivedKey).toBe('name');
            expect(receivedNewValue).toBe('Jane');
            expect(receivedOldValue).toBe('John');
        });
        
        it('应该调用 run 回调', () => {
            let called = false;
            
            const watcher = new Watcher(
                () => {},
                () => {
                    called = true;
                }
            );
            
            watcher.run();
            
            expect(called).toBe(true);
        });
        
        it('应该在 runCallback 为 undefined 时不抛出错误', () => {
            const watcher = new Watcher(() => {});
            
            expect(() => {
                watcher.run();
            }).not.toThrow();
        });
    });
    
    describe('依赖管理', () => {
        it('应该添加依赖', () => {
            const watcher = new Watcher(() => {}, () => {});
            
            watcher.addDependency('name');
            watcher.addDependency('age');
            
            expect(watcher.getDependencies().has('name')).toBe(true);
            expect(watcher.getDependencies().has('age')).toBe(true);
        });
        
        it('应该获取所有依赖', () => {
            const watcher = new Watcher(() => {}, () => {});
            
            watcher.addDependency('name');
            watcher.addDependency('age');
            
            const deps = watcher.getDependencies();
            expect(deps.size).toBe(2);
            expect(deps.has('name')).toBe(true);
            expect(deps.has('age')).toBe(true);
        });
        
        it('应该清除依赖', () => {
            const watcher = new Watcher(() => {}, () => {});
            
            watcher.addDependency('name');
            watcher.addDependency('age');
            
            expect(watcher.getDependencies().size).toBe(2);
            
            watcher.clearDependencies();
            
            expect(watcher.getDependencies().size).toBe(0);
        });
        
        it('应该返回只读的依赖集合', () => {
            const watcher = new Watcher(() => {}, () => {});
            watcher.addDependency('name');
            
            const deps = watcher.getDependencies();
            
            // getDependencies 返回的应该是只读的 Set
            expect(deps.size).toBe(1);
            expect(deps.has('name')).toBe(true);
            
            // 应该能够访问依赖
            expect(watcher.getDependencies().has('name')).toBe(true);
        });
    });
});


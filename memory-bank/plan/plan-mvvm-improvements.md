# PLAN: MVVM 框架改进实施计划

## 📋 计划概览

基于 CREATIVE 设计审查，制定分阶段实施计划，改进 MVVM 框架的核心功能和性能。

## 🎯 总体目标

1. **激活依赖追踪系统** - 实现精确的依赖追踪，提升性能
2. **改进 Computed 实现** - 实现精确更新，减少不必要的计算
3. **优化批量更新机制** - 实现真正的批量更新，避免重复调用
4. **增强类型安全** - 提供类型安全的路径访问
5. **改进 API 设计** - 提供更简洁、声明式的 API
6. **增强错误处理** - 提供更完善的错误处理和恢复机制

## 📅 实施阶段

### 阶段 1: 核心改进（高优先级）⏱️ 4-6 小时

#### 任务 1.1: 激活依赖追踪系统

**目标**：实现精确的依赖追踪，只有相关的 watcher 收到通知

**技术方案**：

1. **修改 Reactive.ts**
   ```typescript
   // 添加 DependencyTracker
   private dependencyTracker: DependencyTracker;
   
   constructor(value: T) {
       this._value = value;
       this.dependencyTracker = new DependencyTracker(); // ✅ 激活
       this._proxy = this._createProxy(value);
   }
   
   // 在 get 拦截器中收集依赖
   get: (obj, key) => {
       const value = Reflect.get(obj, key);
       
       // ✅ 依赖收集
       this.dependencyTracker.track(key);
       
       if (value !== null && typeof value === 'object') {
           return this._createProxy(value as any);
       }
       return value;
   }
   
   // 在 set 拦截器中触发更新
   set: (obj, key, value) => {
       // ...
       // ✅ 使用依赖追踪器精确通知
       this.dependencyTracker.trigger(key, newValue, oldValue);
       // ...
   }
   ```

2. **修改 watch() 方法**
   ```typescript
   watch(watcher: Watcher): () => void {
       this.watchers.add(watcher);
       
       // ✅ 设置当前 watcher 以收集依赖
       this.dependencyTracker.setCurrentWatcher(watcher);
       
       try {
           // 执行一次以收集依赖
           watcher.run();
       } finally {
           // 清除当前 watcher
           this.dependencyTracker.setCurrentWatcher(null);
       }
       
       return () => this.unwatch(watcher);
   }
   ```

3. **修改 _triggerUpdate() 方法**
   ```typescript
   private _triggerUpdate(key: string | symbol, newValue: any, oldValue: any): void {
       // ✅ 使用依赖追踪器精确通知
       this.dependencyTracker.trigger(key, newValue, oldValue);
       
       // 保留批量更新机制
       this._batchUpdate(() => {
           // 批量更新逻辑
       });
   }
   ```

4. **修改 unwatch() 方法**
   ```typescript
   unwatch(watcher: Watcher): void {
       this.watchers.delete(watcher);
       // ✅ 从依赖追踪器中移除
       this.dependencyTracker.removeWatcher(watcher);
   }
   ```

**测试要点**：
- ✅ 测试精确依赖追踪（只有相关 watcher 收到通知）
- ✅ 测试性能提升（减少不必要的更新）
- ✅ 测试向后兼容性（现有代码正常工作）

**风险控制**：
- 保留原有 watchers Set，作为备用
- 分步实施，每步都进行测试
- 添加特性开关（可选）

#### 任务 1.2: 改进 Computed 实现

**目标**：实现精确的依赖追踪，只有依赖的属性变化时才重新计算

**技术方案**：

1. **修改 Reactive.ts 暴露 dependencyTracker**
   ```typescript
   // 添加 getter 或方法
   get dependencyTracker(): DependencyTracker {
       return this.dependencyTracker;
   }
   // 或者
   getDependencyTracker(): DependencyTracker {
       return this.dependencyTracker;
   }
   ```

2. **修改 Computed.ts**
   ```typescript
   get value(): T {
       if (!this._cached) {
           // ✅ 设置当前 watcher 以收集依赖
           const tracker = (this.reactive as any).dependencyTracker;
           if (tracker) {
               tracker.setCurrentWatcher(this.watcher);
           }
           
           try {
               this._compute();
           } finally {
               if (tracker) {
                   tracker.setCurrentWatcher(null);
               }
           }
       }
       return this._value;
   }
   
   // 修改 Watcher 回调
   private _setupWatcher(): void {
       this.watcher = new Watcher(
           (key, newValue, oldValue) => {
               // ✅ 只处理收集到的依赖
               if (this.watcher.getDependencies().has(key)) {
                   this._cached = false;
               }
           },
           () => {
               // 重新计算
               this._cached = false;
           }
       );
   }
   ```

**测试要点**：
- ✅ 测试只依赖的属性变化时重新计算
- ✅ 测试不相关的属性变化时不重新计算
- ✅ 测试性能提升

**依赖**：任务 1.1（依赖追踪系统）

### 阶段 2: 性能优化（中优先级）⏱️ 1-2 小时

#### 任务 2.1: 改进批量更新机制

**目标**：实现真正的批量更新，避免重复调用

**技术方案**：

1. **添加更新队列**
   ```typescript
   // Reactive.ts
   private updateQueue: Set<Watcher> = new Set();
   private flushScheduled: boolean = false;
   ```

2. **修改 _triggerUpdate() 方法**
   ```typescript
   private _triggerUpdate(key: string | symbol, newValue: any, oldValue: any): void {
       // 使用依赖追踪器获取相关的 watcher
       const watchers = this.dependencyTracker.getWatchers(key);
       
       // ✅ 添加到更新队列（自动去重）
       watchers.forEach(watcher => {
           this.updateQueue.add(watcher);
       });
       
       // ✅ 延迟批量更新
       this._scheduleFlush();
   }
   
   private _scheduleFlush(): void {
       if (this.flushScheduled) {
           return;
       }
       
       this.flushScheduled = true;
       Promise.resolve().then(() => {
           this._flushUpdates();
       });
   }
   ```

3. **改进 _flushUpdates() 方法**
   ```typescript
   private _flushUpdates(): void {
       this.flushScheduled = false;
       
       // ✅ 收集需要更新的 watcher（去重）
       const watchersToUpdate = new Set(this.updateQueue);
       this.updateQueue.clear();
       
       // 批量更新
       watchersToUpdate.forEach(watcher => {
           watcher.run();
       });
   }
   ```

**测试要点**：
- ✅ 测试去重机制（同一个 watcher 只调用一次）
- ✅ 测试批量更新性能
- ✅ 测试更新顺序

**依赖**：任务 1.1（依赖追踪系统）

### 阶段 3: 开发体验改进（中优先级）⏱️ 3-4 小时

#### 任务 3.1: 增强类型安全

**目标**：提供类型安全的路径访问

**技术方案**：

1. **创建路径类型工具**
   ```typescript
   // types.ts
   type Path<T> = T extends object
       ? {
             [K in keyof T]: K extends string
                 ? T[K] extends object
                     ? T[K] extends any[]
                         ? K | `${K}.${number}`
                         : K | `${K}.${Path<T[K]>}`
                     : K
                 : never;
         }[keyof T]
       : never;
   
   type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
       ? K extends keyof T
           ? Rest extends Path<T[K]>
               ? PathValue<T[K], Rest>
               : never
           : never
       : P extends keyof T
       ? T[P]
       : never;
   ```

2. **修改 ViewModel.bind() 方法**
   ```typescript
   // ViewModel.ts
   bind<TPath extends Path<T> = Path<T>>(
       path: TPath,
       view: IView,
       options?: BindingOptions<PathValue<T, TPath>, any>
   ): DataBinding<T, PathValue<T, TPath>, any> {
       // ...
   }
   ```

**测试要点**：
- ✅ 测试路径类型检查
- ✅ 测试 IDE 自动补全
- ✅ 测试编译时错误

**风险**：
- ⚠️ TypeScript 版本要求较高（4.1+）
- ⚠️ 类型复杂度增加

### 阶段 4: API 增强（低优先级）⏱️ 4-6 小时

#### 任务 4.1: 改进 API 设计

**技术方案**：

1. **实现 bindMany() 方法**
   ```typescript
   // ViewModel.ts
   bindMany(bindings: Record<string, {
       view: IView;
       path?: string;
       options?: BindingOptions;
   }>): Map<string, DataBinding<T, any, any>> {
       const result = new Map();
       Object.entries(bindings).forEach(([key, config]) => {
           const binding = this.bind(config.path || key, config.view, config.options);
           result.set(key, binding);
       });
       return result;
   }
   ```

2. **实现 bindConfig() 方法**
   ```typescript
   // ViewModel.ts
   bindConfig(config: BindingConfig<T>): void {
       // 根据配置自动创建绑定
   }
   ```

#### 任务 4.2: 增强错误处理

**技术方案**：

1. **扩展错误类型**
   ```typescript
   // types.ts
   export class ValidationError extends MVVMError {
       constructor(message: string, public path: string, public value: any) {
           super(message);
           this.name = 'ValidationError';
       }
   }
   
   export class PathError extends MVVMError {
       constructor(message: string, public path: string) {
           super(message);
           this.name = 'PathError';
       }
   }
   ```

2. **添加错误恢复机制**
   ```typescript
   // types.ts
   export interface BindingOptions<TValue = any, TViewValue = any> {
       // ... 现有选项
       onError?: (error: Error, path: string, value: any) => void;
   }
   ```

## 🔄 实施顺序

### 推荐顺序（最小风险）

1. **阶段 1.1** → 激活依赖追踪系统（基础）
2. **阶段 1.2** → 改进 Computed 实现（依赖阶段 1.1）
3. **阶段 2.1** → 改进批量更新机制（依赖阶段 1.1）
4. **阶段 3.1** → 增强类型安全（可选，独立）
5. **阶段 4.1** → 改进 API 设计（可选，独立）
6. **阶段 4.2** → 增强错误处理（可选，独立）

### 并行实施

- 阶段 3.1、4.1、4.2 可以并行实施（互不依赖）

## ✅ 验收标准

### 功能验收
- ✅ 依赖追踪系统正常工作
- ✅ Computed 精确更新正常工作
- ✅ 批量更新机制正常工作
- ✅ 类型安全正常工作（如果实施）
- ✅ 新 API 正常工作（如果实施）
- ✅ 错误处理正常工作（如果实施）

### 性能验收
- ✅ 依赖追踪性能提升（减少不必要的更新）
- ✅ Computed 性能提升（减少不必要的计算）
- ✅ 批量更新性能提升（减少重复调用）

### 兼容性验收
- ✅ 现有代码无需修改即可使用
- ✅ 现有功能正常工作
- ✅ 新功能可选使用

## 📝 实施检查清单

### 阶段 1.1: 激活依赖追踪系统
- [ ] 在 Reactive 构造函数中初始化 DependencyTracker
- [ ] 在 get 拦截器中调用 track()
- [ ] 在 set 拦截器中调用 trigger()
- [ ] 修改 watch() 方法支持依赖收集
- [ ] 修改 unwatch() 方法调用 removeWatcher()
- [ ] 修改 _triggerUpdate() 使用依赖追踪
- [ ] 编写单元测试
- [ ] 测试向后兼容性
- [ ] 性能测试

### 阶段 1.2: 改进 Computed 实现
- [ ] 在 Reactive 中暴露 dependencyTracker
- [ ] 修改 Computed.value getter 收集依赖
- [ ] 修改 Watcher 回调检查依赖
- [ ] 编写单元测试
- [ ] 测试精确更新
- [ ] 性能测试

### 阶段 2.1: 改进批量更新机制
- [ ] 添加更新队列
- [ ] 修改 _triggerUpdate() 使用队列
- [ ] 改进 _flushUpdates() 方法
- [ ] 编写单元测试
- [ ] 测试去重机制
- [ ] 性能测试

### 阶段 3.1: 增强类型安全
- [ ] 创建 Path 类型工具
- [ ] 创建 PathValue 类型工具
- [ ] 修改 ViewModel.bind() 类型签名
- [ ] 更新相关类型
- [ ] 编写类型测试
- [ ] 测试 IDE 支持

### 阶段 4.1: 改进 API 设计
- [ ] 实现 bindMany() 方法
- [ ] 实现 bindConfig() 方法
- [ ] 更新文档
- [ ] 编写单元测试
- [ ] 测试向后兼容性

### 阶段 4.2: 增强错误处理
- [ ] 扩展错误类型
- [ ] 添加错误恢复机制
- [ ] 改进错误信息
- [ ] 编写单元测试
- [ ] 测试错误场景

## 🚨 风险控制

### 高风险任务
1. **阶段 1.1**: 激活依赖追踪系统
   - 风险：可能影响现有功能
   - 缓解：充分测试，分步实施
   - 回滚：保留原有代码，使用特性开关

2. **阶段 1.2**: 改进 Computed 实现
   - 风险：需要修改 Reactive 接口
   - 缓解：添加新方法而非修改现有方法
   - 回滚：保留原有实现

### 中风险任务
3. **阶段 3.1**: 增强类型安全
   - 风险：可能影响现有代码
   - 缓解：使用可选类型参数，保持向后兼容
   - 回滚：类型参数可选，不影响现有代码

### 低风险任务
4. **阶段 4.1、4.2**: API 增强和错误处理
   - 风险：新增功能，不影响现有代码
   - 缓解：充分测试
   - 回滚：移除新功能即可

## 📊 进度跟踪

### 当前状态
- ✅ CREATIVE 设计审查完成
- ✅ PLAN 实施计划制定完成
- ⏳ 等待开始实施

### 下一步
1. 开始阶段 1.1: 激活依赖追踪系统
2. 完成阶段 1.1 后，开始阶段 1.2
3. 完成阶段 1.2 后，开始阶段 2.1
4. 根据优先级和需求，选择实施阶段 3、4


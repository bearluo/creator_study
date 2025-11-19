/**
 * 装饰器工具
 */

/**
 * TryCatch装饰器使用示例:
 * ```ts
 * class DataService {
 *     // 当方法抛出异常时，返回默认值 'default value'
 *     @TryCatch('default value')
 *     fetchData() {
 *         // 模拟一个可能会抛出异常的操作
 *         if (Math.random() > 0.5) {
 *             throw new Error('网络请求失败');
 *         }
 *         return '数据获取成功';
 *     }
 * 
 *     // 也可以返回一个对象作为默认值
 *     @TryCatch({ code: -1, msg: '请求失败', data: null })
 *     getUserInfo(userId: string) {
 *         // 业务逻辑...
 *         throw new Error('用户不存在');
 *     }
 * }
 */
/**
 * try catch 装饰器
 * @param ret 当方法抛出异常时的返回值
 * @returns 装饰器函数
 */
export const TryCatch = function (ret: any) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            try {
                return originalMethod.apply(this, args);
            } catch (error) {
                return ret;
            }
        };
        return descriptor;
    };
};

/**
 * 延迟执行装饰器
 * 将方法调用延迟到下一个事件循环执行
 * 
 * @example
 * ```ts
 * class MyClass {
 *     @Delay()
 *     updateUI() {
 *         // 这个方法会在下一个事件循环中执行
 *         console.log('UI updated');
 *     }
 * }
 * ```
 */
export const Delay = function () {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            setTimeout(() => {
                originalMethod.apply(this, args);
            }, 0);
        };
        return descriptor;
    };
};

/**
 * 防抖装饰器
 * 在指定时间内，如果方法被多次调用，只执行最后一次
 * 
 * @param delay 延迟时间（毫秒）
 * @example
 * ```ts
 * class MyClass {
 *     @Debounce(300)
 *     handleInput(value: string) {
 *         // 输入停止 300ms 后才执行
 *         console.log('Input:', value);
 *     }
 * }
 * ```
 */
export const Debounce = function (delay: number = 300) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        
        descriptor.value = function (...args: any[]) {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                originalMethod.apply(this, args);
                timeoutId = null;
            }, delay);
        };
        return descriptor;
    };
};

/**
 * 节流装饰器
 * 在指定时间内，方法最多执行一次
 * 
 * @param delay 延迟时间（毫秒）
 * @example
 * ```ts
 * class MyClass {
 *     @Throttle(1000)
 *     handleScroll() {
 *         // 每秒最多执行一次
 *         console.log('Scroll handled');
 *     }
 * }
 * ```
 */
export const Throttle = function (delay: number = 300) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        let lastCallTime = 0;
        
        descriptor.value = function (...args: any[]) {
            const now = Date.now();
            if (now - lastCallTime >= delay) {
                originalMethod.apply(this, args);
                lastCallTime = now;
            }
        };
        return descriptor;
    };
};


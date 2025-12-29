/**
 * @bl-framework/core Promise 扩展使用示例
 */

import {
    withTimeout,
    createCancelToken,
    delay,
    TimeoutError,
    CancellationError
} from '@bl-framework/core';

// ==================== withTimeout 示例 ====================

console.log('=== withTimeout 示例 ===');

// 示例 1: 基础用法
async function example1() {
    console.log('\n1. 基础用法 - 正常完成');
    
    const fastOperation = () => delay(100, '快速完成');
    
    try {
        const result = await withTimeout(fastOperation(), 5000);
        console.log('结果:', result); // '快速完成'
    } catch (error) {
        console.error('错误:', error);
    }
}

// 示例 2: 超时情况
async function example2() {
    console.log('\n2. 超时情况');
    
    const slowOperation = () => delay(5000, '慢速完成');
    
    try {
        const result = await withTimeout(slowOperation(), 1000, '操作超时');
        console.log('结果:', result);
    } catch (error) {
        if (error instanceof TimeoutError) {
            console.log('操作超时:', error.message); // '操作超时'
        } else {
            console.error('其他错误:', error);
        }
    }
}

// 示例 3: 自定义错误消息
async function example3() {
    console.log('\n3. 自定义错误消息');
    
    const slowOperation = () => delay(5000, '慢速完成');
    
    try {
        const result = await withTimeout(
            slowOperation(),
            1000,
            '请求超时，请稍后重试'
        );
        console.log('结果:', result);
    } catch (error) {
        if (error instanceof TimeoutError) {
            console.log('超时错误:', error.message); // '请求超时，请稍后重试'
        }
    }
}

// ==================== CancelToken 示例 ====================

console.log('\n=== CancelToken 示例 ===');

// 示例 4: 基础取消
async function example4() {
    console.log('\n4. 基础取消');
    
    const { token, cancel } = createCancelToken();
    
    const cancellableOperation = (token: any) => {
        return new Promise((resolve, reject) => {
            token.onCancel((reason: any) => {
                reject(new CancellationError(reason));
            });
            
            // 模拟长时间操作
            const timeoutId = setTimeout(() => {
                resolve('操作完成');
            }, 5000);
            
            // 如果取消，清理定时器
            token.onCancel(() => {
                clearTimeout(timeoutId);
            });
        });
    };
    
    // 2 秒后取消
    setTimeout(() => {
        cancel('用户取消');
    }, 2000);
    
    try {
        const result = await cancellableOperation(token);
        console.log('结果:', result);
    } catch (error) {
        if (error instanceof CancellationError) {
            console.log('操作已取消:', error.reason); // '用户取消'
        } else {
            console.error('其他错误:', error);
        }
    }
}

// 示例 5: 取消原因
async function example5() {
    console.log('\n5. 取消原因');
    
    const { token, cancel } = createCancelToken();
    
    const operation = (token: any) => {
        return new Promise((resolve, reject) => {
            token.onCancel((reason: any) => {
                reject(new CancellationError(reason));
            });
            
            setTimeout(() => resolve('完成'), 5000);
        });
    };
    
    setTimeout(() => {
        cancel({ code: 'USER_CANCELLED', message: '用户主动取消' });
    }, 1000);
    
    try {
        await operation(token);
    } catch (error) {
        if (error instanceof CancellationError) {
            console.log('取消原因:', error.reason);
            // { code: 'USER_CANCELLED', message: '用户主动取消' }
        }
    }
}

// 示例 6: 检查是否已取消
async function example6() {
    console.log('\n6. 检查是否已取消');
    
    const { token, cancel } = createCancelToken();
    
    // 立即取消
    cancel('立即取消');
    
    console.log('是否已取消:', token.cancelled); // true
    console.log('取消原因:', token.reason); // '立即取消'
    
    // 取消后注册回调，会立即执行
    token.onCancel((reason) => {
        console.log('回调执行:', reason); // '立即取消'
    });
}

// ==================== delay 示例 ====================

console.log('\n=== delay 示例 ===');

// 示例 7: 基础延迟
async function example7() {
    console.log('\n7. 基础延迟');
    
    console.log('开始延迟...');
    await delay(1000);
    console.log('延迟完成');
}

// 示例 8: 延迟后返回值
async function example8() {
    console.log('\n8. 延迟后返回值');
    
    const result = await delay(1000, 'Hello');
    console.log('结果:', result); // 'Hello'
}

// 示例 9: 延迟对象
async function example9() {
    console.log('\n9. 延迟对象');
    
    const result = await delay(1000, { name: 'World', value: 42 });
    console.log('结果:', result); // { name: 'World', value: 42 }
}

// ==================== 组合使用示例 ====================

console.log('\n=== 组合使用示例 ===');

// 示例 10: 带超时的延迟
async function example10() {
    console.log('\n10. 带超时的延迟');
    
    try {
        const result = await withTimeout(delay(5000, '完成'), 2000);
        console.log('结果:', result);
    } catch (error) {
        if (error instanceof TimeoutError) {
            console.log('延迟超时');
        }
    }
}

// 示例 11: 可取消的延迟操作
async function example11() {
    console.log('\n11. 可取消的延迟操作');
    
    const { token, cancel } = createCancelToken();
    
    const cancellableDelay = (ms: number, token: any) => {
        return new Promise((resolve, reject) => {
            token.onCancel((reason: any) => {
                reject(new CancellationError(reason));
            });
            
            const timeoutId = setTimeout(() => {
                resolve('延迟完成');
            }, ms);
            
            token.onCancel(() => {
                clearTimeout(timeoutId);
            });
        });
    };
    
    // 1 秒后取消
    setTimeout(() => {
        cancel('取消延迟');
    }, 1000);
    
    try {
        const result = await cancellableDelay(5000, token);
        console.log('结果:', result);
    } catch (error) {
        if (error instanceof CancellationError) {
            console.log('延迟已取消:', error.reason);
        }
    }
}

// ==================== 运行所有示例 ====================

async function runAllExamples() {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();
    await example6();
    await example7();
    await example8();
    await example9();
    await example10();
    await example11();
    
    console.log('\n=== 所有示例完成 ===');
}

// 取消注释以运行示例
// runAllExamples().catch(console.error);

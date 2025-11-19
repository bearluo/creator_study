/**
 * @bl-framework/core 基础使用示例
 */

import { 
    FWPath, 
    Log, 
    log, 
    setLogConfig, 
    LogLevel,
    TryCatch,
    Debounce,
    Throttle,
    FWEventDispatcher,
    EventMap
} from '@bl-framework/core';

// ==================== FWPath 使用示例 ====================

console.log('=== FWPath 示例 ===');

// 拼接路径
const path1 = FWPath.join('assets', 'images', 'logo.png');
console.log('拼接路径:', path1); // assets/images/logo.png

// 获取扩展名
const ext = FWPath.getExtension('logo.png');
console.log('文件扩展名:', ext); // .png

// ==================== FWLog 使用示例 ====================

console.log('\n=== FWLog 示例 ===');

// 配置日志级别
setLogConfig({ level: LogLevel.DEBUG });

// 使用类方法
Log.debug('这是调试信息');
Log.info('这是普通信息');
Log.warn('这是警告信息');
Log.error('这是错误信息');

// 使用默认导出
log.debug('使用 log 导出');

// 带堆栈的错误日志
try {
    throw new Error('测试错误');
} catch (error) {
    Log.errorWithStack(error as Error, '捕获到错误');
}

// ==================== FWDecorator 使用示例 ====================

console.log('\n=== FWDecorator 示例 ===');

class DataService {
    private callCount = 0;

    @TryCatch('default value')
    fetchData(): string {
        this.callCount++;
        if (this.callCount === 1) {
            throw new Error('网络错误');
        }
        return '数据获取成功';
    }

    @Debounce(300)
    handleInput(value: string): void {
        console.log('处理输入:', value);
    }

    @Throttle(1000)
    handleScroll(): void {
        console.log('处理滚动');
    }
}

const service = new DataService();

// TryCatch 示例
console.log('第一次调用（会抛出异常）:', service.fetchData()); // 'default value'
console.log('第二次调用（成功）:', service.fetchData()); // '数据获取成功'

// Debounce 示例（需要在实际环境中测试）
// service.handleInput('test1');
// service.handleInput('test2');
// service.handleInput('test3');
// 只有最后一次调用会在 300ms 后执行

// Throttle 示例（需要在实际环境中测试）
// 快速调用多次，但每秒最多执行一次
// for (let i = 0; i < 10; i++) {
//     service.handleScroll();
// }

// ==================== FWEventDispatcher 使用示例 ====================

console.log('\n=== FWEventDispatcher 示例 ===');

// 定义事件类型
interface GameEvents extends EventMap {
    'player:move': [x: number, y: number];
    'player:attack': [target: string, damage: number];
    'game:over': [score: number];
}

// 创建事件分发器
const dispatcher = new FWEventDispatcher<GameEvents>();

// 监听事件
dispatcher.on('player:move', (x, y) => {
    console.log(`玩家移动到: (${x}, ${y})`);
});

dispatcher.on('player:attack', (target, damage) => {
    console.log(`玩家攻击 ${target}，造成 ${damage} 点伤害`);
});

// 一次性监听
dispatcher.once('game:over', (score) => {
    console.log(`游戏结束，得分: ${score}`);
});

// 触发事件
dispatcher.emit('player:move', 100, 200);
dispatcher.emit('player:attack', '敌人A', 50);
dispatcher.emit('game:over', 1000);
dispatcher.emit('game:over', 2000); // 不会触发，因为是一次性监听

// 移除监听
const moveHandler = (x: number, y: number) => {
    console.log('移动处理:', x, y);
};
dispatcher.on('player:move', moveHandler);
dispatcher.off('player:move', moveHandler);

console.log('\n=== 示例完成 ===');


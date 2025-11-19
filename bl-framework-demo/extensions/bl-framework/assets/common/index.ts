/**
 * Common utilities
 * 
 * Re-export from @bl-framework/core
 * UMD 格式，防止被 default 包装
 */

// 使用 import * as 导入，然后解包 default（如果存在）
import * as coreModule from '@bl-framework/core';

// 解包 default 包装（UMD/CommonJS 模块可能被包装）
const core = (coreModule as any).default || coreModule;

// 重新导出所有内容（使用 Object.keys 动态导出）
for (const key in core) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(core, key)) {
        (exports as any)[key] = core[key];
    }
}

// 类型导出（类型不会被 default 包装）
export type {
    LogConfig,
} from '@bl-framework/core';


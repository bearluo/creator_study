/**
 * ViewTarget 辅助函数
 * 
 * 提供类型安全的视图目标创建函数
 */
import { Label, ProgressBar, EditBox, Toggle, Slider, Node } from 'cc';
import type { ViewTarget } from '../types/view-target';

/**
 * EditBox 事件类型
 */
type EditBoxEventType = typeof EditBox.EventType[keyof typeof EditBox.EventType];

/**
 * 创建 Label 目标适配器（字符串，强类型）
 */
export function toLabelText(label: Label | null): ViewTarget<string> {
    if (!label) {
        throw new Error('[toLabelText] Label is null');
    }
    return {
        set: (value: string) => {
            label.string = value;
        },
        get: () => label.string
    };
}

/**
 * 创建 Label 目标适配器（带格式化，只 set，不 get）
 */
export function toLabelFmt<T>(label: Label | null, fmt: (v: T) => string): ViewTarget<T> {
    if (!label) {
        throw new Error('[toLabelFmt] Label is null');
    }
    return {
        set: (value: T) => {
            label.string = fmt(value);
        }
        // 不提供 get，避免类型污染
    };
}

/**
 * 创建 ProgressBar 目标适配器
 */
export function toProgress(
    progressBar: ProgressBar | null,
    converter?: (value: number) => number
): ViewTarget<number> {
    if (!progressBar) {
        throw new Error('[toProgress] ProgressBar is null');
    }
    return {
        set: (value: number) => {
            progressBar.progress = converter ? converter(value) : value;
        },
        get: () => progressBar.progress
    };
}

/**
 * 创建 Node.active 目标适配器
 */
export function toActive(node: Node | null): ViewTarget<boolean> {
    if (!node) {
        throw new Error('[toActive] Node is null');
    }
    return {
        set: (value: boolean) => {
            node.active = value;
        },
        get: () => node.active
    };
}

/**
 * 创建 EditBox 目标适配器（支持 two-way）
 */
export function toEditBox(
    editBox: EditBox | null,
    options?: { event?: EditBoxEventType }
): ViewTarget<string> {
    if (!editBox) {
        throw new Error('[toEditBox] EditBox is null');
    }
    
    let silentDepth = 0;  // 静默保护：用计数器更稳
    
    return {
        set: (value: string) => {
            silentDepth++;
            try {
                editBox.string = value;
            } finally {
                silentDepth--;
            }
        },
        get: () => editBox.string,
        onChange: (callback: (value: string) => void) => {
            const eventType = options?.event || EditBox.EventType.EDITING_DID_ENDED;
            const handler = () => {
                if (silentDepth > 0) return;  // 静默保护
                callback(editBox.string);
            };
            editBox.node.on(eventType, handler);
            return () => {
                editBox.node.off(eventType, handler);
            };
        }
    };
}

/**
 * 创建 Toggle 目标适配器（支持 two-way）
 */
export function toToggle(toggle: Toggle | null): ViewTarget<boolean> {
    if (!toggle) {
        throw new Error('[toToggle] Toggle is null');
    }
    
    let silentDepth = 0;  // 静默保护：用计数器更稳
    
    return {
        set: (value: boolean) => {
            silentDepth++;
            try {
                toggle.isChecked = value;
            } finally {
                silentDepth--;
            }
        },
        get: () => toggle.isChecked,
        onChange: (callback: (value: boolean) => void) => {
            const handler = () => {
                if (silentDepth > 0) return;  // 静默保护
                callback(toggle.isChecked);
            };
            toggle.node.on(Toggle.EventType.TOGGLE, handler);
            return () => {
                toggle.node.off(Toggle.EventType.TOGGLE, handler);
            };
        }
    };
}

/**
 * 创建 Slider 目标适配器（支持 two-way）
 */
export function toSlider(slider: Slider | null): ViewTarget<number> {
    if (!slider) {
        throw new Error('[toSlider] Slider is null');
    }
    
    let silentDepth = 0;  // 静默保护：用计数器更稳
    
    return {
        set: (value: number) => {
            silentDepth++;
            try {
                slider.progress = value;
            } finally {
                silentDepth--;
            }
        },
        get: () => slider.progress,
        onChange: (callback: (value: number) => void) => {
            const handler = () => {
                if (silentDepth > 0) return;  // 静默保护
                callback(slider.progress);
            };
            // Slider 使用 'slide' 事件（不同版本可能不同，这里使用通用方式）
            slider.node.on('slide', handler);
            return () => {
                slider.node.off('slide', handler);
            };
        }
    };
}


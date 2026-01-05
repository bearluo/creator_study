/**
 * 绑定配置类型定义
 * 
 * 支持内置 helper（字符串字面量）和自定义 helper（直接传递 ViewTarget）
 */
import type { Path, PathValue } from '@bl-framework/mvvm';
import type { Label, EditBox, ProgressBar, Toggle, Slider, Node } from 'cc';
import type { ViewTarget } from './view-target';

type EditBoxEventType = typeof EditBox.EventType[keyof typeof EditBox.EventType];

/**
 * 绑定配置项（Discriminated Union - 编译期类型检查）
 * 
 * 每个 helper 对应不同的参数要求，TypeScript 会在编译期检查：
 * - toEditBox target 必须是 EditBox
 * - display helpers 只允许 one-way
 * - input helpers 允许 two-way / one-way-to-source
 * 
 * @template T 数据类型
 * @template P 数据路径类型
 */
export type BindingConfigItem<T, P extends Path<T> & string> =
    // Display targets（只支持 one-way）
    | {
          helper: 'toLabelText';
          target: Label | null;
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toProgress';
          target: ProgressBar | null;
          /**
           * 转换器（可选）
           * 
           * ⚠️ **重要**：
           * - converter 接收原始值（PathValue<T, P>），应当返回 0..1 的 ratio
           * - 如果数据本身就是 0..1，可以不传 converter（直接使用原始值）
           * - 如果数据是 0..max，需要 converter: (v) => v / max
           * - **规范**：helper 内部会 clamp 到 0..1 范围，确保 ProgressBar.progress 始终有效
           * - 开发者无需在 converter 中手动 clamp，但建议 converter 返回合理范围
           */
          converter?: (value: PathValue<T, P>) => number;
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toActive';
          target: Node | null;
          mode?: 'one-way';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    // Input targets（支持 two-way / one-way-to-source）
    | {
          helper: 'toEditBox';
          target: EditBox | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          event?: EditBoxEventType;
          reverseConverter?: (value: string) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toToggle';
          target: Toggle | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          reverseConverter?: (value: boolean) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    | {
          helper: 'toSlider';
          target: Slider | null;
          mode?: 'two-way' | 'one-way-to-source'; // 默认 two-way
          reverseConverter?: (value: number) => PathValue<T, P>;
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
      }
    // 直接传递 ViewTarget（自定义 helper）- 新增
    | {
          viewTarget: ViewTarget<any>;
          mode?: 'one-way' | 'two-way' | 'one-way-to-source';
          validator?: (value: PathValue<T, P>) => boolean;
          onError?: (error: Error, path: P, value: PathValue<T, P>) => void;
          // target 和 helper 都不需要
          // ⚠️ **责任边界**：viewTarget 是已经构造完成的 ViewTarget，不做 null 校验
      };

/**
 * 绑定配置项入口（按 path 自动推断 P，保持类型推断）
 * 
 * @template T 数据类型
 * @template P 数据路径类型（从 path 推断）
 * 
 * ⚠️ **类型推断关键**：使用 `BindingConfigEntry<T, P>` 而不是 `BindingConfigItem<T, any>`，
 * 确保 path 的字面量类型（'level'）能传进 P，PathValue<T,P> 才能推回 converter 参数类型。
 */
export type BindingConfigEntry<T, P extends Path<T> & string> = {
    path: P;
} & BindingConfigItem<T, P>;


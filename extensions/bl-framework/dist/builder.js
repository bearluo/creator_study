"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.assetHandlers = exports.unload = exports.load = void 0;
/**
 * 自定义构建脚本结构
 */
const load = function () {
    console.log('bl-framework builder load');
};
exports.load = load;
const unload = function () {
    console.log('bl-framework builder unload');
};
exports.unload = unload;
// 自定义纹理压缩处理
exports.assetHandlers = './asset-handlers';
/**
 * 自定义构建配置
 * [x: string]: IBuildPluginConfig Cocos Creator 支持的平台名，与点击 构建 按钮后生成的文件夹一致。 如果平台标记为 *，则里面的配置对所有构建平台生效。
 *  配置项
 *  IBuildPluginConfig
 *      doc?: string; // 文档地址
 *      hooks?: string; // 自定义构建钩子
 *      panel?: string; // 自定义面板
 *      options?: IDisplayOptions; // 配置选项
 *      verifyRuleMap?: IVerificationRuleMap; // 验证规则
 */
exports.configs = {
    'android': {
        options: {
            testInput: {
                label: 'testVar',
                description: 'this is a test input.',
                default: '',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        placeholder: 'Enter numbers',
                    },
                },
                verifyRules: ['required', 'ruleTest']
            },
            testCheckbox: {
                label: 'testCheckbox',
                description: 'this is a test checkbox.',
                default: false,
                render: {
                    ui: 'ui-checkbox',
                },
            },
        },
        verifyRuleMap: {
            ruleTest: {
                message: 'length of content should be less than 6.',
                func(val, option) {
                    if (val.length < 6) {
                        return true;
                    }
                    return false;
                }
            }
        },
        // 自定义打包钩子
        hooks: './hooks',
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOztHQUVHO0FBRUksTUFBTSxJQUFJLEdBQXFCO0lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUM7QUFGVyxRQUFBLElBQUksUUFFZjtBQUVLLE1BQU0sTUFBTSxHQUFxQjtJQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDO0FBRlcsUUFBQSxNQUFNLFVBRWpCO0FBRUYsWUFBWTtBQUNDLFFBQUEsYUFBYSxHQUFXLGtCQUFrQixDQUFDO0FBRXhEOzs7Ozs7Ozs7O0dBVUc7QUFDVSxRQUFBLE9BQU8sR0FBdUI7SUFDdkMsU0FBUyxFQUFDO1FBQ04sT0FBTyxFQUFFO1lBQ0wsU0FBUyxFQUFFO2dCQUNQLEtBQUssRUFBRSxTQUFTO2dCQUNoQixXQUFXLEVBQUUsdUJBQXVCO2dCQUNwQyxPQUFPLEVBQUUsRUFBRTtnQkFDWCxNQUFNLEVBQUU7b0JBQ0osRUFBRSxFQUFFLFVBQVU7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFdBQVcsRUFBRSxlQUFlO3FCQUMvQjtpQkFDSjtnQkFDRCxXQUFXLEVBQUUsQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDO2FBQ3ZDO1lBQ0QsWUFBWSxFQUFFO2dCQUNWLEtBQUssRUFBRSxjQUFjO2dCQUNyQixXQUFXLEVBQUUsMEJBQTBCO2dCQUN2QyxPQUFPLEVBQUUsS0FBSztnQkFDZCxNQUFNLEVBQUU7b0JBQ0osRUFBRSxFQUFFLGFBQWE7aUJBQ3BCO2FBQ0o7U0FDSjtRQUNELGFBQWEsRUFBRTtZQUNYLFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMENBQTBDO2dCQUNuRCxJQUFJLENBQUMsR0FBUSxFQUFFLE1BQXdCO29CQUNuQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUNoQixPQUFPLElBQUksQ0FBQztxQkFDZjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQzthQUNKO1NBQ0o7UUFDRCxVQUFVO1FBQ1YsS0FBSyxFQUFDLFNBQVM7S0FDbEI7Q0FDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnVpbGRQbHVnaW4sIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzL3B1YmxpY1wiO1xyXG5cclxuLyoqXHJcbiAqIOiHquWumuS5ieaehOW7uuiEmuacrOe7k+aehFxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBsb2FkOiBCdWlsZFBsdWdpbi5sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZygnYmwtZnJhbWV3b3JrIGJ1aWxkZXIgbG9hZCcpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHVubG9hZDogQnVpbGRQbHVnaW4ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coJ2JsLWZyYW1ld29yayBidWlsZGVyIHVubG9hZCcpO1xyXG59O1xyXG5cclxuLy8g6Ieq5a6a5LmJ57q555CG5Y6L57yp5aSE55CGXHJcbmV4cG9ydCBjb25zdCBhc3NldEhhbmRsZXJzOiBzdHJpbmcgPSAnLi9hc3NldC1oYW5kbGVycyc7XHJcblxyXG4vKipcclxuICog6Ieq5a6a5LmJ5p6E5bu66YWN572uXHJcbiAqIFt4OiBzdHJpbmddOiBJQnVpbGRQbHVnaW5Db25maWcgQ29jb3MgQ3JlYXRvciDmlK/mjIHnmoTlubPlj7DlkI3vvIzkuI7ngrnlh7sg5p6E5bu6IOaMiemSruWQjueUn+aIkOeahOaWh+S7tuWkueS4gOiHtOOAgiDlpoLmnpzlubPlj7DmoIforrDkuLogKu+8jOWImemHjOmdoueahOmFjee9ruWvueaJgOacieaehOW7uuW5s+WPsOeUn+aViOOAglxyXG4gKiAg6YWN572u6aG5XHJcbiAqICBJQnVpbGRQbHVnaW5Db25maWdcclxuICogICAgICBkb2M/OiBzdHJpbmc7IC8vIOaWh+aho+WcsOWdgFxyXG4gKiAgICAgIGhvb2tzPzogc3RyaW5nOyAvLyDoh6rlrprkuYnmnoTlu7rpkqnlrZBcclxuICogICAgICBwYW5lbD86IHN0cmluZzsgLy8g6Ieq5a6a5LmJ6Z2i5p2/XHJcbiAqICAgICAgb3B0aW9ucz86IElEaXNwbGF5T3B0aW9uczsgLy8g6YWN572u6YCJ6aG5XHJcbiAqICAgICAgdmVyaWZ5UnVsZU1hcD86IElWZXJpZmljYXRpb25SdWxlTWFwOyAvLyDpqozor4Hop4TliJlcclxuICovXHJcbmV4cG9ydCBjb25zdCBjb25maWdzOkJ1aWxkUGx1Z2luLkNvbmZpZ3MgPSB7XHJcbiAgICAnYW5kcm9pZCc6e1xyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgdGVzdElucHV0OiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ3Rlc3RWYXInLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICd0aGlzIGlzIGEgdGVzdCBpbnB1dC4nLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogJycsXHJcbiAgICAgICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICB1aTogJ3VpLWlucHV0JyxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnRW50ZXIgbnVtYmVycycsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB2ZXJpZnlSdWxlczogWydyZXF1aXJlZCcsJ3J1bGVUZXN0J11cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVzdENoZWNrYm94OiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ3Rlc3RDaGVja2JveCcsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ3RoaXMgaXMgYSB0ZXN0IGNoZWNrYm94LicsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVpOiAndWktY2hlY2tib3gnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZlcmlmeVJ1bGVNYXA6IHtcclxuICAgICAgICAgICAgcnVsZVRlc3Q6IHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdsZW5ndGggb2YgY29udGVudCBzaG91bGQgYmUgbGVzcyB0aGFuIDYuJyxcclxuICAgICAgICAgICAgICAgIGZ1bmModmFsOiBhbnksIG9wdGlvbjogSUJ1aWxkVGFza09wdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoIDwgNikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDoh6rlrprkuYnmiZPljIXpkqnlrZBcclxuICAgICAgICBob29rczonLi9ob29rcycsXHJcbiAgICB9XHJcbn07Il19
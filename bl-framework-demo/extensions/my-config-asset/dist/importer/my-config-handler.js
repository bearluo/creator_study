"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const my_config_1 = __importDefault(require("./my-config"));
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const { Asset } = require('@editor/asset-db');
const ShaderGraphHandler = {
    name: my_config_1.default.name,
    extends: 'json',
    assetType: my_config_1.default.assetType,
    iconInfo: {
        default: {
            type: 'image',
            value: 'packages://my-config-asset/static/asset-icon.png',
        },
    },
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: `创建配置`,
                    fullFileName: 'New My Config.myconfig',
                    template: 'db://test.shadergraph', // 无用
                    // submenu: [
                    //     {
                    //         label: 'Surface',
                    //         fullFileName: 'New Shader Graph.shadergraph',
                    //         template: 'Surface', // 无用
                    //     },
                    //     {
                    //         label: 'Unlit',
                    //         fullFileName: 'New Shader Graph.shadergraph',
                    //         template: 'Unlit', // 无用
                    //     },
                    // ],
                },
            ];
        },
        async create(options) {
            try {
                console.log('create', options);
                let shaderGraph = '{}';
                (0, fs_extra_1.writeFileSync)(options.target, shaderGraph);
            }
            catch (e) {
                console.error(e);
            }
            return options.target;
        },
    },
    // @ts-expect-error
    async open(asset) {
        Editor.Message.send('shader-graph', 'open', asset.uuid);
        return true;
    },
    importer: {
        version: "1.0.0",
        migrations: [],
        // @ts-expect-error
        async before(asset) {
            return true;
        },
        // @ts-expect-error
        async after(asset) {
            return true;
        },
    },
};
exports.default = ShaderGraphHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY29uZmlnLWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvaW1wb3J0ZXIvbXktY29uZmlnLWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx1Q0FBeUM7QUFDekMsK0JBQTRCO0FBQzVCLDREQUFtQztBQUVuQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQUksRUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBRXpELE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUU5QyxNQUFNLGtCQUFrQixHQUFHO0lBRXZCLElBQUksRUFBRSxtQkFBUSxDQUFDLElBQUk7SUFFbkIsT0FBTyxFQUFFLE1BQU07SUFFZixTQUFTLEVBQUUsbUJBQVEsQ0FBQyxTQUFTO0lBRTdCLFFBQVEsRUFBRTtRQUNOLE9BQU8sRUFBRTtZQUNMLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLGtEQUFrRDtTQUM1RDtLQUNKO0lBRUQsVUFBVSxFQUFFO1FBQ1IsZ0JBQWdCO1lBQ1osT0FBTztnQkFDSDtvQkFDSSxLQUFLLEVBQUUsTUFBTTtvQkFDYixZQUFZLEVBQUUsd0JBQXdCO29CQUN0QyxRQUFRLEVBQUUsdUJBQXVCLEVBQUUsS0FBSztvQkFDeEMsYUFBYTtvQkFDYixRQUFRO29CQUNSLDRCQUE0QjtvQkFDNUIsd0RBQXdEO29CQUN4RCxxQ0FBcUM7b0JBQ3JDLFNBQVM7b0JBQ1QsUUFBUTtvQkFDUiwwQkFBMEI7b0JBQzFCLHdEQUF3RDtvQkFDeEQsbUNBQW1DO29CQUNuQyxTQUFTO29CQUNULEtBQUs7aUJBQ1I7YUFDSixDQUFDO1FBQ04sQ0FBQztRQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBNkM7WUFDdEQsSUFBSSxDQUFDO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLElBQUEsd0JBQWEsRUFBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsQ0FBQztZQUNELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMxQixDQUFDO0tBQ0o7SUFFRCxtQkFBbUI7SUFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFZO1FBQ25CLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUUsT0FBTztRQUVoQixVQUFVLEVBQUUsRUFBRTtRQUVkLG1CQUFtQjtRQUNuQixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELG1CQUFtQjtRQUNuQixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQVk7WUFDcEIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLGtCQUFrQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgbXlDb25maWcgZnJvbSAnLi9teS1jb25maWcnO1xyXG5cclxubW9kdWxlLnBhdGhzLnB1c2goam9pbihFZGl0b3IuQXBwLnBhdGgsICdub2RlX21vZHVsZXMnKSk7XHJcblxyXG5jb25zdCB7IEFzc2V0IH0gPSByZXF1aXJlKCdAZWRpdG9yL2Fzc2V0LWRiJyk7XHJcblxyXG5jb25zdCBTaGFkZXJHcmFwaEhhbmRsZXIgPSB7XHJcblxyXG4gICAgbmFtZTogbXlDb25maWcubmFtZSxcclxuXHJcbiAgICBleHRlbmRzOiAnanNvbicsXHJcblxyXG4gICAgYXNzZXRUeXBlOiBteUNvbmZpZy5hc3NldFR5cGUsXHJcblxyXG4gICAgaWNvbkluZm86IHtcclxuICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZScsXHJcbiAgICAgICAgICAgIHZhbHVlOiAncGFja2FnZXM6Ly9teS1jb25maWctYXNzZXQvc3RhdGljL2Fzc2V0LWljb24ucG5nJyxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBjcmVhdGVJbmZvOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNZW51SW5mbygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogYOWIm+W7uumFjee9rmAsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbEZpbGVOYW1lOiAnTmV3IE15IENvbmZpZy5teWNvbmZpZycsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICdkYjovL3Rlc3Quc2hhZGVyZ3JhcGgnLCAvLyDml6DnlKhcclxuICAgICAgICAgICAgICAgICAgICAvLyBzdWJtZW51OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGxhYmVsOiAnU3VyZmFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBmdWxsRmlsZU5hbWU6ICdOZXcgU2hhZGVyIEdyYXBoLnNoYWRlcmdyYXBoJyxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHRlbXBsYXRlOiAnU3VyZmFjZScsIC8vIOaXoOeUqFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBsYWJlbDogJ1VubGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGZ1bGxGaWxlTmFtZTogJ05ldyBTaGFkZXIgR3JhcGguc2hhZGVyZ3JhcGgnLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgdGVtcGxhdGU6ICdVbmxpdCcsIC8vIOaXoOeUqFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIF0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXN5bmMgY3JlYXRlKG9wdGlvbnM6IHsgdGFyZ2V0OiBzdHJpbmcsIHRlbXBsYXRlOiBzdHJpbmcgfSk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NyZWF0ZScsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNoYWRlckdyYXBoID0gJ3t9JztcclxuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMob3B0aW9ucy50YXJnZXQsIHNoYWRlckdyYXBoKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy50YXJnZXQ7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgYXN5bmMgb3Blbihhc3NldDogQXNzZXQpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICBFZGl0b3IuTWVzc2FnZS5zZW5kKCdzaGFkZXItZ3JhcGgnLCAnb3BlbicsIGFzc2V0LnV1aWQpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIHZlcnNpb246IFwiMS4wLjBcIixcclxuXHJcbiAgICAgICAgbWlncmF0aW9uczogW10sXHJcblxyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICBhc3luYyBiZWZvcmUoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICBhc3luYyBhZnRlcihhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGFkZXJHcmFwaEhhbmRsZXI7XHJcbiJdfQ==
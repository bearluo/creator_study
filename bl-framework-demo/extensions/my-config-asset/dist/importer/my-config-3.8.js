"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyConfig380 = void 0;
const path_1 = require("path");
const my_config_1 = __importDefault(require("./my-config"));
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const { Asset, Importer } = require('@editor/asset-db');
class MyConfig380 extends Importer {
    // 引擎内对应的类型
    get assetType() {
        return my_config_1.default.assetType;
    }
    get version() {
        return my_config_1.default.version;
    }
    get name() {
        return my_config_1.default.name;
    }
    get migrations() {
        return my_config_1.default.migrations;
    }
    /**
     * 返回是否导入成功的标记
     * 如果返回 false，则 imported 标记不会变成 true
     * 后续的一系列操作都不会执行
     * @param asset
     */
    // @ts-expect-error
    async import(asset) {
        // try {
        //     await generateEffectAsset(asset, await shaderGraph.generateEffectByAsset(asset));
        //     return true;
        // } catch (e) {
        //     console.error(e);
        //     return false;
        // }
    }
}
exports.MyConfig380 = MyConfig380;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY29uZmlnLTMuOC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9pbXBvcnRlci9teS1jb25maWctMy44LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLCtCQUE0QjtBQUM1Qiw0REFBb0M7QUFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBQSxXQUFJLEVBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUV6RCxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBR3hELE1BQWEsV0FBWSxTQUFRLFFBQVE7SUFFckMsV0FBVztJQUNYLElBQUksU0FBUztRQUNULE9BQU8sbUJBQVEsQ0FBQyxTQUFTLENBQUM7SUFDOUIsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE9BQU8sbUJBQVEsQ0FBQyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sbUJBQVEsQ0FBQyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sbUJBQVEsQ0FBQyxVQUFVLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsbUJBQW1CO0lBQ1osS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFZO1FBQzVCLFFBQVE7UUFDUix3RkFBd0Y7UUFDeEYsbUJBQW1CO1FBQ25CLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIsb0JBQW9CO1FBQ3BCLElBQUk7SUFDUixDQUFDO0NBQ0o7QUFuQ0Qsa0NBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IG15Q29uZmlnICBmcm9tICcuL215LWNvbmZpZyc7XHJcbm1vZHVsZS5wYXRocy5wdXNoKGpvaW4oRWRpdG9yLkFwcC5wYXRoLCAnbm9kZV9tb2R1bGVzJykpO1xyXG5cclxuY29uc3QgeyBBc3NldCwgSW1wb3J0ZXIgfSA9IHJlcXVpcmUoJ0BlZGl0b3IvYXNzZXQtZGInKTtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgTXlDb25maWczODAgZXh0ZW5kcyBJbXBvcnRlciB7XHJcblxyXG4gICAgLy8g5byV5pOO5YaF5a+55bqU55qE57G75Z6LXHJcbiAgICBnZXQgYXNzZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBteUNvbmZpZy5hc3NldFR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZlcnNpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG15Q29uZmlnLnZlcnNpb247XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG15Q29uZmlnLm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1pZ3JhdGlvbnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIG15Q29uZmlnLm1pZ3JhdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoTmoIforrBcclxuICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICog5ZCO57ut55qE5LiA57O75YiX5pON5L2c6YO95LiN5Lya5omn6KGMXHJcbiAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAqL1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgcHVibGljIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAvLyB0cnkge1xyXG4gICAgICAgIC8vICAgICBhd2FpdCBnZW5lcmF0ZUVmZmVjdEFzc2V0KGFzc2V0LCBhd2FpdCBzaGFkZXJHcmFwaC5nZW5lcmF0ZUVmZmVjdEJ5QXNzZXQoYXNzZXQpKTtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgLy8gfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==
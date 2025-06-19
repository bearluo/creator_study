"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
var Fs = require("fs");
var Path = require("path");
var inject_script = `
(function () {
    if (typeof window.jsb === 'object') {
        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            var paths = JSON.parse(hotUpdateSearchPaths);
            jsb.fileUtils.setSearchPaths(paths);

            var fileList = [];
            var storagePath = paths[0] || '';
            var tempPath = storagePath + '_temp/';
            var baseOffset = tempPath.length;
            if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp')) {
                jsb.fileUtils.listFilesRecursively(tempPath, fileList);
                fileList.forEach(srcPath => {
                    var relativePath = srcPath.substr(baseOffset);
                    var dstPath = storagePath + relativePath;

                    if (srcPath[srcPath.length] == '/') {
                        jsb.fileUtils.createDirectory(dstPath)
                    }
                    else {
                        if (jsb.fileUtils.isFileExist(dstPath)) {
                            jsb.fileUtils.removeFile(dstPath)
                        }
                        jsb.fileUtils.renameFile(srcPath, dstPath);
                    }
                })
                jsb.fileUtils.removeDirectory(tempPath);
            }
        }
    }
})();
`;
const PACKAGE_NAME = 'hotUpdate';
exports.throwError = true;
const load = async function () {
    console.log(PACKAGE_NAME, exports.load);
};
exports.load = load;
const onBeforeBuild = async function (options) {
    // Todo some thing
    console.log(PACKAGE_NAME, 'onBeforeBuild');
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = async function (options, result) {
    // Todo some thing
    console.log(PACKAGE_NAME, 'onBeforeCompressSettings');
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = async function (options, result) {
    // Todo some thing
    console.log(PACKAGE_NAME, 'onAfterCompressSettings');
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = async function (options, result) {
    console.log(PACKAGE_NAME, 'onAfterBuild');
    var url = Path.join(result.dest, 'data', 'main.js');
    if (!Fs.existsSync(url)) {
        url = Path.join(result.dest, 'assets', 'main.js');
    }
    let data = Fs.readFileSync(url, `utf8`);
    var newStr = inject_script + data;
    Fs.writeFileSync(url, newStr);
};
exports.onAfterBuild = onAfterBuild;
const unload = async function () {
    console.log(PACKAGE_NAME, 'unload');
};
exports.unload = unload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvaG9va3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUUzQixJQUFJLGFBQWEsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUNuQixDQUFDO0FBRUYsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBRXBCLFFBQUEsVUFBVSxHQUF5QixJQUFJLENBQUM7QUFFOUMsTUFBTSxJQUFJLEdBQW1CLEtBQUs7SUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUMsWUFBSSxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDO0FBRlcsUUFBQSxJQUFJLFFBRWY7QUFFSyxNQUFNLGFBQWEsR0FBNEIsS0FBSyxXQUFVLE9BQU87SUFDeEUsa0JBQWtCO0lBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlDLENBQUMsQ0FBQztBQUhXLFFBQUEsYUFBYSxpQkFHeEI7QUFFSyxNQUFNLHdCQUF3QixHQUF1QyxLQUFLLFdBQVUsT0FBTyxFQUFFLE1BQU07SUFDdEcsa0JBQWtCO0lBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDekQsQ0FBQyxDQUFDO0FBSFcsUUFBQSx3QkFBd0IsNEJBR25DO0FBRUssTUFBTSx1QkFBdUIsR0FBc0MsS0FBSyxXQUFVLE9BQU8sRUFBRSxNQUFNO0lBQ3BHLGtCQUFrQjtJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3pELENBQUMsQ0FBQztBQUhXLFFBQUEsdUJBQXVCLDJCQUdsQztBQUVLLE1BQU0sWUFBWSxHQUEyQixLQUFLLFdBQVUsT0FBTyxFQUFFLE1BQU07SUFDOUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNwRCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNyQixHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNyRDtJQUNELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLElBQUksTUFBTSxHQUFHLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDbEMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDO0FBVFcsUUFBQSxZQUFZLGdCQVN2QjtBQUVLLE1BQU0sTUFBTSxHQUFxQixLQUFLO0lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQztBQUZXLFFBQUEsTUFBTSxVQUVqQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1aWxkSG9vayB9IGZyb20gXCJAY29jb3MvY3JlYXRvci10eXBlcy9lZGl0b3IvcGFja2FnZXMvYnVpbGRlci9AdHlwZXMvcHVibGljXCI7XHJcbnZhciBGcyA9IHJlcXVpcmUoXCJmc1wiKTtcclxudmFyIFBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuXHJcbnZhciBpbmplY3Rfc2NyaXB0ID0gYFxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cuanNiID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHZhciBob3RVcGRhdGVTZWFyY2hQYXRocyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdIb3RVcGRhdGVTZWFyY2hQYXRocycpO1xyXG4gICAgICAgIGlmIChob3RVcGRhdGVTZWFyY2hQYXRocykge1xyXG4gICAgICAgICAgICB2YXIgcGF0aHMgPSBKU09OLnBhcnNlKGhvdFVwZGF0ZVNlYXJjaFBhdGhzKTtcclxuICAgICAgICAgICAganNiLmZpbGVVdGlscy5zZXRTZWFyY2hQYXRocyhwYXRocyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZmlsZUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgdmFyIHN0b3JhZ2VQYXRoID0gcGF0aHNbMF0gfHwgJyc7XHJcbiAgICAgICAgICAgIHZhciB0ZW1wUGF0aCA9IHN0b3JhZ2VQYXRoICsgJ190ZW1wLyc7XHJcbiAgICAgICAgICAgIHZhciBiYXNlT2Zmc2V0ID0gdGVtcFBhdGgubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAoanNiLmZpbGVVdGlscy5pc0RpcmVjdG9yeUV4aXN0KHRlbXBQYXRoKSAmJiAhanNiLmZpbGVVdGlscy5pc0ZpbGVFeGlzdCh0ZW1wUGF0aCArICdwcm9qZWN0Lm1hbmlmZXN0LnRlbXAnKSkge1xyXG4gICAgICAgICAgICAgICAganNiLmZpbGVVdGlscy5saXN0RmlsZXNSZWN1cnNpdmVseSh0ZW1wUGF0aCwgZmlsZUxpc3QpO1xyXG4gICAgICAgICAgICAgICAgZmlsZUxpc3QuZm9yRWFjaChzcmNQYXRoID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVsYXRpdmVQYXRoID0gc3JjUGF0aC5zdWJzdHIoYmFzZU9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRzdFBhdGggPSBzdG9yYWdlUGF0aCArIHJlbGF0aXZlUGF0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNyY1BhdGhbc3JjUGF0aC5sZW5ndGhdID09ICcvJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBqc2IuZmlsZVV0aWxzLmNyZWF0ZURpcmVjdG9yeShkc3RQYXRoKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzYi5maWxlVXRpbHMuaXNGaWxlRXhpc3QoZHN0UGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzYi5maWxlVXRpbHMucmVtb3ZlRmlsZShkc3RQYXRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzYi5maWxlVXRpbHMucmVuYW1lRmlsZShzcmNQYXRoLCBkc3RQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAganNiLmZpbGVVdGlscy5yZW1vdmVEaXJlY3RvcnkodGVtcFBhdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG5gO1xyXG5cclxuY29uc3QgUEFDS0FHRV9OQU1FID0gJ2hvdFVwZGF0ZSc7XHJcblxyXG5leHBvcnQgY29uc3QgdGhyb3dFcnJvcjogQnVpbGRIb29rLnRocm93RXJyb3IgPSB0cnVlO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxvYWQ6IEJ1aWxkSG9vay5sb2FkID0gYXN5bmMgZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhQQUNLQUdFX05BTUUsbG9hZCk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgb25CZWZvcmVCdWlsZDogQnVpbGRIb29rLm9uQmVmb3JlQnVpbGQgPSBhc3luYyBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgICAvLyBUb2RvIHNvbWUgdGhpbmdcclxuICAgIGNvbnNvbGUubG9nKFBBQ0tBR0VfTkFNRSwnb25CZWZvcmVCdWlsZCcpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IG9uQmVmb3JlQ29tcHJlc3NTZXR0aW5nczogQnVpbGRIb29rLm9uQmVmb3JlQ29tcHJlc3NTZXR0aW5ncyA9IGFzeW5jIGZ1bmN0aW9uKG9wdGlvbnMsIHJlc3VsdCkge1xyXG4gICAgLy8gVG9kbyBzb21lIHRoaW5nXHJcbiAgICBjb25zb2xlLmxvZyhQQUNLQUdFX05BTUUsJ29uQmVmb3JlQ29tcHJlc3NTZXR0aW5ncycpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IG9uQWZ0ZXJDb21wcmVzc1NldHRpbmdzOiBCdWlsZEhvb2sub25BZnRlckNvbXByZXNzU2V0dGluZ3MgPSBhc3luYyBmdW5jdGlvbihvcHRpb25zLCByZXN1bHQpIHtcclxuICAgIC8vIFRvZG8gc29tZSB0aGluZ1xyXG4gICAgY29uc29sZS5sb2coUEFDS0FHRV9OQU1FLCAnb25BZnRlckNvbXByZXNzU2V0dGluZ3MnKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBvbkFmdGVyQnVpbGQ6IEJ1aWxkSG9vay5vbkFmdGVyQnVpbGQgPSBhc3luYyBmdW5jdGlvbihvcHRpb25zLCByZXN1bHQpIHtcclxuICAgIGNvbnNvbGUubG9nKFBBQ0tBR0VfTkFNRSwgJ29uQWZ0ZXJCdWlsZCcpO1xyXG4gICAgdmFyIHVybCA9IFBhdGguam9pbihyZXN1bHQuZGVzdCwgJ2RhdGEnLCAnbWFpbi5qcycpO1xyXG4gICAgaWYgKCFGcy5leGlzdHNTeW5jKHVybCkpIHtcclxuICAgICAgICB1cmwgPSBQYXRoLmpvaW4ocmVzdWx0LmRlc3QsICdhc3NldHMnLCAnbWFpbi5qcycpO1xyXG4gICAgfVxyXG4gICAgbGV0IGRhdGEgPSBGcy5yZWFkRmlsZVN5bmModXJsLCBgdXRmOGApO1xyXG4gICAgdmFyIG5ld1N0ciA9IGluamVjdF9zY3JpcHQgKyBkYXRhO1xyXG4gICAgRnMud3JpdGVGaWxlU3luYyh1cmwsIG5ld1N0cik7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdW5sb2FkOiBCdWlsZEhvb2sudW5sb2FkID0gYXN5bmMgZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhQQUNLQUdFX05BTUUsICd1bmxvYWQnKTtcclxufTsiXX0=
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.methods = {
    async registerMyConfigImporter380() {
        const { MyConfig380 } = await Promise.resolve().then(() => __importStar(require('./my-config-3.8')));
        return {
            extname: ['.myconfig'],
            importer: MyConfig380,
        };
    },
    async registerMyConfigImporter() {
        return (await Promise.resolve().then(() => __importStar(require('./my-config-handler')))).default;
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvaW1wb3J0ZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQWEsUUFBQSxPQUFPLEdBQUc7SUFDbkIsS0FBSyxDQUFDLDJCQUEyQjtRQUM3QixNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsd0RBQWEsaUJBQWlCLEdBQUMsQ0FBQztRQUN4RCxPQUFPO1lBQ0gsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3RCLFFBQVEsRUFBRSxXQUFXO1NBQ3hCLENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLHdCQUF3QjtRQUMxQixPQUFPLENBQUMsd0RBQWEscUJBQXFCLEdBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN6RCxDQUFDO0NBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBtZXRob2RzID0ge1xyXG4gICAgYXN5bmMgcmVnaXN0ZXJNeUNvbmZpZ0ltcG9ydGVyMzgwKCkge1xyXG4gICAgICAgIGNvbnN0IHsgTXlDb25maWczODAgfSA9IGF3YWl0IGltcG9ydCgnLi9teS1jb25maWctMy44Jyk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZXh0bmFtZTogWycubXljb25maWcnXSxcclxuICAgICAgICAgICAgaW1wb3J0ZXI6IE15Q29uZmlnMzgwLFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIHJlZ2lzdGVyTXlDb25maWdJbXBvcnRlcigpIHtcclxuICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9teS1jb25maWctaGFuZGxlcicpKS5kZWZhdWx0O1xyXG4gICAgfSxcclxufTsiXX0=
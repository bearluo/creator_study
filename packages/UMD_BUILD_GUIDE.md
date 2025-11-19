# UMD 构建配置指南

## 📋 概述

所有 npm 包现在支持同时生成 ESM 和 UMD 两种格式：
- **ESM** (`dist/index.js`) - 用于现代模块系统（SystemJS、ES6 import）
- **UMD** (`dist/index.umd.js`) - 用于 CommonJS、AMD 和全局变量

## 🔧 配置说明

### 1. Rollup 配置

每个包都添加了 `rollup.config.js`：

```javascript
module.exports = {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'BLFrameworkECS',  // 全局变量名
        sourcemap: true,
        exports: 'named'
    },
    plugins: [
        nodeResolve({ browser: true }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' })
    ]
};
```

### 2. package.json 配置

```json
{
  "main": "./dist/index.umd.js",      // CommonJS/UMD 入口
  "module": "./dist/index.js",        // ESM 入口
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",    // ESM
      "require": "./dist/index.umd.js", // CommonJS/UMD
      "default": "./dist/index.umd.js"
    }
  }
}
```

## 📦 已配置的包

1. ✅ `@bl-framework/ecs` → `BLFrameworkECS`
2. ✅ `@bl-framework/behaviortree` → `BLFrameworkBehaviorTree`
3. ✅ `@bl-framework/behaviortree-ecs` → `BLFrameworkBehaviorTreeECS`
4. ✅ `@bl-framework/core` → `BLFrameworkCore`

## 🚀 构建命令

### 完整构建（ESM + UMD）
```bash
npm run build
```

### 仅构建 TypeScript（ESM）
```bash
npm run build:ts
```

### 仅构建 UMD
```bash
npm run build:umd
```

## 📝 使用方式

### 1. ESM 导入（推荐）
```typescript
import { Component, World } from '@bl-framework/ecs';
```

### 2. CommonJS 导入
```javascript
const { Component, World } = require('@bl-framework/ecs');
```

### 3. 浏览器全局变量
```html
<script src="node_modules/@bl-framework/ecs/dist/index.umd.js"></script>
<script>
  const world = new BLFrameworkECS.World();
</script>
```

### 4. AMD
```javascript
define(['@bl-framework/ecs'], function(BLFrameworkECS) {
  const world = new BLFrameworkECS.World();
});
```

## 🎯 优势

1. **多环境支持**: 同时支持 Node.js、浏览器、AMD、CommonJS
2. **向后兼容**: UMD 格式兼容旧环境
3. **现代标准**: ESM 格式支持现代打包工具
4. **SystemJS 兼容**: 通过 `systemjs` 字段配置

## ⚠️ 注意事项

1. **依赖顺序**: 构建 `behaviortree-ecs` 前需要先构建 `ecs` 和 `behaviortree`
2. **全局变量名**: 每个包的 UMD 格式使用不同的全局变量名
3. **外部依赖**: `behaviortree-ecs` 将依赖包标记为 external，需要在运行时提供

## 🔄 构建流程

```
TypeScript 源码 (src/)
    ↓ tsc
ESM 格式 (dist/index.js)
    ↓ rollup
UMD 格式 (dist/index.umd.js)
```

## 📋 下一步

1. 安装依赖：`npm install`（在每个包目录）
2. 构建所有包：`npm run build`
3. 验证输出：检查 `dist/` 目录中的文件


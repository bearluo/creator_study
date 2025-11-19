# 使用示例

本目录包含 `@bl-framework/core` 的使用示例。

## 运行示例

### 使用 TypeScript

```bash
# 编译示例
npx tsc examples/basic-usage.ts --outDir examples/dist --module commonjs --target ES2020

# 运行示例
node examples/dist/basic-usage.js
```

### 使用 ts-node（如果已安装）

```bash
npx ts-node examples/basic-usage.ts
```

## 示例说明

### basic-usage.ts

基础使用示例，包含：

1. **FWPath** - 路径工具使用
2. **FWLog** - 日志工具使用
3. **FWDecorator** - 装饰器使用
4. **FWEventDispatcher** - 事件分发器使用

## 更多示例

更多使用示例请参考主 README.md 文档。


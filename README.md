# vite-react-ssr

## 技术栈

Vite + React + SSR + TS

本项目将 Vite 源码简化到极致、满足最基本的 HMR 效果。
便于理解 Vite 的设计原理，并将 Vite 的功能以最轻量的方式，按需植入自己的项目（无需安装 Vite），二次开发出自己想要的功能。

目前已有功能：

- React 组件热加载（HMR）
- SSR 模式
- TS
- development 模式（esbuild 编译）

没有的功能：

- CSS 热加载
- CSR 模式
- vite.config.ts 没有 Vite 那么多的扩展性（方便理解源码，故意删掉了）
- production 模式（rollup 打包）

## 启动

yarn && yarn dev
然后打开 http://localhost:4100/

## FAQ

1、SSR 一开始运行的是 "src/entry-server.jsx"，那什么时候运行 "src/entry-client.jsx" 呢

2、ESBuild 发挥了什么作用

3、

## 合理避坑

yarn dev 启动过程中, yarn / yarn add 可能遇到报错:

```
[3/4] Linking dependencies...
error An unexpected error occurred: "EPERM: operation not permitte\vite-react-ssr\\node_modules\\esbuild\\esbuild.exe'".
```

只需要退出 yarn dev，重新 yarn / yarn add 即可。

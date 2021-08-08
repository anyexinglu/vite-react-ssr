# vite-react-ssr

## 技术栈

vite + react + ssr + ts

## 启动

yarn && yarn dev
然后打开 http://localhost:4100/

## 合理避坑

yarn dev 启动过程中, yarn / yarn add 可能遇到报错:

```
[3/4] Linking dependencies...
error An unexpected error occurred: "EPERM: operation not permitte\vite-react-ssr\\node_modules\\esbuild\\esbuild.exe'".
```

只需要退出 yarn dev，重新 yarn / yarn add 即可。

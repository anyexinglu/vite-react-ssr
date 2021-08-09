## FAQ

1、SSR 设计方式，一开始运行的是 `src/entry-server.jsx`，那什么时候运行 `src/entry-client.jsx` 呢？
两者的作用是什么？

`src/entry-server.jsx` 的 render 是将 App renderToString 变成字符串。然后替换 template.html 中 #app 内的部分后，直出。

`src/entry-client.jsx` 是浏览器获得直出内容后，会重新走一遍客户端渲染，其中的 entry-client 这个 js，通过 ReactDOM.hydrate 更新 #app 内容。

他们的作用是完成 SSR 步骤。

2、路由设计

利用了 `import.meta.globEager` 这个特性，读取 pages 下面所有目录，详见 App.tsx：

```jsx
const pages = import.meta.globEager("./pages/*.tsx");

const routes = Object.keys(pages).map(path => {
  const name = ((path || "").match(/\.\/pages\/(.*)\.tsx$/) || [])[1] || "";
  return {
    name,
    path: name === "Home" ? "/" : `/${name.toLowerCase()}`,
    component: pages[path].default,
  };
});
```

3、ESBuild 发挥了什么作用？

4、hmr 实现（最重磅的知识点）

（1）服务端文件

`nodemon src/server.ts` 用 nodemon 监听。

（2）客户端文件

`@vite/client` 作用是什么？

看看 Header.tsx 组件的 before & after：

源文件：

```jsx
import React from "react";

export default function Header() {
  return <p>heade11r</p>;
}
```

转化后：

```jsx
import { createHotContext as __vite__createHotContext } from "/@vite/client";
import.meta.hot = __vite__createHotContext("/src/components/Header.tsx");
import RefreshRuntime from "/@react-refresh";
let prevRefreshReg;
let prevRefreshSig;
if (!window.__vite_plugin_react_preamble_installed__) {
  throw new Error(
    "@vitejs/plugin-react-refresh can't detect preamble. Something is wrong. See https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201"
  );
}
if (import.meta.hot) {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(
      type,
      "/Users/yangxiayan/Documents/duoduo/vite/vite-ssr/src/components/Header.tsx " +
        id
    );
  };
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _jsxFileName =
  "/Users/yangxiayan/Documents/duoduo/vite/vite-ssr/src/components/Header.tsx";
import __vite__cjsImport2_react from "/node_modules/.vite/react.js?v=df1bc05a";
const React = __vite__cjsImport2_react.__esModule
  ? __vite__cjsImport2_react.default
  : __vite__cjsImport2_react;
export default function Header() {
  return /* @__PURE__ */ React.createElement(
    "p",
    {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 4,
        columnNumber: 10,
      },
    },
    "heade11r"
  );
}
_c = Header;
var _c;
$RefreshReg$(_c, "Header");
if (import.meta.hot) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
  import.meta.hot.accept();
  if (!window.__vite_plugin_react_timeout) {
    window.__vite_plugin_react_timeout = setTimeout(() => {
      window.__vite_plugin_react_timeout = 0;
      RefreshRuntime.performReactRefresh();
    }, 30);
  }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFFQSxpQ0FBaUM7QUFDL0IsU0FBTyxvQ0FBQyxLQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBRztBQUFBO0tBRFlBOzs7Ozs7Ozs7Ozs7OzsiLCJuYW1lcyI6WyJIZWFkZXIiXSwic291cmNlcyI6WyIvVXNlcnMveWFuZ3hpYXlhbi9Eb2N1bWVudHMvZHVvZHVvL3ZpdGUvdml0ZS1zc3Ivc3JjL2NvbXBvbmVudHMvSGVhZGVyLnRzeCJdfQ==
```

包含三部分：

（1）importAnalysis 增加 `import.meta.hot` 和 `__vite__cjsImport2_react`，其中 `import.meta.hot` 会被 `plugin-react-refresh` 插件消费。 `__vite__cjsImport2_react` 主要承担替换 react 的工作。

```jsx
import { createHotContext as __vite__createHotContext } from "/@vite/client";
import.meta.hot = __vite__createHotContext("/src/components/Header.tsx");

import __vite__cjsImport2_react from "/node_modules/.vite/react.js?v=df1bc05a";
const React = __vite__cjsImport2_react.__esModule
  ? __vite__cjsImport2_react.default
  : __vite__cjsImport2_react;
```

（2）其他都是 `node_modules/@vitejs/plugin-react-refresh` 的 `reactRefreshPlugin` 方法注入。

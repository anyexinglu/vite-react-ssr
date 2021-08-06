export default function anonymous(
  global,
  __vite_ssr_exports__,
  __vite_ssr_import_meta__,
  __vite_ssr_import__,
  __vite_ssr_dynamic_import__,
  __vite_ssr_exportAll__
) {
  console.log("...__vite_ssr_import__", __vite_ssr_import__);
  const __vite_ssr_import_0__ = __vite_ssr_import__("react");

  const __vite_ssr_import_1__ = __vite_ssr_import__("react-dom/server");

  const __vite_ssr_import_2__ = __vite_ssr_import__("react-router-dom");

  const __vite_ssr_import_3__ = __vite_ssr_import__("/src/App.tsx");

  function render(url, context) {
    return __vite_ssr_import_1__.default.renderToString(
      /* @__PURE__ */ __vite_ssr_import_0__.default.createElement(
        __vite_ssr_import_2__.StaticRouter,
        {
          location: url,
          context,
        },
        /* @__PURE__ */ __vite_ssr_import_0__.default.createElement(
          __vite_ssr_import_3__.App,
          null
        )
      )
    );
  }

  Object.defineProperty(__vite_ssr_exports__, "render", {
    enumerable: true,
    configurable: true,
    get() {
      return render;
    },
  });
  //# sourceURL=/src/entry-server.jsx
}

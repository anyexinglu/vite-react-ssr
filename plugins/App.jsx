import { createHotContext as __vite__createHotContext } from '/@vite/client'
import.meta.hot = __vite__createHotContext('/App.jsx')
import __vite__cjsImport0_react from '/node_modules/.vite/react.js?v=d167ff77'
const React = __vite__cjsImport0_react.__esModule
  ? __vite__cjsImport0_react.default
  : __vite__cjsImport0_react
import RefreshRuntime from '/@react-refresh'
let prevRefreshReg
let prevRefreshSig
if (!window.__vite_plugin_react_preamble_installed__) {
  throw new Error(
    "@vitejs/plugin-react-refresh can't detect preamble. Something is wrong. See https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201"
  )
}
if (import.meta.hot) {
  prevRefreshReg = window.$RefreshReg$
  prevRefreshSig = window.$RefreshSig$
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(
      type,
      '/Users/yangxiayan/Documents/duoduo/vite/vite/packages/playground/react/App.jsx ' +
        id
    )
  }
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform
}
var _jsxFileName =
    '/Users/yangxiayan/Documents/duoduo/vite/vite/packages/playground/react/App.jsx',
  _s = $RefreshSig$()
import __vite__cjsImport3_react from '/node_modules/.vite/react.js?v=d167ff77'
const useState = __vite__cjsImport3_react['useState']
function App() {
  _s()
  const [count, setCount] = useState(0)
  return /* @__PURE__ */ React.createElement(
    'div',
    {
      className: 'App',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 6,
        columnNumber: 5
      }
    },
    /* @__PURE__ */ React.createElement(
      'header',
      {
        className: 'App-header',
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 7,
          columnNumber: 7
        }
      },
      /* @__PURE__ */ React.createElement(
        'h1',
        {
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 8,
            columnNumber: 9
          }
        },
        'Hello Vite + React'
      ),
      /* @__PURE__ */ React.createElement(
        'p',
        {
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 9,
            columnNumber: 9
          }
        },
        /* @__PURE__ */ React.createElement(
          'button',
          {
            onClick: () => setCount((count2) => count2 + 1),
            __self: this,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 10,
              columnNumber: 11
            }
          },
          'count is: ',
          count
        )
      ),
      /* @__PURE__ */ React.createElement(
        'p',
        {
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 14,
            columnNumber: 9
          }
        },
        'Edit ',
        /* @__PURE__ */ React.createElement(
          'code',
          {
            __self: this,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 15,
              columnNumber: 16
            }
          },
          'App.jsx'
        ),
        ' and save to test HMR updates.'
      ),
      /* @__PURE__ */ React.createElement(
        'a',
        {
          className: 'App-link',
          href: 'https://reactjs.org',
          target: '_blank',
          rel: 'noopener noreferrer',
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 17,
            columnNumber: 9
          }
        },
        'Learn React'
      )
    )
  )
}
_s(App, 'oDgYfYHkD9Wkv4hrAPCkI/ev3YU=')
_c = App
export default App
var _c
$RefreshReg$(_c, 'App')
if (import.meta.hot) {
  window.$RefreshReg$ = prevRefreshReg
  window.$RefreshSig$ = prevRefreshSig
  import.meta.hot.accept()
  if (!window.__vite_plugin_react_timeout) {
    window.__vite_plugin_react_timeout = setTimeout(() => {
      window.__vite_plugin_react_timeout = 0
      RefreshRuntime.performReactRefresh()
    }, 30)
  }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFFQSxlQUFlO0FBQUE7QUFDYixRQUFNLENBQUNBLE9BQU9DLFlBQVlDLFNBQVM7QUFDbkMsU0FDRSxvQ0FBQyxPQUFEO0FBQUEsSUFBSyxXQUFVO0FBQUEsSUFBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUNFLG9DQUFDLFVBQUQ7QUFBQSxJQUFRLFdBQVU7QUFBQSxJQUFsQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUNFLG9DQUFDLE1BQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFJLHVCQUNKLG9DQUFDLEtBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUNFLG9DQUFDLFVBQUQ7QUFBQSxJQUFRLFNBQVMsTUFBTUQsU0FBVUQsWUFBVUEsU0FBUTtBQUFBLElBQW5EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUNhQSxTQUdmLG9DQUFDLEtBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUNPLG9DQUFDLFFBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFNLFlBQWMsbUNBRTNCLG9DQUFDLEtBQUQ7QUFBQSxJQUNFLFdBQVU7QUFBQSxJQUNWLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLEtBQUk7QUFBQSxJQUpOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7R0FkQ0c7S0FBQUE7QUEyQlQsZUFBZUE7Ozs7Ozs7Ozs7Ozs7OyIsIm5hbWVzIjpbImNvdW50Iiwic2V0Q291bnQiLCJ1c2VTdGF0ZSIsIkFwcCJdLCJzb3VyY2VzIjpbIi9Vc2Vycy95YW5neGlheWFuL0RvY3VtZW50cy9kdW9kdW8vdml0ZS92aXRlL3BhY2thZ2VzL3BsYXlncm91bmQvcmVhY3QvQXBwLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuXG5mdW5jdGlvbiBBcHAoKSB7XG4gIGNvbnN0IFtjb3VudCwgc2V0Q291bnRdID0gdXNlU3RhdGUoMClcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIkFwcFwiPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJBcHAtaGVhZGVyXCI+XG4gICAgICAgIDxoMT5IZWxsbyBWaXRlICsgUmVhY3Q8L2gxPlxuICAgICAgICA8cD5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldENvdW50KChjb3VudCkgPT4gY291bnQgKyAxKX0+XG4gICAgICAgICAgICBjb3VudCBpczoge2NvdW50fVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgIEVkaXQgPGNvZGU+QXBwLmpzeDwvY29kZT4gYW5kIHNhdmUgdG8gdGVzdCBITVIgdXBkYXRlcy5cbiAgICAgICAgPC9wPlxuICAgICAgICA8YVxuICAgICAgICAgIGNsYXNzTmFtZT1cIkFwcC1saW5rXCJcbiAgICAgICAgICBocmVmPVwiaHR0cHM6Ly9yZWFjdGpzLm9yZ1wiXG4gICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcbiAgICAgICAgPlxuICAgICAgICAgIExlYXJuIFJlYWN0XG4gICAgICAgIDwvYT5cbiAgICAgIDwvaGVhZGVyPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFxuIl19

import reactRefresh from "@vitejs/plugin-react-refresh";

/**
 * @type {import('vite').UserConfig}
 */
export default {
  jsx: "react",
  plugins: [reactRefresh()],
  // esbuild: {
  //   jsxInject: `import React from 'react';`
  // },
  build: {
    minify: false,
  },
};

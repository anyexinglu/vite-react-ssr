import * as reactPlugin from 'vite-plugin-react'
// import type { UserConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  jsx: 'react',
  plugins: [reactRefresh(), reactPlugin],
  esbuild: {
    jsxInject: `import React from 'react';`
  },
  build: {
    minify: false
  }
}
